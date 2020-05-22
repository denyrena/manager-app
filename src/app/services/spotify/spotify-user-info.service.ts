import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { Injectable } from '@angular/core';
import { Observable, defer, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import SpotifyWebApi from 'spotify-web-api-node';
import { RequestResponceObject } from 'src/app/manager-core/entities/spotify/request-responce.inteface';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SpotifyUserInfoService {
    private api: SpotifyWebApi = new SpotifyWebApi({
        clientId: 'fcecfc72172e4cd267473117a17cbd4d',
        clientSecret: '',
        redirectUri: 'http://localhost:4200/authorize',
    });

    private readonly apiUserUrl = 'https://api.spotify.com/v1/me';

    constructor(private http: HttpClient) {}

    setNewtoken(token: string) {
        this.api.resetAccessToken();
        this.api.setAccessToken(token);
    }

    public fetchUserInfo(): Observable<{}> {
        return this.http.get(this.apiUserUrl);
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
        id: string,
        limit: number,
        offset: number
    ): Observable<SpotifyApi.UsersSavedTracksResponse> {
        const responsePromise =
            id === 'spotify-fav-tracks'
                ? this.api.getMySavedTracks({ limit, offset })
                : this.api.getPlaylistTracks(id, { limit, offset });

        return (defer(() => responsePromise) as Observable<
            RequestResponceObject<SpotifyApi.UsersSavedTracksResponse>
        >).pipe(map((data) => data.body));
    }

    libraryContainsTrack(
        ids: string[]
    ): Observable<SpotifyApi.CheckUsersSavedTracksResponse> {
        return (defer(() => this.api.containsMySavedTracks(ids)) as Observable<
            RequestResponceObject<SpotifyApi.CheckUsersSavedTracksResponse>
        >).pipe(map((data) => data.body));
    }

    favouriteTrack(id: string) {
        return this.api.addToMySavedTracks([id]);
    }

    unFavouriteTrack(id: string) {
        return this.api.removeFromMySavedTracks([id]);
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
}
