export class AppConstants {
    public static readonly SPOTIFY_AUTH_ENDPOINT: string =
        'https://accounts.spotify.com/authorize?client_id=3d292932c57948f18a984124b8dc41a1&response_type=token&redirect_uri=http://localhost:4200/login&scope=user-read-private%20user-read-email';
    public static readonly SPOTIFY_GET_CURRENT_PROFILE: string =
        'https://api.spotify.com/v1/me';
}
