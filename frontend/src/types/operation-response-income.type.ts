import {OperationIncomeType} from "./operation-income.type";

export type OperationResponseIncomeType = {
    error?: any;
    redirect?: any;
    operation?: OperationIncomeType;
    date?: OperationIncomeType[] | null;
}
