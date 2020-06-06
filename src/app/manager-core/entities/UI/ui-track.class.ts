import { DeezerTrack } from './../deezer/track.i';
export class UITrack {
    public isFavourite: boolean;
    public id: string;
    public image: string;
    public name: string;
    public artist: string;
    public album: string;
    public length: string;
    public uri: string;

    private constructor(
        isFavourite: boolean,
        id: string,
        image: string,
        name: string,
        artist: string,
        album: string,
        length: string,
        uri: string
    ) {
        this.isFavourite = isFavourite;
        this.id = id;
        this.image = image;
        this.name = name;
        this.artist = artist;
        this.album = album;
        this.length = length;
        this.uri = uri;
    }

    public static createFromSpotifyRawData(
        rawData: SpotifyApi.TrackObjectFull,
        isFav: boolean
    ): UITrack {
        const album = this.shorten(rawData.album.name, 35);
        const artist = this.getArtists(rawData.artists);
        const image = rawData.album.images[0].url;
        const length = this.getLength(rawData.duration_ms);
        const name = this.shorten(rawData.name, 15);

        return new UITrack(
            isFav,
            rawData.id,
            image,
            name,
            artist,
            album,
            length,
            rawData.uri
        );
    }

    public static createFromDeezerRawData(
        rawData: DeezerTrack,
        isFav: boolean
    ): UITrack {
        const album = this.shorten(rawData.album.title, 35);
        const length = this.getLength(rawData.duration * 1000);
        const name = this.shorten(rawData.title, 15);

        return new UITrack(
            isFav,
            rawData.id,
            rawData.album.cover_big,
            name,
            rawData.artist.name,
            album,
            length,
            rawData.id
        );
    }

    private static getArtists(artists: any): any {
        const artistsString = artists
            .map((a) => a.name)
            .join(', ')
            .toString();
        return this.shorten(artistsString, 30);
    }

    private static shorten(source: string, length: number): string {
        if (source.length > length) {
            source = source.substring(0, length) + '...';
        }
        return source;
    }

    private static getLength(length: number): string {
        return new Date(length).toISOString().substr(14, 5);
    }
}
