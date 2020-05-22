import { Platform } from './../../enums/platform.enum';
export class UIPlaylist {
    private static readonly spotifyDefaultCoverUri =
        'https://open.scdn.co/cdn/images/favicon.5cb2bd30.ico';
    private static readonly deezerDefaultCoverUri =
        'https://e-cdns-files.dzcdn.net/cache/images/common/favicon/favicon.a6a53d55264841165a904dbea19d5d73.ico';
    private static readonly spotifyLovedTracksId = 'spotify-fav-tracks';
    private static readonly deezerLovedTracksId = 'deezer-fav-tracks';

    public coverUri: string;
    public name: string;
    public id: string;
    public ownerId: string;
    public platform: Platform;

    private constructor(
        coverUri: string,
        name: string,
        id: string,
        ownerId: string,
        platform: Platform
    ) {
        this.coverUri = coverUri;
        this.name = name;
        this.id = id;
        this.ownerId = ownerId;
        this.platform = platform;
    }

    public static createFromSpotifyRawData(
        rawData: SpotifyApi.PlaylistObjectSimplified
    ): UIPlaylist {
        const coverUri =
            rawData.images.length !== 0
                ? rawData.images[0].url
                : this.spotifyDefaultCoverUri;

        return new UIPlaylist(
            coverUri,
            rawData.name,
            rawData.id,
            rawData.owner.id,
            Platform.Spotify
        );
    }

    public static getLovedTracksPlaylist(platform: Platform): UIPlaylist {
        const coverUri =
            platform === Platform.Spotify
                ? this.spotifyDefaultCoverUri
                : this.deezerDefaultCoverUri;
        const id =
            platform === Platform.Spotify
                ? this.spotifyLovedTracksId
                : this.deezerLovedTracksId;
        return new UIPlaylist(
            coverUri,
            'Loved Tracks',
            id,
            undefined,
            platform
        );
    }
}
