import { AccountMessageService } from './../../services/common/account-message.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Platform } from 'src/app/manager-core/enums/platform.enum';

@Component({
    selector: 'app-deezer-auth',
    template: `<h3>Authorizing;</h3>`,
    styles: [``],
})
export class DeezerAuthComponent implements OnInit {
    constructor(
        private ams: AccountMessageService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.route.fragment
            .pipe(
                map((fragment) => new URLSearchParams(fragment)),
                map((params) => ({
                    access_token: params.get('access_token')
                }))
            )
            .subscribe((params) => {
                ams.registerAccount(Platform.Deezer, params.access_token);
                this.router.navigateByUrl('/home');
            });
    }

    ngOnInit(): void {}
}
