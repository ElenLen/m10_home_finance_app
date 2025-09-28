import {UrlUtils} from "../../utils/url-utils";
import {CategoryExpenseService} from "../../services/category-expense-service";

export class EditExpensesCategory {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        const id = UrlUtils.getUrlParam('id');

        this.nameCategoryInputElement = document.getElementById('name-category');
        this.nameCategoryErrorElement = document.getElementById('name-category-error');

        this.getCategory(id).then();

        if (!id) {
            return this.openNewRoute('/expenses');
        }

        const el =  document.getElementById('saveButton');
        if (el) {
            el.addEventListener('click', this.updateCategory.bind(this), false);
        }

        const el1 =  document.getElementById('cancelButton');
        if (el1) {
            el1.addEventListener('click', this.cancelCategory.bind(this), false);
        }
    }

    //     поиск категории по id
    async getCategory(id) {
        const response = await CategoryExpenseService.getCategory(id);

        if (response.error) {
            alert(response.error);
            return response.redirect ? this.openNewRoute(response.redirect) : null;
        }

        this.categoryOriginalData = response.expense;
        this.showCategory(response.expense);
    }

    showCategory(category) {
        const nameCategoryElement = document.getElementById('name-category');
        nameCategoryElement.value = category.title;
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
    async updateCategory() {
        this.nameCategoryErrorElement.style.display = 'none';

        if (this.validateForm()) {
            const createData = {};
            if (this.nameCategoryInputElement.value !== this.categoryOriginalData.title) {
                createData.title = this.nameCategoryInputElement.value;
            } else {
                return this.openNewRoute('/expenses');
            }
            if (Object.keys(createData).length > 0) {
                const  id = this.categoryOriginalData.id;
                const response = await CategoryExpenseService.updateCategory(id, createData);

                if (response.error) {
                    console.log('Ошибка при удалении:', response.error);
                    return response.redirect ? this.openNewRoute(response.redirect) : null;
                }
                return this.openNewRoute('/expenses');
            }
        }
        this.nameCategoryErrorElement.style.display = 'block';
    }

    // по кнопке Отмена отправляем запрос на добавление
    async cancelCategory() {
        return this.openNewRoute('/expenses');
    }
}