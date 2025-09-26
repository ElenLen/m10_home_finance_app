import {OperationsService} from "../../services/operations-service";
import {UrlUtils} from "../../utils/url-utils";
import {CategoryIncomeService} from "../../services/category-income-service";
import {CategoryExpenseService} from "../../services/category-expense-service";

export class EditIncomeExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.id = UrlUtils.getUrlParam('id');
        this.operationOriginalData = null;
        this.categories = [];

        this.init();
    }

    init() {
        // Проверка ID и редирект
        if (!this.id) {
            // console.log('ID операции не указан');
            return this.openNewRoute('/income-expenses');
        }
        if (!this.cacheElements()) {
            // console.log('Не найдены необходимые элементы DOM');
            return;
        }
        // this.cacheElements();
        this.bindEvents();
        this.loadOperation().then();
    }

    cacheElements() {
        this.elements = {
            typeSelect: document.getElementById('type'),
            categorySelect: document.getElementById('category'),
            amountInput: document.getElementById('amount'),
            dateInput: document.getElementById('date'),
            commentInput: document.getElementById('comment'),
            saveButton: document.querySelector('.btn-success'),
            cancelButton: document.querySelector('.btn-danger'),
        };
        // Проверяем, что основные элементы существуют
        if (!this.elements.typeSelect || !this.elements.amountInput || !this.elements.saveButton) {
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

    bindEvents() {
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

    async loadOperation() {
        try {
            // console.log('Загрузка операции с ID:', this.id);
            const response = await OperationsService.getOperation(this.id);
            // console.log('Ответ сервера:', response);

            if (response.error) {
                this.handleError(response);
                return;
            }

            this.operationOriginalData = response.operation;
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

    initializeForm() {
        // Заменяем текстовые поля на правильные типы
        this.replaceInputsWithProperElements();

        // Заполняем select типа операции
        this.populateTypeSelect();

        // Загружаем и заполняем категории
        this.loadCategories().then();

        // Заполняем остальные поля
        this.populateFormFields();
    }

    populateTypeSelect() {
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
            this.elements.typeSelect.appendChild(option);
        });

        // Устанавливаем значение из данных операции
        if (this.operationOriginalData && this.operationOriginalData.type) {
            this.elements.typeSelect.value = this.operationOriginalData.type;

            // Убираем selected с placeholder
            this.elements.typeSelect.querySelector('option[value=""]').selected = false;
        }

        // Делаем поле нередактируемым
        this.elements.typeSelect.disabled = true;
    }

    async loadCategories() {
        // const selectedType = this.operationOriginalData.type;
        const selectedType = this.elements.typeSelect ? this.elements.typeSelect.value :
            (this.operationOriginalData ? this.operationOriginalData.type : 'income');

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

    populateCategorySelect() {
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
            option.category_id = category.id;
            option.textContent = category.title;
            categorySelect.appendChild(option);
        });

        // Устанавливаем выбранную категорию
        if (this.operationOriginalData) {
            if (this.operationOriginalData.category) {
                categorySelect.value = this.operationOriginalData.category;
                this.operationOriginalData.category_id = categorySelect.selectedIndex;
                placeholderOption.selected = false;
            }
        }
    }

    populateFormFields() {
        if (!this.operationOriginalData) return;

        // console.log('Заполнение формы данными:', this.operationOriginalData);

        // Заполняем сумму
        if (this.elements.amountInput && this.operationOriginalData.amount) {
            this.elements.amountInput.value = this.operationOriginalData.amount;
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

    validateForm() {
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

    async updateOperation() {
        if (!this.validateForm()) {
            this.showError('Заполните все обязательные поля корректно');
            return;
        }

        let updateData = this.getUpdateData();

        // Проверяем, есть ли изменения
        if (Object.keys(updateData).length === 0) {
            // console.log('Нет изменений для сохранения');
            return this.redirectToOperations();
        } else {
            updateData = {};
            updateData.type = this.elements.typeSelect.value;
            updateData.amount = parseFloat(this.elements.amountInput.value);
            updateData.date = this.elements.dateInput.value;
            updateData.comment = this.elements.commentInput.value.trim();
            updateData.category_id = parseInt(this.elements.categorySelect.selectedIndex);
        }

        try {
            const response = await OperationsService.updateOperation(this.id, updateData);

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

    getUpdateData() {
        const updateData = {};

        // Проверяем изменения по каждому полю
        if (!this.operationOriginalData) return updateData;

        if (this.elements.typeSelect && this.elements.typeSelect.value !== this.operationOriginalData.type) {
            updateData.type = this.elements.typeSelect.value;
        }

        if (this.elements.categorySelect) {
            const currentCategoryId = parseInt(this.elements.categorySelect.selectedIndex);
            const originalCategoryId = this.operationOriginalData.category_id;
            if (currentCategoryId !== originalCategoryId) {
                updateData.category_id = currentCategoryId;
            }
        }

        if (this.elements.amountInput) {
            const currentAmount = parseFloat(this.elements.amountInput.value);
            const originalAmount = parseFloat(this.operationOriginalData.amount);
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

    cancelOperation() {
        this.redirectToOperations();
    }

    redirectToOperations() {
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