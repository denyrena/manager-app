import { DeezerUserInfoService } from './../../services/deezer/deezer-user-info.service';
import { ShowTracksMessage } from './../../manager-core/entities/UI/show-tracks-message.class';
import { NewPlaylistName } from './../../manager-core/entities/new-playlist-name.interface';
import { Platform } from './../../manager-core/enums/platform.enum';
import { AccountMessageService } from './../../services/common/account-message.service';
import { SpotifyUserInfoService } from './../../services/spotify/spotify-user-info.service';
import { Component, OnInit } from '@angular/core';
import { switchMap, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreatePlaylistDialogComponent } from '../create-playlist-dialog/create-playlist-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { TracksShowMessageService } from 'src/app/services/spotify/tracks-show-message.service';
import { ShowMode } from 'src/app/manager-core/enums/show-mode.enum';

@Component({
    selector: 'app-playlists',
    templateUrl: './playlists.component.html',
    styleUrls: ['./playlists.component.scss'],
})
export class PlaylistsComponent implements OnInit {
    public spotyPlaylists: Observable<UIPlaylist[]>;
    public dzPlaylists: Observable<UIPlaylist[]>;
    public lovedTracksSpotify = UIPlaylist.getLovedTracksPlaylist(
        Platform.Spotify
    );
    public lovedTracksDeezer = UIPlaylist.getLovedTracksPlaylist(
        Platform.Deezer
    );

    constructor(
        private tsms: TracksShowMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private dzInfo: DeezerUserInfoService,
        private ams: AccountMessageService,
        private dialog: MatDialog,
        private notify: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.ams.accounts.subscribe((accs) =>
            accs.forEach((acc) => {
                this.refreshPlaylistsOnPlatform(acc.platform);
            })
        );
    }

    private refreshPlaylistsOnPlatform(platform: Platform): void {
        platform === Platform.Spotify
            ? this.loadSpotyPlaylists()
            : this.loadDeezerPlaylists();
    }

    private loadSpotyPlaylists(): void {
        this.spotyPlaylists = this.spotyInfo
            .fetchUserPlaylists()
            .pipe(
                map((pls) =>
                    pls.map((p) => UIPlaylist.createFromSpotifyRawData(p))
                )
            );
    }
    private loadDeezerPlaylists(): void {
        this.dzPlaylists = this.dzInfo
            .fetchUserPlaylists()
            .pipe(
                map((pls) =>
                    pls.data.map((p) => UIPlaylist.createFromDeezerRawData(p))
                )
            );
    }

    public createPlaylist() {
        const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
            width: '300px',
            data: { platform: Platform.Spotify, name: '' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.createPlaylistOnPlatform(result);
        });
    }

    private createPlaylistOnPlatform(data: NewPlaylistName) {
        if (!data) {
            return;
        }

        switch (data.platform) {
            case Platform.Deezer: {
                this.dzInfo.createPlaylist(data.name).subscribe((response) => {
                    this.notify.open('Playlist successfully created!');
                    this.refreshPlaylistsOnPlatform(data.platform);
                });
                break;
            }
            case Platform.Spotify: {
                this.spotyInfo
                    .registerPlaylist(data.name)
                    .subscribe((response) => {
                        this.notify.open(
                            'Playlist ' +
                                response.body.name +
                                ' successfully created!'
                        );
                        this.refreshPlaylistsOnPlatform(data.platform);
                    });
            }
        }
    }

    public selectPlaylist(pls: UIPlaylist) {
        const message: ShowTracksMessage<UIPlaylist> = {
            action: ShowMode.ShowPlaylist,
            platform: pls.platform,
            parentEntity: pls,
        };
        this.tsms.callPlaylistInit(message);
    }

    public isNeedShow(platform?: Platform): boolean {
        return this.ams.isNeedShow(platform);
    }
}
