import { Platform } from '../enums/platform.enum';

export class Account {

    id: number;
    platform: Platform;
    login: string;
    accessToken: string;
    tokenExpireDate: Date;
    profilePhoto: string;
}