
import React from 'react';
// FIX: Import `CostBreakdownItem` to resolve type errors.
import type { HistoryEntry, CostBreakdownItem } from '../types';
import { INDUSTRY_OPTIONS } from '../constants';
import { DownloadIcon, TrashIcon } from './icons';

interface HistoryDisplayProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onClearHistory, onClose }) => {

    const handleDownload = () => {
        const headers = [
            "Company Name",
            "Industry",
            "Sector",
            "Country",
            "No. of Engineers / Designers",
            "No. of Sites",
            "No. of Countries",
            "Info Location",
            "New Products / Revisions per Year",
            "No. of Reworks per Product",
            "Avg. Weeks of Delay per Product",
            "Total Annual Loss",
            "Collaboration Cost",
            "Rework Cost",
            "Delay Cost",
            "Silo Risk Cost",
            "Used Annual Salary",
            "Used Cost per Rework",
            "Used Annual Revenue per Product"
        ];
    
        const csvContent = [
            headers.join(','),
            ...history.map(entry => {
                const industryLabel = entry.formData.industry === 'other' && entry.formData.otherIndustry
                    ? entry.formData.otherIndustry
                    : INDUSTRY_OPTIONS.find(opt => opt.value === entry.formData.industry)?.label || entry.formData.industry;

                const sectorLabel = entry.formData.sector === 'other' && entry.formData.otherSector
                    ? entry.formData.otherSector
                    : entry.formData.sector;
                
                const escapeCsvField = (field: string | number): string => {
                    const str = String(field);
                    if (str.includes(',')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                const breakdownMap: Map<string, CostBreakdownItem> = new Map(entry.result.costBreakdown.map(item => [item.metricKey, item]));
    
                const getMetricCsvValue = (metricKey: string): string => {
                    const item = breakdownMap.get(metricKey);
                    if (!item) return '';
                    
                    const value = Math.round(item.metricValue);
                    const isOverridden = item.isMetricOverridden;

                    return isOverridden ? String(value) : `*${value}`;
                };
    
                const row = [
                    entry.formData.companyName,
                    industryLabel,
                    sectorLabel || 'General',
                    entry.country.name,
                    entry.formData.engineers,
                    entry.formData.numSites,
                    entry.formData.numCountries,
                    entry.formData.infoLocation === 'personal_pc' ? 'Personal PC' : 'Corporate System',
                    entry.formData.newProducts,
                    entry.formData.reworks,
                    entry.formData.delays,
                    Math.round(entry.result.totalCost),
                    Math.round(entry.result.costBreakdown.find(c => c.category.includes("Collaboration"))?.cost ?? 0),
                    Math.round(entry.result.costBreakdown.find(c => c.category.includes("Rework"))?.cost ?? 0),
                    Math.round(entry.result.costBreakdown.find(c => c.category.includes("Opportunity"))?.cost ?? 0),
                    Math.round(entry.result.costBreakdown.find(c => c.category.includes("Information Silos"))?.cost ?? 0),
                    getMetricCsvValue('averageEngineerSalary'),
                    getMetricCsvValue('reworkCost'),
                    getMetricCsvValue('newProductRevenue'),
                ].map(escapeCsvField);
                
                return row.join(',');
            })
        ].join('\n');
    
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "cost_analysis_history.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                        Analysis History
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        You have <span className="font-bold text-slate-800">{history.length}</span> analyses saved in this session.
                    </p>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-center">
                    <button onClick={handleDownload} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                        <DownloadIcon />
                        <span className="ml-2">Download</span>
                    </button>
                    <button onClick={onClearHistory} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <TrashIcon />
                        <span className="ml-2">Clear</span>
                    </button>
                    <button onClick={onClose} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                        Hide
                    </button>
                </div>
            </div>
        </div>
    );
};