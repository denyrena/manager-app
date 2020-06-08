import { DataSourceType } from './../enums/data-source-type.enum';
import { Platform } from './../enums/platform.enum';
import { UIPlaylist } from './UI/ui-playlist.class';

export class MigrationSettings {
    sourcePlatform: Platform = Platform.Spotify;
    sourceType: DataSourceType = DataSourceType.Playlist;
    sourcePlaylist: UIPlaylist;
    sourceLink: string;

    targetPlatform: Platform = Platform.Deezer;
    targetType: DataSourceType = DataSourceType.Playlist;
    targetPlaylistName: string;
}
