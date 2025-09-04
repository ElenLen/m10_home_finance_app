import {Home} from "./components/home";
import {Logout} from "./components/auth/logout";
import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Income} from "./components/category/income";
import {CreateIncomeCategory} from "./components/category/create-income-category";
import {EditIncomeCategory} from "./components/category/edit-income-category";
import {IncomeExpenses} from "./components/income-expenses/income-expenses";
import {Expenses} from "./components/category/expenses";
import {CreateExpensesCategory} from "./components/category/create-expenses-category";
import {EditExpensesCategory} from "./components/category/edit-expenses-category";
import {CreateIncomeExpenses} from "./components/income-expenses/create-income-expenses";
import {EditIncomeExpenses} from "./components/income-expenses/edit-income-expenses";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();
        //     каждый объект- своя стр
        this.routes = [
            {
                // гл стр
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/pages/home.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    new Home(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-expenses',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/income-expenses/income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    new IncomeExpenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/create-income-expenses',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/pages/income-expenses/create-income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    new CreateIncomeExpenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/edit-income-expenses',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/income-expenses/edit-income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    new EditIncomeExpenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/category/income.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Income(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/category/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/create-income',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/category/create-income-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomeCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/create-expenses',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/category/create-expenses-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateExpensesCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/edit-income',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/category/edit-income-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditIncomeCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/edit-expenses',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/category/edit-expenses-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditExpensesCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/pages/404.html',
                useLayout: false,
                load: () => {
                    document.body.classList.add('login-page');
                    document.body.classList.add('d-flex');
                    document.body.classList.add('align-items-center');
                    document.body.style.height = '100vh';
                    document.body.classList.add('container');
                    document.body.classList.add('justify-content-center');
                },
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/auth/login.html',
                useLayout: false,
                // загрузка js
                load: () => {
                    document.body.classList.add('login-page');
                    document.body.classList.add('d-flex');
                    document.body.classList.add('align-items-center');
                    document.body.classList.add('container');
                    document.body.classList.add('justify-content-center');
                    document.body.style.height = '100vh';

                    new Login(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('login-page');
                    document.body.style.height = 'auto';
                },
                // styles: ['icheck-bootstrap.min.css']
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/auth/sign-up.html',
                useLayout: false,
                // загрузка js
                load: () => {
                    document.body.classList.add('register-page');
                    document.body.classList.add('d-flex');
                    document.body.classList.add('align-items-center');
                    document.body.classList.add('container');
                    document.body.classList.add('justify-content-center');
                    document.body.style.height = '100vh';

                    new SignUp(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('register-page');
                    document.body.style.height = 'auto';
                },
            },
            {
                route: '/logout',
                load: () => {
                    document.body.style.height = 'auto';
                    new Logout(this.openNewRoute.bind(this));
                }
            }
        ]

    }

    initEvents() {
        // когда стр загружается
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this))
        // когда поменялся url стр
        window.addEventListener('popstate', this.activateRoute.bind(this))

    }

    async openNewRoute(url) {
        // определяем какая стр открыта
        const currentRoute = window.location.pathname;
        // изменение урл в адрессной строке при клике на ссылке
        history.pushState({}, '', url);
        //чтобы взял адрес из адресной стрки и обработал
        await this.activateRoute(null, currentRoute);
    }

//     активация роутера
    async activateRoute(e, oldRoute = null) {
        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);
        // проверка что стр существует, иначе ошибка
        if (newRoute) {

            //     проверяем title
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title;
            }
            //     для подгрузки контента
            if (newRoute.filePathTemplate) {
                let contentBlock = this.contentPageElement;
                // проверяем использ лайаута
                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    this.contentPageElement = document.getElementById('content-layout');
                    // document.body.classList.add('sidebar-mini');
                    // document.body.classList.add('layout-fixed');

                } else {
                    // document.body.classList.remove('sidebar-mini');
                    // document.body.classList.remove('layout-fixed');
                }
                this.contentPageElement.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());

            }

            //     если есть js
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('No route found');
            window.location = '/404';
            await this.activateRoute(null);
        }

    }
}