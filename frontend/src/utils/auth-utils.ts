import config from "../config/config";
import {UserInfoType} from "../types/user-info.type";

export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    // устанавливает значение
    static setAuthInfo(accessToken: string, refreshToken: string, userInfo: UserInfoType | null = null): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    // устанавливает значение для нового пользоватедя без токена
    static setAuthInfoNew(userInfo: UserInfoType): void {
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    // удаляет значение
    static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    // получает значение
    static getAuthInfo(key: string | null = null): any {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            }
        }
    }

    static async updateRefreshToken(): Promise<boolean> {
        let result: boolean = false;
        const refreshToken = this.getAuthInfo(this.refreshTokenKey);
        if (typeof refreshToken === 'string') {
            try {
                const response = await fetch(config.api + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: refreshToken}),
                });
                if (response && response.status === 200) {
                    const tokens = await response.json();
                    if (tokens && !tokens.error && tokens.accessToken && tokens.refreshToken) {
                        this.setAuthInfo(tokens.accessToken, tokens.refreshToken);
                        result = true;
                    }
                }
            } catch (error) {
                console.error('Ошибка обновления refresh token:', error);
            }
        }
        if (!result) {
            this.removeAuthInfo();
        }

        return result;
    }
}