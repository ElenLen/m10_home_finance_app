import {UserInfoType} from "./user-info.type";

export interface SignUpResponseType {
    user: Omit<UserInfoType, 'email'> & { email?: string };
}