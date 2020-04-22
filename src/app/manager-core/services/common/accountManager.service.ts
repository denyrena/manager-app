import { Account } from './../../entities/account';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountManagerService {
    accounts: Account[];

    constructor() {
        this.accounts = [];
    }

    addAccount(account: Account) {
        this.accounts.push(account);
        this.updateLocalStorage();
    }

    removeAccount(account: Account) {
        // TODO: remove
    }

    getaccounts(): Account[] {
        return this.accounts;  
    }

    private updateLocalStorage() {
        localStorage.setItem('accounts', JSON.stringify(this.accounts));
    }
}
