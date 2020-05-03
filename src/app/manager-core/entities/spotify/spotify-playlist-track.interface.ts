import { SpotifyTrack } from './track.inteface';
export interface SpotifyPlaylistTrack {
    added_at: Date; // The date and time the track or episode was added.
    added_by: any; // The Spotify user who added the track or episode.
    is_local: boolean; // Whether this track or episode is a local file or not.
    track: SpotifyTrack; // Information about the track or episode.
}
