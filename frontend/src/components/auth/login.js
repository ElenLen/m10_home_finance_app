import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        // если есть токен в локал сторедж, то перебрасываем на главную
        if (localStorage.getItem('accessToken')) {
            return this.openNewRoute('/');
        }

        this.findElements();
        document.getElementById('process-button').addEventListener('click', this.login.bind(this));
    }

    findElements() {
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorElement = document.getElementById('common-error');
    }

    validateForm() {
        let isValid = true;
        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async login() {
        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            // отправляем запрос
            const loginResult = await AuthService.logIn({
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: this.rememberMeElement.checked
            });

            // получаем данные пользователя
            if (loginResult) {
                AuthUtils.setAuthInfo(loginResult.tokens.accessToken,
                    loginResult.tokens.refreshToken,
                    {
                        id: loginResult.user.id,
                        name: loginResult.user.name,
                        lastName: loginResult.user.lastName
                    }
                );
                return this.openNewRoute('/');
            }
            this.commonErrorElement.style.display = 'block';
        }
    }
}