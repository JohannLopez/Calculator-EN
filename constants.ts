
import type { Country, IndustryData, LocalizedMetrics } from './types';

export const COUNTRIES: Country[] = [
    { name: 'United States (USD)', code: 'USD', currencySymbol: '$', usdRate: 1, locale: 'en-US' },
    { name: 'Europe (EUR)', code: 'EUR', currencySymbol: '€', usdRate: 0.92, locale: 'de-DE' },
    { name: 'Colombia (COP)', code: 'COP', currencySymbol: '$', usdRate: 4000, locale: 'es-CO' },
    { name: 'Mexico (MXN)', code: 'MXN', currencySymbol: '$', usdRate: 18, locale: 'es-MX' },
    { name: 'Spain (EUR)', code: 'EUR', currencySymbol: '€', usdRate: 0.92, locale: 'es-ES' },
    { name: 'Argentina (ARS)', code: 'ARS', currencySymbol: '$', usdRate: 900, locale: 'es-AR' },
    { name: 'Chile (CLP)', code: 'CLP', currencySymbol: '$', usdRate: 950, locale: 'es-CL' },
    { name: 'Peru (PEN)', code: 'PEN', currencySymbol: 'S/', usdRate: 3.75, locale: 'es-PE' },
    { name: 'Guatemala (GTQ)', code: 'GTQ', currencySymbol: 'Q', usdRate: 7.8, locale: 'es-GT' },
    { name: 'Dominican Republic (DOP)', code: 'DOP', currencySymbol: 'RD$', usdRate: 59, locale: 'es-DO' },
    { name: 'Brazil (BRL)', code: 'BRL', currencySymbol: 'R$', usdRate: 5.1, locale: 'pt-BR' },
];

export const INDUSTRY_OPTIONS = [
    { value: 'automotive', label: 'Automotive' },
    { value: 'electronics-and-high-tech', label: 'Electronics and High-Tech' },
    { value: 'home-appliances-and-consumer-electronics', label: 'Home Appliances and Consumer Electronics' },
    { value: 'industrial-machinery', label: 'Industrial Machinery' },
    { value: 'semiconductors', label: 'Semiconductors' },
    { value: 'construction-equipment', label: 'Construction Equipment' },
    { value: 'plastics-manufacturing-molding', label: 'Plastics Manufacturing (Molding)' },
    { value: 'aerospace-and-defense', label: 'Aerospace and Defense' },
    { value: 'medical-devices', label: 'Medical Devices' },
    { value: 'electrical-engineering', label: 'Electrical Engineering' },
    { value: 'mechanical-engineering', label: 'Mechanical Engineering' },
    { value: 'robotics-and-automation', label: 'Robotics and Automation' },
    { value: 'telecommunications-equipment', label: 'Telecommunications Equipment' },
    { value: 'consumer-goods-and-toys', label: 'Consumer Goods and Toys' },
    { value: 'hvac', label: 'HVAC (Heating, Ventilation & A/C)' },
    { value: 'commercial-and-residential-lighting', label: 'Commercial and Residential Lighting' },
    { value: 'scientific-and-measurement-instrumentation', label: 'Scientific and Measurement Instrumentation' },
    { value: 'furniture-and-fixtures', label: 'Furniture and Fixtures' },
    { value: 'sports-equipment', label: 'Sports Equipment' },
    { value: 'tool-and-die', label: 'Tool and Die' },
];

const createLocalizedMetrics = (usd: number, cop: number, mxn: number, eur: number, ars: number, clp: number, pen: number, gtq: number, dop: number, brl: number): LocalizedMetrics => ({
    USD: usd, COP: cop, MXN: mxn, EUR: eur, ARS: ars, CLP: clp, PEN: pen, GTQ: gtq, DOP: dop, BRL: brl,
});


