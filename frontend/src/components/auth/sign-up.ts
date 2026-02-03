import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";
import {OpenNewRouteFunction} from "../../types/open-new-route-function";

export class SignUp {
    private openNewRoute: OpenNewRouteFunction;
    private nameElement: HTMLInputElement | undefined;
    private lastNameElement: HTMLInputElement | undefined;
    private emailElement: HTMLInputElement | undefined;
    private passwordElement: HTMLInputElement | undefined;
    private passwordRepeatElement: HTMLInputElement | undefined;
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
            processButton.addEventListener('click', this.signUp.bind(this));
        }
    }

    private findElements(): void {
        this.nameElement = document.getElementById('name') as HTMLInputElement;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement;
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error') as HTMLInputElement;
    }

    private validateForm(): boolean {
        let isValid = true;

        if (this.nameElement) {
            if (this.nameElement.value) {
                this.nameElement.classList.remove('is-invalid');
            } else {
                this.nameElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.lastNameElement) {
            if (this.lastNameElement.value) {
                this.lastNameElement.classList.remove('is-invalid');
            } else {
                this.lastNameElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.emailElement) {
            const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/;
            if (this.emailElement.value && this.emailElement.value.match(emailRegex)) {
                this.emailElement.classList.remove('is-invalid');
            } else {
                this.emailElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.passwordElement) {
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
            if (this.passwordElement.value && this.passwordElement.value.match(passwordRegex)) {
                this.passwordElement.classList.remove('is-invalid');
            } else {
                this.passwordElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.passwordRepeatElement && this.passwordElement) {
            if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
                this.passwordRepeatElement.classList.remove('is-invalid');
            } else {
                this.passwordRepeatElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    private async signUp(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        if (this.validateForm() &&
            this.nameElement &&
            this.lastNameElement &&
            this.emailElement &&
            this.passwordElement &&
            this.passwordRepeatElement
        ) {
            // отправляем
            const signupResult = await AuthService.signUp({
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value,
            })

            // токенов нет
            if (signupResult) {
                // получаем
                AuthUtils.setAuthInfoNew({
                    id: signupResult.user.id,
                    email: signupResult.user.email,
                    name: signupResult.user.name,
                    lastName: signupResult.user.lastName,
                });
                // если регистрация успешна, перекидываем на стр логина
                this.openNewRoute('/login');
            }
            if (this.commonErrorElement) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}