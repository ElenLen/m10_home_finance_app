import {OperationsService} from "../../services/operations-service";
import {OperationIncomeType} from "../../types/operation-income.type";
import {OperationResponseIncomeType} from "../../types/operation-response-income.type";
import {ElementsIncomeExpensesType} from "../../types/elements-income-expenses.type";
import {OpenNewRouteFunction} from "../../types/open-new-route-function";

export class IncomeExpenses {
    private openNewRoute: OpenNewRouteFunction;
    private operations: OperationIncomeType[];
    private operationToDelete: string | null;
    private currentFilter: string;
    private dateFrom: string;
    private dateTo: string;
    private elements: ElementsIncomeExpensesType;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.operations = [];
        this.operationToDelete = null; //  ID  для удаления

        // Устанавливаем текущую дату по умолчанию
        this.currentFilter = 'today';
        const today = new Date().toISOString().split('T')[0];
        this.dateFrom = today;
        this.dateTo = today;

        this.elements = {
            tableBody: null,
            filterButtons: {} as NodeListOf<HTMLElement>,
            dateStart: null,
            dateEnd: null,
            confirmDeleteBtn: null,
            cancelDeleteBtn: null,
            modal: null
        };

        this.init();
    }

    private async init(): Promise<void> {
        this.cacheElements();
        this.setDefaultFilter();
        this.bindEvents();
        await this.loadOperations();
    }

    private cacheElements(): void {
        this.elements = {
            tableBody: document.querySelector('.table tbody'),
            filterButtons: document.querySelectorAll('.interval .btn'),
            dateStart: document.getElementById('date-start') as HTMLInputElement | null,
            dateEnd: document.getElementById('date-end') as HTMLInputElement | null,
            confirmDeleteBtn: document.getElementById('confirmDelete') as HTMLButtonElement | null,
            cancelDeleteBtn: document.querySelector('#staticBackdrop .btn-danger[data-bs-dismiss="modal"]') as HTMLButtonElement | null,
            modal: document.getElementById('staticBackdrop')
        };
    }

    private setDefaultFilter(): void {
        // Всегда показываем поля дат
        this.showDateIntervalFields();

        // Заполняем поля датами по умолчанию
        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }

        // Активируем кнопку "Сегодня" по умолчанию
        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
            this.elements.filterButtons.forEach(button => {
                if (button.textContent.trim().toLowerCase() === 'сегодня') {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }

    private bindEvents(): void {
        // Обработчики для кнопок фильтрации периода
        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
            this.elements.filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleFilterClick(e.target as HTMLElement);
                });
            });
        }

        // Обработчики для полей дат интервала
        if (this.elements.dateStart) {
            this.elements.dateStart.addEventListener('change', this.handleDateIntervalChange.bind(this));
        }

        if (this.elements.dateEnd) {
            this.elements.dateEnd.addEventListener('change', this.handleDateIntervalChange.bind(this));
        }

        // Инициализируем обработчик удаления
        this.initDeleteHandler();
    }

    private initDeleteHandler(): void {
        // Обработчик клика по кнопкам удаления в таблице
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const deleteButton = target.closest('.delete-operation') as HTMLElement;

            if (deleteButton) {
                e.preventDefault();
                this.operationToDelete = deleteButton.dataset.id || null;
                // console.log('Операция для удаления:', this.operationToDelete);
            }
        });

        // Обработчик кнопки "Да, удалить" в модальном окне
        if (this.elements.confirmDeleteBtn) {
            this.elements.confirmDeleteBtn.addEventListener('click', this.confirmDelete.bind(this));
        }

        // Обработчик кнопки "Не удалять" в модальном окне
        if (this.elements.cancelDeleteBtn) {
            this.elements.cancelDeleteBtn.addEventListener('click', this.cancelDelete.bind(this));
        }

        // Обработчик закрытия модального окна (сброс состояния)
        if (this.elements.modal) {
            this.elements.modal.addEventListener('hidden.bs.modal', () => {
                this.operationToDelete = null;
            });
        }
    }

    private async confirmDelete(): Promise<void> {
        if (!this.operationToDelete) {
            // console.log('Нет операции для удаления');
            this.closeModal();
            return;
        }

        try {
            // Отправляем запрос на удаление
            const response = await OperationsService.deleteOperation(parseInt(this.operationToDelete));

            if (response.error) {
                // console.log('Ошибка при удалении операции:', response.error);
                if (response.redirect) {
                    this.openNewRoute(response.redirect);
                } else {
                    // alert('Ошибка при удалении операции: ' + response.error);
                }
                this.closeModal();
                return;
            }

            // console.log('Операция успешно удалена');

            // Закрываем модальное окно
            this.closeModal();

            // Обновляем таблицу
            await this.loadOperations();

        } catch (error) {
            console.log('Ошибка при удалении операции:', error);
            this.closeModal();
        }
    }

    private cancelDelete(): void {
        // console.log('Удаление отменено');
        this.operationToDelete = null;
        this.closeModal();
    }

    private closeModal(): void {
        if (this.elements.modal) {
            const bootstrap = (window as any).bootstrap;
            const modal = bootstrap.Modal.getInstance(this.elements.modal);
            if (modal) {
                modal.hide();
            }
        }
        this.operationToDelete = null;
    }

    private handleFilterClick(clickedButton: HTMLElement): void {
        // Убираем активный класс у всех кнопок
        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {

            this.elements.filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Добавляем активный класс нажатой кнопке
            clickedButton.classList.add('active');
        }
        // Определяем тип фильтра по тексту кнопки
        const filterText = clickedButton.textContent?.trim().toLowerCase() || '';

        switch (filterText) {
            case 'сегодня':
                this.currentFilter = 'today';
                this.setTodayDates();
                break;
            case 'неделя':
                this.currentFilter = 'week';
                this.setWeekDates();
                break;
            case 'месяц':
                this.currentFilter = 'month';
                this.setMonthDates();
                break;
            case 'год':
                this.currentFilter = 'year';
                this.setYearDates();
                break;
            case 'интервал':
                this.currentFilter = 'interval';
                // Для интервала не меняем даты, оставляем текущие
                break;
            case 'все':
                this.currentFilter = 'all';
                // Для "все" устанавливаем широкий диапазон
                this.setAllDates();
                break;
            default:
                this.currentFilter = 'today';// По умолчанию "Сегодня"
                this.setAllDates();
        }

        // Загружаем операции с новым фильтром
        this.loadOperations();
    }

    private setTodayDates(): void {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        this.dateFrom = todayString;
        this.dateTo = todayString;

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = todayString;
            this.elements.dateEnd.value = todayString;
        }
    }

    private setWeekDates(): void {
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(today.getDate() + diffToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        this.dateFrom = startOfWeek.toISOString().split('T')[0];
        this.dateTo = endOfWeek.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    private setMonthDates(): void {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        this.dateFrom = startOfMonth.toISOString().split('T')[0];
        this.dateTo = endOfMonth.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    private setYearDates(): void {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 2);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        this.dateFrom = startOfYear.toISOString().split('T')[0];
        this.dateTo = endOfYear.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    private setAllDates(): void {
        // Устанавливаем широкий диапазон для "всех" операций
        const startDate = new Date(2020, 0, 1);
        const endDate = new Date(2030, 11, 31);

        this.dateFrom = startDate.toISOString().split('T')[0];
        this.dateTo = endDate.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    private handleDateIntervalChange(): void {
        // Проверяем, что обе даты заполнены
        if (this.elements.dateStart && this.elements.dateEnd) {
            // Если какая-то дата пустая, устанавливаем текущую дату
            const today = new Date().toISOString().split('T')[0];

            if (!this.elements.dateStart.value) {
                this.elements.dateStart.value = today;
            }
            if (!this.elements.dateEnd.value) {
                this.elements.dateEnd.value = today;
            }

            this.dateFrom = this.elements.dateStart.value;
            this.dateTo = this.elements.dateEnd.value;

            // Меняем фильтр на "интервал" при ручном изменении дат
            this.currentFilter = 'interval';

            // Активируем кнопку "Интервал"
            if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
                this.elements.filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.textContent.trim().toLowerCase() === 'интервал') {
                        btn.classList.add('active');
                    }
                });
            }

            this.loadOperations();
        }
    }

    private showDateIntervalFields(): void {
        // Поля дат всегда видны
        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.style.display = 'inline-block';
            this.elements.dateStart.style.width = '100px';
            this.elements.dateEnd.style.display = 'inline-block';
            this.elements.dateEnd.style.width = '100px';

            // Устанавливаем минимальные и максимальные значения для валидации
            this.elements.dateStart.setAttribute('required', 'true');
            this.elements.dateEnd.setAttribute('required', 'true');
        }
    }

    private validateDates(): boolean {
        if (!this.elements.dateStart || !this.elements.dateEnd) {
            return false;
        }

        // Проверяем, что даты заполнены
        if (!this.elements.dateStart.value || !this.elements.dateEnd.value) {
            // Если какая-то дата пустая, устанавливаем значения по умолчанию
            if (!this.elements.dateStart.value) {
                this.elements.dateStart.value = this.dateFrom;
            }
            if (!this.elements.dateEnd.value) {
                this.elements.dateEnd.value = this.dateTo;
            }
            return false;
        }

        // Проверяем, что начальная дата не больше конечной
        const startDate = new Date(this.elements.dateStart.value);
        const endDate = new Date(this.elements.dateEnd.value);

        if (startDate > endDate) {
            // Если начальная дата больше конечной, меняем их местами
            [this.elements.dateStart.value, this.elements.dateEnd.value] =
                [this.elements.dateEnd.value, this.elements.dateStart.value];

            this.dateFrom = this.elements.dateStart.value;
            this.dateTo = this.elements.dateEnd.value;
        }

        return true;
    }

    private async loadOperations(): Promise<void> {
        // Всегда валидируем даты перед загрузкой
        this.validateDates();

        try {
            let response: OperationResponseIncomeType;

            // для "всех" сервис возвращает пустоту, поэтому пока смотрим сервис с заданным периодом
            // if (this.currentFilter === 'all') {
            //     console.log('Загрузка всех операций');
            // response = await OperationsService.getOperations();
            // } else {
            // console.log('Загрузка операций за период:', this.currentFilter, this.dateFrom, 'до', this.dateTo);
            response = await OperationsService.getOperationsFilter(this.dateFrom, this.dateTo);
            // }

            if (response.error) {
                // console.log('Ошибка загрузки операций:', response.error);
                if (response.redirect) {
                    this.openNewRoute(response.redirect);
                }
                return;
            }

            this.operations = Array.isArray(response.operations)
                ? response.operations
                : Array.isArray(response.date)
                    ? response.date
                    : [];

            this.displayOperations();

        } catch (error) {
            console.log('Ошибка при загрузке операций:', error);
        }
    }

    private displayOperations(): void {
        if (!this.elements.tableBody) {
            // console.log('Данные для таблицы не найдены');
            return;
        }

        const tableBody = this.elements.tableBody;
        tableBody.innerHTML = '';

        if (this.operations.length === 0) {
            this.showNoDataMessage();
            return;
        }

        this.operations.forEach((operation, index) => {
            const row = this.createOperationRow(operation, index + 1);
            tableBody.appendChild(row);
        });
    }

    private createOperationRow(operations: OperationIncomeType, number: number): HTMLTableRowElement {
        const row = document.createElement('tr');

        const numberCell = document.createElement('th');
        numberCell.scope = 'row';
        numberCell.textContent = number.toString();
        row.appendChild(numberCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = operations.type === 'income' ? 'доход' : 'расход';
        typeCell.className = operations.type === 'income' ? 'text-success' : 'text-danger';
        row.appendChild(typeCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = operations.category || operations.category_title || '—';
        row.appendChild(categoryCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = `${operations.amount}$`;
        row.appendChild(amountCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = this.formatDate(operations.date);
        row.appendChild(dateCell);

        const commentCell = document.createElement('td');
        commentCell.textContent = operations.comment || '—';
        row.appendChild(commentCell);

        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = this.createActionButtons(operations);
        row.appendChild(actionsCell);

        return row;
    }

    private formatDate(dateString: string): string {
        if (!dateString) return '—';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    private createActionButtons(operation: OperationIncomeType): string {
        return `
            <a href="#" class="text-decoration-none delete-operation" data-id="${operation.id}" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>
                    <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>
                    <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>
                </svg>
            </a>
            <a href="/edit-income-expenses?id=${operation.id}" class="text-decoration-none" style="margin-left: 10px;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
                </svg>
            </a>
        `;
    }

    private showNoDataMessage(): void {
        if (!this.elements.tableBody) return;

        const tableBody = this.elements.tableBody;
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.className = 'text-center text-muted py-4';
        cell.textContent = 'Нет данных для отображения';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }

}