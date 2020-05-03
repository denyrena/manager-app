import { SpotifyTrack } from './../../manager-core/entities/spotify/track.inteface';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SpotifyPage } from 'src/app/manager-core/entities/spotify/page.interface';
import { SpotifyPlaylist } from 'src/app/manager-core/entities/spotify/playlist.class';
import { SpotifyPlaylistTrack } from 'src/app/manager-core/entities/spotify/spotify-playlist-track.interface';

@Injectable({
    providedIn: 'root',
})
export class SpotifyUserInfoService {
    private readonly apiUserUrl = 'https://api.spotify.com/v1/me';
    private readonly apiPlaylistsUrl =
        'https://api.spotify.com/v1/me/playlists';
    private readonly favTracksUrl = 'https://api.spotify.com/v1/me/tracks';
    private readonly playlistTracksUrl =
        'https://api.spotify.com/v1/playlists/{id}/tracks';

    constructor(private http: HttpClient) {}

    public fetchUserInfo(): Observable<{}> {
        return this.http.get(this.apiUserUrl);
    }

    public fetchUserPlaylists(): Observable<SpotifyPage<SpotifyPlaylist>> {
        return this.http.get(this.apiPlaylistsUrl) as Observable<
            SpotifyPage<SpotifyPlaylist>
        >;
    }

    public fetchUserTracks(
        id: string
    ): Observable<SpotifyPage<SpotifyPlaylistTrack>> {
        let url =
            id === 'spotify-fav-tracks'
                ? this.favTracksUrl
                : this.playlistTracksUrl.replace('{id}', id);

        return this.http.get(url) as Observable<
            SpotifyPage<SpotifyPlaylistTrack>
        >;
    }
}
