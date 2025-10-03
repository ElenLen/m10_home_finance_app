import {CategoryExpenseService} from "../../services/category-expense-service";
import {CategoryType} from "../../types/category.type";

type OpenNewRouteFunction = (url: string) => void;

export class Expenses {
    private openNewRoute: OpenNewRouteFunction;
    private currentDeleteId: string | null;
    private modal: any; // bootstrap.Modal
    private btnModalDel: HTMLButtonElement | null;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.currentDeleteId = null;
        this.modal = null;
        this.btnModalDel = null;

        this.getCategoriesExpenses().then();

        //  модальное окно
        const modalElement = document.getElementById('staticBackdrop');
        if (modalElement) {
            const bootstrap = (window as any).bootstrap;
            this.modal = new bootstrap.Modal(modalElement);

            // для сброса id при закрытии модалки
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.currentDeleteId = null;
            });
        }

        // Обработчик клика по кнопке "Удалить"
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('btn-delete')) {
                this.currentDeleteId = target.dataset.id || null;
                // console.log('ID кнопки для удаления:', this.currentDeleteId);
            }
        });

        // кнопка удалить в модалке
        this.btnModalDel = document.getElementById('expenses-delete') as HTMLButtonElement;
        if (this.btnModalDel) {
            this.btnModalDel.addEventListener('click', () => {
                this.deleteCategory();
            });
        }
    }

    //     запрос всех доходов
    private async getCategoriesExpenses(): Promise<void> {
        const response = await CategoryExpenseService.getCategories();

        if (response.error) {
            console.log(response.error);
            if (response.redirect) {
                this.openNewRoute(response.redirect);
            }
            return;
        }
        if (response.categories) {
            this.showRecords(response.categories);
        }
    }

    //  отображение всех полученных категорий с бэка
    private showRecords(categories: CategoryType[]): void {
        const expensesSection = document.getElementById('expenses-section');
        if (!expensesSection) return;

        expensesSection.innerHTML = '';
        //     добавляем список полученных категорий
        categories.forEach((element) => {
            const expensesCard = this.addExpensesCard(element);
            expensesSection.appendChild(expensesCard);
        });
    }

    // создание карточек
    private addExpensesCard(element: CategoryType): HTMLElement {
        // карточка
        const expensesCard = document.createElement('div');
        expensesCard.className = `expenses-block cardWidth border rounded-3`;
        expensesCard.dataset.id = element.id.toString();

        // заголовок
        const expensesCardTitle = document.createElement('h3');
        expensesCardTitle.className = 'expenses-title';
        expensesCardTitle.style.marginBottom = '10px';
        expensesCardTitle.innerText = element.title;

        // кнопка редактирования
        const expensesBtnUpdateA = document.createElement('a');
        expensesBtnUpdateA.className = 'text-decoration-none';
        expensesBtnUpdateA.href = '/edit-expenses?id=' + element.id;
        expensesBtnUpdateA.dataset.id = element.id.toString();
        const expensesBtnUpdate = document.createElement('button');
        expensesBtnUpdate.type = 'button';
        expensesBtnUpdate.className = 'btn btn-primary';
        expensesBtnUpdate.style.marginRight = '10px';
        expensesBtnUpdate.style.fontSize = '14px';
        expensesBtnUpdate.innerText = 'Редактировать';

        // кнопка удаления
        const expensesBtnDelete = document.createElement('button');
        expensesBtnDelete.type = 'button';
        expensesBtnDelete.className = 'btn btn-danger btn-delete';
        expensesBtnDelete.dataset.id = element.id.toString();
        expensesBtnDelete.style.fontSize = '14px';
        expensesBtnDelete.innerText = 'Удалить';
        expensesBtnDelete.setAttribute('data-bs-toggle', 'modal');
        expensesBtnDelete.setAttribute('data-bs-target', '#staticBackdrop');

        expensesBtnUpdateA.appendChild(expensesBtnUpdate);
        expensesCard.appendChild(expensesCardTitle);
        expensesCard.appendChild(expensesBtnUpdateA);
        expensesCard.appendChild(expensesBtnDelete);

        return expensesCard;
    }

    // удаление карточки
    private async deleteCategory(): Promise<void> {
        if (!this.currentDeleteId) {
            // console.log('ID для удаления не установлен');
            return;
        }

        try {
            // Отправляем запрос на удаление
            const response = await CategoryExpenseService.deleteCategory(parseInt(this.currentDeleteId));

            if (response.error) {
                // console.log('Ошибка при удалении:', response.error);
                if (response.redirect) {
                    this.openNewRoute(response.redirect);
                }
                return;
            }
            // console.log('Категория успешно удалена');

            // Закрываем модальное окно
            if (this.modal) {
                this.modal.hide();
            }

            // Обновляем список категорий после удаления
            await this.getCategoriesExpenses();

            // Сбрасываем ID после успешного удаления
            this.currentDeleteId = null;

        } catch (error) {
            console.log('Ошибка при удалении категории:', error);
        }
    }

}