import {HttpUtils} from "../utils/http-utils";

export class CategoryIncomeService {
    static async getCategories() {
        const returnObject = {
            error: false,
            redirect: null,
            categories: null,
        };

        const result = await HttpUtils.request('/categories/income');

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
        // http://localhost:3000/api/categories/income
        // [
        //     {
        //         "id": 1,
        //         "title": "Депозиты"
        //     },
        //     {
        //         "id": 2,
        //         "title": "Зарплата"
        //     },
        //     {
        //         "id": 3,
        //         "title": "Сбережения"
        //     },
        //     {
        //         "id": 4,
        //         "title": "Инвестиции"
        //     }
        // ]
    }

    static async getCategory(id) {
        const returnObject = {
            error: false,
            redirect: null,
            income: null,
        };

        const result = await HttpUtils.request('/categories/income/' + id);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при запросе категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.income = result.response;
        return returnObject;

        // GET
        // http://localhost:3000/api/categories/income/1
        // {
        //     "id": 1,
        //     "title": "Депозиты"
        // }

    }

    static async updateCategory(id, data) {
        const returnObject = {
            error: false,
            redirect: null,
        };

        const result = await HttpUtils.request('/categories/income/' + id,
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
        // http://localhost:3000/api/categories/income/1
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
        const result = await HttpUtils.request('/categories/income', 'POST', true, data);

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
        //     "title": "Новая категория"
        // }
        // http://localhost:3000/api/categories/income
        // {
        //     "id": 5,
        //     "title": "Новая категория"
        // }

    }

    static async deleteCategory(id) {
        const returnObject = {
            error: false,
            redirect: null,
        };
        const result = await HttpUtils.request('/categories/income/' + id, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при удалении категории. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }

        return returnObject;

        // DELETE
        // http://localhost:3000/api/categories/income/3
        // {
        //     "error": false,
        //     "message": "Removed successfully"
        // }
    }
}