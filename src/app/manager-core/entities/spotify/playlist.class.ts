import { SpotifyImage } from './image.class';
import { SpotifyPage } from './page.interface';
import { SpotifyTrack } from './track.inteface';
export class SpotifyPlaylist {
    collaborative: boolean; // Returns true if context is not search
    // and the owner allows other users to modify the playlist. Otherwise returns false.
    description: string; // The playlist description. Only returned for modified, verified playlists, otherwise null.
    external_urls: any; // an external URL object	Known external URLs for this playlist.
    followers: any; // A followers object	Information about the followers of the playlist.
    href: string; // A link to the Web API endpoint providing full details of the playlist.
    id: string; // The Spotify ID for the playlist.
    images: SpotifyImage[]; // Images for the playlist. The array may be empty or contain up to three images.
    name: string; // The name of the playlist.
    owner: any; // The user who owns the playlist
    public: boolean | null; // The playlist’s public/private status: true the playlist is public,
    // false the playlist is private, null the playlist status is not relevant.
    snapshot_id: string; // The version identifier for the current playlist.
    tracks: SpotifyPage<SpotifyTrack>; // Information about the tracks of the playlist.
    type: string; // The object type: “playlist”
    uri: string; // The Spotify URI for the playlist.
}
