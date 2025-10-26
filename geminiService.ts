
import { GoogleGenAI } from "@google/genai";
import type { FormData, Country, CalculationResult } from '../types';
import { INDUSTRY_OPTIONS } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * This function NO LONGER calculates costs. It receives pre-calculated, deterministic results
 * and uses the AI solely to generate the qualitative, persuasive text content based on those fixed numbers.
 * The AI's role is now that of a "consultant writer," not a "calculator."
 */
export async function generateQualitativeAnalysis(formData: FormData, country: Country, calculatedData: CalculationResult): Promise<CalculationResult> {
    const industryLabel = INDUSTRY_OPTIONS.find(opt => opt.value === formData.industry)?.label || formData.industry;
    
    const industryName = formData.industry === 'other' && formData.otherIndustry
        ? formData.otherIndustry
        : industryLabel;
    
    const sectorName = formData.sector === 'other' && formData.otherSector
        ? formData.otherSector
        : formData.sector;
        
    const infoLocationText = formData.infoLocation === 'personal_pc' ? 'Personal PCs (highly decentralized)' : 'Corporate system (centralized)';

    const prompt = `
        Act as a senior business strategy consultant specializing in process optimization for manufacturing companies using PLM (Product Lifecycle Management) systems.
        Your task is to take the data and pre-calculated cost results I provide and generate a persuasive and professional written analysis in JSON format.

        Company Data and Context:
        - Company Name: ${formData.companyName}
        - Industry: ${industryName}
        ${sectorName ? `- Specific Sector: ${sectorName}` : ''}
        - Country: ${country.name}
        - Currency: ${country.code}
        - Structure: ${formData.engineers} engineers across ${formData.numSites} sites and ${formData.numCountries} countries.
        - Information Management: ${infoLocationText}.

        Numerical Results (ALREADY CALCULATED - DO NOT CHANGE THEM):
        - Total Estimated Annual Loss: ${calculatedData.totalCost.toLocaleString('en-US', { style: 'currency', currency: country.code })}
        - Cost Breakdown:
        ${calculatedData.costBreakdown.map(item => `  - ${item.category}: ${item.cost.toLocaleString('en-US', { style: 'currency', currency: country.code })}`).join('\n')}

        Content Generation Instructions (Your Task - YOU MUST RETURN ONLY THE JSON):
        Based on the numbers and context, complete the following text fields:

        1.  **summary (Executive Summary)**: Write an executive-level paragraph. Frame the 'totalCost' (${calculatedData.totalCost.toLocaleString()}) as a strategic risk for a company with a distributed structure (${formData.numSites} sites). Define this cost as a 'capital drain' that inhibits innovation. Position a PLM as the critical investment to unify information, optimize multi-site collaboration, and strengthen competitiveness.

        2.  **costBreakdown (Only the 'explanation' fields)**: For each of the 4 items in the breakdown, write a "Consultant's Insight" ('explanation'). Connect the numerical cost to a process weakness, considering the company's structure and data management.
            - For "${calculatedData.costBreakdown[0].category}" (${calculatedData.costBreakdown[0].cost.toLocaleString()}): Explain how the complexity of having ${formData.numSites} sites and ${formData.numCountries} countries creates communication and data-searching overhead that a centralized PLM eliminates.
            - For "${calculatedData.costBreakdown[1].category}" (${calculatedData.costBreakdown[1].cost.toLocaleString()}): Link reworks to the lack of a "single source of truth," a problem exacerbated by distributed teams and non-centralized data.
            - For "${calculatedData.costBreakdown[2].category}" (${calculatedData.costBreakdown[2].cost.toLocaleString()}): Argue that delays are a direct consequence of operational friction (inefficient communication and reworks), preventing the agility needed to compete.
            - For "${calculatedData.costBreakdown[3].category}" (${calculatedData.costBreakdown[3].cost.toLocaleString()}): ${formData.infoLocation === 'personal_pc' ? `Emphasize that storing data on PCs is the biggest operational risk, creating 'silos' that guarantee the use of outdated information. Explain that the calculated cost is a risk premium the company pays for not having control over its intellectual assets.` : `Praise the decision to use a corporate system, but warn that without a formal PLM structure, even centralized systems can become disorganized and generate hidden costs. Mention that the risk cost is zero thanks to this good initial practice.`}

        3.  **methodologyNotes**: Write a brief summary of the assumptions. Mention that the calculations are based on metrics that model the complexity of collaboration in distributed teams and the risks of decentralized data management, offering a realistic estimate.

        4.  **chartInterpretations**: Write an interpretation for each chart type, contextualized to the challenges of a company with ${formData.numSites} sites.
            - **bar**: Explain what the comparison of the bars reveals. Does the biggest cost come from structural complexity (collaboration), execution (reworks/delays), or risk (silos)?
            - **pie**: Analyze the percentage distribution. Does it show one concentrated problem or several contributing issues? How does this help prioritize a PLM investment?
            - **radar**: Describe the "inefficiency profile." A high value in 'No. of Sites' and 'No. of Countries' suggests scale and complexity issues. A high value in 'Reworks' or 'Delays' suggests process quality problems. What profile emerges?

        JSON Output Format (complete the 'explanation', 'summary', etc. fields):
        {
            "summary": "...",
            "explanations": [
                {"explanation": "..."},
                {"explanation": "..."},
                {"explanation": "..."},
                {"explanation": "..."}
            ],
            "methodologyNotes": "...",
            "chartInterpretations": {
                "bar": "...",
                "pie": "...",
                "radar": "..."
            }
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim();
        const qualitativeData = JSON.parse(jsonText);

        // Integrate the generated text back into the original data structure
        const finalResult: CalculationResult = {
            ...calculatedData,
            summary: qualitativeData.summary,
            methodologyNotes: qualitativeData.methodologyNotes,
            chartInterpretations: qualitativeData.chartInterpretations,
            costBreakdown: calculatedData.costBreakdown.map((item, index) => ({
                ...item,
                explanation: qualitativeData.explanations[index]?.explanation || "Analysis not available.",
            })),
        };

        return finalResult;

    } catch (error) {
        console.error("Error calling Gemini API for qualitative analysis:", error);
        throw new Error("Failed to get a valid analysis from the AI model.");
    }
}