export const SECTORS: Record<string, string[]> = {
    'industrial-machinery': [
        'CNC Equipment', 'Industrial Robots', 'Conveyor and Handling Systems', 'Packaging Machinery', 'Packing Machinery', 'Pumps and Compressors', 'Hydraulic Systems', 'Pneumatic Systems', 'Mechanical Presses', 'Welding Equipment', 'Agricultural Machinery', 'Food Processing Machinery', 'Mining Machinery', 'Lifting Systems', 'Light Construction Machinery', 'Industrial Control Systems', 'Printing Machinery', 'Recycling Machinery', 'Measurement Machinery', 'Industrial Maintenance Equipment'
    ],
    'mechanical-engineering': [
        'Transmissions', 'Actuators', 'Gears', 'Centrifugal Pumps', 'Compressors', 'Control Valves', 'Shafts and Couplings', 'Bearings and Supports', 'Industrial Cooling Systems', 'Precision Mechanisms', 'Power Units', 'Lubrication Systems', 'Metal Structures', 'Thermal Converters', 'Vibration Systems', 'Mechanical Converters', 'Cam Mechanisms', 'Motion Control Systems', 'Torque Converters', 'Modular Mechanical Assemblies'
    ],
    'electrical-engineering': [
        'Electric Motors', 'Electrical Panels', 'Power Supplies', 'Transformers', 'Generators', 'Inverters', 'Frequency Converters', 'Control Panels', 'Circuit Breakers', 'Contactors', 'Relays', 'UPS Backup Units', 'Distribution Systems', 'Electrical Protection Modules', 'Voltage Regulators', 'Soft Starters', 'Electrical Sensors', 'Industrial Connectors', 'Power Control Systems', 'High Voltage Cables'
    ],
    'automotive': [
        'Bodyworks', 'Chassis', 'Engines', 'Transmissions', 'Electrical Systems', 'Electronic Modules', 'Interiors', 'Brake Systems', 'Suspensions', 'Drive Axles', 'Exhaust Systems', 'Climate Control Systems', 'Safety Systems', 'Lighting Systems', 'Battery Modules', 'Undercarriages', 'Instrument Panels', 'Infotainment Systems', 'Power Steering', 'Modular Doors and Roofs'
    ],
    'electronics-and-high-tech': [
        'Microprocessors', 'Motherboards', 'Electronic Boards', 'Power Modules', 'Power Supplies', 'Sensors', 'IoT Modules', 'Processing Units', 'Batteries', 'Displays', 'Cameras', 'Communication Devices', 'Routers', 'Connectivity Modules', 'Wearable Devices', 'Converters', 'Cooling Systems', 'Optical Modules', 'Display Panels', 'SMT Assemblies'
    ],
    'aerospace-and-defense': [
        'Fuselages', 'Wings', 'Turbofan Engines', 'Avionics', 'Flight Control Systems', 'Cockpits', 'Composite Structures', 'Electrical Systems', 'Landing Gear', 'Nacelles', 'Hydraulic Systems', 'Fuel Systems', 'Communication Systems', 'Radar Systems', 'Navigation Modules', 'Stabilizers', 'Doors', 'Seats', 'Oxygen Systems', 'Pressurized Tanks'
    ],
    'medical-devices': [
        'Diagnostic Equipment', 'Multi-parameter Monitors', 'Clinical Analyzers', 'Ventilators', 'Infusion Pumps', 'Defibrillators', 'Assisted Surgery Modules', 'Laparoscopic Equipment', 'Sterilization Systems', 'Pacemakers', 'Prosthetics', 'Hospital Beds', 'Incubators', 'Dental Systems', 'Portable Respirators', 'Rehabilitation Equipment', 'Electric Wheelchairs', 'Suction Units', 'Laboratory Equipment', 'Medical Telemetry Modules'
    ],
    'robotics-and-automation': [
        'Robotic Arms', 'Controllers', 'Servomotors', 'Vision Systems', 'Linear Actuators', 'Force Sensors', 'Grippers', 'Reducers', 'AI Modules', 'Robotic Workstations', 'Conveyors', 'Electronic Modules', 'Control Boards', 'Mechanical Structures', 'Control Panels', 'Frequency Converters', 'Calibration Modules', 'Safety Systems', 'Industrial Connectors', 'Communication Units'
    ],
    'construction-equipment': [
        'Excavators', 'Loaders', 'Cranes', 'Backhoes', 'Motor Graders', 'Compactors', 'Diesel Engines', 'Hydraulic Systems', 'Heavy-duty Transmissions', 'Chassis', 'Operator Cabs', 'Articulated Arms', 'Undercarriages', 'Pavers', 'Drills', 'Rotating Turrets', 'Cooling Modules', 'Control Systems', 'Drive Axles'
    ],
    'tool-and-die': [
        'Precision Molds', 'Cutting Dies', 'Stamping Presses', 'Punching Systems', 'Machining Tools', 'Clamping Devices', 'Progressive Dies', 'Hydraulic Presses', 'Milling Heads', 'Mold Bases', 'Calipers', 'Torque Tools', 'Tool Holders', 'Alignment Devices', 'Adjustment Systems', 'Pneumatic Tools', 'Dimensional Control Devices', 'Guiding Systems', 'Assembly Devices', 'Testing Stations'
    ],
    'hvac': [
        'Air Conditioners', 'Chillers', 'Heat Pumps', 'Condensing Units', 'Evaporators', 'Compressors', 'Fans', 'Heat Exchangers', 'Control Systems', 'Cooling Towers', 'Modular Ducts', 'Expansion Valves', 'Thermostats', 'Thermal Sensors', 'Filters', 'Electrical Panels', 'Metal Structures', 'Refrigeration Units', 'Climate Control Modules', 'Pumping Systems', 'Electronic Controllers'
    ],
    'furniture-and-fixtures': [
        'Metal Structures', 'Hardware', 'Reclining Mechanisms', 'Sliding Systems', 'Hinges', 'Chair Frames', 'Storage Units', 'Assembly Modules', 'Swivel Bases', 'Rails', 'Adjustable Legs', 'Brackets', 'Anchors', 'Integrated Lighting Systems', 'Hydraulic Mechanisms', 'Aluminum Profiles', 'Modular Joints', 'Magnetic Latches', 'Damping Systems', 'Ergonomic Accessories'
    ],
    'consumer-goods-and-toys': [
        'Portable Appliances', 'Vacuum Cleaners', 'Electronic Toys', 'Game Consoles', 'Smartwatches', 'Electric Scooters', 'Bicycles', 'Recreational Drones', 'Portable Audio Systems', 'Interactive Robots', 'Coffee Machines', 'Electric Skateboards', 'Purifiers', 'Smart Lamps', 'Fans', 'Household Tools', 'Electric Toothbrushes', 'Automatic Dispensers', 'Kitchen Devices', 'Portable Chargers'
    ],
    'home-appliances-and-consumer-electronics': [
        'Refrigerators', 'Washing Machines', 'LED TVs', 'OLED TVs', 'Microwave Ovens', 'Vacuum Cleaners', 'Air Conditioners', 'Dishwashers', 'Dryers', 'Electric Ovens', 'Induction Cooktops', 'Surround Sound Systems', 'Soundbars', 'Video Game Consoles', 'Robot Vacuums', 'Blenders', 'Mixers', 'Food Processors', 'Coffee Makers', 'Air Fryers', 'Freezers', 'Gas Stoves', 'Extractor Hoods', 'Air Purifiers', 'Electric Heaters', 'Dehumidifiers', 'Fans', 'Electric Irons', 'Toasters', 'Electric Kettles', 'Water Dispensers', 'Home Projectors', 'Bluetooth Speakers', 'Hi-Fi Audio Equipment', 'Media Players', 'Home Monitors', 'Wi-Fi Routers', 'Home Security Cameras', 'Smart Doorbells'
    ],
    'sports-equipment': [
        'Bicycles', 'Gym Equipment', 'Treadmills', 'Elliptical Machines', 'Adjustable Weights', 'Training Benches', 'Multi-functional Machines', 'Stationary Bikes', 'Sports Scooters', 'Electric Skateboards', 'Rollers', 'Rowing Machines', 'Metal Structures', 'Resistance Systems', 'Electronic Control Devices', 'Performance Sensors', 'Damping Modules', 'Brackets', 'Training Structures', 'Sports Simulators'
    ],
    'plastics-manufacturing-molding': [
        'Automotive Components', 'Housings', 'Industrial Containers', 'Appliance Parts', 'Medical Components', 'Electronic Enclosures', 'Plastic Assembly Modules', 'Structural Parts', 'Protective Covers', 'Connectors', 'Trays', 'Lighting Parts', 'Plastic Tools', 'Consumer Accessories', 'Front Panels', 'Switches', 'Sensor Housings', 'Modular Boxes', 'Frames', 'Furniture Components'
    ],
    'commercial-and-residential-lighting': [
        'LED Luminaires', 'Light Panels', 'LED Strips', 'Projectors', 'Pendant Lamps', 'Recessed Lighting Systems', 'Industrial Luminaires', 'Power Supplies', 'Controllers', 'Heat Sinks', 'Optical Modules', 'Ballasts', 'Motion Sensors', 'Reflectors', 'Metal Structures', 'Diffusers', 'Connectors', 'Housings', 'Mounting Systems', 'Emergency Modules'
    ],
    'telecommunications-equipment': [
        'Base Stations', 'Antennas', 'Routers', 'Transmission Modules', 'Electronic Boards', 'Cabinets', 'Fiber Optic Cables', 'Signal Amplifiers', 'Power Modules', 'Converters', 'Cooling Systems', 'Racks', 'Patch Panels', 'Optical Modules', 'Redundant Power Supplies', 'Control Units', 'Communication Devices', 'Connectors', 'Repeaters', 'Interface Modules'
    ],
    'semiconductors': [
        'Processors', 'Integrated Chips', 'Memory Modules', 'Silicon Wafers', 'Packages', 'CMOS Sensors', 'Integrated Circuits', 'Power Modules', 'Converters', 'Transistors', 'Diodes', 'Resistors', 'Capacitors', 'Communication Modules', 'Storage Units', 'Controllers', 'Electronic Boards', 'Heat Sinks', 'Test Modules', 'Multi-chip Packages'
    ],
    'scientific-and-measurement-instrumentation': [
        'Pressure Sensors', 'Flow Transmitters', 'Gas Analyzers', 'Spectrometers', 'Data Acquisition Modules', 'PID Controllers', 'Transducers', 'Digital Indicators', 'Motorized Valves', 'Actuators', 'RTDs', 'Calibration Modules', 'Signal Converters', 'Power Supplies', 'Recording Systems', 'Distributed Controllers', 'Optical Modules', 'Monitoring Units', 'Instrumentation Cabinets', 'Operator Terminals'
    ]
};

