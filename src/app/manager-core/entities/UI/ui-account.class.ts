import { Platform } from '../../enums/platform.enum';
import { DeezerUser } from '../deezer/user.i';

export class UIAccount {
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
        const profilePhoto = rawData.images[0].url;
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
