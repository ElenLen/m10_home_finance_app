import {UrlUtils} from "../../utils/url-utils";
import {CategoryExpenseService} from "../../services/category-expense-service";
import {CategoryType} from "../../types/category.type";
import {UpdateCategoryType} from "../../types/update-category.type";
import {OpenNewRouteFunction} from "../../types/open-new-route-function";

export class EditExpensesCategory {
    private openNewRoute: OpenNewRouteFunction;
    private nameCategoryInputElement: HTMLInputElement;
    private nameCategoryErrorElement: HTMLElement;
    private categoryOriginalData: CategoryType | null;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.categoryOriginalData = null;

        this.nameCategoryInputElement = document.getElementById('name-category') as HTMLInputElement;
        this.nameCategoryErrorElement = document.getElementById('name-category-error') as HTMLElement;

        const id = UrlUtils.getUrlParam('id');

        if (!id) {
            this.openNewRoute('/expenses');
            return;
        }

        this.getCategory(id).then();

        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', this.updateCategory.bind(this), false);
        }

        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.cancelCategory.bind(this), false);
        }
    }

    //     поиск категории по id
    private async getCategory(id: any): Promise<void> {
        const response: any = await CategoryExpenseService.getCategory(id);

        if (response.error) {
            alert(response.error);
            if (response.redirect) {
                this.openNewRoute(response.redirect);
            }
            return;
        }

        if (response.expense) {
            this.categoryOriginalData = response.expense;
            this.showCategory(response.expense);
        }
    }

    private showCategory(category: CategoryType): void {
        const nameCategoryElement = document.getElementById('name-category') as HTMLInputElement;
        if (nameCategoryElement) {
            nameCategoryElement.value = category.title;
        }
    }

    private validateForm(): boolean {
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
    private async updateCategory(): Promise<void> {
        if (this.nameCategoryErrorElement) {
            this.nameCategoryErrorElement.style.display = 'none';
        }

        if (this.validateForm()) {
            const updateData: UpdateCategoryType = {};

            if (this.categoryOriginalData && this.nameCategoryInputElement.value !== this.categoryOriginalData.title) {
                updateData.title = this.nameCategoryInputElement.value;
            } else {
                this.openNewRoute('/expenses');
                return;
            }

            if (Object.keys(updateData).length > 0 && this.categoryOriginalData) {
                const id = this.categoryOriginalData.id;
                const response: any = await CategoryExpenseService.updateCategory(id, updateData);

                if (response.error) {
                    console.log('Ошибка при обновлении:', response.error);
                    if (response.redirect) {
                        this.openNewRoute(response.redirect);
                    }
                    return;
                }
                this.openNewRoute('/expenses');
            }
        } else {
            if (this.nameCategoryErrorElement) {
                this.nameCategoryErrorElement.style.display = 'block';
            }
        }
    }

    // по кнопке Отмена отправляем запрос на добавление
    private cancelCategory(): void {
        this.openNewRoute('/expenses');
    }
}