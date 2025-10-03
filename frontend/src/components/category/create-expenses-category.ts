import {CategoryExpenseService} from "../../services/category-expense-service";

type OpenNewRouteFunction = (url: string) => void;

export class CreateExpensesCategory {
    private openNewRoute: OpenNewRouteFunction;
    private nameCategoryInputElement: HTMLInputElement;
    private nameCategoryErrorElement: HTMLElement;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;

        this.nameCategoryInputElement = document.getElementById('name-category') as HTMLInputElement;
        this.nameCategoryErrorElement = document.getElementById('name-category-error') as HTMLElement;

        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', this.saveCategory.bind(this), false);
        }

        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.cancelCategory.bind(this), false);
        }
    }

    private validateForm(): boolean {
        let isValid = true;

        if (this.nameCategoryInputElement) {
            if (this.nameCategoryInputElement.value) {
                this.nameCategoryInputElement.classList.remove('is-invalid');
            } else {
                this.nameCategoryInputElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    // по кнопке Сохранить отправляем запрос на добавление
    private async saveCategory(): Promise<void> {
        if (this.nameCategoryErrorElement) {
            this.nameCategoryErrorElement.style.display = 'none';
        }

        if (this.validateForm()) {
            const createData = {
                title: this.nameCategoryInputElement.value,
            };

            const response = await CategoryExpenseService.createCategory(createData);

            if (response.error) {
                console.log('Ошибка:', response.error);
                if (response.redirect) {
                    this.openNewRoute(response.redirect);
                }
                return;
            }
            this.openNewRoute('/expenses');
            return;
        } else {
            if (this.nameCategoryErrorElement) {
                this.nameCategoryErrorElement.style.display = 'block';
            }
        }
    }

    // по кнопке Отмена отправляем запрос на добавление
    private cancelCategory(): void {
        this.openNewRoute('/expenses');
        return;
    }
}