import {OperationHomeType} from "./operation-home.type";

export type OperationsResponseHomeType = {
    error?: string;
    operations?: OperationHomeType[];
    date?: OperationHomeType[];
}