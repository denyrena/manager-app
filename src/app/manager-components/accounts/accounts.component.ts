import { SpotifyUserInfoService } from './../../services/spotify/spotify-user-info.service';
import { Account } from '../../manager-core/entities/account.class';
import { Platform } from './../../manager-core/enums/platform.enum';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { KeyValue } from '@angular/common';
import {
    AuthConfig,
    AuthService,
    ScopesBuilder,
    TokenService,
} from 'spotify-auth';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit, OnDestroy {
    platforms = Platform;
    private stream: Subscription | null = null;

    accounts: Account[];

    constructor(
        private authService: AuthService,
        private tokenSvc: TokenService,
        private spotifyInfo: SpotifyUserInfoService
    ) {
        this.accounts = [];
    }

    ngOnDestroy(): void {
        if (this.stream) {
            this.stream.unsubscribe();
        }
    }

    ngOnInit(): void {
        const stream = this.tokenSvc.authTokens.pipe(
            switchMap((x) => {
                return this.spotifyInfo.fetchUserInfo();
            })
        );
        this.stream = stream.subscribe((x: any) => {
            let account = new Account();
            account.login = x['id'];
            account.profilePhoto = x['images'][0].url;
            account.platform = Platform.Spotify;

            this.accounts.push(account);
        });
    }

    linkAccount_Click(platform: Platform) {
        switch (platform) {
            case Platform.Spotify:
                this.authSpotify();
                return;
            case Platform.Deezer:
                this.authDeezer();
                return;
            case Platform.Youtube:
                this.authYoutube();
                return;
        }
    }

    removeAccount_Click(platform: Platform) {
        this.tokenSvc.clearToken(); // FOR SPOTIFY ONLY
        this.accounts = this.accounts.filter((a) => a.platform !== platform);
    }

    private authSpotify() {
        const scopes = new ScopesBuilder()
            .withScopes(ScopesBuilder.LIBRARY)
            .build();
        const ac: AuthConfig = {
            client_id: '3d292932c57948f18a984124b8dc41a1',
            response_type: 'token',
            redirect_uri: 'http://localhost:4200/authorized',
            state: '',
            show_dialog: true,
            scope: scopes,
        };
        this.authService.configure(ac).authorize();
    }

    private authDeezer() {}

    private authYoutube() {}

    getAccountByPlatform(platformKey: string): Account {
        return this.accounts.find((a) => a.platform === platformKey);
    }

    isPlatormExpanded(platformKey: string): boolean {
        return (
            this.accounts.filter((a) => a.platform === platformKey).length > 0
        );
    }
}
