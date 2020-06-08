import { ShowTracksMessage } from './../../manager-core/entities/UI/show-tracks-message.class';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';

@Injectable({
    providedIn: 'root',
})
export class TracksShowMessageService {
    private messageSource = new BehaviorSubject<
        ShowTracksMessage<UIPlaylist | string>
    >(null);
    currentMessage = this.messageSource.asObservable();

    constructor() {}

    callPlaylistInit(message: ShowTracksMessage<UIPlaylist | string>) {
        this.messageSource.next(message);
    }
}
