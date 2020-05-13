import { SpotifyTrackUI } from './../../manager-core/entities/spotify/spotify-track-ui.class';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PlaylistMessageService } from 'src/app/services/spotify/playlist-message.service';
import { SpotifyUserInfoService } from 'src/app/services/spotify/spotify-user-info.service';
import { map, tap, throttleTime, scan, switchMap } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-tracks',
    templateUrl: './tracks.component.html',
    styleUrls: ['./tracks.component.scss'],
})
export class TracksComponent implements OnInit {
    infinite: Observable<SpotifyTrackUI[]>;

    @ViewChild(CdkVirtualScrollViewport)
    private viewport: CdkVirtualScrollViewport;
    private offset = new BehaviorSubject<number>(1);
    private curOffset = 0;
    private limit = 1;
    private batchSize = 50;
    private playlistId = '';

    constructor(
        private pms: PlaylistMessageService,
        private spotyInfo: SpotifyUserInfoService,
        private notify: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.pms.currentMessage.subscribe((id) => {
            this.curOffset = 0;
            this.offset = new BehaviorSubject<number>(0);
            this.playlistId = id;
            this.infinite = this.offset.pipe(
                throttleTime(500),
                switchMap((n) => this.getSpotifyBatch(n)),
                scan((acc, batch) => acc.concat(batch))
            );
        });
    }

    nextBatch(e: any) {
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

    private getSpotifyBatch(offset: number) {
        return this.spotyInfo
            .fetchPlaylistTracks(this.playlistId, this.batchSize, offset)
            .pipe(
                tap((page) => (this.limit = page.limit)),
                switchMap((page) => {
                    return this.spotyInfo
                        .libraryContainsTrack(page.items.map((i) => i.track.id))
                        .pipe(
                            map((ids) =>
                                page.items.map((t, i) =>
                                    this.prepareTrack(t.track, ids[i])
                                )
                            )
                        );
                })
            );
    }

    private getArtists(artists: any): any {
        const artistsString = artists
            .map((a) => a.name)
            .join(', ')
            .toString();
        return this.shorten(artistsString, 30);
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

    private prepareTrack(
        track: SpotifyApi.TrackObjectFull,
        isFav: boolean
    ): SpotifyTrackUI {
        const uiTrack = new SpotifyTrackUI();
        uiTrack.album = this.shorten(track.album.name, 35);
        uiTrack.artist = this.getArtists(track.artists);
        uiTrack.image = track.album.images[0].url;
        uiTrack.length = this.getLength(track.duration_ms);
        uiTrack.name = this.shorten(track.name, 15);
        uiTrack.id = track.id;
        uiTrack.isFavourite = isFav;

        return uiTrack;
    }

    toggleFavourite(track: SpotifyTrackUI) {
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
}
