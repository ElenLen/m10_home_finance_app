import {AuthUtils} from "../../utils/auth-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();

        this.validations = [
            {element: this.nameElement},
            {element: this.lastNameElement},
            {element: this.emailElement, option: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([_.]\w+)*$/}},
            {element: this.passwordElement, option: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, option: {compareTo: this.passwordElement.value}},

        ];
        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
    }

    findElements() {
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        // this.commonErrorElement = document.getElementById('common-error');
    }

    async signUp() {
        // this.commonErrorElement.style.display = 'none';

        for (let i = 0; i < this.validations.length; i++) {
            if (this.validations[i].element === this.passwordRepeatElement) {
                this.validations[i].option.compareTo = this.passwordRepeatElement.value;
            }
        }

        if (ValidationUtils.validateForm(this.validations)) {
            // const signupResult = await AuthService.signUp({
            //     name: this.nameElement.value,
            //     lastName: this.lastNameElement.value,
            //     email: this.emailElement.value,
            //     password: this.passwordElement.value,
            // });

            // if (signupResult) {
            //     AuthUtils.setAuthInfo(signupResult.accessToken, signupResult.refreshToken, {
            //         id: signupResult.id,
            //         name: signupResult.name
            //     });
            //
            //     //     перевод на гл стр
            //     return this.openNewRoute('/');
            // }

            // this.commonErrorElement.style.display = 'block';

        }
    }
}