import { Injectable } from '@angular/core';
import { TokenService, SpotifyAuthInterceptor } from 'spotify-auth';

@Injectable()
export class MySpotifyAuthInterceptor extends SpotifyAuthInterceptor {
    doOnError(err: any): void {}

    constructor(tokenSvc: TokenService) {
        super(tokenSvc);
    }
}
