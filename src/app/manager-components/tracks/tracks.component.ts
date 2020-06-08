import { DeezerUserInfoService } from './../../services/deezer/deezer-user-info.service';
import { UITrack } from './../../manager-core/entities/UI/ui-track.class';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TracksShowMessageService } from 'src/app/services/spotify/tracks-show-message.service';
import { SpotifyUserInfoService } from 'src/app/services/spotify/spotify-user-info.service';
import { map, tap, throttleTime, scan, switchMap } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShowTracksMessage } from 'src/app/manager-core/entities/UI/show-tracks-message.class';
import { ShowMode } from 'src/app/manager-core/enums/show-mode.enum';
import { Platform } from 'src/app/manager-core/enums/platform.enum';

@Component({
    selector: 'app-tracks',
    templateUrl: './tracks.component.html',
    styleUrls: ['./tracks.component.scss'],
})
export class TracksComponent implements OnInit {
    infinite: Observable<UITrack[]>;

    private msg: ShowTracksMessage<UIPlaylist | string>;

    constructor(
        private pms: TracksShowMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private dzInfo: DeezerUserInfoService,
        private notify: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.pms.currentMessage.subscribe((msg) => {
            if (msg !== null) {
                this.handleMessage(msg);
            }
        });
    }

    public getEditablePls(): Observable<UIPlaylist[]> {
        return this.spotyInfo
            .fetchEditablePlayLists()
            .pipe(
                map((pls) =>
                    pls.map((p) => UIPlaylist.createFromSpotifyRawData(p))
                )
            );
    }
    public addTrackToPls(uri: string, pls: UIPlaylist) {
        this.spotyInfo
            .addTracksToPlaylist(pls, [uri])
            .then((data) =>
                data.statusCode === 201
                    ? this.notify.open('Added successfully to ' + pls.name)
                    : this.notify.open('Error adding to a playlist')
            );
    }
    private handleMessage(msg: ShowTracksMessage<UIPlaylist | string>): void {
        this.msg = msg;

        const id = this.getPlaylistId(msg.parentEntity);

        if (msg.action === ShowMode.ShowPlaylist) {
            this.initPlaylistLoad(msg.platform, id);
        } else if (msg.action === ShowMode.ShowSearchResult) {
            this.initSearchResultLoad();
        } else {
            throw new Error('');
        }
    }
    getPlaylistId(parentEntity: string | UIPlaylist) {
        if (
            typeof parentEntity === 'string' ||
            typeof parentEntity === 'number'
        ) {
            return parentEntity;
        } else {
            return parentEntity.id;
        }
    }
    private initSearchResultLoad() {
        throw new Error('Method not implemented.');
    }
    private initPlaylistLoad(platform: Platform, id: string) {
        this.infinite =
            platform === Platform.Deezer
                ? this.dzInfo
                      .fetchPlaylistTracks(id)
                      .pipe(
                          map((data) =>
                              data.map((pls) =>
                                  UITrack.createFromDeezerRawData(pls)
                              )
                          )
                      )
                : this.spotyInfo
                      .fetchPlaylistTracks(id)
                      .pipe(
                          map((data) =>
                              data.map((pls) =>
                                  UITrack.createFromSpotifyRawData(pls)
                              )
                          )
                      );
    }
}
