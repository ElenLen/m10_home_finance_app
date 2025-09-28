import {HttpUtils} from "../utils/http-utils";

export class OperationsService {
    static async getOperations() {
        const returnObject = {
            error: false,
            redirect: null,
            operations: null,
        };

        const result = await HttpUtils.request('/operations');

        if (result.redirect || result.error || !result.response || (result.response && (result.response.error || !result.response.operations))) {
            returnObject.error = 'Возникла ошибка при запросе операций. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.operations = result.response.operations;
        return returnObject;

        // GET
        // http://localhost:3000/api/operations

    }

    static async getOperationsFilter(dateFrom, dateTo) {
        const returnObject = {
            error: false,
            redirect: null,
            operations: null,
        };

        const result = await HttpUtils.request('/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при запросе операций за период. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.operations = result.response;
        return returnObject;

        // GET
        // http://localhost:3000/api/operations?period=interval&dateFrom=2022-09-12&dateTo=2022-09-13
        // [
        //     {
        //         "id": 3,
        //         "type": "expense",
        //         "amount": 250,
        //         "date": "2022-09-13",
        //         "comment": "Оплата квартиры 2",
        //         "category": "Жилье"
        //     },
        //     {
        //         "id": 2,
        //         "type": "expense",
        //         "amount": 2500,
        //         "date": "2022-09-12",
        //         "comment": "Оплата квартиры",
        //         "category": "Жилье"
        //     }
        // ]
    }

    static async getOperation(id) {
        console.log('Запрос операции с ID:', id);
        const returnObject = {
            error: false,
            redirect: null,
            operation: null,
        };

        const result = await HttpUtils.request('/operations/' + id);
        console.log('Результат запроса:', result);
        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при запросе операций. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.operation = result.response;
        return returnObject;

        // GET
        // http://localhost:3000/api/operations/1
        // {
        //     "id": 2,
        //     "type": "expense",
        //     "amount": 2500,
        //     "date": "2022-09-12",
        //     "comment": "Оплата квартиры",
        //     "category": "Жилье"
        // }

    }

    static async updateOperation(id, data) {
        const returnObject = {
            error: false,
            redirect: null,
        };

        const result = await HttpUtils.request('/operations/' + id,
            'PUT', true, data);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при редактировании операции. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }
        return returnObject;

        // PUT
        // {
        //     "type": "expense",
        //     "amount": 150,
        //     "date": "2022-02-02",
        //     "comment": "wtf",
        //     "category_id": 3
        // }
        // http://localhost:3000/api/operations/1
        // {
        //     "id": 2,
        //     "type": "expense",
        //     "amount": 150,
        //     "date": "2022-02-02",
        //     "comment": "wtf"
        // }
    }

    static async createOperation(data) {
        const returnObject = {
            error: false,
            redirect: null,
            id: null,
        };
        const result = await HttpUtils.request('/operations', 'POST', true, data);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при добавлении операции. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }

        returnObject.id = result.response.id;
        return returnObject;

        // POST
        // {
        //     "type": "income",
        //     "amount": 250,
        //     "date": "2022-01-01",
        //     "comment": "new comment",
        //     "category_id": 2
        // }
        // http://localhost:3000/api/operations
        // {
        //     "id": 8,
        //     "type": "income",
        //     "amount": 250,
        //     "date": "2022-01-01",
        //     "comment": "new comment"
        // }

    }

    static async deleteOperation(id) {
        const returnObject = {
            error: false,
            redirect: null,
        };
        const result = await HttpUtils.request('/operations/' + id, 'DELETE', true);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при удалении операции. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }

        return returnObject;

        // DELETE
        // http://localhost:3000/api/operations/3
        // {
        //     "error": true,
        //     "message": "jwt expired"
        // }
    }
}