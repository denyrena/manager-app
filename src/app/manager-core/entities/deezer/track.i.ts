export interface Album {
    id: string;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    tracklist: string;
    type: string;
}

export interface Artist {
    id: string;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    tracklist: string;
    type: string;
}

export interface DeezerTrack {
    id: string;
    readable: boolean;
    title: string;
    link: string;
    duration: number;
    rank: string;
    explicit_lyrics: boolean;
    explicit_content_lyrics: number;
    explicit_content_cover: number;
    time_add: number;
    album: Album;
    artist: Artist;
    type: string;
}