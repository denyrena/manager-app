import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { TokenService } from 'spotify-auth';
import { TracksShowMessageService } from '../../services/spotify/tracks-show-message.service';
import { MainContent } from './../../manager-core/enums/main-content.enum';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    public currentContent: MainContent = MainContent.Hello;

    constructor(private tsms: TracksShowMessageService) {}

    ngOnInit(): void {
        this.tsms.currentMessage.subscribe((data) =>
            this.switchMainContentTo(MainContent.Tracks)
        );
    }

    public switchMainContentTo(content: MainContent) {
        this.currentContent = content;
    }
}
