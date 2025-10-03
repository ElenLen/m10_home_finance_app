import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";
import {LoginResponseType} from "../../types/login-response.type";

type OpenNewRouteFunction = (url: string) => void;

export class Login {
    private openNewRoute: OpenNewRouteFunction;
    private emailElement: HTMLInputElement | undefined;
    private passwordElement: HTMLInputElement | undefined;
    private rememberMeElement: HTMLInputElement | undefined;
    private commonErrorElement: HTMLElement | undefined;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;

        // если есть токен в локал сторедж, то перебрасываем на главную
        if (localStorage.getItem('accessToken')) {
            this.openNewRoute('/');
            return;
        }

        this.findElements();
        const processButton = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.login.bind(this));
        }
    }

    private findElements(): void {
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error') as HTMLInputElement;
    }

    private validateForm(): boolean {
        let isValid = true;
        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/;
        if (this.emailElement) {
            if (this.emailElement.value && this.emailElement.value.match(emailRegex)) {
                this.emailElement.classList.remove('is-invalid');
            } else {
                this.emailElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.passwordElement) {
            if (this.passwordElement.value) {
                this.passwordElement.classList.remove('is-invalid');
            } else {
                this.passwordElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    public async login(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        if (this.validateForm() &&
            this.emailElement &&
            this.passwordElement &&
            this.rememberMeElement
        ) {
            // отправляем запрос
            const loginResult: void | LoginResponseType = await AuthService.logIn({
                email: this.emailElement.value,
                password: this.passwordElement.value,
                // rememberMe: this.rememberMeElement.checked
            });

            // получаем данные пользователя
            if (loginResult &&
                loginResult.tokens &&
                loginResult.user) {

                AuthUtils.setAuthInfo(
                    loginResult.tokens.accessToken,
                    loginResult.tokens.refreshToken,
                    {
                        id: loginResult.user.id,
                        name: loginResult.user.name,
                        lastName: loginResult.user.lastName
                    } as any
                );
                this.openNewRoute('/');
                return;
            }
            if (this.commonErrorElement) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}