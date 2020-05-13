import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AccountMessageService {
    private accountRegistered$ = new BehaviorSubject<null>(null);
    private accountUnRegistered$ = new BehaviorSubject<null>(null);
    private accountsCount = 0;

    public accountRegistered = this.accountRegistered$.asObservable();
    public accountUnRegistered = this.accountUnRegistered$.asObservable();

    constructor() {}

    registerAccount() {
        this.accountRegistered$.next(null);
        this.accountsCount++;
    }
    unRegisterAccount() {
        this.accountUnRegistered$.next(null);
        if (this.accountsCount > 0) {
            this.accountsCount--;
        } else {
            throw new Error('Not all accounts was registered');
        }
    }

    hasAccounts(): boolean {
        return this.accountsCount > 0;
    }
}
