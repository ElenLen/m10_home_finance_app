import {AuthUtils} from "../../utils/auth-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {AuthService} from "../../services/auth-service";
import {HttpUtils} from "../../utils/http-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();

        // this.validations = [
        //     {element: this.nameElement},
        //     {element: this.lastNameElement},
        //     {element: this.emailElement, option: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/}},
        //     {element: this.passwordElement, option: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
        //     {element: this.passwordRepeatElement, option: {compareTo: this.passwordElement.value}},
        //
        // ];
        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
    }

    findElements() {
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.commonErrorElement = document.getElementById('common-error');
    }

    validateForm() {
        let isValid = true;

        if (this.nameElement.value) {
            this.nameElement.classList.remove('is-invalid');
        } else {
            this.nameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.lastNameElement.value) {
            this.lastNameElement.classList.remove('is-invalid');
        } else {
            this.lastNameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
            this.passwordRepeatElement.classList.remove('is-invalid');
        } else {
            this.passwordRepeatElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async signUp() {
        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            const result = await HttpUtils.request('/signup', 'POST', {
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value,
            })

            if (result.error || !result.response || (result.response &&
                ( !result.response.user.id ||
                    !result.response.user.name || !result.response.user.lastName))) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            // токенов нет
            AuthUtils.setAuthInfo( {
                id: result.response.user.id,
                email: result.response.user.email,
                name: result.response.user.name,
                lastName: result.response.user.lastName
            });


            this.openNewRoute('/');
        }

        // for (let i = 0; i < this.validations.length; i++) {
        //     if (this.validations[i].element === this.passwordRepeatElement) {
        //         this.validations[i].option.compareTo = this.passwordRepeatElement.value;
        //     }
        // }

        // if (ValidationUtils.validateForm(this.validations)) {
        //     const signupResult = await AuthService.signUp({
        //         name: this.nameElement.value,
        //         lastName: this.lastNameElement.value,
        //         email: this.emailElement.value,
        //         password: this.passwordElement.value,
        //     });
        //
        //     if (signupResult) {
        //         AuthUtils.setAuthInfo(signupResult.accessToken, signupResult.refreshToken, {
        //             id: signupResult.id,
        //             name: signupResult.name
        //         });
        //
        //         //     перевод на гл стр
        //         return this.openNewRoute('/');
        //     }
        //
        //     this.commonErrorElement.style.display = 'block';
        //
        // }
    }
}