export class Home {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.loaderPie();
    }

    loaderPie() {

        const ctx = document.getElementById('myChart');
        const ctx2 = document.getElementById('myChart2');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],

                datasets: [{
                    label: 'Dataset',
                    data: [10, 20, 30, 25, 15],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],

                }]
            },
            options: {
                // responsive: true,
                color: 'black',
                width: 360,
                // wrap: false,
                layout: {
                    padding: {
                        bottom: 40
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        boxWidth: 1470,
                        fullSize: true,
                    },
                    // title: {
                    //     display: true,
                    //     text: 'Доходы'
                    // }
                }
            }
        });


        new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [{
                    label: 'Dataset',
                    data: [30, 10, 25, 30, 5],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                }]
            },
            options: {
                responsive: true,
                color: 'black',
                layout: {
                    padding: {
                        bottom: 40
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    // title: {
                    //     display: true,
                    //     text: 'Расходы'
                    // }
                }
            }
        });
    }
}