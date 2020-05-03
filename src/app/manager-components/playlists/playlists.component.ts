import { SpotifyImage } from './../../manager-core/entities/spotify/image.class';
import { TokenService } from 'spotify-auth';
import { SpotifyUserInfoService } from './../../services/spotify/spotify-user-info.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SpotifyPlaylist } from 'src/app/manager-core/entities/spotify/playlist.class';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-playlists',
    templateUrl: './playlists.component.html',
    styleUrls: ['./playlists.component.scss'],
})
export class PlaylistsComponent implements OnInit {
    @Output() public SelectedPlaylistChanged: EventEmitter<
        string
    > = new EventEmitter();

    public spotifyPlaylists: SpotifyPlaylist[];

    constructor(
        private spotyInfo: SpotifyUserInfoService,
        private tokenSvc: TokenService
    ) {
        this.spotifyPlaylists = [];
    }

    ngOnInit(): void {
        const plstream = this.tokenSvc.authTokens.pipe(
            switchMap((x) => {
                return this.spotyInfo.fetchUserPlaylists();
            })
        );

        plstream.subscribe((data) => {
            this.spotifyPlaylists = data.items;
            const lovedTracks = this.createSpotifyLovedTracksPlaylist();
            this.spotifyPlaylists.unshift(lovedTracks);
        });
    }

    createSpotifyLovedTracksPlaylist(): SpotifyPlaylist {
        const lovedTracks = new SpotifyPlaylist();
        const image = new SpotifyImage();
        image.url = 'https://open.scdn.co/cdn/images/favicon.5cb2bd30.ico';
        lovedTracks.images = [image];
        lovedTracks.id = 'spotify-fav-tracks';
        lovedTracks.name = 'Loved tracks';

        return lovedTracks;
    }

    selectPlaylist(id: string) {
        this.SelectedPlaylistChanged.emit(id);
    }
}
