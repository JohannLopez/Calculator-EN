import React, { useState } from 'react';
import type { CalculationResult, FormData, Country, MetricOverrides } from '../types';
import { DataVisualization } from './DataVisualization';
import { MethodologyExplanation } from './MethodologyExplanation';
import { LoadingSpinner } from './icons';


declare global {
    interface Window {
        jspdf: any;
    }
}

interface ResultsDisplayProps {
  result: CalculationResult;
  formData: FormData;
  currencySymbol: string;
  country: Country;
  onReset: () => void;
  metricOverrides: MetricOverrides;
  hasOverrides: boolean;
  onOverridesChange: (metricKey: string, value: string) => void;
  onRecalculate: () => void;
  isRecalculating: boolean;
}

const formatCurrency = (value: number, currencySymbol: string, locale: string) => {
    return `${currencySymbol}${value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    result, 
    formData, 
    currencySymbol, 
    country, 
    onReset,
    metricOverrides,
    hasOverrides,
    onOverridesChange,
    onRecalculate,
    isRecalculating
}) => {
    const [showMethodology, setShowMethodology] = useState<boolean>(false);
    const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

    const toggleDetails = (key: string) => {
        setExpandedDetails(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDownloadPdf = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const bottomMargin = 20;
        let yPos = 35; 

        const now = new Date();
        const reportDate = now.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const reportTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const reportDateTime = `${reportDate} ${reportTime}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(108, 117, 125);
        doc.text('Report Date:', pageWidth - margin, margin - 5, { align: 'right' });
        doc.text(reportDateTime, pageWidth - margin, margin, { align: 'right' });

        const checkPageBreak = (currentY: number, requiredHeight: number): number => {
            if (currentY + requiredHeight > pageHeight - bottomMargin) {
                doc.addPage();
                return margin;
            }
            return currentY;
        };
        
        const calculateWrappedTextHeight = (text: string, options: any = {}) => {
            const lineHeight = options.lineHeightFactor || 1.15;
            const fontSize = options.fontSize || doc.getFontSize();
            const maxWidth = options.maxWidth || (pageWidth - margin * 2);
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxWidth);
            const textHeight = lines.length * fontSize * 0.352778 * lineHeight;
            return textHeight;
        };

        const addWrappedText = (text: string, x: number, y: number, options: any = {}) => {
            const lineHeight = options.lineHeightFactor || 1.15;
            const fontSize = options.fontSize || doc.getFontSize();
            const maxWidth = options.maxWidth || (pageWidth - margin * 2);
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y, options);
            const textHeight = lines.length * fontSize * 0.352778 * lineHeight;
            return textHeight;
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(33, 37, 41);
        doc.text('Inefficiency Cost Analysis', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(108, 117, 125);
        doc.text(`Results for ${formData.companyName} (Company with ${formData.engineers} engineers)`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 18;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(33, 37, 41);
        doc.text('Total Estimated Annual Loss:', margin, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text(formatCurrency(result.totalCost, currencySymbol, country.locale), margin, yPos);
        yPos += 12;
        
        const summaryText = `Executive Summary: ${result.summary}`;
        const summaryHeight = calculateWrappedTextHeight(summaryText, { fontSize: 11, lineHeightFactor: 1.4 });
        yPos = checkPageBreak(yPos, summaryHeight);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(52, 58, 64);
        addWrappedText(summaryText, margin, yPos, { fontSize: 11, lineHeightFactor: 1.4 });
        yPos += summaryHeight + 18;

        const breakdownTitleHeight = 12;
        yPos = checkPageBreak(yPos, breakdownTitleHeight);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(33, 37, 41);
        doc.text('Cost Breakdown and Insights', margin, yPos);
        yPos += breakdownTitleHeight;

        result.costBreakdown.filter(item => item.cost > 0).forEach((item) => {
            const categoryText = item.category;
            const costText = formatCurrency(item.cost, currencySymbol, country.locale);
            const reflectionText = `Consultant's Insight: ${item.explanation}`;
            
            const categoryHeight = calculateWrappedTextHeight(categoryText, { fontSize: 12, maxWidth: pageWidth - margin * 2 - 45 });
            const reflectionHeight = calculateWrappedTextHeight(reflectionText, { fontSize: 10, lineHeightFactor: 1.5 });
            const totalBlockHeight = categoryHeight + 4 + reflectionHeight + 12;

            yPos = checkPageBreak(yPos, totalBlockHeight);
            
            const categoryStartY = yPos;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 58, 64);
            const drawnCategoryHeight = addWrappedText(categoryText, margin, categoryStartY, { fontSize: 12, maxWidth: pageWidth - margin * 2 - 45 });

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 53, 69);
            addWrappedText(costText, pageWidth - margin, categoryStartY, { align: 'right', fontSize: 12 });
            
            yPos += drawnCategoryHeight + 4;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const drawnReflectionHeight = addWrappedText(reflectionText, margin, yPos, { fontSize: 10, lineHeightFactor: 1.5 });
            yPos += drawnReflectionHeight + 12;
        });

        const visualAnalysisTitleHeight = 18;
        yPos = checkPageBreak(yPos, visualAnalysisTitleHeight);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(33, 37, 41);
        doc.text('Visual Results Analysis', margin, yPos);
        yPos += 12;
        
        const interpretations = result.chartInterpretations;
        
        const addInterpretation = (title: string, text: string) => {
            const titleHeight = calculateWrappedTextHeight(title, { fontSize: 12 });
            const textHeight = calculateWrappedTextHeight(text, { fontSize: 10, lineHeightFactor: 1.5 });
            const interpretationBlockHeight = titleHeight + textHeight + 10;

            yPos = checkPageBreak(yPos, interpretationBlockHeight);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 58, 64);
            const drawnTitleHeight = addWrappedText(title, margin, yPos, { fontSize: 12 });
            yPos += drawnTitleHeight;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const drawnTextHeight = addWrappedText(text, margin, yPos, { fontSize: 10, lineHeightFactor: 1.5 });
            yPos += drawnTextHeight + 10;
        };
        
        addInterpretation('Bar Chart Interpretation', interpretations.bar);
        addInterpretation('Pie Chart Interpretation', interpretations.pie);
        addInterpretation('Radar Chart Interpretation (Inefficiency Profile)', interpretations.radar);

        doc.save('hidden_cost_analysis_plm.pdf');
    };

    return (
        <div className="space-y-6">
             <button
                onClick={onReset}
                className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-300"
            >
                Perform New Analysis
            </button>

            <div className="text-center">
                <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8 text-center inline-block w-full">
                    <h2 className="text-lg md:text-xl font-normal text-slate-300 mb-2">
                        Total Estimated Annual Loss
                    </h2>
                    <p className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        {formatCurrency(result.totalCost, currencySymbol, country.locale)}
                    </p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    *Values shown in local currency with an approximate exchange rate for illustrative purposes.
                </p>
            </div>


            <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="text-center">
                    <button 
                        onClick={() => toggleDetails('summary')}
                        className="text-sm text-blue-600 hover:underline focus:outline-none font-semibold"
                        aria-expanded={expandedDetails['summary']}
                    >
                        {expandedDetails['summary'] ? 'Hide Executive Summary' : 'View Executive Summary'}
                    </button>
                </div>
                {expandedDetails['summary'] && (
                    <p className="text-base text-slate-600 italic mt-4 animate-fadeIn">
                        <span className="font-semibold">Executive Summary:</span> {result.summary}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                        Cost Breakdown and Insights
                    </h2>
                    {hasOverrides && (
                         <button
                            onClick={onRecalculate}
                            disabled={isRecalculating}
                            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-wait"
                        >
                            {isRecalculating ? <LoadingSpinner /> : 'Recalculate with New Data'}
                        </button>
                    )}
                </div>
                <div className="space-y-6">
                    {result.costBreakdown.filter(item => item.cost > 0).map((item) => {
                        const detailKey = item.category;
                        const isDetailExpanded = expandedDetails[detailKey];
                        const metricStatusText = item.isMetricOverridden ? '(User Data)' : '(Estimated - Editable)';
                        const metricSourceText = item.isMetricOverridden ? 'This value was provided by you for the recalculation.' : item.metricSource;

                        return (
                            <div key={item.category} className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-700 text-base md:text-lg font-semibold pr-4">{item.category}:</p>
                                    <p className="text-red-600 font-bold text-base md:text-lg whitespace-nowrap">
                                        {formatCurrency(item.cost, currencySymbol, country.locale)}
                                    </p>
                                </div>
                                <div className="text-right mt-2">
                                    <button 
                                        onClick={() => toggleDetails(detailKey)}
                                        className="text-xs text-blue-600 hover:underline focus:outline-none"
                                        aria-expanded={isDetailExpanded}
                                    >
                                        {isDetailExpanded ? 'Hide details' : 'View details'}
                                    </button>
                                </div>
                                {isDetailExpanded && (
                                    <div className="animate-fadeIn mt-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-md space-y-4">
                                        <div>
                                            <p className="font-semibold text-slate-700 mb-2">Calculation Methodology:</p>
                                            <p className='mb-3'>{item.methodologyFormula}</p>
                                             <div className="mt-3">
                                                <label htmlFor={item.metricKey} className="block text-slate-700 font-medium text-sm mb-1">
                                                    {item.metricLabel} {metricStatusText}:
                                                </label>
                                                <input
                                                    id={item.metricKey}
                                                    type="text"
                                                    value={formatCurrency(metricOverrides[item.metricKey] ?? item.metricValue, currencySymbol, country.locale)}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                                                        onOverridesChange(item.metricKey, rawValue);
                                                    }}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black"
                                                />
                                                <p className="text-xs italic mt-2 text-slate-500">{metricSourceText}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3">
                                            <p className="font-semibold text-slate-700 mb-1">Calculation Rationale (Step-by-Step):</p>
                                            <p className="whitespace-pre-wrap">{item.calculationNarrative}</p>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3">
                                            <p className="font-semibold text-slate-700 mb-1">Consultant's Insight:</p>
                                            <p className="whitespace-pre-wrap">{item.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-center px-4">
                <button 
                    onClick={() => setShowMethodology(!showMethodology)}
                    className="text-sm text-blue-600 hover:underline focus:outline-none mt-1 font-semibold"
                    aria-expanded={showMethodology}
                >
                    {showMethodology ? 'Hide Metrics & Assumptions Rationale' : 'View Metrics & Assumptions Rationale'}
                </button>
            </div>

            {showMethodology && (
                <MethodologyExplanation 
                    formData={formData}
                    country={country}
                    metricOverrides={metricOverrides}
                />
            )}

            <div className="pt-2">
                <DataVisualization 
                    result={result}
                    formData={formData}
                    currencySymbol={currencySymbol}
                />
            </div>

            <div className="text-center text-slate-700 space-y-3 text-base pt-4">
                <p>This number represents a capital drain that could be invested in innovation and growth.</p>
                <p>A PLM strategy can recover up to 70% of these costs.</p>
                <p>
                    Shall we schedule a 15-minute call for a free diagnosis?{' '}
                    <a href="https://calendly.com/johann-lopez-rockwellconsults/30min" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800">
                        Let's start the conversation.
                    </a>
                </p>
            </div>

            <button
                onClick={handleDownloadPdf}
                className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition-colors duration-300"
            >
                Download Results as PDF
            </button>
        </div>
    );
};