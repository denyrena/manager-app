export class SpotifyTrack {
    album: any; // The album on which the track appears. The album object includes a link in href to full information about the album.
    artists: any; // The artists who performed the track.
    available_markets: string[]; // A list of the countries in which the track can be played, identified by their ISO 3166-1 alpha-2 code.
    disc_number: number; // The disc number (usually 1 unless the album consists of more than one disc).
    duration_ms: number; // The track length in milliseconds.
    explicit: boolean; // Whether or not the track has explicit lyrics ( true = yes it does; false = no it does not OR unknown).
    external_ids: any; // Known external IDs for the track.
    external_urls: string; // Known external URLs for this track.
    href: string; // A link to the Web API endpoint providing full details of the track.
    id: string; // The Spotify ID for the track.
    is_playable: boolean;
    restrictions: any;
    name: string; // The name of the track.
    popularity: number;
    track_number: number; // The number of the track. If an album has several discs, the track number is the number on the specified disc.
    type: string; // The object type: “track”.
    uri: string; // The Spotify URI for the track.
    is_local: boolean; // Whether or not the track is from a local file.
}
