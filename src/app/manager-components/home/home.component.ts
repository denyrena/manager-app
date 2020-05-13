import { TokenService } from 'spotify-auth';
import { PlaylistMessageService } from './../../services/spotify/playlist-message.service';
import { MainContent } from './../../manager-core/enums/main-content.enum';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    public currentContent: MainContent = MainContent.Hello;

    public switchMainContentTo(content: MainContent) {
        this.currentContent = content;
    }

    public initPlaylistLoading(id: string) {
        this.switchMainContentTo(MainContent.Tracks);
        this.pms.callPlaylistInit(id);
    }

    constructor(
        private pms: PlaylistMessageService,
        private tks: TokenService
    ) {}

    ngOnInit(): void {}
}
