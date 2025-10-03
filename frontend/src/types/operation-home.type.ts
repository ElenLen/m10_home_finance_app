export type OperationHomeType = {
    type: 'income' | 'expense';
    category?: string;
    amount: number | string;
}