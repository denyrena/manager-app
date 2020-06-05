import { ShowTracksMessage } from './../../manager-core/entities/UI/show-tracks-message.class';
import { NewPlaylistName } from './../../manager-core/entities/new-playlist-name.interface';
import { Platform } from './../../manager-core/enums/platform.enum';
import { AccountMessageService } from './../../services/common/account-message.service';
import { SpotifyUserInfoService } from './../../services/spotify/spotify-user-info.service';
import { Component, OnInit } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
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
    public playlists: Observable<UIPlaylist[]>;
    public lovedTracksSpotify = UIPlaylist.getLovedTracksPlaylist(
        Platform.Spotify
    );

    constructor(
        private tsms: TracksShowMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private ams: AccountMessageService,
        private dialog: MatDialog,
        private notify: MatSnackBar
    ) {}

    ngOnInit(): void {
        // this.playlists = this.ams.accountRegistered.pipe(
        //     switchMap(() => this.refreshPlaylists())
        // );
    }

    private refreshPlaylists(): Observable<UIPlaylist[]> {
        return this.spotyInfo
            .fetchUserPlaylists()
            .pipe(
                map((pls) =>
                    pls.map((p) => UIPlaylist.createFromSpotifyRawData(p))
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
            case Platform.Deezer:
                break;
            case Platform.Spotify: {
                this.spotyInfo
                    .registerPlaylist(data.name)
                    .subscribe((response) => {
                        this.notify.open(
                            'Playlist ' +
                                response.body.name +
                                ' successfully created!'
                        );
                        this.playlists = this.refreshPlaylists();
                    });
                return;
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

    public isNeedShow(): boolean {
        return true;
    }
}
