import {HttpUtils} from "../utils/http-utils";
import {BaseReturnObjectType} from "../types/base-return-object.type";

// Интерфейсы для конкретных методов
interface GetBalanceReturnObject extends BaseReturnObjectType {
    balance: number | null;
}

// Интерфейс для данных при обновлении баланса
interface BalanceData {
    newBalance: number;
}

export class BalanceService {
    static async getBalance(): Promise<GetBalanceReturnObject> {
        const returnObject: GetBalanceReturnObject = {
            error: false,
            redirect: null,
            balance: null,
        };

        const result = await HttpUtils.request('/balance');

        if (result.redirect || result.error || !result.response || (result.response && (result.response.error || !result.response.balance))) {
            // returnObject.error = 'Возникла ошибка при запросе баланса. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
                return returnObject;
            }
            return returnObject;
        }

        returnObject.balance = result.response.balance;
        return returnObject;
    }

    static async updateBalance(data: BalanceData): Promise<BaseReturnObjectType> {
        const returnObject: BaseReturnObjectType = {
            error: false,
            redirect: null,
        };

        const result = await HttpUtils.request('/balance',
            'PUT', true, data);

        if (result.redirect || result.error || !result.response || (result.response && result.response.error)) {
            returnObject.error = 'Возникла ошибка при редактировании баланса. Обратитесь в поддержку.';
            if (result.redirect) {
                returnObject.redirect = result.redirect;
            }
            return returnObject;
        }
        return returnObject;
    }

}