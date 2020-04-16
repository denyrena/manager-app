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
        private window: WindowRef,
        private parser: ParseUrl
    ) {
        activatedRoute.fragment.subscribe((fragment) => {
            console.log(fragment);
            console.log(parser.Decode(fragment));
        });

        // const routeFragment: Observable<string> = activatedRoute.fragment;
        // routeFragment.subscribe(fragment => {
        //   let f = fragment.match(/^(.*?)&/);
        //   if (f) {
        //     let token: string = f[1].replace('access_token=', '');
        //     alert(token);
        //     this.window.nativeWindow.close();
        //   }
        // });
    }

    ngOnInit(): void {}
}
