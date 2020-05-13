import { AccountMessageService } from './../../services/common/account-message.service';
import { TokenService } from 'spotify-auth';
import { SpotifyUserInfoService } from './../../services/spotify/spotify-user-info.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-playlists',
    templateUrl: './playlists.component.html',
    styleUrls: ['./playlists.component.scss'],
})
export class PlaylistsComponent implements OnInit {
    @Output() public SelectedPlaylistChanged: EventEmitter<
        string
    > = new EventEmitter();

    public playlists: Observable<SpotifyApi.PlaylistObjectSimplified[]>;

    constructor(
        private spotyInfo: SpotifyUserInfoService,
        private ams: AccountMessageService
    ) {}

    ngOnInit(): void {
        this.playlists = this.ams.accountRegistered.pipe(
            switchMap(() => {
                return this.spotyInfo.fetchUserPlaylists();
            })
        );
    }

    selectPlaylist(id: string) {
        this.SelectedPlaylistChanged.emit(id);
    }

    isNeedShow(): boolean {
        return this.ams.hasAccounts();
    }
}
