import React from 'react';
import { INDUSTRY_METRICS, INDUSTRY_OPTIONS } from '../constants';
import type { Country, FormData, MetricOverrides, IndustryMetrics } from '../types';

interface MethodologyExplanationProps {
  formData: FormData;
  country: Country;
  metricOverrides: MetricOverrides;
}

const formatCurrency = (value: number, currencySymbol: string, locale: string) => {
    return `${currencySymbol}${value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const JustificationText: React.FC<{ overrideCount: number }> = ({ overrideCount }) => {
    const allOverridden = overrideCount === 3;
    const someOverridden = overrideCount > 0 && overrideCount < 3;

    return (
        <div className="space-y-3 text-xs">
            {allOverridden ? (
                <>
                    <p><strong>Data Source:</strong> All calculations are based on the actual values you provided. This transforms the analysis into an accurate financial reflection of your company's specific operational inefficiencies, eliminating market estimates.</p>
                    <p><strong>Value's Purpose:</strong> By using your own data, the calculator offers a fully customized result that reflects the reality of your operations and costs.</p>
                    <p><strong>Calculation Accuracy:</strong> The result is a direct reflection of the information you have provided, leading to the most accurate possible analysis of your current situation.</p>
                </>
            ) : someOverridden ? (
                <>
                    <p><strong>Data Source:</strong> This analysis combines conservative industry estimates with actual data provided by you. This mixed approach significantly increases the calculation's accuracy, adapting it better to your company's financial reality while maintaining a market benchmark for other variables.</p>
                    <p><strong>Value's Purpose:</strong> The industry values act as a credible benchmark for the variables that were not modified, while the data you provided ensures that key areas of the calculation are as accurate as possible.</p>
                    <p><strong>Conservative and Real Values:</strong> The application's estimates are deliberately conservative to provide a credible "floor." The combination with your actual data results in a robust, hybrid analysis.</p>
                </>
            ) : (
                 <>
                    <p><strong>Data Source:</strong> The values are based on an analysis of economic metrics for each country and sector, using public domain sources such as salary surveys and industrial cost reports. They represent a statistical consensus for a medium-sized company, serving as a robust, localized benchmark.</p>
                    <p><strong>Value's Purpose:</strong> The goal is not to guess the exact cost of a particular error in your company, but to use a credible and defensible market average to make the calculation strategically representative.</p>
                    <p><strong>Purposely Conservative:</strong> They were deliberately chosen to be conservative. In many cases, actual costs can be much higher. This ensures that the loss estimate is a credible and hard-to-refute "floor" rather than an exaggeration.</p>
                </>
            )}
        </div>
    );
};


export const MethodologyExplanation: React.FC<MethodologyExplanationProps> = ({ formData, country, metricOverrides }) => {
    const { industry, sector, countryCode } = formData;
    const industryKey = industry === 'other' ? 'general-discrete-manufacturing' : industry;
    const industryData = INDUSTRY_METRICS[industryKey] || INDUSTRY_METRICS['general-discrete-manufacturing'];
    
    const isSpecificSector = sector && sector !== 'other' && industryData.sectors?.[sector];
    const metrics = isSpecificSector
                    ? industryData.sectors![sector]
                    : industryData.baseMetrics;
    
    const industryLabel = industry === 'other' && formData.otherIndustry 
        ? formData.otherIndustry
        : INDUSTRY_OPTIONS.find(opt => opt.value === industry)?.label || 'General Industry';
    
    const sectorLabel = sector === 'other' && formData.otherSector
        ? formData.otherSector
        : sector;
        
    const displaySector = sectorLabel ? `/ ${sectorLabel}` : (sector === '' ? '/ General' : '');

    const overrideCount = Object.keys(metricOverrides).length;
    
    const isOverridden = (key: string) => metricOverrides.hasOwnProperty(key);

    const getMetricValue = (key: keyof MetricOverrides, metricSet: IndustryMetrics) => {
        const localValue = (metricSet[key as keyof IndustryMetrics] as Record<string, number>)[countryCode];
        return metricOverrides[key] ?? localValue;
    };
    
    const getUsdEquivalent = (localValue: number) => {
        return localValue / country.usdRate;
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 mt-6 text-sm text-slate-700 animate-fadeIn space-y-6">
            <h3 className="text-xl font-bold text-slate-800 text-center">Metrics and Assumptions Rationale</h3>

            <div className="space-y-2">
                <h4 className="font-semibold text-lg text-slate-800">1. Base Financial Variables (Editable)</h4>
                <p>
                    To ensure consistency and reliability, the calculator uses three base financial cost metrics. These values are localized market estimates for your country and sector. The tool allows you to <span className="font-bold">edit these values</span> in the cost breakdown to more accurately reflect your company's reality.
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 bg-slate-50 p-4 rounded-md">
                    <li>
                        <strong>Annual Engineer Salary:</strong>
                        {isOverridden('averageEngineerSalary') && <span className="text-green-600 font-semibold text-xs ml-2">(Custom Value)</span>}
                        <span className="block pl-4">
                            {formatCurrency(getMetricValue('averageEngineerSalary', metrics), country.currencySymbol, country.locale)}
                            {country.code !== 'USD' && ` (${formatCurrency(getUsdEquivalent(getMetricValue('averageEngineerSalary', metrics)), '$', 'en-US')})`}
                        </span>
                    </li>
                    <li>
                        <strong>Cost per Rework:</strong>
                        {isOverridden('reworkCost') && <span className="text-green-600 font-semibold text-xs ml-2">(Custom Value)</span>}
                        <span className="block pl-4">
                            {formatCurrency(getMetricValue('reworkCost', metrics), country.currencySymbol, country.locale)}
                            {country.code !== 'USD' && ` (${formatCurrency(getUsdEquivalent(getMetricValue('reworkCost', metrics)), '$', 'en-US')})`}
                        </span>
                    </li>
                    <li>
                        <strong>Annual Revenue per Product:</strong>
                        {isOverridden('newProductRevenue') && <span className="text-green-600 font-semibold text-xs ml-2">(Custom Value)</span>}
                        <span className="block pl-4">
                            {formatCurrency(getMetricValue('newProductRevenue', metrics), country.currencySymbol, country.locale)}
                            {country.code !== 'USD' && ` (${formatCurrency(getUsdEquivalent(getMetricValue('newProductRevenue', metrics)), '$', 'en-US')})`}
                        </span>
                    </li>
                </ul>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold text-lg text-slate-800">2. Base Operational Variables (Non-Editable)</h4>
                <p>
                    The costs for Collaboration and Silo Risk are derived from standard industry operational metrics. These model the complexity inherent in distributed teams and decentralized information management.
                </p>
                 <ul className="list-disc list-inside pl-4 space-y-2 bg-slate-50 p-4 rounded-md">
                    <li>
                        <strong>Base Weekly Inefficiency Hours:</strong>
                        <span className="block pl-4">{metrics.baseWastedHours} hours per engineer</span>
                    </li>
                     <li>
                        <strong>Additional Inefficiency per Site:</strong>
                        <span className="block pl-4">{metrics.hoursPerSite} hours per additional site</span>
                    </li>
                     <li>
                        <strong>Additional Inefficiency per Country:</strong>
                        <span className="block pl-4">{metrics.hoursPerCountry} hours per additional country</span>
                    </li>
                     <li>
                        <strong>Silo Risk Multiplier:</strong>
                        <span className="block pl-4">{metrics.siloCostMultiplier * 100}% (applied to rework and delay costs)</span>
                    </li>
                </ul>
            </div>
            
            <div className="space-y-2">
                <h4 className="font-semibold text-lg text-slate-800">3. Rationale: Are These Values Realistic?</h4>
                <JustificationText overrideCount={overrideCount} />
            </div>
        </div>
    );
};