import { AccountManagerService } from './../../manager-core/services/common/accountManager.service';
import { SpotifyAuthService } from '../../manager-core/services/spotify/spotifyAuth.service';
import { IAuth } from './../../manager-core/entities/iAuth';
import { Account } from './../../manager-core/entities/account';
import { Platform } from './../../manager-core/enums/platform.enum';
import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    platforms = Platform;
    accounts: KeyValue<Platform, Account[]>[];
    private readonly authProviders: IAuth[];

    constructor(
        private spotifyAuth: SpotifyAuthService,
        private accountManager: AccountManagerService
    ) {
        this.accounts = [];
        this.authProviders = [];

        this.authProviders.push(spotifyAuth);
    }

    ngOnInit(): void {
        this.convertAccountsForUI();
        this.spotifyAuth.onUpdateAccounts.subscribe((o) => {
            this.convertAccountsForUI();
        });
    }

    getAccountsByPlatform(platformKey: string): Account[] {
        return this.accounts.find((s) => s.key === platformKey).value;
    }

    linkAccount_Click(platform: Platform): void {
        this.executeProviderByPlatform(platform);
    }

    private executeProviderByPlatform(platform: string): void {
        let authProvider: IAuth;
        authProvider = this.authProviders.find((p) => p.platform === platform);
        authProvider.openWindow();
    }

    private convertAccountsForUI() {
        const accounts: KeyValue<Platform, Account[]>[] = [];
        const innerAccounts = this.accountManager.getaccounts();

        const spotifyAccounts: KeyValue<Platform, Account[]> = {
            key: Platform.Spotify,
            value: this.filterAccountsByPlatform(
                innerAccounts,
                Platform.Spotify
            ),
        };

        const deezerAccounts: KeyValue<Platform, Account[]> = {
            key: Platform.Deezer,
            value: this.filterAccountsByPlatform(
                innerAccounts,
                Platform.Deezer
            ),
        };

        const youtubeAccounts: KeyValue<Platform, Account[]> = {
            key: Platform.Youtube,
            value: this.filterAccountsByPlatform(
                innerAccounts,
                Platform.Youtube
            ),
        };

        accounts.push(spotifyAccounts, deezerAccounts, youtubeAccounts);

        this.accounts = accounts;
    }

    filterAccountsByPlatform(
        accounts: Account[],
        platform: Platform
    ): Account[] {
        if (accounts == null) {
            return [];
        }
        return accounts.filter((a) => a.platform === platform);
    }
}
