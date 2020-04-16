import { Account } from './../../manager-core/entities/account';
import { AppConstants } from './../../manager-core/utils/constants';
import { Platform } from './../../manager-core/enums/platform.enum';
import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  platforms = Platform;
  accounts: KeyValue<Platform, Account[]>[];

  constructor() {
    this.accounts = [];
   }

  ngOnInit(): void {
    // TODO load accounts from local storage for all platforms
    const deezer: KeyValue<Platform, Account[]> = {
      key: Platform.Deezer,
      value: [
        {
          id: 1,
          platform: Platform.Deezer,
          login: 'noiretea',
          accessToken: '5fe01282e44241328a84e7c5cc169165',
          tokenExpireDate: new Date(),
          profilePhoto: 'https://e-cdns-files.dzcdn.net/cache/images/common/favicon/favicon.a6a53d55264841165a904dbea19d5d73.ico'
        }
      ]
    }
    const spoty = {
      key: Platform.Spotify,
      value: []
    }
    const yt = {
      key: Platform.Youtube,
      value: []
    }

    this.accounts.push(deezer, spoty, yt);
  }

  getAccountsByPlatform(platformKey): Account[] {
    return this.accounts.find(s => s.key == platformKey).value;
  }

  linkAccount_Click(platform: string): void {
    let width = 860;
    let height = 500;
    let left = (screen.width / 2) - (width / 2);
    let top = (screen.height / 2) - (height / 2);
    const windowOptions = `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`;
    let type = 'auth';

    window.open(this.chooseUrl(platform), type, windowOptions);
  }

  private chooseUrl(platform: string): string {
    switch (platform) {
      case Platform.Spotify:
        return AppConstants.SPOTIFY_AUTH_ENDPOINT;
      default:
        return null;
    }
  }

}
