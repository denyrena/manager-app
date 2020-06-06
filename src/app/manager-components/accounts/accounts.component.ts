import { AccountMessageService } from './../../services/common/account-message.service';
import { Platform } from './../../manager-core/enums/platform.enum';
import { Component, OnInit } from '@angular/core';
import {
    AuthConfig,
    AuthService,
    ScopesBuilder,
    TokenService,
} from 'spotify-auth';
import { UIAccount } from 'src/app/manager-core/entities/UI/ui-account.class';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    platforms = Platform;
    accounts: UIAccount[];

    constructor(
        private authService: AuthService,
        private tokenSvc: TokenService,
        private ams: AccountMessageService
    ) {}

    ngOnInit(): void {
        this.tokenSvc.authTokens.subscribe((t) => {
            if (t !== '') {
                this.ams.registerAccount(Platform.Spotify, t);
            }
        });

        this.ams.restoreAccounts();

        this.ams.accounts.subscribe((data) => (this.accounts = data));
    }

    linkAccount_Click(platform: Platform) {
        switch (platform) {
            case Platform.Spotify:
                this.authSpotify();
                return;
            case Platform.Deezer:
                this.authDeezer();
                return;
        }
    }

    removeAccount_Click(platform: Platform) {
        this.ams.unRegisterAccount(platform);
        this.accounts = this.accounts.filter((a) => a.platform !== platform);
    }

    getAccountByPlatform(platformKey: string): UIAccount {
        return this.accounts.find((a) => a.platform === platformKey);
    }

    isPlatormExpanded(platformKey: string): boolean {
        return (
            this.accounts.filter((a) => a.platform === platformKey).length > 0
        );
    }

    private authSpotify() {
        const scopes = new ScopesBuilder()
            .withScopes(ScopesBuilder.LIBRARY, ScopesBuilder.PLAYLISTS)
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

    private authDeezer() {
        const callbackUrl = 'http://localhost:4200/authorize1';
        const appid = '418162';
        const scope = 'basic_access,email,manage_library';
        const url = `https://connect.deezer.com/oauth/auth.php?app_id=${appid}&redirect_uri=${callbackUrl}&perms=${scope}&response_type=token`;

        const win = window.open(encodeURI(url), '_self');
        win.focus();
    }
}
