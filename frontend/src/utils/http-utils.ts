import config from "../config/config";
import {AuthUtils} from "./auth-utils";
import {RequestResult} from "../types/request-result";
import {RequestParams} from "../types/request-params";

export class HttpUtils {
    static async request(
        url: string,
        method: string = 'GET',
        useAuth: boolean = true,
        body: any = null
    ): Promise<RequestResult> {
        const result: RequestResult = {
            error: false,
            response: null
        };

        const params: RequestParams = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            },
        };
        let token: any = null;
        if (useAuth) {
            token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
            if (token) {
                params.headers['x-auth-token'] = token;
            }
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response: Response | null = null;
        try {
            response = await fetch(config.api + url, params);
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true;
            if (useAuth && response.status === 401) {

                if (!token) {
                    //     1-токена нет
                    result.redirect = '/login';
                } else {
                    //     2-токен устарел/невалидный (надо обновить)
                    const updateTokenResult = await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        //     запрос повторно
                        return this.request(url, method, useAuth, body);
                    } else {
                        result.redirect = '/login';
                    }
                }
            }
        }
        return result;
    }
}