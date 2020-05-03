import { SpotifyUserInfoService } from './services/spotify/spotify-user-info.service';
import { NgMaterial } from './manager-core/utils/material-modules';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './manager-components/home/home.component';
import { AccountsComponent } from './manager-components/accounts/accounts.component';
import { ActionsComponent } from './manager-components/actions/actions.component';
import { PlaylistsComponent } from './manager-components/playlists/playlists.component';
import { AccountComponent } from './manager-components/account/account.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MySpotifyAuthInterceptor } from './interceptors/my-spotify-auth.interceptor';
import { TracksComponent } from './manager-components/tracks/tracks.component';
import { WizardComponent } from './manager-components/wizard/wizard.component';
import { HelloComponent } from './manager-components/hello/hello.component';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        AccountsComponent,
        ActionsComponent,
        PlaylistsComponent,
        AccountComponent,
        TracksComponent,
        WizardComponent,
        HelloComponent,
    ],
    imports: [AppRoutingModule, NgMaterial, HttpClientModule],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MySpotifyAuthInterceptor,
            multi: true,
        },
        SpotifyUserInfoService
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
