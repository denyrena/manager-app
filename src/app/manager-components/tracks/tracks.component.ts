import { SpotifyTrackUI } from './../../manager-core/entities/spotify/spotify-track-ui.class';
import { SpotifyTrack } from './../../manager-core/entities/spotify/track.inteface';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { PlaylistMessageService } from 'src/app/services/spotify/playlist-message.service';
import { SpotifyUserInfoService } from 'src/app/services/spotify/spotify-user-info.service';
import { TokenService } from 'spotify-auth';
import { switchMap } from 'rxjs/operators';
import { SpotifyPlaylistTrack } from 'src/app/manager-core/entities/spotify/spotify-playlist-track.interface';


@Component({
    selector: 'app-tracks',
    templateUrl: './tracks.component.html',
    styleUrls: ['./tracks.component.scss'],
})
export class TracksComponent implements OnInit {
    public dataSource: MatTableDataSource<SpotifyTrackUI>;
    

    public displayedColumns = ['image', 'name', 'artist', 'album', 'length'];

    constructor(
        private pms: PlaylistMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private tokenSvc: TokenService
    ) {}

    ngOnInit(): void {
        this.pms.currentMessage.subscribe((id) => this.initLoadingTracks(id));
    }

    private initLoadingTracks(id: string) {
        const plstream = this.tokenSvc.authTokens.pipe(
            switchMap((x) => {
                return this.spotyInfo.fetchUserTracks(id);
            })
        );

        plstream.subscribe((data) => this.prepareTracks(data.items));
    }

    private prepareTracks(data: SpotifyPlaylistTrack[]) {
        this.dataSource = new MatTableDataSource(
            data.map((t) => this.prepareTrack(t.track))
        );
    }

    private prepareTrack(track: SpotifyTrack): SpotifyTrackUI {
        const uiTrack = new SpotifyTrackUI();
        uiTrack.album = this.shorten(track.album.name, 35);
        uiTrack.artist = this.getArtists(track.artists);
        uiTrack.image = track.album.images[track.album.images.length - 1].url;
        uiTrack.length = this.getLength(track.duration_ms);
        uiTrack.name = track.name;

        return uiTrack;
    }

    private getArtists(artists: any): any {
        let artistsString = artists
            .map((a) => a.name)
            .join(', ')
            .toString();
        return this.shorten(artistsString, 50);
    }

    private shorten(source: string, length: number): string {
        if (source.length > length) {
            source = source.substring(0, length) + '...';
        }
        return source;
    }

    private getLength(length: number): string {
        return new Date(length).toISOString().substr(14, 5);
    }
}
