import {ChartTooltipItem} from "./chart-tooltipItem";
import {Chart} from "./chart";

export interface ChartTooltipContext {
    tooltip: {
        dataPoints: ChartTooltipItem[];
    };
    chart: Chart;
    label: string;
    raw: number;
    dataset: {
        data: number[];
    };
}