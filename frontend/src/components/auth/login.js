import {ValidationUtils} from "../../utils/validation-utils";
import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";
import {HttpUtils} from "../../utils/http-utils";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        // если есть токен в локал сторедж, то перебрасываем на главную
        if (localStorage.getItem('userInfo') ) {
            return this.openNewRoute('/');
        }

        // if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
        //     return this.openNewRoute('/');
        // }

        this.findElements();

        // this.validations = [
        //     {element: this.passwordElement},
        //     {element: this.emailElement, option: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/}},
        // ];
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
            // отправляем
            const loginResult = await AuthService.logIn({
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: this.rememberMeElement.checked
            });

            // получаем
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