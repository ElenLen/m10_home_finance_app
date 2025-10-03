import {CategoryIncomeService} from "../../services/category-income-service";
import {CategoryType} from "../../types/category.type";

type OpenNewRouteFunction = (url: string) => void;

export class Income {
    private openNewRoute: OpenNewRouteFunction;
    private currentDeleteId: string | null;
    private modal: any; // bootstrap.Modal
    private btnModalDel: HTMLButtonElement | null;

    constructor(openNewRoute: OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        this.currentDeleteId = null;
        this.modal = null;
        this.btnModalDel = null;

        this.getCategoriesIncome().then();

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
        this.btnModalDel = document.getElementById('income-delete') as HTMLButtonElement;
        if (this.btnModalDel) {
            this.btnModalDel.addEventListener('click', () => {
                this.deleteCategory();
            });
        }
    }

//     запрос всех доходов
    private async getCategoriesIncome(): Promise<void> {
        const response: any = await CategoryIncomeService.getCategories();

        if (response.error) {
            // console.log('Ошибка загрузки операций:', response.error);
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
        const incomeSection = document.getElementById('income-section');
        if (!incomeSection) return;

        incomeSection.innerHTML = '';
        //     добавляем список полученных категорий
        categories.forEach((element) => {
            const incomeCard = this.addIncomeCard(element);
            incomeSection.appendChild(incomeCard);
        });
    }

    // создание карточек
    private addIncomeCard(element: CategoryType): HTMLElement {
        // карточка
        const incomeCard = document.createElement('div');
        incomeCard.className = `income-block cardWidth border rounded-3`;
        incomeCard.dataset.id = element.id.toString();

        // заголовок
        const incomeCardTitle = document.createElement('h3');
        incomeCardTitle.className = 'income-title';
        incomeCardTitle.style.marginBottom = '10px';
        incomeCardTitle.innerText = element.title;

        // кнопка редактирования
        const incomeBtnUpdateA = document.createElement('a');
        incomeBtnUpdateA.className = 'text-decoration-none';
        incomeBtnUpdateA.href = '/edit-income?id=' + element.id;
        incomeBtnUpdateA.dataset.id = element.id.toString();
        const incomeBtnUpdate = document.createElement('button');
        incomeBtnUpdate.type = 'button';
        incomeBtnUpdate.className = 'btn btn-primary';
        incomeBtnUpdate.style.marginRight = '10px';
        incomeBtnUpdate.style.fontSize = '14px';
        incomeBtnUpdate.textContent = 'Редактировать';

        // кнопка удаления
        const incomeBtnDelete = document.createElement('button');
        incomeBtnDelete.type = 'button';
        incomeBtnDelete.className = 'btn btn-danger btn-delete';
        incomeBtnDelete.dataset.id = element.id.toString();
        incomeBtnDelete.style.fontSize = '14px';
        incomeBtnDelete.textContent = 'Удалить';
        incomeBtnDelete.setAttribute('data-bs-toggle', 'modal');
        incomeBtnDelete.setAttribute('data-bs-target', '#staticBackdrop');

        incomeBtnUpdateA.appendChild(incomeBtnUpdate);
        incomeCard.appendChild(incomeCardTitle);
        incomeCard.appendChild(incomeBtnUpdateA);
        incomeCard.appendChild(incomeBtnDelete);

        return incomeCard;
    }

    // удаление карточки
    private async deleteCategory(): Promise<void> {
        if (!this.currentDeleteId) {
            // console.log('ID для удаления не установлен');
            return;
        }

        try {
            // Отправляем запрос на удаление
            const response = await CategoryIncomeService.deleteCategory(parseInt(this.currentDeleteId));

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
            await this.getCategoriesIncome();

            // Сбрасываем ID после успешного удаления
            this.currentDeleteId = null;

        } catch (error) {
            console.log('Ошибка при удалении категории:', error);
        }
    }
}