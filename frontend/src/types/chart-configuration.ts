import {ChartTooltipContext} from "./chart-tooltip-context";

export interface ChartConfiguration {
    type: string;
    data: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            backgroundColor: string[];
            borderColor: string;
            borderWidth: number;
            hoverOffset: number;
        }>;
    };
    options: {
        responsive: boolean;
        maintainAspectRatio: boolean;
        plugins: {
            legend: {
                position: 'top';
                labels: {
                    boxWidth: number;
                    padding: number;
                    font: {
                        size: number;
                        family: string;
                    };
                    color: string;
                };
            };
            tooltip: {
                enabled?: boolean;
                callbacks?: {
                    label: (context: ChartTooltipContext) => string;
                };
            };
        };
        animation: {
            animateScale: boolean;
            animateRotate: boolean;
        };
    };
}