import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeezerUser } from 'src/app/manager-core/entities/deezer/user.i';

@Injectable({
    providedIn: 'root',
})
export class DeezerUserInfoService {
    private readonly userApiUrl = 'https://api.deezer.com/user/me';
    private token: string;

    constructor(private http: HttpClient) {}

    public setAccessToken(token: string) {
        this.token = token;
    }

    fetchUserInfo(): Observable<DeezerUser> {
        const accessToken = this.getAccessTokenString();
        return this.http.get(this.userApiUrl + accessToken) as Observable<
            DeezerUser
        >;
    }

    private getAccessTokenString(): string {
        return `?access_token=${this.token}`;
    }
}
