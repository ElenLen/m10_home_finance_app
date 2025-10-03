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
import {BalanceService} from "./services/balance-service";
import {RouteType} from "./types/route.type";
import {AuthUtils} from "./utils/auth-utils";

export class Router {
    private titlePageElement: HTMLElement | null;
    private contentPageElement: HTMLElement | null;
    private profileNameElement: HTMLElement | null;
    private balanceElement: HTMLElement | null;
    private adminLteStyleElement: HTMLElement | null;
    private userName: string | null;
    private userBalance: number;
    private routes: RouteType[];

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.profileNameElement = null;
        this.balanceElement = null;
        this.adminLteStyleElement = null;
        this.userName = null;
        this.userBalance = 0;

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
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        document.body.classList.remove('login-page');
                        document.body.classList.add('d-flex');
                        document.body.classList.remove('align-items-center');
                        document.body.classList.remove('container');
                        document.body.classList.remove('justify-content-center');
                        new Home(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
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
                unload: (): void => {
                }
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
                title: "",
                filePathTemplate: "",
                useLayout: undefined,
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                },
                unload: (): void => {
                }
            },
            {
                route: '/income-expenses',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/income-expenses/income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new IncomeExpenses(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/create-income-expenses',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/pages/income-expenses/create-income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new CreateIncomeExpenses(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/edit-income-expenses',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/income-expenses/edit-income-expenses.html',
                useLayout: '/templates/layout.html',
                // загрузка js
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new EditIncomeExpenses(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/category/income.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new Income(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/create-income',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/category/create-income-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new CreateIncomeCategory(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/edit-income',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/category/edit-income-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new EditIncomeCategory(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/category/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new Expenses(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/create-expenses',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/category/create-expenses-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new CreateExpensesCategory(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            },
            {
                route: '/edit-expenses',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/category/edit-expenses-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    if (!localStorage.getItem('accessToken')) {
                        return this.openNewRoute('/login');
                    } else {
                        new EditExpensesCategory(this.openNewRoute.bind(this));
                    }
                },
                unload: (): void => {
                }
            }
        ] as RouteType[];
    }

    private initEvents(): void {
        // когда стр загружается
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this))
        // когда поменялся url стр
        window.addEventListener('popstate', this.activateRoute.bind(this))
//     отслеживаем любой клик
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    public async openNewRoute(url: string ): Promise<void> {
        // определяем какая стр открыта
        const currentRoute: string = window.location.pathname;
        // изменение урл в адрессной строке при клике на ссылке
        history.pushState({}, '', url);
        //чтобы взял адрес из адресной стрки и обработал
        await this.activateRoute(null, currentRoute);
    }

    // для загрузки нового роута
    public async clickHandler(e: MouseEvent): Promise<void> {
        let element: HTMLAnchorElement | null = null;
        if (e.target instanceof HTMLAnchorElement) {
            element = e.target;
        } else if (e.target instanceof HTMLElement && e.target.parentNode instanceof HTMLAnchorElement) {
            element = e.target.parentNode;
        }
        if (element) {
            e.preventDefault();
            // определяем какая стр открыта
            const currentRoute: string = window.location.pathname;
            const url: string = element.href.replace(window.location.origin, '');
            // проверяем и завершаем при необходимости
            if (!url || currentRoute === url.replace('#', '') || url.startsWith('javascript:void(0)')) {
                return;
            }
            await this.openNewRoute(url);
        }
    }

//     активация роутера
//     private FileUtils: any;
    public async activateRoute(e: Event | null, oldRoute: string | null = null): Promise<void> {
        // если найден, удаляем стили
        if (oldRoute) {
            const currentRoute: RouteType | undefined = this.routes.find(item => item.route === oldRoute);
            if (currentRoute?.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach((style: string) => {
                    const linkElement = document.querySelector(`link[href='/css/${style}']`);
                    if (linkElement) {
                        linkElement.remove();
                    }
                })
            }
            if (currentRoute?.scripts && currentRoute.scripts.length > 0) {
                currentRoute.scripts.forEach((script: string) => {
                    const scriptElement = document.querySelector(`script[src='/ts/${script}']`);
                    if (scriptElement) {
                        scriptElement.remove();
                    }
                })
            }

            if (currentRoute?.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }

        // определяем какая стр открыта
        const urlRoute: string = window.location.pathname;
        //     см какому адресу сотв текущий url, кот отобр пользователю
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);
        // проверка что стр существует, иначе ошибка
        if (newRoute) {
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach((style: string) => {
                    this.loadPageStyle('/css/' + style);
                })
            }
            if (newRoute.scripts && newRoute.scripts.length > 0) {
                for (const script of newRoute.scripts) {
                    // когда выполнится, только после этого перейдем к следующй итерации
                    await this.loadPageScript('/js/' + script);
                }
            }
            //     проверяем title
            if (newRoute.title && this.titlePageElement) {
                this.titlePageElement.innerText = newRoute.title;
            }
            //     для подгрузки контента
            if (newRoute.filePathTemplate) {
                let contentBlock: HTMLElement | null = this.contentPageElement;
                // проверяем использ лайаута
                if (newRoute.useLayout && this.contentPageElement) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');

                    // фио авторизованного пользователя
                    this.profileNameElement = document.getElementById('profile-name');

                    // если имя уже есть, то не меняем
                    if (!this.userName && this.profileNameElement) {
                        let userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey as any);
                        if (userInfo && typeof userInfo === 'string') {
                            try {
                                const parsedUserInfo = JSON.parse(userInfo);
                                if (parsedUserInfo.name) {
                                    this.userName = parsedUserInfo.name;
                                }
                            } catch (error) {
                                console.error('Error parsing user info:', error);
                            }
                        }
                    }

                    if (this.profileNameElement && this.userName) {
                        this.profileNameElement.innerText = this.userName;
                    }

                    // подгрузка баланса balance
                    // async getBalance() {
                    const response = await BalanceService.getBalance();

                    if (response.error) {
                        alert(response.error);
                    } else {
                        this.balanceElement = document.getElementById('balance');
                        if (response.balance && this.balanceElement) {
                            this.userBalance = response.balance;
                            this.balanceElement.innerText = `${this.userBalance}$`;
                        }
                    }

                    this.activateMenuItem(newRoute);
                }

                if (contentBlock) {
                    contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
                }
            }

            //     если есть js
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('No route found');
            window.location.href = '/404';
            await this.activateRoute(null);
        }
    }

    private activateMenuItem(route: RouteType): void {
        document.querySelectorAll('.sidebar .nav-link').forEach(item => {
            if (!(item instanceof HTMLElement)) return;

            const href = item.getAttribute('href');
            const categories = document.getElementById('categories');
            const homeCollapse = document.getElementById('home-collapse');
            const borderCategories = document.getElementById('border-categories');

            const income = document.getElementById('income');
            const expenses = document.getElementById('expenses');
            const svgCategories = document.getElementById('svg-categories');

            if ((route.route === href)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }

            //     если категории
            if ((href === '/income' && income?.classList.contains('active'))
                || (href === '/expenses' && expenses?.classList.contains('active'))
            ) {
                categories?.classList.add('active');
                homeCollapse?.classList.add('show');
                borderCategories?.classList.add('border-primary');
                if (svgCategories) {
                    svgCategories.style.transform = 'rotate(90deg)';
                }
            } else {
                categories?.classList.remove('active');
                homeCollapse?.classList.remove('show');
                borderCategories?.classList.remove('border-primary');
                if (svgCategories) {
                    svgCategories.style.transform = '';
                }
            }
        });
    }

    private loadPageStyle(href: string): void {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    private async loadPageScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    }
}