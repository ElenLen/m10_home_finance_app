import {CategoryIncomeService} from "../../services/category-income-service";

export class Income {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.currentDeleteId = null;

        this.getCategoriesIncome().then();

        //  модальное окно
        const modalElement = document.getElementById('staticBackdrop');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement);

            // для сброса id при закрытии модалки
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.currentDeleteId = null;
            });
        }

        // Обработчик клика по кнопке "Удалить"
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-delete')) {
                this.currentDeleteId = event.target.dataset.id;
                // console.log('ID кнопки для удаления:', this.currentDeleteId);
            }
        });

        // кнопка удалить в модалке
        this.btnModalDel = document.getElementById('income-delete');
        if (this.btnModalDel) {
            this.btnModalDel.addEventListener('click', () => {
                this.deleteCategory();
            });
        }
    }

//     запрос всех доходов
    async getCategoriesIncome() {
        const response = await CategoryIncomeService.getCategories();

        if (response.error) {
            // console.log('Ошибка загрузки операций:', response.error);
            return response.redirect ? this.openNewRoute(response.redirect) : null;
        }
        this.showRecords(response.categories);
    }

    //  отображение всех полученных категорий с бэка
    showRecords(categories) {
        const incomeSection = document.getElementById('income-section');
        incomeSection.innerHTML = '';
        //     добавляем список полученных категорий
        categories.forEach((element) => {
            const incomeCard = this.addIncomeCard(element);
            incomeSection.appendChild(incomeCard);
        });
    }

    // создание карточек
    addIncomeCard(element) {
        // карточка
        const incomeCard = document.createElement('div');
        incomeCard.className = `income-block cardWidth border rounded-3`;
        incomeCard.dataset.id = element.id;

        // заголовок
        const incomeCardTitle = document.createElement('h3');
        incomeCardTitle.className = 'income-title';
        incomeCardTitle.style.marginBottom = '10px';
        incomeCardTitle.innerText = element.title;

        // кнопка редактирования
        const incomeBtnUpdateA = document.createElement('a');
        incomeBtnUpdateA.className = 'text-decoration-none';
        incomeBtnUpdateA.href = '/edit-income?id=' + element.id;
        incomeBtnUpdateA.dataset.id = element.id;
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
        incomeBtnDelete.dataset.id = element.id;
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
    async deleteCategory() {
        if (!this.currentDeleteId) {
            // console.log('ID для удаления не установлен');
            return;
        }

        try {
            // Отправляем запрос на удаление
            const response = await CategoryIncomeService.deleteCategory(this.currentDeleteId);

            if (response.error) {
                // console.log('Ошибка при удалении:', response.error);
                return response.redirect ? this.openNewRoute(response.redirect) : null;
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