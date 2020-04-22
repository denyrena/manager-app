import { AuthPart } from './../../entities/authpart';
import { AccountManagerService } from './../common/accountManager.service';
import { SpotifyQueryService } from './spotifyQuery.service';
import { Account } from '../../entities/account';
import { Platform } from '../../enums/platform.enum';
import { IAuth } from '../../entities/iAuth';
import { Injectable } from '@angular/core';
import { AppConstants } from '../../utils/constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotifyAuthService implements IAuth {

    public onUpdateAccounts: BehaviorSubject<any> = new BehaviorSubject(null);
    public platform: Platform = Platform.Spotify;

    constructor(
        private spotifyQS: SpotifyQueryService,
        private accountManager: AccountManagerService
    ) {
    }

    openWindow(): void {
        const windowOptions = `_blank`;
        window.open(AppConstants.SPOTIFY_AUTH_ENDPOINT, windowOptions);
    }
    handleAccessToken(authPart: any) {
        let account: Account = new Account();

        account.accessToken = authPart.access_token;

        let now: Date = new Date();
        now.setSeconds(now.getSeconds() + (authPart.expires_in as number));
        account.tokenExpireDate = now;
        account.platform = this.platform;

        this.spotifyQS.fillBasicInfo(account.accessToken).subscribe((data) => {
            account.login = data['id'];
            account.profilePhoto = data['images'][0].url;

            this.accountManager.addAccount(account);

            this.onUpdateAccounts.next(null);
        });
    }
}
