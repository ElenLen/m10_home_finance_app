import {TokensType} from "./tokens.type";
import {UserInfoType} from "./user-info.type";

export interface LoginResponseType {
    tokens: TokensType;
    user: UserInfoType;
}