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

    @ViewChild(CdkVirtualScrollViewport)
    private viewport: CdkVirtualScrollViewport;
    private offset = new BehaviorSubject<number>(1);
    private curOffset = 0;
    private limit = 1;
    private batchSize = 50;
    private msg: ShowTracksMessage<UIPlaylist>;

    constructor(
        private pms: TracksShowMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private notify: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.pms.currentMessage.subscribe((msg) => {
            if (msg !== null) {
                this.handleMessage(msg);
            }
        });
    }
    public nextBatch(e: any) {
        if (this.curOffset > this.limit) {
            return;
        }

        const end = this.viewport.getRenderedRange().end;
        const total = this.viewport.getDataLength();

        if (end === total) {
            this.curOffset += 50;
            this.offset.next(this.curOffset);
        }
    }
    public toggleFavourite(track: UITrack) {
        const promise = track.isFavourite
            ? this.spotyInfo.unFavouriteTrack(track.id)
            : this.spotyInfo.favouriteTrack(track.id);

        promise.then(() => {
            track.isFavourite = !track.isFavourite;
            this.notify.open(
                track.isFavourite
                    ? 'Track was added to Loved'
                    : 'Track removed from Loved'
            );
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
    private handleMessage(msg: ShowTracksMessage<UIPlaylist>): void {
        this.msg = msg;
        if (msg.action === ShowMode.ShowPlaylist) {
            this.initPlaylistLoad(msg.platform, msg.parentEntity);
        } else if (msg.action === ShowMode.ShowSearchResult) {
            this.initSearchResultLoad();
        } else {
            throw new Error('');
        }
    }
    private initSearchResultLoad() {
        throw new Error('Method not implemented.');
    }
    private initPlaylistLoad(platform: Platform, pls: UIPlaylist) {
        this.curOffset = 0;
        this.offset = new BehaviorSubject<number>(0);
        this.infinite = this.offset.pipe(
            throttleTime(500),
            switchMap((n) => this.getBatch(n, platform, pls)),
            scan((acc, batch) => acc.concat(batch))
        );
    }
    private getBatch(
        n: number,
        platform: Platform,
        pls: UIPlaylist
    ): Observable<UITrack[]> {
        if (platform === Platform.Spotify) {
            return this.getSpotifyBatch(n, pls);
        } else if (platform === Platform.Deezer) {
            return null;
        } else {
            throw new Error('');
        }
    }
    private getSpotifyBatch(
        offset: number,
        pls: UIPlaylist
    ): Observable<UITrack[]> {
        return this.spotyInfo
            .fetchPlaylistTracks(pls.id, this.batchSize, offset)
            .pipe(
                tap((page) => (this.limit = page.limit)),
                switchMap((page) => {
                    return this.spotyInfo
                        .libraryContainsTrack(page.items.map((i) => i.track.id))
                        .pipe(
                            map((ids) =>
                                page.items.map((t, i) =>
                                    UITrack.createFromSpotifyRawData(
                                        t.track,
                                        ids[i]
                                    )
                                )
                            )
                        );
                })
            );
    }
}
