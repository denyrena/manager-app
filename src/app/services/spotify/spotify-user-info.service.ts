import { TracksShowMessageService } from 'src/app/services/spotify/tracks-show-message.service';
import { UITrack } from './../../manager-core/entities/UI/ui-track.class';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { Injectable } from '@angular/core';
import {
    Observable,
    defer,
    from,
    EMPTY,
    forkJoin,
    BehaviorSubject,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import SpotifyWebApi from 'spotify-web-api-node';
import { RequestResponceObject } from 'src/app/manager-core/entities/spotify/request-responce.inteface';
import {
    map,
    switchMap,
    expand,
    scan,
    reduce,
    tap,
    retryWhen,
    delay,
    take,
} from 'rxjs/operators';
import { ShowTracksMessage } from 'src/app/manager-core/entities/UI/show-tracks-message.class';
import { ShowMode } from 'src/app/manager-core/enums/show-mode.enum';
import { Platform } from 'src/app/manager-core/enums/platform.enum';

@Injectable({
    providedIn: 'root',
})
export class SpotifyUserInfoService {
    private api: SpotifyWebApi = new SpotifyWebApi({
        clientId: 'fcecfc72172e4cd267473117a17cbd4d',
        clientSecret: '',
        redirectUri: 'http://localhost:4200/authorize',
    });

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

    public ok = 0;

    constructor(private tsms: TracksShowMessageService) {}

    setNewtoken(token: string) {
        this.api.resetAccessToken();
        this.api.setAccessToken(token);
    }

    fetchUserInfoNew(): Observable<SpotifyApi.CurrentUsersProfileResponse> {
        return (from(this.api.getMe()) as Observable<
            RequestResponceObject<SpotifyApi.CurrentUsersProfileResponse>
        >).pipe(map((data) => data.body));
    }

    public fetchUserPlaylists(): Observable<
        SpotifyApi.PlaylistObjectSimplified[]
    > {
        return (defer(() => this.api.getUserPlaylists()) as Observable<
            RequestResponceObject<SpotifyApi.ListOfUsersPlaylistsResponse>
        >).pipe(map((data) => data.body.items));
    }

    public fetchPlaylistTracks(
        id: string
    ): Observable<SpotifyApi.TrackObjectFull[]> {
        return this.getTracksBatch(id, 0, 51).pipe(
            expand((data) => this.getTracksBatch(id, data.next, data.total)),
            scan((acc, data) => {
                return acc.concat(data.data);
            }, [])
        );
    }
    public fetchPlaylistTracksFullLoad(
        id: string
    ): Observable<SpotifyApi.TrackObjectFull[]> {
        return this.getTracksBatch(id, 0, 51).pipe(
            expand((data) => this.getTracksBatch(id, data.next, data.total)),
            reduce((acc, data) => {
                return acc.concat(data.data);
            }, [])
        );
    }

    getTracksBatch(
        id: string,
        offset: number,
        total: number
    ): Observable<{
        next: number;
        total: number;
        data: SpotifyApi.TrackObjectFull[];
    }> {
        const limit = 50;
        if (offset > total) {
            return EMPTY;
        }
        const responsePromise =
            id === 'spotify-fav-tracks'
                ? this.api.getMySavedTracks({ limit, offset })
                : this.api.getPlaylistTracks(id, { limit, offset });

        return defer(() => responsePromise).pipe(
            map((responce) => {
                return {
                    next: offset + limit,
                    total: responce.body.total,
                    data: responce.body.items.map((item) => item.track),
                };
            })
        );
    }

    registerPlaylist(name: string) {
        return this.fetchUserInfoNew().pipe(
            switchMap((user) => {
                return this.api.createPlaylist(user.id, name);
            })
        );
    }

    fetchEditablePlayLists(): Observable<
        SpotifyApi.PlaylistObjectSimplified[]
    > {
        return this.fetchUserPlaylists().pipe(
            switchMap((pls) => {
                return this.fetchUserInfoNew().pipe(
                    map((usrInfo) =>
                        pls.filter((p) => p.owner.id === usrInfo.id)
                    )
                );
            })
        );
    }

    addTracksToPlaylist(pls: UIPlaylist, tracks: string[]) {
        return this.api.addTracksToPlaylist(pls.id, tracks);
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
                const query = t.originalName + ' ' + t.originalArtists[0];

                return (from(this.api.searchTracks(query)) as Observable<{
                    body: SpotifyApi.TrackSearchResponse;
                }>).pipe(
                    map((r) => {
                        if (r.body.tracks.items.length === 0) {
                            notOk++;
                            return null;
                        }
                        ok++;
                        return UITrack.createFromSpotifyRawData(
                            r.body.tracks.items[0]
                        );
                    }),
                    retryWhen((errors) => errors.pipe(delay(10000), take(10))),
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

    favouriteTracks(ids: string[], total: number) {
        this.api.addToMySavedTracks(ids).then(() => {
            this.ok += ids.length;
            this.insertStatus$.next({
                ok: this.ok,
                total,
            });
        });
    }

    importTracksToPlaylist(id: string, uris: string[], total) {
        return this.api.addTracksToPlaylist(id, uris).then(() => {
            this.ok += uris.length;
            this.insertStatus$.next({
                ok: this.ok,
                total,
            });

            const message: ShowTracksMessage<string> = {
                action: ShowMode.ShowPlaylist,
                platform: Platform.Spotify,
                parentEntity: id,
            };
            this.tsms.callPlaylistInit(message);
        });
    }
}
