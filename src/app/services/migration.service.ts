import { Platform } from './../manager-core/enums/platform.enum';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { UITrack } from './../manager-core/entities/UI/ui-track.class';
import { MigrationSettings } from './../manager-core/entities/migration-settings.class';
import { SpotifyUserInfoService } from './spotify/spotify-user-info.service';
import { DeezerUserInfoService } from './deezer/deezer-user-info.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSourceType } from '../manager-core/enums/data-source-type.enum';
import { map, tap, switchMap, mergeAll, mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MigrationService {
    constructor(
        private dzInfo: DeezerUserInfoService,
        private spotyInfo: SpotifyUserInfoService
    ) {}

    public loadSourceAndSearch(ctx: MigrationSettings): Observable<UITrack[]> {
        const importedTracks: Observable<
            UITrack[]
        > = this.importTracksFromSource(ctx);
        return this.findTracksOnPlatform(ctx, importedTracks);
    }
    importTracksFromSource(ctx: MigrationSettings): Observable<UITrack[]> {
        if (ctx.sourceType === DataSourceType.Playlist) {
            return this.importPlaylist(
                ctx.sourcePlatform,
                ctx.sourcePlaylist.id
            );
        }
        if (ctx.sourceType === DataSourceType.Link) {
            return this.importFromLink(ctx.sourceLink, ctx.sourcePlatform);
        }
        if (ctx.sourceType === DataSourceType.LovedTracks) {
            return this.importFromLovedTracks();
        }
    }
    importPlaylist(platform: Platform, id: string): Observable<UITrack[]> {
        return platform === Platform.Deezer
            ? this.dzInfo
                  .fetchPlaylistTracksFullLoad(id)
                  .pipe(
                      map((data) =>
                          data.map((pls) =>
                              UITrack.createFromDeezerRawData(pls)
                          )
                      )
                  )
            : this.spotyInfo
                  .fetchPlaylistTracksFullLoad(id)
                  .pipe(
                      map((data) =>
                          data.map((pls) =>
                              UITrack.createFromSpotifyRawData(pls)
                          )
                      )
                  );
    }
    importFromLink(
        sourceLink: string,
        sourcePlatform: Platform
    ): Observable<UITrack[]> {
        const id = sourceLink.substring(sourceLink.lastIndexOf('/') + 1);
        return this.importPlaylist(sourcePlatform, id);
    }
    importFromLovedTracks(): Observable<UITrack[]> {
        return this.spotyInfo
            .fetchPlaylistTracksFullLoad(UIPlaylist.spotifyLovedTracksId)
            .pipe(
                map((data) =>
                    data.map((pls) => UITrack.createFromSpotifyRawData(pls))
                )
            );
    }
    findTracksOnPlatform(
        ctx: MigrationSettings,
        importedTracks: Observable<UITrack[]>
    ): Observable<UITrack[]> {
        return ctx.sourcePlatform === ctx.targetPlatform
            ? importedTracks
            : this.searchTracks(ctx.targetPlatform, importedTracks);
    }
    searchTracks(
        platform: Platform,
        importedTracks: Observable<UITrack[]>
    ): Observable<UITrack[]> {
        return importedTracks.pipe(
            mergeMap((t) => {
                return platform === Platform.Deezer
                    ? this.dzInfo.searchTracks(t)
                    : this.spotyInfo.searchTracks(t);
            }, 50)
        );
    }

    importToTarget(ctx: MigrationSettings, foundTracks: UITrack[]) {
        if (ctx.targetPlatform === Platform.Deezer) {
            return this.importToDeezer(ctx, foundTracks);
        } else {
            return this.importToSpotify(ctx, foundTracks);
        }
    }
    importToDeezer(ctx: MigrationSettings, foundTracks: UITrack[]) {
        if (ctx.targetType === DataSourceType.Playlist) {
            return this.importToNewDeezerPlaylist(
                ctx.targetPlaylistName,
                foundTracks
            );
        } else {
            return this.importToDeezerFavTracks(foundTracks);
        }
    }
    importToNewDeezerPlaylist(
        targetPlaylistName: string,
        foundTracks: UITrack[]
    ) {
        this.dzInfo.createPlaylist(targetPlaylistName).subscribe((data) => {
            const plsId = data.id;
            this.dzInfo.ok = 0;
            const filteredTracks = foundTracks.filter((tr) => tr !== null);
            const total = filteredTracks.length;
            this.chunkArray(filteredTracks, 50).map((chunk) =>
                this.dzInfo.insertToPlaylist(
                    plsId,
                    chunk.map((t) => t.uri),
                    total
                )
            );
        });
    }
    importToDeezerFavTracks(foundTracks: UITrack[]) {
        this.dzInfo.fetchUserPlaylists().subscribe((res) => {
            const plsId = res.data.find((pls) => pls.title === 'Loved Tracks').id;
            this.dzInfo.ok = 0;
            const filteredTracks = foundTracks.filter((tr) => tr !== null);
            const total = filteredTracks.length;
            this.chunkArray(filteredTracks, 50).map((chunk) =>
                this.dzInfo.insertToPlaylist(
                    plsId,
                    chunk.map((t) => t.uri),
                    total
                )
            );
        });
    }

    importToSpotify(ctx: MigrationSettings, foundTracks: UITrack[]) {
        if (ctx.targetType === DataSourceType.Playlist) {
            return this.importToNewSpotifyPlaylist(
                ctx.targetPlaylistName,
                foundTracks
            );
        } else {
            return this.importToSpotifyFavTracks(foundTracks);
        }
    }
    importToNewSpotifyPlaylist(
        targetPlaylistName: string,
        foundTracks: UITrack[]
    ) {
        this.spotyInfo
            .registerPlaylist(targetPlaylistName)
            .subscribe((responce) => {
                const plsId = responce.body.id;
                this.spotyInfo.ok = 0;
                const filteredTracks = foundTracks.filter((tr) => tr !== null);
                const total = filteredTracks.length;
                this.chunkArray(filteredTracks, 50).map((chunk) =>
                    this.spotyInfo.importTracksToPlaylist(
                        plsId,
                        chunk.map((t) => t.uri),
                        total
                    )
                );
            });
    }
    importToSpotifyFavTracks(foundTracks: UITrack[]) {
        this.spotyInfo.ok = 0;
        const filteredTracks = foundTracks.filter((tr) => tr !== null);
        const total = filteredTracks.length;
        this.chunkArray(filteredTracks, 50).map((chunk) =>
            this.spotyInfo.favouriteTracks(
                chunk.map((t) => t.id),
                total
            )
        );
    }

    chunkArray<T>(array: T[], size: number): T[][] {
        const results = [];

        while (array.length) {
            results.push(array.splice(0, size));
        }

        return results;
    }
}