export const INDUSTRY_METRICS: Record<string, IndustryData> = {
    'automotive': {
        baseMetrics: { 
            averageEngineerSalary: createLocalizedMetrics(85000, 95000000, 750000, 60000, 45000000, 50000000, 100000, 180000, 900000, 200000),
            reworkCost: createLocalizedMetrics(7500, 30000000, 135000, 6900, 6750000, 7125000, 28125, 58500, 442500, 38250),
            newProductRevenue: createLocalizedMetrics(5000000, 20000000000, 90000000, 4600000, 4500000000, 4750000000, 18750000, 39000000, 295000000, 25500000),
            baseWastedHours: 2.5,
            hoursPerSite: 0.75,
            hoursPerCountry: 1.25,
            siloCostMultiplier: 0.30,
        },
        sectors: {
            'Engines': { 
                averageEngineerSalary: createLocalizedMetrics(95000, 110000000, 850000, 68000, 51000000, 57000000, 115000, 200000, 1000000, 230000),
                reworkCost: createLocalizedMetrics(9000, 36000000, 162000, 8200, 8100000, 8550000, 33750, 69000, 530000, 45000),
                newProductRevenue: createLocalizedMetrics(6000000, 24000000000, 108000000, 5500000, 5400000000, 5700000000, 22500000, 46800000, 354000000, 30600000),
                baseWastedHours: 3.0,
                hoursPerSite: 1.0,
                hoursPerCountry: 1.5,
                siloCostMultiplier: 0.35,
            },
        }
    },
    'electronics-and-high-tech': {
        baseMetrics: { 
            averageEngineerSalary: createLocalizedMetrics(90000, 100000000, 800000, 65000, 48000000, 54000000, 110000, 190000, 950000, 220000),
            reworkCost: createLocalizedMetrics(4500, 18000000, 81000, 4100, 4050000, 4275000, 16875, 35100, 265500, 22950),
            newProductRevenue: createLocalizedMetrics(3000000, 12000000000, 54000000, 2750000, 2700000000, 2850000000, 11250000, 23400000, 177000000, 15300000),
            baseWastedHours: 3.0,
            hoursPerSite: 1.0,
            hoursPerCountry: 1.5,
            siloCostMultiplier: 0.25,
        }
    },
    'general-discrete-manufacturing': {
        baseMetrics: {
            averageEngineerSalary: createLocalizedMetrics(70000, 80000000, 600000, 50000, 35000000, 40000000, 80000, 150000, 750000, 160000),
            reworkCost: createLocalizedMetrics(5000, 20000000, 90000, 4600, 4500000, 4750000, 18750, 39000, 295000, 25500),
            newProductRevenue: createLocalizedMetrics(2000000, 8000000000, 36000000, 1840000, 1800000000, 1900000000, 7500000, 15600000, 118000000, 10200000),
            baseWastedHours: 2.0,
            hoursPerSite: 0.5,
            hoursPerCountry: 1.0,
            siloCostMultiplier: 0.20,
        }
    },
};

// Populate the rest of the industries by copying the general manufacturing data
const generalMetrics = INDUSTRY_METRICS['general-discrete-manufacturing'];
INDUSTRY_OPTIONS.forEach(opt => {
    if (!INDUSTRY_METRICS[opt.value]) {
        INDUSTRY_METRICS[opt.value] = generalMetrics;
    }
});