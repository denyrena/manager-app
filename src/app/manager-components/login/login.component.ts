import { SpotifyAuthService } from '../../manager-core/services/spotify/spotifyAuth.service';
import { IAuth } from './../../manager-core/entities/iAuth';
import { ParseUrl } from './../../manager-core/utils/parse-url';
import { WindowRef } from './../../manager-core/utils/window-ref';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    constructor(
        private activatedRoute: ActivatedRoute,
        private parser: ParseUrl,
        private windowHandler: WindowRef,
        private spotifyAuth: SpotifyAuthService
    ) {
        activatedRoute.fragment.subscribe((fragment: any) => {
            const authPart = parser.Decode(fragment);

            spotifyAuth.handleAccessToken(authPart);

            windowHandler.nativeWindow.close();
        });
    }

    ngOnInit(): void {}
}
