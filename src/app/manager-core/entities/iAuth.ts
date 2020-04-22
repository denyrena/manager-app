import { Platform } from './../enums/platform.enum';

export interface IAuth {
    platform: Platform;
    openWindow(): void;
    handleAccessToken(authPart: any): void;
}
