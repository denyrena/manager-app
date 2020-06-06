import { DeezerUserInfoService } from './../deezer/deezer-user-info.service';
import { SpotifyUserInfoService } from 'src/app/services/spotify/spotify-user-info.service';
import { UIAccount } from 'src/app/manager-core/entities/UI/ui-account.class';
import { Platform } from 'src/app/manager-core/enums/platform.enum';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeezerUser } from 'src/app/manager-core/entities/deezer/user.i';
import { TokenService } from 'spotify-auth';

@Injectable({
    providedIn: 'root',
})
export class AccountMessageService {
    private accountUnRegistered$ = new BehaviorSubject<null>(null);
    private accounts$ = new BehaviorSubject<UIAccount[]>([]);

    public accountUnRegistered = this.accountUnRegistered$.asObservable();
    public accounts = this.accounts$.asObservable();

    constructor(
        private spotifyInfo: SpotifyUserInfoService,
        private dzInfo: DeezerUserInfoService,
        private tokenSvc: TokenService
    ) {}

    registerAccount(platform: Platform, token: string) {
        if (platform === Platform.Spotify) {
            this.spotifyInfo.setNewtoken(token);
            this.spotifyInfo
                .fetchUserInfoNew()
                .subscribe((data) => this.AddNewAccount(data, token, platform));
        } else {
            this.dzInfo.setAccessToken(token);
            this.dzInfo
                .fetchUserInfo()
                .subscribe((data) => this.AddNewAccount(data, token, platform));
        }
    }
    unRegisterAccount(platform: Platform) {
        this.tokenSvc.clearToken(); // FOR SPOTIFY ONLY
        sessionStorage.removeItem(platform);
        this.accountUnRegistered$.next(null);
    }

    private AddNewAccount(
        data: SpotifyApi.CurrentUsersProfileResponse | DeezerUser,
        token: string,
        platform: Platform
    ) {
        const acc =
            platform === Platform.Spotify
                ? UIAccount.createFromSpotifyRawData(
                      data as SpotifyApi.CurrentUsersProfileResponse,
                      token
                  )
                : UIAccount.createFromDeezerRawData(data as DeezerUser, token);

        sessionStorage.setItem(platform, JSON.stringify(acc));

        this.restoreAccounts();
    }

    public restoreAccounts() {
        const availableAccounts = [];
        const deezerStorage = sessionStorage.getItem(Platform.Deezer);
        const spotifyStorage = sessionStorage.getItem(Platform.Spotify);

        if (deezerStorage) {
            const dzAcc = JSON.parse(deezerStorage) as UIAccount;
            availableAccounts.push(dzAcc);
            this.dzInfo.setAccessToken(dzAcc.accessToken);
        }
        if (spotifyStorage) {
            const spotyAcc = JSON.parse(spotifyStorage) as UIAccount;
            availableAccounts.push(spotyAcc);
            this.spotifyInfo.setNewtoken(spotyAcc.accessToken);
        }

        this.accounts$.next(availableAccounts);
    }

    isNeedShow(platform: Platform): boolean {
        if (platform) {
            return sessionStorage.getItem(platform) !== null;
        }

        return sessionStorage.length > 0;
    }
}
