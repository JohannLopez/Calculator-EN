import React from 'react';
import type { FormData } from '../types';
import { COUNTRIES, INDUSTRY_OPTIONS, SECTORS } from '../constants';
import { LoadingSpinner, InfoIcon } from './icons';

interface CalculatorFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  disabled: boolean;
}

interface FormFieldProps {
    id: keyof Omit<FormData, 'countryCode' | 'companyName' | 'industry' | 'sector' | 'otherIndustry' | 'otherSector' | 'industryInput' | 'sectorInput' | 'infoLocation'>;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    tooltipText: string;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, placeholder, value, onChange, disabled, tooltipText }) => (
    <div>
        <div className="flex items-center space-x-1.5 mb-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="tooltip-container">
                <InfoIcon />
                <span className="tooltip-text">{tooltipText}</span>
            </div>
        </div>
        <input
            type="number"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            disabled={disabled}
            min="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
    </div>
);


export const CalculatorForm: React.FC<CalculatorFormProps> = ({ formData, onFormChange, onSubmit, isLoading, disabled }) => {
  const availableSectors = SECTORS[formData.industry] || [];
  
  return (
    <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={onFormChange}
                    placeholder="e.g., Acme Manufacturing Inc."
                    required
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="countryCode" className="block text-sm font-medium text-slate-700 mb-1">Country (for local currency)</label>
                <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={onFormChange}
                    disabled={disabled}
                    className="w-full h-[42px] rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                    {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code} className="text-black bg-white">
                        {country.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-8">
            <div>
                <label htmlFor="industryInput" className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <input
                    type="text"
                    id="industryInput"
                    name="industryInput"
                    value={formData.industryInput || ''}
                    onChange={onFormChange}
                    disabled={disabled}
                    list="industry-list"
                    placeholder="Select or type your industry"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <datalist id="industry-list">
                {INDUSTRY_OPTIONS.map(option => (
                    <option key={option.value} value={option.label} />
                ))}
                </datalist>
            </div>
            {formData.industry && (
                <div className="animate-fadeIn">
                    <label htmlFor="sectorInput" className="block text-sm font-medium text-slate-700 mb-1">
                        Sector
                    </label>
                    <input
                        type="text"
                        id="sectorInput"
                        name="sectorInput"
                        value={formData.sectorInput || ''}
                        onChange={onFormChange}
                        disabled={disabled || !availableSectors.length}
                        list="sector-list"
                        placeholder={availableSectors.length ? "Select or type your sector" : "No specific sectors available"}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <datalist id="sector-list">
                        <option value="General" />
                        {availableSectors.map(sector => (
                            <option key={sector} value={sector} />
                        ))}
                    </datalist>
                </div>
            )}
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🏢 Engineering Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <FormField id="engineers" label="No. of Engineers / Designers" placeholder="e.g., 10" value={formData.engineers} onChange={onFormChange} disabled={disabled} tooltipText="Include all technical staff actively involved in product development and modification." />
                <FormField id="numSites" label="No. of sites with engineers" placeholder="e.g., 2" value={formData.numSites} onChange={onFormChange} disabled={disabled} tooltipText="Indicate in how many different physical locations (plants, offices) you have engineering teams." />
                <FormField id="numCountries" label="No. of countries with engineers" placeholder="e.g., 1" value={formData.numCountries} onChange={onFormChange} disabled={disabled} tooltipText="Indicate in how many different countries your engineering teams operate." />
            </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🏭 Production and Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <FormField id="newProducts" label="New products / revisions per year" placeholder="e.g., 5" value={formData.newProducts} onChange={onFormChange} disabled={disabled} tooltipText="Enter the total number of new products launched or major revisions to existing products your team manages annually." />
                <FormField id="reworks" label="No. of reworks per product" placeholder="e.g., 3" value={formData.reworks} onChange={onFormChange} disabled={disabled} tooltipText="Indicate the average number of times a product must be reworked due to design errors or outdated information." />
                <FormField id="delays" label="Average weeks of delay" placeholder="e.g., 2" value={formData.delays} onChange={onFormChange} disabled={disabled} tooltipText="Estimate the average number of weeks a project is delayed from its planned launch date." />
            </div>
        </div>
        
        <div className="border-t border-slate-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">⚙️ Information Management</h3>
            <p className="text-sm text-slate-600 mb-4">Where is critical product information (designs, BOMs) primarily stored?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="custom-radio-label py-4 pr-4 pl-12 border rounded-lg border-slate-300">
                    <input type="radio" name="infoLocation" value="corporate" checked={formData.infoLocation === 'corporate'} onChange={onFormChange} disabled={disabled}/>
                    <span className="checkmark"></span>
                    <span className="radio-option-text">Corporate System</span>
                    <span className="radio-option-desc block">Network servers, ERP, cloud system</span>
                </label>
                <label className="custom-radio-label py-4 pr-4 pl-12 border rounded-lg border-slate-300">
                    <input type="radio" name="infoLocation" value="personal_pc" checked={formData.infoLocation === 'personal_pc'} onChange={onFormChange} disabled={disabled}/>
                    <span className="checkmark"></span>
                    <span className="radio-option-text">Personal PC</span>
                    <span className="radio-option-desc block">Engineers' hard drives, email</span>
                </label>
            </div>
        </div>


        <div className="mt-8">
            <button
            type="submit"
            disabled={isLoading || disabled}
            className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
            {isLoading ? <LoadingSpinner /> : 'Analyze Hidden Costs'}
            </button>
        </div>
    </form>
  );
};