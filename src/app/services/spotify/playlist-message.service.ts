import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PlaylistMessageService {
    private messageSource = new BehaviorSubject<string>('');
    currentMessage = this.messageSource.asObservable();

    constructor() {}

    callPlaylistInit(playlistId: string){
      this.messageSource.next(playlistId);
    }
}
