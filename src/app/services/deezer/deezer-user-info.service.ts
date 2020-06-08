import { ShowTracksMessage } from './../../manager-core/entities/UI/show-tracks-message.class';
import { Platform } from './../../manager-core/enums/platform.enum';
import { ShowMode } from './../../manager-core/enums/show-mode.enum';
import { TracksShowMessageService } from './../spotify/tracks-show-message.service';
import { UITrack } from './../../manager-core/entities/UI/ui-track.class';
import { DeezerTrack } from './../../manager-core/entities/deezer/track.i';
import {
    DeezerResponse,
    DeezerPlaylist,
} from './../../manager-core/entities/deezer/playlist.i';
import { Observable, EMPTY, forkJoin, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeezerUser } from 'src/app/manager-core/entities/deezer/user.i';
import {
    map,
    expand,
    scan,
    tap,
    throttleTime,
    reduce,
    catchError,
} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DeezerUserInfoService {
    private readonly userApiUrl = 'https://api.deezer.com/user/me';
    private readonly userPlaylistsApiUrl =
        'https://api.deezer.com/user/me/playlists';
    private readonly trackSearchApiUrl =
        'https://api.deezer.com/search/track?q=';
    private readonly playlistCreateApiUrl =
        'https://api.deezer.com/user/me/playlists?request_method=POST&title=';
    private token: string;

    private searchStatus$: BehaviorSubject<{
        ok: number;
        notOk: number;
        total: number;
    }> = new BehaviorSubject<{ ok: number; notOk: number; total: number }>({
        ok: 0,
        notOk: 0,
        total: 0,
    });
    public searchStatusObservable$: Observable<{
        ok: number;
        notOk: number;
        total: number;
    }> = this.searchStatus$.asObservable();

    private insertStatus$: BehaviorSubject<{
        ok: number;
        total: number;
    }> = new BehaviorSubject<{ ok: number; total: number }>({
        ok: 0,
        total: 0,
    });
    public insertStatusObservable$: Observable<{
        ok: number;
        total: number;
    }> = this.insertStatus$.asObservable();
    ok: number;

    constructor(
        private http: HttpClient,
        private tsms: TracksShowMessageService
    ) {}

    public setAccessToken(token: string) {
        this.token = token;
    }

    fetchUserInfo(): Observable<DeezerUser> {
        return this.api(this.userApiUrl) as Observable<DeezerUser>;
    }

    fetchUserPlaylists(): Observable<DeezerResponse<DeezerPlaylist>> {
        return this.api(this.userPlaylistsApiUrl) as Observable<
            DeezerResponse<DeezerPlaylist>
        >;
    }

    searchTracks(tracks: UITrack[]): Observable<UITrack[]> {
        let ok = 0;
        let notOk = 0;
        const total = tracks.length;
        this.searchStatus$.next({
            ok,
            notOk,
            total,
        });

        return forkJoin(
            tracks.map((t) => {
                const uri = encodeURI(
                    this.trackSearchApiUrl +
                        t.originalName +
                        ' ' +
                        t.originalArtists[0]
                );
                return (this.api(uri, true, false) as Observable<{
                    data: DeezerTrack[];
                    total: number;
                }>).pipe(
                    map((r) => {
                        if (r.data.length === 0) {
                            notOk++;
                            return null;
                        }
                        ok++;
                        return UITrack.createFromDeezerRawData(r.data[0]);
                    }),
                    tap((r) => {
                        this.searchStatus$.next({
                            ok,
                            notOk,
                            total,
                        });
                    })
                );
            })
        );
    }

    createPlaylist(name: string): Observable<{ id: string }> {
        return this.api(
            this.playlistCreateApiUrl + encodeURI(name),
            true,
            false
        ) as Observable<{ id: string }>;
    }

    insertToPlaylist(id: string, urls: string[], total: number) {
        const baseUrl =
            `https://api.deezer.com/playlist/${id}/tracks?request_method=POST&songs=` +
            urls.join(',');

        return this.api(baseUrl, true, false).subscribe((res) => {
            this.ok += urls.length;
            this.insertStatus$.next({
                ok: this.ok,
                total,
            });
            const message: ShowTracksMessage<string> = {
                action: ShowMode.ShowPlaylist,
                platform: Platform.Deezer,
                parentEntity: id,
            };
            this.tsms.callPlaylistInit(message);
        });
    }

    public fetchPlaylistTracks(id: string): Observable<DeezerTrack[]> {
        const baseUrl = `https://api.deezer.com/playlist/${id}/tracks`;

        return this.getTracksBatch(baseUrl).pipe(
            expand((data) => this.getTracksBatch(data.next)),
            scan((acc, data) => {
                return acc.concat(data.data);
            }, [])
        );
    }

    public fetchPlaylistTracksFullLoad(id: string): Observable<DeezerTrack[]> {
        const baseUrl = `https://api.deezer.com/playlist/${id}/tracks`;

        return this.getTracksBatch(baseUrl).pipe(
            expand((data) => this.getTracksBatch(data.next)),
            reduce((acc, data) => {
                return acc.concat(data.data);
            }, [])
        );
    }

    private getTracksBatch(
        batchUrl: string
    ): Observable<{ next: string; data: DeezerTrack[] }> {
        return (this.api(batchUrl) as Observable<
            DeezerResponse<DeezerTrack>
        >).pipe(
            map((responce) => {
                return {
                    next: responce.next,
                    data: responce.data,
                };
            })
        );
    }

    api(
        url: string,
        hasQueryParms?: boolean,
        skipAccessToken?: boolean
    ): Observable<any> {
        if (!url) {
            return EMPTY;
        }
        const accessToken = skipAccessToken
            ? ''
            : this.getAccessTokenString(!hasQueryParms);

        return this.http.jsonp(url + accessToken, 'callback') as Observable<
            any
        >;
    }

    private getAccessTokenString(isfirst: boolean): string {
        return isfirst
            ? `?access_token=${this.token}&output=jsonp`
            : `&access_token=${this.token}&output=jsonp`;
    }
}
