import { Platform } from '../../enums/platform.enum';
import { DeezerUser } from '../deezer/user.i';

export class UIAccount {
    private static readonly spotifyDefaultCoverUri =
        'https://open.scdn.co/cdn/images/favicon.5cb2bd30.ico';
    platform: Platform;
    login: string;
    accessToken: string;
    profilePhoto: string;

    private constructor(
        platform: Platform,
        login: string,
        accessToken: string,
        profilePhoto: string
    ) {
        this.platform = platform;
        this.login = login;
        this.accessToken = accessToken;
        this.profilePhoto = profilePhoto;
    }

    public static createFromSpotifyRawData(
        rawData: SpotifyApi.CurrentUsersProfileResponse,
        token: string
    ): UIAccount {
        const login = rawData.id;
        let profilePhoto = rawData.images[0].url;
        if (!profilePhoto) {
            profilePhoto = this.spotifyDefaultCoverUri;
        }
        const platform = Platform.Spotify;

        return new UIAccount(platform, login, token, profilePhoto);
    }

    public static createFromDeezerRawData(
        rawData: DeezerUser,
        token: string
    ): UIAccount {
        const login = rawData.name;
        const profilePhoto = rawData.picture_medium;
        const platform = Platform.Deezer;

        return new UIAccount(platform, login, token, profilePhoto);
    }
}
