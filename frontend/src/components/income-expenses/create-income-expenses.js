import {OperationsService} from "../../services/operations-service";
import {CategoryIncomeService} from "../../services/category-income-service";
import {CategoryExpenseService} from "../../services/category-expense-service";
import {UrlUtils} from "../../utils/url-utils";

export class CreateIncomeExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.operationType = UrlUtils.getUrlParam('type'); // Получаем тип из URL
        this.categories = [];

        this.init();
    }

    init() {
        if (!this.cacheElements()) {
            // console.log('Не найдены необходимые элементы DOM');
            return;
        }

        this.bindEvents();
        this.initializeForm();
    }

    cacheElements() {
        this.elements = {
            typeSelect: document.getElementById('type'),
            categorySelect: document.getElementById('category'),
            amountInput: document.getElementById('amount'),
            dateInput: document.getElementById('date'),
            commentInput: document.getElementById('comment'),
            createButton: document.querySelector('.btn-success'),
            cancelButton: document.querySelector('.btn-danger')
        };

        if (!this.elements.typeSelect || !this.elements.amountInput || !this.elements.createButton) {
            return false;
        }

        this.elements.errorContainer = this.createErrorContainer();
        return true;
    }

    createErrorContainer() {
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

    bindEvents() {
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

    initializeForm() {
        // Заменяем текстовые поля на правильные типы
        this.replaceInputsWithProperElements();

        // Заполняем select типа операции
        this.populateTypeSelect();

        // Устанавливаем текущую дату по умолчанию
        this.setDefaultDate();

        // Загружаем категории для выбранного типа
        this.loadCategories();
    }

    populateTypeSelect() {
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
            this.elements.typeSelect.appendChild(option);
        });

        // Устанавливаем значение из URL параметра
        if (this.operationType && (this.operationType === 'income' || this.operationType === 'expense')) {
            this.elements.typeSelect.value = this.operationType;
        } else {
            // Если тип не указан или невалиден, устанавливаем пустое значение
            this.elements.typeSelect.value = '';
        }
    }

    async loadCategories() {
        const selectedType = this.elements.typeSelect ? this.elements.typeSelect.value : this.operationType;

        if (!selectedType || (selectedType !== 'income' && selectedType !== 'expense')) {
            // Очищаем категории если тип не выбран
            this.clearCategorySelect();
            return;
        }

        // console.log('Загрузка категорий для типа:', selectedType);

        try {
            let response;
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

    clearCategorySelect() {
        if (!this.elements.categorySelect) return;

        this.elements.categorySelect.innerHTML = '';
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Категория...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        this.elements.categorySelect.appendChild(placeholderOption);
    }

    populateCategorySelect() {
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
            option.value = category.id;
            option.textContent = category.title;
            this.elements.categorySelect.appendChild(option);
        });
    }

    replaceInputsWithProperElements() {
        // Заменяем поле суммы на number input
        if (this.elements.amountInput && this.elements.amountInput.type !== 'number') {
            this.replaceWithNumberInput(this.elements.amountInput);
        }

        // Заменяем поле даты на date input
        if (this.elements.dateInput && this.elements.dateInput.type !== 'date') {
            this.replaceWithDateInput(this.elements.dateInput);
        }
    }

    replaceWithNumberInput(element) {
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

    replaceWithDateInput(element) {
        if (!element) return;

        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'form-control border rounded-2';
        input.style.cssText = element.style.cssText;
        input.id = element.id;

        element.replaceWith(input);
        this.elements.dateInput = input;
    }

    setDefaultDate() {
        if (this.elements.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.dateInput.value = today;
        }
    }

    validateForm() {
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

    markInvalid(element) {
        if (element && element.classList) {
            element.classList.add('is-invalid');
        }
    }

    resetValidationStyles() {
        if (!this.elements) return;

        Object.values(this.elements).forEach(element => {
            if (element && element.classList) {
                element.classList.remove('is-invalid');
            }
        });
    }

    showError(message) {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.textContent = message;
            this.elements.errorContainer.classList.remove('d-none');
        }
    }

    hideError() {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.classList.add('d-none');
        }
    }

    showSuccess(message) {
        if (this.elements.errorContainer) {
            this.elements.errorContainer.className = 'alert alert-success';
            this.elements.errorContainer.textContent = message;
            this.elements.errorContainer.classList.remove('d-none');
        }
    }

    async createOperation() {
        if (!this.validateForm()) {
            this.showError('Заполните все обязательные поля корректно');
            return;
        }

        const operationData = this.getOperationData();
        // console.log('Данные для создания:', operationData);

        try {
            // Блокируем кнопку на время создания
            this.elements.createButton.disabled = true;
            this.elements.createButton.textContent = 'Создание...';

            const response = await OperationsService.createOperation(operationData);

            if (response.error) {
                this.handleError(response);
                // Разблокируем кнопку при ошибке
                this.elements.createButton.disabled = false;
                this.elements.createButton.textContent = 'Создать';
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
            this.elements.createButton.disabled = false;
            this.elements.createButton.textContent = 'Создать';
        }
    }

    getOperationData() {
        return {
            type: this.elements.typeSelect.value,
            category_id: parseInt(this.elements.categorySelect.value),
            amount: parseFloat(this.elements.amountInput.value),
            date: this.elements.dateInput.value,
            comment: this.elements.commentInput.value.trim()
        };
    }

    cancelOperation() {
        this.redirectToIncomeExpenses();
    }

    redirectToIncomeExpenses() {
        this.openNewRoute('/income-expenses');
    }

    handleError(response) {
        if (response.error) {
            this.showError(response.error);
        }

        if (response.redirect) {
            this.openNewRoute(response.redirect);
        }
    }
}