import {OperationsService} from "../services/operations-service";

export class Home {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.operations = [];
        this.currentFilter = 'today';

        const today = new Date().toISOString().split('T')[0];
        this.dateFrom = today;
        this.dateTo = today;

        this.incomeChart = null;
        this.expenseChart = null;

        this.init();
    }

    async init() {
        if (!this.cacheElements()) {
            // console.log('Не найдены необходимые элементы DOM');
            return;
        }

        this.setDefaultFilter();
        this.bindEvents();
        await this.loadOperations();
    }

    cacheElements() {
        this.elements = {
            filterButtons: document.querySelectorAll('.interval .btn'),
            dateStart: document.getElementById('date-start'),
            dateEnd: document.getElementById('date-end'),
            incomeCanvas: document.getElementById('myChart'),
            expenseCanvas: document.getElementById('myChart2')
        };

        if (!this.elements.incomeCanvas || !this.elements.expenseCanvas) {
            // console.log('Canvas элементы не найдены');
            return false;
        }
        return true;
    }

    setDefaultFilter() {
        this.showDateIntervalFields();

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }

        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
            this.elements.filterButtons.forEach(button => {
                if (button.textContent.trim().toLowerCase() === 'сегодня') {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }

    bindEvents() {
        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
            this.elements.filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleFilterClick(e.target);
                });
            });
        }

        if (this.elements.dateStart) {
            this.elements.dateStart.addEventListener('change', this.handleDateIntervalChange.bind(this));
        }

        if (this.elements.dateEnd) {
            this.elements.dateEnd.addEventListener('change', this.handleDateIntervalChange.bind(this));
        }
    }

    handleFilterClick(clickedButton) {
        if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
            this.elements.filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            clickedButton.classList.add('active');
        }

        const filterText = clickedButton.textContent.trim().toLowerCase();

        switch (filterText) {
            case 'сегодня':
                this.currentFilter = 'today';
                this.setTodayDates();
                break;
            case 'неделя':
                this.currentFilter = 'week';
                this.setWeekDates();
                break;
            case 'месяц':
                this.currentFilter = 'month';
                this.setMonthDates();
                break;
            case 'год':
                this.currentFilter = 'year';
                this.setYearDates();
                break;
            case 'интервал':
                this.currentFilter = 'interval';
                break;
            case 'все':
                this.currentFilter = 'all';
                this.setAllDates();
                break;
            default:
                this.currentFilter = 'today';
                this.setTodayDates();
        }

        this.loadOperations();
    }

    setTodayDates() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        this.dateFrom = todayString;
        this.dateTo = todayString;

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = todayString;
            this.elements.dateEnd.value = todayString;
        }
    }

    setWeekDates() {
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(today.getDate() + diffToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        this.dateFrom = startOfWeek.toISOString().split('T')[0];
        this.dateTo = endOfWeek.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    setMonthDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        this.dateFrom = startOfMonth.toISOString().split('T')[0];
        this.dateTo = endOfMonth.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    setYearDates() {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 2);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        this.dateFrom = startOfYear.toISOString().split('T')[0];
        this.dateTo = endOfYear.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    setAllDates() {
        const startDate = new Date(2020, 0, 1);
        const endDate = new Date(2030, 11, 31);

        this.dateFrom = startDate.toISOString().split('T')[0];
        this.dateTo = endDate.toISOString().split('T')[0];

        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.value = this.dateFrom;
            this.elements.dateEnd.value = this.dateTo;
        }
    }

    handleDateIntervalChange() {
        if (this.elements.dateStart && this.elements.dateEnd) {
            const today = new Date().toISOString().split('T')[0];
            if (!this.elements.dateStart.value) {
                this.elements.dateStart.value = today;
            }
            if (!this.elements.dateEnd.value) {
                this.elements.dateEnd.value = today;
            }

            this.dateFrom = this.elements.dateStart.value;
            this.dateTo = this.elements.dateEnd.value;

            this.currentFilter = 'interval';

            if (this.elements.filterButtons && this.elements.filterButtons.length > 0) {
                this.elements.filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.textContent.trim().toLowerCase() === 'интервал') {
                        btn.classList.add('active');
                    }
                });
            }

            this.loadOperations();
        }
    }

    showDateIntervalFields() {
        if (this.elements.dateStart && this.elements.dateEnd) {
            this.elements.dateStart.style.display = 'inline-block';
            this.elements.dateEnd.style.display = 'inline-block';
        }
    }

    validateDates() {
        if (!this.elements.dateStart || !this.elements.dateEnd) {
            return false;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!this.elements.dateStart.value) {
            this.elements.dateStart.value = today;
        }
        if (!this.elements.dateEnd.value) {
            this.elements.dateEnd.value = today;
        }

        this.dateFrom = this.elements.dateStart.value;
        this.dateTo = this.elements.dateEnd.value;

        return true;
    }

    async loadOperations() {
        // console.log('Начало загрузки операций...');
        // console.log('Фильтр:', this.currentFilter);
        // console.log('Период:', this.dateFrom, 'до', this.dateTo);

        this.validateDates();

        try {
            let response;

            // if (this.currentFilter === 'all') {
            //     console.log('Запрос всех операций');
            //     response = await OperationsService.getOperations();
            // } else {
            // console.log('Запрос операций за период');
            response = await OperationsService.getOperationsFilter(this.dateFrom, this.dateTo);
            // }

            // console.log('Ответ сервера:', response);

            if (response.error) {
                console.log('Ошибка загрузки операций:', response.error);
                // При ошибке показываем "Нет данных"
                this.operations = [];
                this.updateCharts();
                return;
            }

            this.operations = response.operations || response.date || [];
            // console.log('Успешно загружено операций:', this.operations.length);

            this.updateCharts();

        } catch (error) {
            // console.log('Исключение при загрузке операций:', error);
            // Показываем тестовые данные при ошибке
            this.operations = [];
            this.updateCharts();
        }
    }

    processDataForCharts() {
        const incomeData = {};
        const expenseData = {};

        // console.log('Обработка данных для графиков. Операций:', this.operations.length);

        this.operations.forEach((operation, index) => {
            // console.log(`Операция ${index}:`, operation);

            // Получаем категорию (проверяем разные возможные поля)
            let category = 'Без категории';
            if (operation.category) {
                category = operation.category;
            }

            const amount = parseFloat(operation.amount) || 0;

            if (operation.type === 'income') {
                incomeData[category] = (incomeData[category] || 0) + amount;
                // console.log(`Доход: ${category} - ${amount}`);
            } else if (operation.type === 'expense') {
                expenseData[category] = (expenseData[category] || 0) + amount;
                // console.log(`Расход: ${category} - ${amount}`);
            }
        });

        // console.log('=== ИТОГОВЫЕ ДАННЫЕ ===');
        // console.log('Доходы:', incomeData);
        // console.log('Расходы:', expenseData);

        return {incomeData, expenseData};
    }

    generateColors(count) {
        const colors = [
            '#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD',
            '#6F42C1', '#E83E8C', '#6610F2', '#D63384', '#FD7E14',
            '#198754', '#0DCAF0', '#FFC107', '#198754', '#6C757D'
        ];

        return colors.slice(0, count);
    }

    updateCharts() {
        // console.log('=== ОБНОВЛЕНИЕ ГРАФИКОВ ===');
        const {incomeData, expenseData} = this.processDataForCharts();

        this.updateChart('income', incomeData);
        this.updateChart('expense', expenseData);
    }

    updateChart(type, data) {
        // console.log(`=== ОБНОВЛЕНИЕ ГРАФИКА ${type.toUpperCase()} ===`);
        // console.log('Данные:', data);


        const canvas = type === 'income' ? this.elements.incomeCanvas : this.elements.expenseCanvas;

        // Уничтожаем старый график
        if (type === 'income' && this.incomeChart) {
            this.incomeChart.destroy();
            this.incomeChart = null;
        }
        if (type === 'expense' && this.expenseChart) {
            this.expenseChart.destroy();
            this.expenseChart = null;
        }

        // Очищаем canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Если нет данных, показываем сообщение
        const labels = Object.keys(data);
        const values = Object.values(data);
        const totalSum = values.reduce((sum, value) => sum + value, 0);

        // console.log(`Общая сумма для ${type}:`, totalSum);
        // console.log('Распределение по категориям:');
        labels.forEach((label, index) => {
            const value = values[index];
            const percentage = totalSum > 0 ? (value / totalSum) * 100 : 0;
            // console.log(`- ${label}: $${value} (${percentage.toFixed(4)}%)`);
        });

        if (labels.length === 0 || totalSum === 0) {
            // console.log(`Нет данных для графика ${type}`);
            this.showNoDataChart(type, canvas);
            return;
        }

        // console.log('Метки (labels):', labels);
        // console.log('Значения (values):', values);
        // console.log('Количество элементов:', labels.length);

        const colors = this.generateColors(labels.length);

        const chartConfig = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: type === 'income' ? 'Доходы' : 'Расходы',
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Arial'
                            },
                            color: '#000'
                        }
                    },
                    // расчет процента для графика
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                // total - Сумма всех значений в датасете
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = 0;
                                if (total > 0) {
                                    percentage = (value / total) * 100;
                                }
                                // округление: показываем больше знаков для маленьких процентов
                                let roundedPercentage;
                                if (percentage < 0.01) {
                                    roundedPercentage = percentage.toFixed(4); // 0.0023%
                                } else if (percentage < 1) {
                                    roundedPercentage = percentage.toFixed(2); // 0.45%
                                } else if (percentage < 10) {
                                    roundedPercentage = percentage.toFixed(1); // 4.5%
                                } else {
                                    roundedPercentage = Math.round(percentage); // 45%
                                }

                                // Форматируем числа с разделителями тысяч
                                const formattedValue = new Intl.NumberFormat('ru-RU').format(value);

                                // console.log(`Tooltip для "${label}": значение=$${formattedValue}, процент=${roundedPercentage}%`);

                                return `${label}: $${formattedValue} (${roundedPercentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        try {
            // Создаем новый график
            if (type === 'income') {
                this.incomeChart = new Chart(canvas, chartConfig);
            } else {
                this.expenseChart = new Chart(canvas, chartConfig);
            }

            // console.log(`График ${type} успешно создан`);
        } catch (error) {
            // console.log(`Ошибка создания графика ${type}:`, error);
            this.showNoDataChart(type, canvas);
        }
    }

    showNoDataChart(type, canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Создаем простой график с одной категорией "Нет данных"
        const chartConfig = {
            type: 'pie',
            data: {
                labels: ['Нет данных'],
                datasets: [{
                    label: type === 'income' ? 'Доходы' : 'Расходы',
                    data: [1], // Одно значение для отображения круга
                    backgroundColor: ['#e9ecef'],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Arial'
                            },
                            color: '#000'
                        }
                    },
                    tooltip: {
                        enabled: false // Отключаем тултипы для "Нет данных"
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        try {
            if (type === 'income') {
                this.incomeChart = new Chart(canvas, chartConfig);
            } else {
                this.expenseChart = new Chart(canvas, chartConfig);
            }
            // console.log(`График ${type} с сообщением "Нет данных" создан`);
        } catch (error) {
            // console.log(`Ошибка создания графика с сообщением:`, error);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#6c757d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
        }
    }
}