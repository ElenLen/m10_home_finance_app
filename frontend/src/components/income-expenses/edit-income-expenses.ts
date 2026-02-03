import {OperationsService} from "../../services/operations-service";
import {UrlUtils} from "../../utils/url-utils";
import {CategoryIncomeService} from "../../services/category-income-service";
import {CategoryExpenseService} from "../../services/category-expense-service";
import {CategoryType} from "../../types/category.type";
import {OperationIncomeType} from "../../types/operation-income.type";
import {ElementsType} from "../../types/elements.type";
import {OperationResponseIncomeType} from "../../types/operation-response-income.type";
import {OpenNewRouteFunction} from "../../types/open-new-route-function";

interface CustomHTMLOptionElement extends HTMLOptionElement {
    category_id?: number;
}

export class EditIncomeExpenses {
    private openNewRoute: OpenNewRouteFunction;
    private id: string | null;
    private operationOriginalData: OperationIncomeType | null;
    private categories: CategoryType[];
    private elements: ElementsType;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.id = UrlUtils.getUrlParam('id');
        this.operationOriginalData = null;
        this.categories = [];

        this.elements = {
            typeSelect: null,
            categorySelect: null,
            amountInput: null,
            dateInput: null,
            commentInput: null,
            saveButton: null,
            cancelButton: null,
            errorContainer: null
        };

