import {OperationIncomeType} from "./operation-income.type";

export type OperationResponseIncomeType = {
    error?: string | false;
    redirect?: string | null;
    operations?: OperationIncomeType[] | null;
    date?: OperationIncomeType[] | null;
}
