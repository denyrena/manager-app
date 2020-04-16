import { Injectable } from '@angular/core';
@Injectable()
export class ParseUrl {
    public Decode(queryString: string): object {
        let urlParams = {};
        let match: any;
        const pl = /\+/g;
        const search = /([^&=]+)=?([^&]*)/g;
        const decode = (s: string) => decodeURIComponent(s.replace(pl, ' '));

        while ((match = search.exec(queryString))) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    }
}
