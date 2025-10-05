import {OperationsService} from "../../services/operations-service";
import {CategoryIncomeService} from "../../services/category-income-service";
import {CategoryExpenseService} from "../../services/category-expense-service";
import {UrlUtils} from "../../utils/url-utils";
import {CategoryType} from "../../types/category.type";
import {OperationType} from "../../types/operation.type";
import {OperationResponseType} from "../../types/operation-response.type";
import {Elements} from "../../types/elements";
import {OpenNewRouteFunction} from "../../types/open-new-route-function";

export class CreateIncomeExpenses {
    private openNewRoute: OpenNewRouteFunction;
    private operationType: string | null;
    private categories: CategoryType[];
    private elements: Elements;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.operationType = UrlUtils.getUrlParam('type'); // Получаем тип из URL
        this.categories = [];

        this.elements = {
            typeSelect: null,
            categorySelect: null,
            amountInput: null,
            dateInput: null,
            commentInput: null,
            createButton: null,
            cancelButton: null,
            errorContainer: null
        };

        this.init();
    }

    private init(): void {
        if (!this.cacheElements()) {
            // console.log('Не найдены необходимые элементы DOM');
            return;
        }

        this.bindEvents();
        this.initializeForm();
    }

    private cacheElements(): boolean {
        this.elements = {
            typeSelect: document.getElementById('type') as HTMLSelectElement | null,
            categorySelect: document.getElementById('category') as HTMLSelectElement | null,
            amountInput: document.getElementById('amount') as HTMLInputElement | null,
            dateInput: document.getElementById('date') as HTMLInputElement | null,
            commentInput: document.getElementById('comment') as HTMLInputElement | null,
            createButton: document.querySelector('.btn-success') as HTMLButtonElement | null,
            cancelButton: document.querySelector('.btn-danger') as HTMLButtonElement | null,
            errorContainer: null
        };

        if (!this.elements.typeSelect || !this.elements.amountInput || !this.elements.createButton) {
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

            if (this.elements && this.elements.createButton) {
                const createButton = this.elements.createButton;
                if (createButton.parentNode && createButton.parentNode.parentNode) {
                    createButton.parentNode.parentNode.insertBefore(
                        errorContainer,
                        createButton.parentNode.nextSibling
                    );
                }
            }
        }
        return errorContainer;
    }

    private bindEvents(): void {
        if (this.elements.createButton) {
            this.elements.createButton.addEventListener('click', this.createOperation.bind(this));
        }

        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', this.cancelOperation.bind(this));
        }

        if (this.elements.typeSelect) {
            this.elements.typeSelect.addEventListener('change', this.loadCategories.bind(this));
        }
    }

    private initializeForm(): void {
        // Заменяем текстовые поля на правильные типы
        this.replaceInputsWithProperElements();

        // Заполняем select типа операции
        this.populateTypeSelect();

        // Устанавливаем текущую дату по умолчанию
        this.setDefaultDate();

        // Загружаем категории для выбранного типа
        this.loadCategories();
    }

    private populateTypeSelect(): void {
        if (!this.elements.typeSelect) return;

        // Очищаем select
        this.elements.typeSelect.innerHTML = '';

        // Добавляем опции
        const options = [
            {value: '', text: 'Тип...', disabled: true},
            {value: 'income', text: 'Доход'},
            {value: 'expense', text: 'Расход'}
        ];

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            option.disabled = !!opt.disabled;
            if (this.elements.typeSelect) {
                this.elements.typeSelect.appendChild(option);
            }
        });

        // Устанавливаем значение из URL параметра
        if (this.operationType && (this.operationType === 'income' || this.operationType === 'expense')) {
            this.elements.typeSelect.value = this.operationType;
        } else {
            // Если тип не указан или невалиден, устанавливаем пустое значение
            this.elements.typeSelect.value = '';
        }
    }

    private async loadCategories(): Promise<void> {
        const selectedType = this.elements.typeSelect ? this.elements.typeSelect.value : this.operationType;

        if (!selectedType || (selectedType !== 'income' && selectedType !== 'expense')) {
            // Очищаем категории если тип не выбран
            this.clearCategorySelect();
            return;
        }

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

    private clearCategorySelect(): void {
        if (!this.elements.categorySelect) return;

        this.elements.categorySelect.innerHTML = '';
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Категория...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        this.elements.categorySelect.appendChild(placeholderOption);
    }

    private populateCategorySelect(): void {
        if (!this.elements.categorySelect) return;

        this.elements.categorySelect.innerHTML = '';

        // placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Выберите категорию...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        this.elements.categorySelect.appendChild(placeholderOption);

        // options категорий
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id.toString();
            option.textContent = category.title;
            if (this.elements.categorySelect) {
                this.elements.categorySelect.appendChild(option);
            }
        });
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
        input.placeholder = element.placeholder;
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

    private setDefaultDate(): void {
        if (this.elements.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.dateInput.value = today;
        }
    }

    private validateForm(): boolean {
        if (!this.elements) return false;

        let isValid = true;

        this.hideError();
        this.resetValidationStyles();

        // Валидация типа
        if (!this.elements.typeSelect || !this.elements.typeSelect.value) {
            this.markInvalid(this.elements.typeSelect);
            isValid = false;
        }

        // Валидация категории
        if (!this.elements.categorySelect || !this.elements.categorySelect.value) {
            this.markInvalid(this.elements.categorySelect);
            isValid = false;
        }

        // Валидация суммы
        const amount = this.elements.amountInput ? parseFloat(this.elements.amountInput.value) : 0;
        if (!this.elements.amountInput || !this.elements.amountInput.value || amount <= 0) {
            this.markInvalid(this.elements.amountInput);
            isValid = false;
        }

        // Валидация даты
        if (!this.elements.dateInput || !this.elements.dateInput.value) {
            this.markInvalid(this.elements.dateInput);
            isValid = false;
        }

        // Валидация комментария
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

    private showSuccess(message: string): void {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.className = 'alert alert-success';
            this.elements.errorContainer.textContent = message;
            this.elements.errorContainer.classList.remove('d-none');
        }
    }

    private async createOperation(): Promise<void> {
        if (!this.validateForm()) {
            this.showError('Заполните все обязательные поля корректно');
            return;
        }

        const operationData = this.getOperationData();
        // console.log('Данные для создания:', operationData);

        try {
            // Блокируем кнопку на время создания
            if (this.elements.createButton) {
                this.elements.createButton.disabled = true;
                this.elements.createButton.textContent = 'Создание...';
            }
            const response: any = await OperationsService.createOperation(operationData);

            if (response.error) {
                this.handleError(response);
                // Разблокируем кнопку при ошибке
                if (this.elements.createButton) {
                    this.elements.createButton.disabled = false;
                    this.elements.createButton.textContent = 'Создать';
                }
                return;
            }

            // console.log('Операция успешно создана с ID:', response.id);
            this.showSuccess('Операция успешно создана!');

            // Через 1.5 секунды переходим на главную страницу
            setTimeout(() => {
                this.redirectToIncomeExpenses();
            }, 1500);

        } catch (error) {
            // console.log('Ошибка создания операции:', error);
            this.showError('Возникла ошибка при создании операции');
            // Разблокируем кнопку при ошибке
            if (this.elements.createButton) {
                this.elements.createButton.disabled = false;
                this.elements.createButton.textContent = 'Создать';
            }
        }
    }

    private getOperationData(): OperationType {
        return {
            type: (this.elements.typeSelect?.value as 'income' | 'expense') || 'income',
            category_id: this.elements.categorySelect ? parseInt(this.elements.categorySelect.value) : 0,
            amount: this.elements.amountInput ? parseFloat(this.elements.amountInput.value) : 0,
            date: this.elements.dateInput?.value || '',
            comment: this.elements.commentInput?.value.trim() || ''
        };
    }

    private cancelOperation(): void {
        this.redirectToIncomeExpenses();
    }

    private redirectToIncomeExpenses(): void {
        this.openNewRoute('/income-expenses');
    }

    private handleError(response: OperationResponseType): void {
        if (response.error) {
            this.showError(response.error);
        }

        if (response.redirect) {
            this.openNewRoute(response.redirect);
        }
    }
}