        this.init();
    }

    private init(): void {
        // Проверка ID и редирект
        if (!this.id) {
            // console.log('ID операции не указан');
            this.openNewRoute('/income-expenses');
            return;
        }
        if (!this.cacheElements()) {
            // console.log('Не найдены необходимые элементы DOM');
            return;
        }
        // this.cacheElements();
        this.bindEvents();
        this.loadOperation().then();
    }

    private cacheElements(): boolean {
        this.elements = {
            typeSelect: document.getElementById('type') as HTMLSelectElement | null,
            categorySelect: document.getElementById('category') as HTMLSelectElement | null,
            amountInput: document.getElementById('amount') as HTMLInputElement | null,
            dateInput: document.getElementById('date') as HTMLInputElement | null,
            commentInput: document.getElementById('comment') as HTMLInputElement | null,
            saveButton: document.querySelector('.btn-success') as HTMLButtonElement | null,
            cancelButton: document.querySelector('.btn-danger') as HTMLButtonElement | null,
            errorContainer: null
        };

        // Проверяем, что основные элементы существуют
        if (!this.elements.typeSelect || !this.elements.amountInput || !this.elements.saveButton) {
            return false;
        }

        this.elements.errorContainer = this.createErrorContainer();
        return true;
    }

    private createErrorContainer(): HTMLElement {
        let errorContainer = document.getElementById('error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.className = 'alert alert-danger d-none';
            errorContainer.style.marginTop = '10px';

            if (this.elements && this.elements.saveButton) {
                const saveButton = this.elements.saveButton;
                if (saveButton.parentNode && saveButton.parentNode.parentNode) {
                    saveButton.parentNode.parentNode.insertBefore(
                        errorContainer,
                        saveButton.parentNode.nextSibling
                    );
                }
            }
        }
        return errorContainer;
    }

    private bindEvents(): void {
        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', this.updateOperation.bind(this));
        }

        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', this.cancelOperation.bind(this));
        }

        if (this.elements.typeSelect) {
            this.elements.typeSelect.addEventListener('change', this.loadCategories.bind(this));
        }
    }

    private async loadOperation(): Promise<void> {
        try {
            if (!this.id) return;

            // console.log('Загрузка операции с ID:', this.id);
            const response: any = await OperationsService.getOperation(parseInt(this.id));
            // console.log('Ответ сервера:', response);

            if (response.error) {
                this.handleError(response);
                return;
            }

            this.operationOriginalData = response.operations || null;
            // console.log('Данные операции:', this.operationOriginalData);

            if (!this.operationOriginalData) {
                this.showError('Данные операции не найдены');
                return;
            }

            this.initializeForm();

        } catch (error) {
            // console.log('Ошибка загрузки операции:', error);
            this.showError('Ошибка загрузки данных операции');
        }
    }

    private initializeForm(): void {
        // Заменяем текстовые поля на правильные типы
        this.replaceInputsWithProperElements();

        // Заполняем select типа операции
        this.populateTypeSelect();

        // Загружаем и заполняем категории
        this.loadCategories().then();

        // Заполняем остальные поля
        this.populateFormFields();
    }

    private populateTypeSelect(): void {
        if (!this.elements.typeSelect) return;

        // Очищаем select
        this.elements.typeSelect.innerHTML = '';

        // Добавляем опции
        const options = [
            {value: '', text: 'Тип...', disabled: true, selected: true},
            {value: 'income', text: 'Доход'},
            {value: 'expense', text: 'Расход'}
        ];

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            option.disabled = !!opt.disabled;
            option.selected = !!opt.selected;
            if (this.elements.typeSelect) {
                this.elements.typeSelect.appendChild(option);
            }
        });

        // Устанавливаем значение из данных операции
        if (this.operationOriginalData && this.operationOriginalData.type) {
            this.elements.typeSelect.value = this.operationOriginalData.type;

            // Убираем selected с placeholder
            const placeholderOption = this.elements.typeSelect.querySelector('option[value=""]');
            if (placeholderOption) {
                (placeholderOption as HTMLOptionElement).selected = false;
            }
        }

        // Делаем поле нередактируемым
        this.elements.typeSelect.disabled = true;
    }

    private async loadCategories(): Promise<void> {
        const selectedType = this.elements.typeSelect
            ? this.elements.typeSelect.value
            : (this.operationOriginalData
                ? this.operationOriginalData.type
                : 'income');

        // console.log('Загрузка категорий для типа:', selectedType);
        try {
            let response: any;
            if (selectedType === 'income') {
                response = await CategoryIncomeService.getCategories();
            } else {
                response = await CategoryExpenseService.getCategories();
            }

            if (response.error) {
                this.showError('Ошибка загрузки категорий');
                return;
            }

            this.categories = response.categories || [];
            this.populateCategorySelect();

        } catch (error) {
            // console.log('Ошибка загрузки категорий:', error);
            this.showError('Ошибка загрузки категорий');
        }
    }

    private replaceInputsWithProperElements(): void {
        // Заменяем поле суммы на number input
        if (this.elements.amountInput && this.elements.amountInput.type !== 'number') {
            this.replaceWithNumberInput(this.elements.amountInput);
        }

        // Заменяем поле даты на date input
        if (this.elements.dateInput && this.elements.dateInput.type !== 'date') {
            this.replaceWithDateInput(this.elements.dateInput);
        }
    }

    private replaceWithNumberInput(element: HTMLInputElement): void {
        if (!element) return;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control border rounded-2';
        input.style.cssText = element.style.cssText;
        input.placeholder = element.placeholder || '';
        input.id = element.id;
        input.min = '0';
        input.step = '0.01';

        element.replaceWith(input);
        this.elements.amountInput = input;
    }

    private replaceWithDateInput(element: HTMLInputElement): void {
        if (!element) return;

        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'form-control border rounded-2';
        input.style.cssText = element.style.cssText;
        input.id = element.id;

        element.replaceWith(input);
        this.elements.dateInput = input;
    }

    private populateCategorySelect(): void {
        if (!this.elements.categorySelect) return;

        const categorySelect = this.elements.categorySelect;
        categorySelect.innerHTML = '';

        // placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Категория...';
        placeholderOption.disabled = true;
        categorySelect.appendChild(placeholderOption);

        // options категорий
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.title;
            (option as any).category_id = category.id;
            option.textContent = category.title;
            categorySelect.appendChild(option);
        });

        // Устанавливаем выбранную категорию
        if (this.operationOriginalData) {
            if (this.operationOriginalData.category) {
                categorySelect.value = this.operationOriginalData.category;
                (this.operationOriginalData as any).category_id = categorySelect.selectedIndex;
                placeholderOption.selected = false;
            }
        }
    }

    private populateFormFields(): void {
        if (!this.operationOriginalData) return;

        // console.log('Заполнение формы данными:', this.operationOriginalData);

        // Заполняем сумму
        if (this.elements.amountInput && this.operationOriginalData.amount) {
            if (typeof this.operationOriginalData.amount === "string") {
                this.elements.amountInput.value = this.operationOriginalData.amount;
            } else {
                this.elements.amountInput.value = this.operationOriginalData.amount.toString();
            }
        }

        // Заполняем дату
        if (this.elements.dateInput && this.operationOriginalData.date) {
            this.elements.dateInput.value = this.operationOriginalData.date;
        }

        // Заполняем комментарий
        if (this.elements.commentInput && this.operationOriginalData.comment) {
            this.elements.commentInput.value = this.operationOriginalData.comment;
        }
    }

    private validateForm(): boolean {
        if (!this.elements) return false;

        let isValid = true;

        this.hideError();
        this.resetValidationStyles();

        if (!this.elements.typeSelect || !this.elements.typeSelect.value) {
            this.markInvalid(this.elements.typeSelect);
            isValid = false;
        }

        if (!this.elements.categorySelect || !this.elements.categorySelect.value) {
            this.markInvalid(this.elements.categorySelect);
            isValid = false;
        }

        const amount = this.elements.amountInput ? parseFloat(this.elements.amountInput.value) : 0;
        if (!this.elements.amountInput || !this.elements.amountInput.value || amount <= 0) {
            this.markInvalid(this.elements.amountInput);
            isValid = false;
        }

        if (!this.elements.dateInput || !this.elements.dateInput.value) {
            this.markInvalid(this.elements.dateInput);
            isValid = false;
        }

        if (!this.elements.commentInput || !this.elements.commentInput.value.trim()) {
            this.markInvalid(this.elements.commentInput);
            isValid = false;
        }

        return isValid;
    }

    private markInvalid(element: HTMLElement | null): void {
        if (element && element.classList) {
            element.classList.add('is-invalid');
        }
    }

    private resetValidationStyles(): void {
        if (!this.elements) return;

        Object.values(this.elements).forEach(element => {
            if (element && element.classList) {
                element.classList.remove('is-invalid');
            }
        });
    }

    private showError(message: string): void {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.textContent = message;
            this.elements.errorContainer.classList.remove('d-none');
        }
    }

    private hideError(): void {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.classList.add('d-none');
        }
    }

    private async updateOperation(): Promise<void> {
        if (!this.validateForm()) {
            this.showError('Заполните все обязательные поля корректно');
            return;
        }

        let updateData = this.getUpdateData();

        // Проверяем, есть ли изменения
        if (Object.keys(updateData).length === 0) {
            // console.log('Нет изменений для сохранения');
            this.redirectToOperations();
            return;
        } else {
            updateData = {
                type: this.elements.typeSelect?.value || '',
                amount: this.elements.amountInput ? parseFloat(this.elements.amountInput.value) : 0,
                date: this.elements.dateInput?.value || '',
                comment: this.elements.commentInput?.value.trim() || '',
                category_id: this.elements.categorySelect ? updateData.category_id : 0
            };
        }

        try {
            if (!this.id) return;

            const response: OperationResponseIncomeType = await OperationsService.updateOperation(this.id, updateData);

            if (response.error) {
                this.handleError(response);
                return;
            }

            // console.log('Операция успешно обновлена');
            this.redirectToOperations();

        } catch (error) {
            // console.log('Ошибка обновления операции:', error);
            this.showError('Возникла ошибка при обновлении операции');
        }
    }

    private getUpdateData(): any {
        const updateData: any = {};

        // Проверяем изменения по каждому полю
        if (!this.operationOriginalData) return updateData;

        if (this.elements.typeSelect && this.elements.typeSelect.value !== this.operationOriginalData.type) {
            updateData.type = this.elements.typeSelect.value;
        }

        if (this.elements.categorySelect) {
            const select = this.elements.categorySelect as HTMLSelectElement;
            const selectedOption = select.options[select.selectedIndex] as CustomHTMLOptionElement;
            const categoryId = selectedOption.category_id;

            const currentCategoryId = categoryId || 0;
            const originalCategoryId = this.operationOriginalData.category_id || 0;
            if (currentCategoryId !== originalCategoryId) {
                updateData.category_id = currentCategoryId;
            }
        }

        if (this.elements.amountInput) {
            const currentAmount = parseFloat(this.elements.amountInput.value);
            const originalAmount = typeof this.operationOriginalData.amount === 'string'
                ? parseFloat(this.operationOriginalData.amount)
                : this.operationOriginalData.amount;

            if (currentAmount !== originalAmount) {
                updateData.amount = currentAmount;
            }
        }

        if (this.elements.dateInput && this.elements.dateInput.value !== this.operationOriginalData.date) {
            updateData.date = this.elements.dateInput.value;
        }

        if (this.elements.commentInput) {
            const currentComment = this.elements.commentInput.value.trim();
            const originalComment = this.operationOriginalData.comment || '';
            if (currentComment !== originalComment) {
                updateData.comment = currentComment;
            }
        }
        return updateData;
    }

    private cancelOperation(): void {
        this.redirectToOperations();
    }

    private redirectToOperations(): void {
        this.openNewRoute('/income-expenses');
    }

    private handleError(response: OperationResponseIncomeType): void {
        if (response.error) {
            this.showError(response.error);
        }

        if (response.redirect) {
            this.openNewRoute(response.redirect);
        }
    }
}