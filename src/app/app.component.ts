import { Component, OnInit } from '@angular/core';
import { TokenService, AuthService } from 'spotify-auth';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(
        private tokenSvc: TokenService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.authService.authorizedStream
            .pipe(filter((x: boolean) => x))
            .subscribe(() => {
                this.router.navigate(['home']);
            });
    }
}
