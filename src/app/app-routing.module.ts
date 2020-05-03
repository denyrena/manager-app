import { MySpotifyAuthInterceptor } from './interceptors/my-spotify-auth.interceptor';
import { HomeComponent } from './manager-components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpotifyAuthModule } from 'spotify-auth';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    SpotifyAuthModule.authRoutes()[0],
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes), SpotifyAuthModule.forRoot()],
    exports: [RouterModule],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MySpotifyAuthInterceptor,
            multi: true,
        },
    ],
})
export class AppRoutingModule {}
