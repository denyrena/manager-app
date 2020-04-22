import { AppConstants } from './../../utils/constants';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotifyQueryService {
    constructor(private httpClient: HttpClient) {}

    fillBasicInfo(token: string): Observable<any> {
        const customHeaders = new HttpHeaders({
            Authorization: 'Bearer ' + token,
        });

        return this.httpClient.get(AppConstants.SPOTIFY_GET_CURRENT_PROFILE, {
            headers: customHeaders,
        });
    }
}
