const Scheme = require('../models/Scheme');

// Comprehensive Official Andhra Pradesh State & Central National Schemes
const defaultSchemes = [
  // 1. Direct Aid Schemes (3+ schemes)
  {
    schemeId: 'AP-YSR-RYTHU-BHAROSA',
    name: 'AP YSR Rythu Bharosa + PM-KISAN Scheme',
    description: 'Government of Andhra Pradesh financial assistance of ₹13,500/year for land-owning farmer families & tenant farmers (CCTA). Excludes Income Tax Payers.',
    subsidyAmount: 13500,
    state: 'Andhra Pradesh',
    category: 'Direct Aid',
    minLandArea: 0.1,
    maxLandArea: 5.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 250000,
    pattadarRequired: true,
    allowedCrops: ['Paddy', 'Groundnut', 'Cotton', 'Chilli'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-YSR-SUNNA-VADDI',
    name: 'AP YSR Sunna Vaddi Panta Runalu (Zero-Interest Crop Loan)',
    description: '100% interest subsidy on crop loans up to ₹1 Lakh for prompt repaying farmers cultivating up to 5 acres in AP.',
    subsidyAmount: 10000,
    state: 'Andhra Pradesh',
    category: 'Direct Aid',
    minLandArea: 0.1,
    maxLandArea: 5.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 250000,
    pattadarRequired: true,
    allowedCrops: ['Paddy', 'Maize', 'Bengal Gram', 'Cotton'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'PM-KISAN-NATIONAL',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN Central)',
    description: 'Central Government direct income support of ₹6,000 per year in three equal installments to landholding farmer families across India.',
    subsidyAmount: 6000,
    state: 'National / Central',
    category: 'Direct Aid',
    minLandArea: 0.1,
    maxLandArea: 5.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 250000,
    pattadarRequired: true,
    allowedCrops: ['All Crops', 'Paddy', 'Wheat'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },

  // 2. Crop Protection Schemes (3+ schemes)
  {
    schemeId: 'AP-YSR-CROP-INSURANCE',
    name: 'AP YSR Free Crop Insurance (YSR Bima Panta Bima)',
    description: '100% State-sponsored crop insurance cover protecting notified crops against drought, floods, and unseasonal rainfall in AP districts.',
    subsidyAmount: 15000,
    state: 'Andhra Pradesh',
    category: 'Crop Protection',
    minLandArea: 0.1,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 300000,
    pattadarRequired: true,
    allowedCrops: ['Paddy', 'Groundnut', 'Cotton', 'Sugarcane'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'PMFBY-NATIONAL',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY Central)',
    description: 'Comprehensive national crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages.',
    subsidyAmount: 15000,
    state: 'National / Central',
    category: 'Crop Protection',
    minLandArea: 0.1,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 300000,
    pattadarRequired: true,
    allowedCrops: ['Rice', 'Wheat', 'Pulses', 'Oilseeds'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-PEST-MANAGEMENT',
    name: 'AP Integrated Pest & Bio-Control Protection Scheme',
    description: 'Subsidized bio-pesticides, pheromone traps, and eco-friendly crop protection kits for AP horticulture & paddy farmers.',
    subsidyAmount: 7500,
    state: 'Andhra Pradesh',
    category: 'Crop Protection',
    minLandArea: 0.1,
    maxLandArea: 7.5,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 400000,
    pattadarRequired: false,
    allowedCrops: ['Cotton', 'Chilli', 'Paddy', 'Vegetables'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },

  // 3. Irrigation Support Schemes (3+ schemes)
  {
    schemeId: 'AP-PMKSY-MICRO-IRRIGATION',
    name: 'AP Micro Irrigation Scheme (APMIP Drip/Sprinkler)',
    description: '90% subsidy for SC/ST, Small & Marginal farmers for installing advanced drip & sprinkler micro-irrigation systems up to 12.5 acres.',
    subsidyAmount: 50000,
    state: 'Andhra Pradesh',
    category: 'Irrigation Support',
    minLandArea: 0.5,
    maxLandArea: 12.5,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 400000,
    pattadarRequired: true,
    allowedCrops: ['Horticulture', 'Chilli', 'Oil Palm', 'Mango'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'PMKSY-CENTRAL-IRRIGATION',
    name: 'PMKSY Per Drop More Crop Central Irrigation Subsidy',
    description: 'Central assistance for micro-irrigation systems, farm ponds, and water distribution networks to maximize water use efficiency.',
    subsidyAmount: 25000,
    state: 'National / Central',
    category: 'Irrigation Support',
    minLandArea: 0.5,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 350000,
    pattadarRequired: true,
    allowedCrops: ['Sugarcane', 'Cotton', 'Vegetables'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-JALAKALA-BOREWELL',
    name: 'AP YSR Jalakala Free Borewell & Energization Scheme',
    description: 'Free borewell drilling and pump energization assistance for small and marginal farmers in AP drought-prone districts.',
    subsidyAmount: 40000,
    state: 'Andhra Pradesh',
    category: 'Irrigation Support',
    minLandArea: 2.5,
    maxLandArea: 5.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 250000,
    pattadarRequired: true,
    allowedCrops: ['Groundnut', 'Millets', 'Pulses'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },

  // 4. Seeds & Fertilizer Schemes (3+ schemes)
  {
    schemeId: 'AP-SEED-BIO-FERTILIZER',
    name: 'AP Subsidized Certified Seed & Bio-Fertilizer Scheme',
    description: '50% state subsidy on high-yield certified seeds (Paddy, Groundnut, Pulses) and bio-fertilizer kits for registered AP farmers.',
    subsidyAmount: 8000,
    state: 'Andhra Pradesh',
    category: 'Seeds & Fertilizer',
    minLandArea: 0.1,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 500000,
    pattadarRequired: false,
    allowedCrops: ['Paddy', 'Groundnut', 'Sesamum', 'Millets'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'SCHEME-FERT-2026',
    name: 'Fertilizer Subsidy Scheme 2026',
    description: 'Financial assistance for purchasing high-quality organic fertilizers, neem-coated urea, and soil health nutrients.',
    subsidyAmount: 5000,
    state: 'National / Central',
    category: 'Seeds & Fertilizer',
    minLandArea: 0.5,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 500000,
    pattadarRequired: false,
    allowedCrops: ['Wheat', 'Rice', 'Paddy', 'Maize'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'SCHEME-SEED-2026',
    name: 'Certified Hybrid Seed Distribution Scheme 2026',
    description: 'Subsidy support for purchasing certified high-yield hybrid seed varieties across state agricultural regions.',
    subsidyAmount: 3500,
    state: 'National / Central',
    category: 'Seeds & Fertilizer',
    minLandArea: 0.1,
    maxLandArea: 5.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 500000,
    pattadarRequired: false,
    allowedCrops: ['Cotton', 'Sugarcane', 'Pulses'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },

  // 5. Solar Infrastructure Schemes (3+ schemes)
  {
    schemeId: 'PM-KUSUM-NATIONAL',
    name: 'PM Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM Solar)',
    description: '60% subsidy for setting up standalone solar agriculture pumps and solarizing existing grid-connected agriculture pumps.',
    subsidyAmount: 45000,
    state: 'National / Central',
    category: 'Solar Infrastructure',
    minLandArea: 0.5,
    maxLandArea: 15.0,
    isIncomeTaxPayeeAllowed: false,
    maxAnnualIncome: 400000,
    pattadarRequired: true,
    allowedCrops: ['All Crops'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-SOLAR-FENCING',
    name: 'AP Solar Agricultural Fencing & Crop Safety Subsidy',
    description: '50% subsidy for installing energized solar power fences to protect standing crops from wild animals in forest border districts of AP.',
    subsidyAmount: 30000,
    state: 'Andhra Pradesh',
    category: 'Solar Infrastructure',
    minLandArea: 1.0,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 400000,
    pattadarRequired: true,
    allowedCrops: ['Maize', 'Groundnut', 'Sugarcane'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-SOLAR-DRYER',
    name: 'AP Agricultural Solar Poly-House Dryer Subsidy Scheme',
    description: '60% capital subsidy for installing hygienic solar dryers for chilli, turmeric, and spice processing in AP.',
    subsidyAmount: 35000,
    state: 'Andhra Pradesh',
    category: 'Solar Infrastructure',
    minLandArea: 0.5,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 500000,
    pattadarRequired: false,
    allowedCrops: ['Chilli', 'Turmeric', 'Spices'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },

  // 6. Storage Facilities Schemes (3+ schemes)
  {
    schemeId: 'AIF-2026-STORAGE',
    name: 'Agriculture Infrastructure Fund (AIF Cold Storage Scheme)',
    description: 'Debt financing facility with 3% interest subvention for establishing on-farm cold storage and post-harvest warehouses.',
    subsidyAmount: 50000,
    state: 'National / Central',
    category: 'Storage Facilities',
    minLandArea: 0.5,
    maxLandArea: 20.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 600000,
    pattadarRequired: true,
    allowedCrops: ['All Crops', 'Horticulture'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-RURAL-GODOWN',
    name: 'AP Grama Rythu Bharosa Kendra (RBK) Mini-Godown Scheme',
    description: 'Financial assistance for setting up village-level mini godowns & seed storage units at Rythu Bharosa Kendras in AP.',
    subsidyAmount: 42000,
    state: 'Andhra Pradesh',
    category: 'Storage Facilities',
    minLandArea: 0.5,
    maxLandArea: 10.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 500000,
    pattadarRequired: true,
    allowedCrops: ['Paddy', 'Pulses', 'Oilseeds'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  },
  {
    schemeId: 'AP-COLD-STORAGE-CHAMBER',
    name: 'AP On-Farm Solar Cold Chamber Storage Subsidy',
    description: '70% state subsidy for small farmers installing 5-ton portable solar cold rooms for perishable fruits and vegetables.',
    subsidyAmount: 38000,
    state: 'Andhra Pradesh',
    category: 'Storage Facilities',
    minLandArea: 0.5,
    maxLandArea: 8.0,
    isIncomeTaxPayeeAllowed: true,
    maxAnnualIncome: 450000,
    pattadarRequired: false,
    allowedCrops: ['Tomato', 'Banana', 'Mango', 'Vegetables'],
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  }
];

const seedSchemesIntoDb = async () => {
  try {
    for (const def of defaultSchemes) {
      await Scheme.updateOne(
        { schemeId: def.schemeId },
        { $set: def },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Error upserting default schemes:', err.message);
  }
};

const getSchemes = async (req, res, next) => {
  try {
    await seedSchemesIntoDb();

    let dbSchemes = [];
    try {
      dbSchemes = await Scheme.find({ isActive: true }).sort({ createdAt: -1 });
    } catch (err) {}

    // Guarantee all 18 schemes are returned by merging defaultSchemes with DB records
    const schemeMap = new Map();
    defaultSchemes.forEach(s => schemeMap.set(s.schemeId, s));
    if (Array.isArray(dbSchemes)) {
      dbSchemes.forEach(s => {
        const obj = s.toObject ? s.toObject() : s;
        schemeMap.set(obj.schemeId, { ...schemeMap.get(obj.schemeId), ...obj });
      });
    }

    const allSchemes = Array.from(schemeMap.values());

    res.status(200).json({
      count: allSchemes.length,
      schemes: allSchemes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  defaultSchemes
};
