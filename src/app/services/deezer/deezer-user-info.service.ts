import { DeezerTrack } from './../../manager-core/entities/deezer/track.i';
import {
    DeezerResponse,
    DeezerPlaylist,
} from './../../manager-core/entities/deezer/playlist.i';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeezerUser } from 'src/app/manager-core/entities/deezer/user.i';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DeezerUserInfoService {
    private readonly userApiUrl = 'https://api.deezer.com/user/me';
    private readonly userPlaylistsApiUrl =
        'https://api.deezer.com/user/me/playlists';
    private readonly userTracksApiUrl = 'https://api.deezer.com/user/me/tracks';
    private token: string;

    constructor(private http: HttpClient) {}

    public setAccessToken(token: string) {
        this.token = token;
    }

    fetchUserInfo(): Observable<DeezerUser> {
        return this.api(this.userApiUrl, false) as Observable<DeezerUser>;
    }

    fetchUserPlaylists(): Observable<DeezerResponse<DeezerPlaylist>> {
        return this.api(this.userPlaylistsApiUrl, false) as Observable<
            DeezerResponse<DeezerPlaylist>
        >;
    }

    api(url: string, hasQueryParms: boolean): Observable<any> {
        const accessToken = this.getAccessTokenString(!hasQueryParms);
        return this.http.jsonp(url + accessToken, 'callback') as Observable<any>;
    }

    public fetchPlaylistTracks(
        id: string,
        limit: number,
        offset: number
    ): Observable<DeezerResponse<DeezerTrack>> {
        const response =
            id === 'deezer-fav-tracks'
                ? this.api(this.userTracksApiUrl + `?index=${offset}`, true)
                : this.api(`https://api.deezer.com/playlist/${id}/tracks` + `?index=${offset}`, true);

        return response as Observable<DeezerResponse<DeezerTrack>>;
    }

    private getAccessTokenString(isfirst: boolean): string {
        return isfirst
            ? `?access_token=${this.token}&output=jsonp`
            : `&access_token=${this.token}&output=jsonp`;
    }
}
