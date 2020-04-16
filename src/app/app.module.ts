import { ParseUrl } from './manager-core/utils/parse-url';
import { WindowRef } from './manager-core/utils/window-ref';
import { NgMaterial } from './manager-core/utils/material-modules';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './manager-components/login/login.component';
import { HomeComponent } from './manager-components/home/home.component';
import { AccountsComponent } from './manager-components/accounts/accounts.component';
import { ActionsComponent } from './manager-components/actions/actions.component';
import { PlaylistsComponent } from './manager-components/playlists/playlists.component';
import { AccountComponent } from './manager-components/account/account.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        AccountsComponent,
        ActionsComponent,
        PlaylistsComponent,
        AccountComponent,
    ],
    imports: [AppRoutingModule, NgMaterial],
    providers: [WindowRef, ParseUrl],
    bootstrap: [AppComponent],
})
export class AppModule {}
