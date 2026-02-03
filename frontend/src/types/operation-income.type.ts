export type OperationIncomeType = {
    id: number;
    type: 'income' | 'expense';
    category?: string;
    category_id?: number;
    category_title?: string;
    amount: number;
    date: string;
    comment?: string;
}
