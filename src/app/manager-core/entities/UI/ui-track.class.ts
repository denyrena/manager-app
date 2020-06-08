import { DeezerTrack } from './../deezer/track.i';
export class UITrack {
    public isFavourite = false;
    public id: string;
    public image: string;
    public name: string;
    public artist: string;
    public length: string;
    public uri: string;

    public originalName: string;
    public originalArtists: string[];

    private constructor(
        id: string,
        image: string,
        name: string,
        artist: string,
        length: string,
        uri: string,
        originalName: string,
        originalArtists: string[]
    ) {
        this.id = id;
        this.image = image;
        this.name = name;
        this.artist = artist;
        this.length = length;
        this.uri = uri;
        this.originalName = originalName;
        this.originalArtists = originalArtists;
    }

    public static createFromSpotifyRawData(
        rawData: SpotifyApi.TrackObjectFull
    ): UITrack {
        const artist = this.getArtists(rawData.artists);
        const image = rawData.album.images[0].url;
        const length = this.getLength(rawData.duration_ms);
        const name = this.shorten(rawData.name, 15);

        return new UITrack(
            rawData.id,
            image,
            name,
            artist,
            length,
            rawData.uri,
            rawData.name,
            rawData.artists.map((a) => a.name),
        );
    }

    public static createFromDeezerRawData(rawData: DeezerTrack): UITrack {
        const length = this.getLength(rawData.duration * 1000);
        const name = this.shorten(rawData.title, 15);

        return new UITrack(
            rawData.id,
            rawData.album.cover_big,
            name,
            rawData.artist.name,
            length,
            rawData.id,
            rawData.title,
            [rawData.artist.name],
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
