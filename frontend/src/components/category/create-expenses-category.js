import {CategoryExpenseService} from "../../services/category-expense-service";

export class CreateExpensesCategory {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.nameCategoryInputElement = document.getElementById('name-category');
        this.nameCategoryErrorElement = document.getElementById('name-category-error');

        const el =  document.getElementById('saveButton');
        if (el) {
            el.addEventListener('click', this.saveCategory.bind(this), false);
        }

        const el1 =  document.getElementById('cancelButton');
        if (el1) {
            el1.addEventListener('click', this.cancelCategory.bind(this), false);
        }
    }

    validateForm() {
        let isValid = true;

        if (this.nameCategoryInputElement.value) {
            this.nameCategoryInputElement.classList.remove('is-invalid');
        } else {
            this.nameCategoryInputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    // по кнопке Сохранить отправляем запрос на добавление
    async saveCategory() {
        this.nameCategoryErrorElement.style.display = 'none';

        if (this.validateForm()) {
            const createData = {
                title: this.nameCategoryInputElement.value,
            };

            const response = await CategoryExpenseService.createCategory(createData);

            if (response.error) {
                console.log('Ошибка:', response.error);
                return response.redirect ? this.openNewRoute(response.redirect) : null;
            }
            return this.openNewRoute('/expenses');
        }
        this.nameCategoryErrorElement.style.display = 'block';
    }

    // по кнопке Отмена отправляем запрос на добавление
    async cancelCategory() {
        return this.openNewRoute('/expenses');
    }
}