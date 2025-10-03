export type ElementsIncomeExpensesType = {
    tableBody: HTMLTableSectionElement | null;
    filterButtons: NodeListOf<HTMLElement>;
    dateStart: HTMLInputElement | null;
    dateEnd: HTMLInputElement | null;
    confirmDeleteBtn: HTMLButtonElement | null;
    cancelDeleteBtn: HTMLButtonElement | null;
    modal: HTMLElement | null;
}