import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";

type OpenNewRouteFunction = (url: string) => void;

export class Logout {
    private openNewRoute: OpenNewRouteFunction;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey as any)
            || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey as any)
        ) {
            AuthUtils.removeAuthInfo();
            this.openNewRoute('/login');
            return;
        }

        this.logout().then();
    }

    private async logout(): Promise<void> {
        const refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey as any);
        if (refreshToken) {
            await AuthService.logOut({
                refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey as any),
            });
        }

        AuthUtils.removeAuthInfo();
        //     перевод на гл стр
        this.openNewRoute('/login');
    }

}