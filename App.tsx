
import React, { useState, useCallback, useEffect } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryDisplay } from './components/HistoryDisplay';
import { LoadingSpinner } from './components/Icons';
import type { FormData, CalculationResult, Country, CostBreakdownItem, HistoryEntry, MetricOverrides } from './types';
import { generateQualitativeAnalysis } from './services/geminiService';
import { COUNTRIES, INDUSTRY_METRICS, INDUSTRY_OPTIONS, SECTORS } from './constants';

const formatCurrency = (value: number, currencySymbol: string, locale: string) => {
    return `${currencySymbol}${value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    industryInput: '',
    otherIndustry: '',
    sector: '',
    sectorInput: '',
    otherSector: '',
    countryCode: 'USD',
    engineers: '10',
    numSites: '1',
    numCountries: '1',
    infoLocation: 'corporate',
    newProducts: '5',
    reworks: '3',
    delays: '2',
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [metricOverrides, setMetricOverrides] = useState<MetricOverrides>({});
  const [hasOverrides, setHasOverrides] = useState<boolean>(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('plmCalculatorHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Failed to load history from localStorage", err);
      setHistory([]);
    }
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
        const newState = { ...prev };

        if (!['industryInput', 'sectorInput'].includes(name)) {
            newState[name as keyof FormData] = value as any;
            return newState;
        }

        if (name === 'industryInput') {
            newState.industryInput = value;
            const selectedIndustry = INDUSTRY_OPTIONS.find(opt => opt.label === value);
            
            const oldIndustry = newState.industry;
            let newIndustry = '';

            if (selectedIndustry) {
                newIndustry = selectedIndustry.value;
                newState.otherIndustry = '';
            } else {
                newIndustry = 'other';
                newState.otherIndustry = value;
            }
            newState.industry = newIndustry;

            if (oldIndustry !== newIndustry) {
                newState.sector = '';
                newState.otherSector = '';
                newState.sectorInput = ''; 
            }
        }

        if (name === 'sectorInput') {
            newState.sectorInput = value;
            const availableSectors = SECTORS[newState.industry] || [];

            if (value === 'General' || value === '') {
                newState.sector = '';
                newState.otherSector = '';
            } else if (availableSectors.includes(value)) {
                newState.sector = value;
                newState.otherSector = '';
            } else {
                newState.sector = 'other';
                newState.otherSector = value;
            }
        }

        return newState;
    });
  }, []);

  const performCalculation = useCallback(async (
    currentFormData: FormData, 
    currentMetricOverrides: MetricOverrides
  ): Promise<CalculationResult> => {
    const selectedCountry = COUNTRIES.find(c => c.code === currentFormData.countryCode);
    if (!selectedCountry) {
        throw new Error("Selected country is not valid.");
    }
    
    const industryKey = currentFormData.industry === 'other' ? 'general-discrete-manufacturing' : currentFormData.industry;
    const industryData = INDUSTRY_METRICS[industryKey] || INDUSTRY_METRICS['general-discrete-manufacturing'];
    
    const isSpecificSector = currentFormData.sector && currentFormData.sector !== 'other' && industryData.sectors?.[currentFormData.sector];
    const metrics = isSpecificSector
                  ? industryData.sectors![currentFormData.sector] 
                  : industryData.baseMetrics;
    
    const currencyCode = currentFormData.countryCode;

    // Get base values from localized data and apply overrides
    const averageEngineerSalary = currentMetricOverrides.averageEngineerSalary ?? metrics.averageEngineerSalary[currencyCode];
    const reworkCost = currentMetricOverrides.reworkCost ?? metrics.reworkCost[currencyCode];
    const newProductRevenue = currentMetricOverrides.newProductRevenue ?? metrics.newProductRevenue[currencyCode];
    const baseWastedHours = metrics.baseWastedHours;
    const hoursPerSite = metrics.hoursPerSite;
    const hoursPerCountry = metrics.hoursPerCountry;
    const siloCostMultiplier = metrics.siloCostMultiplier;
    
    // User inputs
    const numEngineers = parseFloat(currentFormData.engineers);
    const numSites = parseFloat(currentFormData.numSites);
    const numCountries = parseFloat(currentFormData.numCountries);
    const numNewProducts = parseFloat(currentFormData.newProducts);
    const numReworks = parseFloat(currentFormData.reworks);
    const numDelays = parseFloat(currentFormData.delays);

    // --- NEW CALCULATION LOGIC ---
    
    // 1. Collaboration Cost
    const calculatedWastedHours = baseWastedHours + Math.max(0, numSites - 1) * hoursPerSite + Math.max(0, numCountries - 1) * hoursPerCountry;
    const collaborationCostRaw = (averageEngineerSalary / 52) * calculatedWastedHours * numEngineers;

    // 2. Rework Cost (remains the same)
    const reworksCostRaw = numNewProducts * numReworks * reworkCost;
    
    // 3. Delay Cost (remains the same)
    const delayCostRaw = (newProductRevenue / 52) * numDelays * numNewProducts;
    
    // 4. Silo Risk Cost
    const siloRiskCostRaw = currentFormData.infoLocation === 'personal_pc' ? (reworksCostRaw + delayCostRaw) * siloCostMultiplier : 0;
    
    // Round final values
    const collaborationCost = Math.round(collaborationCostRaw);
    const reworksCost = Math.round(reworksCostRaw);
    const delayCost = Math.round(delayCostRaw);
    const siloRiskCost = Math.round(siloRiskCostRaw);

    const totalCost = collaborationCost + reworksCost + delayCost + siloRiskCost;

    // --- NARRATIVES FOR GEMINI ---
    const salaryText = `The average annual salary of an engineer is estimated at ${formatCurrency(averageEngineerSalary, selectedCountry.currencySymbol, selectedCountry.locale)}`;
    const collaborationNarrative = `${salaryText}. With a structure of ${numSites} sites in ${numCountries} countries, an inefficiency in communication and data searching is estimated at ${calculatedWastedHours.toFixed(1)} hours/week per engineer. For ${numEngineers} engineers, this represents an annual loss of ${formatCurrency(collaborationCost, selectedCountry.currencySymbol, selectedCountry.locale)}.`;

    const reworkText = `At an estimated cost of ${formatCurrency(reworkCost, selectedCountry.currencySymbol, selectedCountry.locale)} per cycle`;
    const reworkNarrative = `With ${numNewProducts} new products and ${numReworks} reworks for each, the company faces ${numNewProducts * numReworks} rework cycles. ${reworkText}, the annual loss is ${formatCurrency(reworksCost, selectedCountry.currencySymbol, selectedCountry.locale)}.`;
    
    const revenueText = `If a new product generates annual revenue of ${formatCurrency(newProductRevenue, selectedCountry.currencySymbol, selectedCountry.locale)}`;
    const delayNarrative = `${revenueText}, each week of delay represents a loss of ${formatCurrency(newProductRevenue / 52, selectedCountry.currencySymbol, selectedCountry.locale)}. With a delay of ${numDelays} weeks on ${numNewProducts} products, the opportunity cost is ${formatCurrency(delayCost, selectedCountry.currencySymbol, selectedCountry.locale)}.`;

    const siloNarrative = currentFormData.infoLocation === 'personal_pc'
        ? `Storing critical data on personal PCs introduces significant risk. This decentralized method increases the likelihood of errors and reworks. A risk multiplier of ${siloCostMultiplier * 100}% is applied to rework and delay costs, resulting in an additional risk cost of ${formatCurrency(siloRiskCost, selectedCountry.currencySymbol, selectedCountry.locale)}.`
        : "Using a centralized corporate system is a good practice that mitigates the risks of isolated information. This cost is zero.";


    const costBreakdown: CostBreakdownItem[] = [
        {
            category: "Cost of Inefficiency from Distributed Collaboration",
            cost: collaborationCost,
            explanation: "",
            methodologyFormula: `(${formatCurrency(averageEngineerSalary, selectedCountry.currencySymbol, selectedCountry.locale)}/year ÷ 52 wk) × ${calculatedWastedHours.toFixed(1)}h × ${numEngineers} eng.`,
            metricKey: 'averageEngineerSalary',
            metricValue: averageEngineerSalary,
            metricLabel: 'Annual Salary',
            metricSource: '(based on industry standards).',
            calculationNarrative: collaborationNarrative,
            isMetricOverridden: !!currentMetricOverrides.averageEngineerSalary,
        },
        {
            category: "Cost of Engineering and Production Rework",
            cost: reworksCost,
            explanation: "",
            methodologyFormula: `${numNewProducts} products × ${numReworks} reworks/prod × ${formatCurrency(reworkCost, selectedCountry.currencySymbol, selectedCountry.locale)}/rework`,
            metricKey: 'reworkCost',
            metricValue: reworkCost,
            metricLabel: 'Cost per Rework',
            metricSource: '(based on industry standards).',
            calculationNarrative: reworkNarrative,
            isMetricOverridden: !!currentMetricOverrides.reworkCost,
        },
        {
            category: "Opportunity Cost from Market Delay",
            cost: delayCost,
            explanation: "",
            methodologyFormula: `(${formatCurrency(newProductRevenue, selectedCountry.currencySymbol, selectedCountry.locale)}/prod ÷ 52 wk) × ${numDelays} wk × ${numNewProducts} prod`,
            metricKey: 'newProductRevenue',
            metricValue: newProductRevenue,
            metricLabel: 'Annual Revenue per Product',
            metricSource: '(based on industry standards).',
            calculationNarrative: delayNarrative,
            isMetricOverridden: !!currentMetricOverrides.newProductRevenue,
        },
        {
            category: "Cost of Risk from Information Silos",
            cost: siloRiskCost,
            explanation: "",
            methodologyFormula: currentFormData.infoLocation === 'personal_pc' ? `(${formatCurrency(reworksCost, selectedCountry.currencySymbol, selectedCountry.locale)} + ${formatCurrency(delayCost, selectedCountry.currencySymbol, selectedCountry.locale)}) × ${siloCostMultiplier * 100}%` : 'Zero cost for using a centralized system',
            metricKey: 'siloCostMultiplier',
            metricValue: siloCostMultiplier,
            metricLabel: 'Silo Risk Multiplier',
            metricSource: '(based on industry standards).',
            calculationNarrative: siloNarrative,
            isMetricOverridden: false, // This metric is not user-editable for now
        }
    ];
    
    const initialResult: CalculationResult = {
        totalCost,
        costBreakdown,
        summary: "",
        methodologyNotes: "",
        chartInterpretations: { bar: "", pie: "", radar: "" }
    };

    return generateQualitativeAnalysis(currentFormData, selectedCountry, initialResult);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setMetricOverrides({});
    setHasOverrides(false);
    
    if (!formData.industry || !formData.industryInput) {
        setError("Please select or specify an industry.");
        setIsLoading(false);
        return;
    }

    try {
        const finalResult = await performCalculation(formData, {});
        setResult(finalResult);

        const newHistoryEntry: HistoryEntry = {
            id: Date.now(),
            formData,
            result: finalResult,
            country: COUNTRIES.find(c => c.code === formData.countryCode)!,
            metricOverrides: {},
        };

        setHistory(prevHistory => {
            const updatedHistory = [newHistoryEntry, ...prevHistory].slice(0, 10);
            try {
                localStorage.setItem('plmCalculatorHistory', JSON.stringify(updatedHistory));
            } catch (err) {
                console.error("Failed to save history to localStorage", err);
            }
            return updatedHistory;
        });

    } catch (err) {
        console.error(err);
        setError('There was an error generating the analysis. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }, [formData, performCalculation]);
  
  const handleOverridesChange = useCallback((metricKey: string, valueStr: string) => {
    const newOverrides = { ...metricOverrides };
    if (valueStr === '') {
        delete newOverrides[metricKey];
    } else {
        const value = parseFloat(valueStr);
        if (!isNaN(value) && value >= 0) {
            newOverrides[metricKey] = value;
        } else {
            return; 
        }
    }
    setMetricOverrides(newOverrides);
    setHasOverrides(Object.keys(newOverrides).length > 0);
  }, [metricOverrides]);

  const handleRecalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const finalResult = await performCalculation(formData, metricOverrides);
        setResult(finalResult);

        const newHistoryEntry: HistoryEntry = {
            id: Date.now(),
            formData,
            result: finalResult,
            country: COUNTRIES.find(c => c.code === formData.countryCode)!,
            metricOverrides: metricOverrides,
        };

        setHistory(prevHistory => {
            const updatedHistory = [newHistoryEntry, ...prevHistory].slice(0, 10);
            try {
                localStorage.setItem('plmCalculatorHistory', JSON.stringify(updatedHistory));
            } catch (err) {
                console.error("Failed to save history to localStorage", err);
            }
            return updatedHistory;
        });
        
    } catch (err) {
        console.error(err);
        setError('There was an error recalculating the analysis. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }, [formData, metricOverrides, performCalculation]);


  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setMetricOverrides({});
    setHasOverrides(false);
  }, []);

  const handleClearHistory = useCallback(() => {
      setHistory([]);
      try {
          localStorage.removeItem('plmCalculatorHistory');
      } catch (err) {
          console.error("Failed to clear history from localStorage", err);
      }
  }, []);

  const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode);
  const currencySymbol = selectedCountry?.currencySymbol || '$';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-4xl mx-auto my-8 space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-8">
                Advanced Inefficiency Cost Calculator
            </h1>
            <CalculatorForm 
                formData={formData} 
                onFormChange={handleFormChange} 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={!!result && !isLoading}
            />
        </div>
        
        {isLoading && (
            <div className="flex justify-center items-center text-slate-600">
                <LoadingSpinner isWhite={false} />
                <span className="ml-2">Analyzing data and generating report...</span>
            </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {result && !isLoading && selectedCountry && (
            <div className="animate-fadeIn space-y-8">
                <ResultsDisplay 
                    result={result} 
                    formData={formData}
                    currencySymbol={currencySymbol} 
                    country={selectedCountry}
                    onReset={handleReset}
                    metricOverrides={metricOverrides}
                    hasOverrides={hasOverrides}
                    onOverridesChange={handleOverridesChange}
                    onRecalculate={handleRecalculate}
                    isRecalculating={isLoading}
                />
            </div>
        )}

        {history.length > 0 && (
            <div className="mt-8">
                {isHistoryVisible ? (
                    <HistoryDisplay 
                        history={history} 
                        onClearHistory={handleClearHistory}
                        onClose={() => setIsHistoryVisible(false)} 
                    />
                ) : (
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsHistoryVisible(true)}
                            className="bg-white text-slate-700 font-semibold py-2 px-4 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors duration-300"
                        >
                            View Analysis History ({history.length})
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;