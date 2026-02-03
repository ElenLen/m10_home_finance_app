import {HttpUtils} from "../utils/http-utils";
import {LoginDataType} from "../types/login-data.type";
import {SignUpDataType} from "../types/sign-up-data.type";
import {LogOutDataType} from "../types/log-out-data.type";
import {LoginResponseType} from "../types/login-response.type";
import {SignUpResponseType} from "../types/sign-up-response.type";

export class AuthService {
    static async logIn(data: LoginDataType): Promise<LoginResponseType | void> {
        const result = await HttpUtils.request('/login', 'POST', false, data);
        if (result.error || !result.response ||
            (result.response &&
                (!result.response.tokens?.accessToken ||
                    !result.response.tokens?.refreshToken ||
                    !result.response.user?.id ||
                    !result.response.user?.name ||
                    !result.response.user?.lastName))) {
            return;
        }
        return result.response;
    }

    static async signUp(data: SignUpDataType): Promise<SignUpResponseType | void> {
        const result = await HttpUtils.request('/signup', 'POST', false, data);
        if (result.error || !result.response ||
            (result.response &&
                (!result.response.user?.id ||
                    !result.response.user?.email ||
                    !result.response.user?.name ||
                    !result.response.user?.lastName))) {
            return;
        }
        return result.response;
    }

    static async logOut(data: LogOutDataType): Promise<void> {
        await HttpUtils.request('/logout', 'POST', false, data);
    }
}