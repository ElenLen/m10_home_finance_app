import {ValidationUtils} from "../../utils/validation-utils";
import {AuthUtils} from "../../utils/auth-utils";

export class Login {
    constructor(openNewRoute) {
        console.log('Login ');
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();

        this.validations = [
            {element: this.passwordElement},
            {element: this.emailElement, option: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/}},
        ];
        document.getElementById('process-button').addEventListener('click', this.login.bind(this));

    }

    findElements() {
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        // this.commonErrorElement = document.getElementById('common-error');
    }

    async login() {
        // this.commonErrorElement.style.display = 'none';
        if (ValidationUtils.validateForm(this.validations)) {

            // const loginResult = await AuthService.logIn({
            //     email: this.emailElement.value,
            //     password: this.passwordElement.value
            // });

            // if (loginResult) {
            //
            //     AuthUtils.setAuthInfo(loginResult.accessToken, loginResult.refreshToken, {
            //         id: loginResult.id,
            //         name: loginResult.name
            //     });
            //
            //     //     перевод на гл стр
            //     return this.openNewRoute('/');
            // }

            // this.commonErrorElement.style.display = 'block';
        }
    }

}