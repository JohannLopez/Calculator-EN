import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { CalculationResult, FormData, ChartType } from '../types';

declare global {
    interface Window {
        Chart: any;
        ChartDataLabels: any; // For the datalabels plugin
    }
}

interface DataVisualizationProps {
    result: CalculationResult;
    formData: FormData;
    currencySymbol: string;
}

const chartColors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
];

const chartBorderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
];


export const DataVisualization: React.FC<DataVisualizationProps> = ({ result, formData, currencySymbol }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);
    const [chartType, setChartType] = useState<ChartType>('bar');

    const chartData = useMemo(() => {
        const filteredBreakdown = result.costBreakdown.filter(item => item.cost > 0);
        
        const costLabels = filteredBreakdown.map(item => 
            item.category
                .replace(/Cost of |Cost from /i, '')
                .replace(/Inefficiency from /i, '')
        );
        const costData = filteredBreakdown.map(item => item.cost);

        const inputData = [
            parseInt(formData.engineers, 10),
            parseInt(formData.numSites, 10),
            parseInt(formData.numCountries, 10),
            parseInt(formData.reworks, 10),
            parseInt(formData.delays, 10)
        ];
        
        const maxInputValue = Math.max(...inputData);
        
        const normalizedInputData = inputData.map(val => (maxInputValue > 0 ? (val / maxInputValue) * 100 : 0));
        
        const inputLabels = ['No. Engineers', 'No. Sites', 'No. Countries', 'No. Reworks', 'Weeks Delay'];

        return { costLabels, costData, inputLabels, normalizedInputData };
    }, [result, formData]);

    useEffect(() => {
        if (!chartRef.current || !window.Chart) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        // The datalabels plugin is available globally as ChartDataLabels from the script tag.
        // We need to register it with Chart.js. Chart.js safely handles duplicate registrations.
        if (window.ChartDataLabels) {
            window.Chart.register(window.ChartDataLabels);
        }

        let config: any;

        switch (chartType) {
            case 'radar':
                config = {
                    type: 'radar',
                    data: {
                        labels: chartData.inputLabels,
                        datasets: [{
                            label: 'Inefficiency Profile (Normalized)',
                            data: chartData.normalizedInputData,
                            backgroundColor: 'rgba(54, 162, 235, 0.4)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'Relative Contribution of Inefficiency Factors' },
                             datalabels: {
                                display: false, // Disable for this chart type
                            }
                        },
                        scales: {
                            r: {
                                angleLines: { display: true },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                pointLabels: { font: { size: 10 } }
                            }
                        }
                    }
                };
                break;
            case 'pie':
                config = {
                    type: 'pie',
                    data: {
                        labels: chartData.costLabels,
                        datasets: [{
                            label: 'Cost Distribution',
                            data: chartData.costData,
                            backgroundColor: chartColors,
                            borderColor: chartBorderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: { display: true, text: 'Percentage Distribution of Inefficiency Costs' },
                            tooltip: {
                                callbacks: {
                                    label: function(context: any) {
                                        const label = context.label || '';
                                        const value = context.raw;
                                        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                        return `${label}: ${currencySymbol} ${value.toLocaleString('en-US')} (${percentage})`;
                                    }
                                }
                            },
                            datalabels: {
                                display: true,
                                formatter: (value: number, ctx: any) => {
                                    const total = ctx.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                    if ((value / total) < 0.05) return ''; // Hide label if less than 5%
                                    return percentage;
                                },
                                color: '#fff',
                                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                                textShadowBlur: 4,
                                font: {
                                    weight: 'bold',
                                }
                            }
                        }
                    }
                };
                break;
            case 'bar':
            default:
                config = {
                    type: 'bar',
                    data: {
                        labels: chartData.costLabels,
                        datasets: [{
                            label: `Values in ${formData.countryCode}`,
                            data: chartData.costData,
                            backgroundColor: chartColors,
                            borderColor: chartBorderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false },
                            title: { 
                                display: true, 
                                text: 'Comparison of Inefficiency Costs',
                            },
                            subtitle: {
                                display: true,
                                text: `Values in ${formData.countryCode}`,
                                padding: {
                                    bottom: 15
                                }
                            },
                            datalabels: {
                                display: false, // Disable for this chart type
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value: number) {
                                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                                        if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
                                        return `${value}`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;
        }

        chartInstanceRef.current = new window.Chart(ctx, config);

    }, [chartType, chartData, currencySymbol, formData.countryCode]);

    const renderChartButton = (type: ChartType, label: string) => (
        <button
            onClick={() => setChartType(type)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                chartType === type 
                ? 'bg-slate-900 text-white shadow' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
        >
            {label}
        </button>
    );
    
    const interpretation = result.chartInterpretations ? result.chartInterpretations[chartType] : 'Interpretation not available.';

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-4">
                Visual Analysis
            </h2>
            <div className="flex justify-center space-x-2 mb-6 border-b border-slate-200 pb-4">
                {renderChartButton('bar', 'Bar')}
                {renderChartButton('pie', 'Pie')}
                {renderChartButton('radar', 'Radar')}
            </div>
            <div className="relative h-96 mb-6">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-700 mb-2">Chart Interpretation</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{interpretation}</p>
            </div>
        </div>
    );
};