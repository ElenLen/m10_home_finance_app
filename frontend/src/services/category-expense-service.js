import {HttpUtils} from "../utils/http-utils";

export class CategoryExpenseService {
    static async getCategories() {
        const returnObject = {
            error: false,
            redirect: null,
            categories: null,
        };

        const result = await HttpUtils.request('/categories/expense');

        if (result.redirect || result.error || !result.response) {
            returnObject.error = 'Возникла ошибка при запросе категорий. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.categories = result.response;
        return returnObject;

        // GET
        // http://localhost:3000/api/categories/expense
        // {
        //     "id": 1,
        //     "title": "Еда"
        // },
        // {
        //     "id": 2,
        //     "title": "Жилье"
        // },
        // {
        //     "id": 3,
        //     "title": "Здоровье"
        // },
        // {
        //     "id": 4,
        //     "title": "Кафе"
        // },
        // {
        //     "id": 5,
        //     "title": "Авто"
        // },
        // {
        //     "id": 6,
        //     "title": "Одежда"
        // },
        // {
        //     "id": 7,
        //     "title": "Развлечения"
        // },
        // {
        //     "id": 8,
        //     "title": "Счета"
        // },
        // {
        //     "id": 9,
        //     "title": "Спорт"
        // }
    }

    static async getCategory(id) {
        const returnObject = {
            error: false,
            redirect: null,
            expense: null,
        };

        const result = await HttpUtils.request('/categories/expense/' + id);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при запросе категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.expense = result.response;
        return returnObject;

        // GET
        // http://localhost:3000/api/categories/expense/1
        // {
        //     "id": 1,
        //     "title": "Еда"
        // }

    }

    static async updateCategory(id, data) {
        const returnObject = {
            error: false,
            redirect: null,
        };

        const result = await HttpUtils.request('/categories/expense/' + id,
            'PUT', true, data);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при редактировании категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }
        return returnObject;

        // PUT
        // {
        //     "title": "Измененная"
        // }
        // http://localhost:3000/api/categories/expense/1
        // {
        //     "id": 1,
        //     "title": "Измененная"
        // }
    }

    static async createCategory(data) {
        const returnObject = {
            error: false,
            redirect: null,
            title: null,
        };
        const result = await HttpUtils.request('/categories/expense', 'POST', true, data);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при добавлении категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }

        returnObject.title = result.response.title;
        return returnObject;

        // POST
        // {
        //     "title": "Новая категория моя"
        // }
        // http://localhost:3000/api/categories/expense
        // {
        //     "id": 10,
        //     "title": "Новая категория моя"
        // }

    }

    static async deleteCategory(id) {
        const returnObject = {
            error: false,
            redirect: null,
        };
        const result = await HttpUtils.request('/categories/expense/' + id, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при удалении категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }

        return returnObject;

        // DELETE
        // http://localhost:3000/api/categories/expense/3
        // {
        //     "error": false,
        //     "message": "Removed successfully"
        // }
    }
}