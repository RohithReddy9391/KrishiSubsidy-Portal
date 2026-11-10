import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';
import { Search, CheckCircle, FileText, Award, HelpCircle, ArrowRight, ShieldCheck, Info, Filter, ArrowUpRight, ShieldAlert, Upload, HardDrive, CheckCircle2, XCircle } from 'lucide-react';

export const SchemesPage = () => {
  const { walletAddress, setActiveTab } = useWallet();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSchemeDetails, setSelectedSchemeDetails] = useState(null);
  const [eligibilityCheckScheme, setEligibilityCheckScheme] = useState(null);

  // Application Modal State from Schemes Page
  const [applySchemeModal, setApplySchemeModal] = useState(null);
  const [file, setFile] = useState(null);
  const [computedFileHash, setComputedFileHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Farmer Eligibility Profile Inputs
  const [landSizeInput, setLandSizeInput] = useState('2.5');
  const [isITPayeeInput, setIsITPayeeInput] = useState(false);
  const [annualIncomeInput, setAnnualIncomeInput] = useState('120000');
  const [pattadarPassbookInput, setPattadarPassbookInput] = useState('AP-GUNTUR-PASSBOOK-99');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const categories = [
    'All',
    'Andhra Pradesh State',
    'Central National',
    'Direct Aid',
    'Crop Protection',
    'Irrigation Support',
    'Seeds & Fertilizer',
    'Solar Infrastructure',
    'Storage Facilities'
  ];

  // Default Rich Schemes guaranteeing 3+ schemes in every category
  const defaultGovSchemes = [
    // 1. Direct Aid Schemes
    {
      schemeId: 'AP-YSR-RYTHU-BHAROSA',
      name: 'AP YSR Rythu Bharosa + PM-KISAN Scheme',
      description: 'Government of Andhra Pradesh financial assistance of ₹13,500/year for land-owning farmer families & tenant farmers (CCTA). Excludes Income Tax Payers.',
      category: 'Direct Aid',
      subsidyAmount: 13500,
      state: 'Andhra Pradesh',
      minLandArea: 0.1,
      maxLandArea: 5.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 250000,
      pattadarRequired: true,
      eligibility: 'AP landowning farmers & registered CCTA tenant farmers cultivating up to 5.0 acres. Income Tax Payees are strictly excluded.',
      requiredDocs: ['AP Webland Pattadar Passbook Copy', 'Aadhaar Card', 'Bank Passbook'],
      status: 'Active',
      allowedCrops: ['Paddy', 'Groundnut', 'Cotton', 'Chilli']
    },
    {
      schemeId: 'AP-YSR-SUNNA-VADDI',
      name: 'AP YSR Sunna Vaddi Panta Runalu (Zero-Interest Crop Loan)',
      description: '100% interest subsidy on crop loans up to ₹1 Lakh for prompt repaying farmers cultivating up to 5 acres in AP.',
      category: 'Direct Aid',
      subsidyAmount: 10000,
      state: 'Andhra Pradesh',
      minLandArea: 0.1,
      maxLandArea: 5.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 250000,
      pattadarRequired: true,
      eligibility: 'AP farmers cultivating up to 5.0 acres with prompt bank crop loan repayment record. Income Tax Payees excluded.',
      requiredDocs: ['Bank Crop Loan Sanction Copy', 'Pattadar Passbook / Webland Record', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Paddy', 'Maize', 'Bengal Gram', 'Cotton']
    },
    {
      schemeId: 'PM-KISAN-NATIONAL',
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN National)',
      description: 'Central Government direct income support of ₹6,000 per year in three equal installments to landholding farmer families across India.',
      category: 'Direct Aid',
      subsidyAmount: 6000,
      state: 'National / Central',
      minLandArea: 0.1,
      maxLandArea: 5.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 250000,
      pattadarRequired: true,
      eligibility: 'All landholding farmers across India with cultivable land up to 5.0 acres. IT Payees excluded.',
      requiredDocs: ['Land Ownership Certificate', 'Aadhaar Card', 'Bank Passbook'],
      status: 'Active',
      allowedCrops: ['All Crops', 'Paddy', 'Wheat']
    },

    // 2. Crop Protection Schemes
    {
      schemeId: 'AP-YSR-CROP-INSURANCE',
      name: 'AP YSR Free Crop Insurance (YSR Bima Panta Bima)',
      description: '100% State-sponsored crop insurance cover protecting notified crops against drought, floods, and unseasonal rainfall in AP districts.',
      category: 'Crop Protection',
      subsidyAmount: 15000,
      state: 'Andhra Pradesh',
      minLandArea: 0.1,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 300000,
      pattadarRequired: true,
      eligibility: 'Farmers growing notified crops in AP notified districts. 100% premium paid by Government of Andhra Pradesh.',
      requiredDocs: ['Crop Sowing Certificate from VAA', 'Pattadar Passbook', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Paddy', 'Groundnut', 'Cotton', 'Sugarcane']
    },
    {
      schemeId: 'PMFBY-NATIONAL',
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY Central)',
      description: 'Comprehensive national crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages.',
      category: 'Crop Protection',
      subsidyAmount: 15000,
      state: 'National / Central',
      minLandArea: 0.1,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 300000,
      pattadarRequired: true,
      eligibility: 'Farmers growing notified crops across India including sharecroppers and tenant farmers.',
      requiredDocs: ['Land Sowing Certificate', 'Land Possession Document', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Rice', 'Wheat', 'Pulses', 'Oilseeds']
    },
    {
      schemeId: 'AP-PEST-MANAGEMENT',
      name: 'AP Integrated Pest & Bio-Control Protection Scheme',
      description: 'Subsidized bio-pesticides, pheromone traps, and eco-friendly crop protection kits for AP horticulture & paddy farmers.',
      category: 'Crop Protection',
      subsidyAmount: 7500,
      state: 'Andhra Pradesh',
      minLandArea: 0.1,
      maxLandArea: 7.5,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 400000,
      pattadarRequired: false,
      eligibility: 'All registered AP farmers cultivating paddy, cotton, or chilli crops up to 7.5 acres.',
      requiredDocs: ['Land Record Copy', 'Aadhaar Card', 'RBK Registration'],
      status: 'Active',
      allowedCrops: ['Cotton', 'Chilli', 'Paddy', 'Vegetables']
    },

    // 3. Irrigation Support Schemes
    {
      schemeId: 'AP-PMKSY-MICRO-IRRIGATION',
      name: 'AP Micro Irrigation Scheme (APMIP - Drip/Sprinkler)',
      description: '90% subsidy for SC/ST, Small & Marginal farmers for installing advanced drip & sprinkler micro-irrigation systems up to 12.5 acres.',
      category: 'Irrigation Support',
      subsidyAmount: 50000,
      state: 'Andhra Pradesh',
      minLandArea: 0.5,
      maxLandArea: 12.5,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 400000,
      pattadarRequired: true,
      eligibility: 'AP farmers owning agricultural land with borewell/canal water source up to 12.5 acres.',
      requiredDocs: ['Land Title Deed', 'Borewell / Water Source Proof', 'Caste Certificate (for SC/ST)'],
      status: 'Active',
      allowedCrops: ['Horticulture', 'Chilli', 'Oil Palm', 'Mango']
    },
    {
      schemeId: 'PMKSY-CENTRAL-IRRIGATION',
      name: 'PMKSY Per Drop More Crop Central Irrigation Subsidy',
      description: 'Central assistance for micro-irrigation systems, farm ponds, and water distribution networks to maximize water use efficiency.',
      category: 'Irrigation Support',
      subsidyAmount: 25000,
      state: 'National / Central',
      minLandArea: 0.5,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 350000,
      pattadarRequired: true,
      eligibility: 'Farmers of all categories owning agricultural land with access to water sources up to 10.0 acres.',
      requiredDocs: ['Land Survey Document', 'Water Availability Certificate', 'Bank Passbook'],
      status: 'Active',
      allowedCrops: ['Sugarcane', 'Cotton', 'Vegetables']
    },
    {
      schemeId: 'AP-JALAKALA-BOREWELL',
      name: 'AP YSR Jalakala Free Borewell & Energization Scheme',
      description: 'Free borewell drilling and pump energization assistance for small and marginal farmers in AP drought-prone districts.',
      category: 'Irrigation Support',
      subsidyAmount: 40000,
      state: 'Andhra Pradesh',
      minLandArea: 2.5,
      maxLandArea: 5.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 250000,
      pattadarRequired: true,
      eligibility: 'Small & marginal farmers in AP possessing contiguous land of 2.5 to 5.0 acres without prior borewell.',
      requiredDocs: ['Webland Adangal Record', 'Small/Marginal Farmer Certificate', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Groundnut', 'Millets', 'Pulses']
    },

    // 4. Seeds & Fertilizer Schemes
    {
      schemeId: 'AP-SEED-BIO-FERTILIZER',
      name: 'AP Subsidized Certified Seed & Bio-Fertilizer Scheme',
      description: '50% state subsidy on high-yield certified seeds (Paddy, Groundnut, Pulses) and bio-fertilizer kits for registered AP farmers.',
      category: 'Seeds & Fertilizer',
      subsidyAmount: 8000,
      state: 'Andhra Pradesh',
      minLandArea: 0.1,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 500000,
      pattadarRequired: false,
      eligibility: 'All registered AP farmers cultivating up to 10.0 acres. Subsidized seeds distributed via RBKs.',
      requiredDocs: ['RBK Farmer Registration ID', 'Aadhaar Card', 'Land Survey Record'],
      status: 'Active',
      allowedCrops: ['Paddy', 'Groundnut', 'Sesamum', 'Millets']
    },
    {
      schemeId: 'SCHEME-FERT-2026',
      name: 'Fertilizer Subsidy Scheme 2026',
      description: 'Financial assistance for purchasing high-quality organic fertilizers, neem-coated urea, and soil health nutrients.',
      category: 'Seeds & Fertilizer',
      subsidyAmount: 5000,
      state: 'National / Central',
      minLandArea: 0.5,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 500000,
      pattadarRequired: false,
      eligibility: 'Landholding farmers cultivating up to 10.0 acres purchasing certified bio-fertilizers.',
      requiredDocs: ['Purchase Invoice', 'Land Record Proof', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Wheat', 'Rice', 'Paddy', 'Maize']
    },
    {
      schemeId: 'SCHEME-SEED-2026',
      name: 'Certified Hybrid Seed Distribution Scheme 2026',
      description: 'Subsidy support for purchasing certified high-yield hybrid seed varieties across state agricultural regions.',
      category: 'Seeds & Fertilizer',
      subsidyAmount: 3500,
      state: 'National / Central',
      minLandArea: 0.1,
      maxLandArea: 5.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 500000,
      pattadarRequired: false,
      eligibility: 'Farmers purchasing certified hybrid seeds for notified pulse and cash crops up to 5.0 acres.',
      requiredDocs: ['Seed Receipt', 'Land Title Document', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Cotton', 'Sugarcane', 'Pulses']
    },

    // 5. Solar Infrastructure Schemes
    {
      schemeId: 'PM-KUSUM-NATIONAL',
      name: 'PM Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM Solar)',
      description: '60% subsidy for setting up standalone solar agriculture pumps and solarizing existing grid-connected agriculture pumps.',
      category: 'Solar Infrastructure',
      subsidyAmount: 45000,
      state: 'National / Central',
      minLandArea: 0.5,
      maxLandArea: 15.0,
      isIncomeTaxPayeeAllowed: false,
      maxAnnualIncome: 400000,
      pattadarRequired: true,
      eligibility: 'Individual farmers, farmer groups, cooperatives, and panchayats with agricultural land up to 15.0 acres.',
      requiredDocs: ['Land Title Deed', 'Electricity Connection Copy', 'Identity Proof'],
      status: 'Active',
      allowedCrops: ['All Crops']
    },
    {
      schemeId: 'AP-SOLAR-FENCING',
      name: 'AP Solar Agricultural Fencing & Crop Safety Subsidy',
      description: '50% subsidy for installing energized solar power fences to protect standing crops from wild animals in forest border districts of AP.',
      category: 'Solar Infrastructure',
      subsidyAmount: 30000,
      state: 'Andhra Pradesh',
      minLandArea: 1.0,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 400000,
      pattadarRequired: true,
      eligibility: 'Farmers in forest-adjacent AP mandals cultivating commercial crops up to 10.0 acres.',
      requiredDocs: ['Mandal Revenue Officer Land Certificate', 'Pattadar Passbook', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Maize', 'Groundnut', 'Sugarcane']
    },
    {
      schemeId: 'AP-SOLAR-DRYER',
      name: 'AP Agricultural Solar Poly-House Dryer Subsidy Scheme',
      description: '60% capital subsidy for installing hygienic solar dryers for chilli, turmeric, and spice processing in AP.',
      category: 'Solar Infrastructure',
      subsidyAmount: 35000,
      state: 'Andhra Pradesh',
      minLandArea: 0.5,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 500000,
      pattadarRequired: false,
      eligibility: 'AP chilli, turmeric, and horticulture farmers setting up clean solar drying units up to 10.0 acres.',
      requiredDocs: ['Spices Board / RBK ID', 'Land Record Proof', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Chilli', 'Turmeric', 'Spices']
    },

    // 6. Storage Facilities Schemes
    {
      schemeId: 'AIF-2026-STORAGE',
      name: 'Agriculture Infrastructure Fund (AIF Cold Storage Scheme)',
      description: 'Debt financing facility with 3% interest subvention for establishing on-farm cold storage and post-harvest warehouses.',
      category: 'Storage Facilities',
      subsidyAmount: 50000,
      state: 'National / Central',
      minLandArea: 0.5,
      maxLandArea: 20.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 600000,
      pattadarRequired: true,
      eligibility: 'PACS, FPOs, Agri-entrepreneurs, and farmers setting up post-harvest cold storage up to 20.0 acres.',
      requiredDocs: ['Project DPR / Proposal', 'Land Title Document', 'PAN / GST Registration'],
      status: 'Active',
      allowedCrops: ['All Crops', 'Horticulture']
    },
    {
      schemeId: 'AP-RURAL-GODOWN',
      name: 'AP Grama Rythu Bharosa Kendra (RBK) Mini-Godown Scheme',
      description: 'Financial assistance for setting up village-level mini godowns & seed storage units at Rythu Bharosa Kendras in AP.',
      category: 'Storage Facilities',
      subsidyAmount: 42000,
      state: 'Andhra Pradesh',
      minLandArea: 0.5,
      maxLandArea: 10.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 500000,
      pattadarRequired: true,
      eligibility: 'AP farmers & FPOs establishing 50-ton grain storage structures near RBKs.',
      requiredDocs: ['Land Title Deed', 'RBK Partnership Approval', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Paddy', 'Pulses', 'Oilseeds']
    },
    {
      schemeId: 'AP-COLD-STORAGE-CHAMBER',
      name: 'AP On-Farm Solar Cold Chamber Storage Subsidy',
      description: '70% state subsidy for small farmers installing 5-ton portable solar cold rooms for perishable fruits and vegetables.',
      category: 'Storage Facilities',
      subsidyAmount: 38000,
      state: 'Andhra Pradesh',
      minLandArea: 0.5,
      maxLandArea: 8.0,
      isIncomeTaxPayeeAllowed: true,
      maxAnnualIncome: 450000,
      pattadarRequired: false,
      eligibility: 'AP fruit & vegetable growers establishing on-farm cold rooms up to 8.0 acres.',
      requiredDocs: ['Horticulture Department Certificate', 'Land Record Proof', 'Aadhaar Card'],
      status: 'Active',
      allowedCrops: ['Tomato', 'Banana', 'Mango', 'Vegetables']
    }
  ];

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.getSchemes();
      if (res && res.schemes && res.schemes.length >= 10) {
        setSchemes(res.schemes);
      } else {
        setSchemes(defaultGovSchemes);
      }
    } catch (err) {
      setSchemes(defaultGovSchemes);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(query) ||
                          s.schemeId.toLowerCase().includes(query) ||
                          (s.category && s.category.toLowerCase().includes(query)) ||
                          (s.description && s.description.toLowerCase().includes(query));

    let matchesCategory = true;
    if (activeCategory === 'Andhra Pradesh State') {
      matchesCategory = s.category === 'STATE_AP' || s.category === 'Andhra Pradesh State' || s.state === 'Andhra Pradesh';
    } else if (activeCategory === 'Central National') {
      matchesCategory = s.category === 'CENTRAL_NATIONAL' || s.category === 'Central National' || s.state === 'National / Central';
    } else if (activeCategory !== 'All') {
      matchesCategory = s.category === activeCategory;
    }

    return matchesSearch && matchesCategory;
  });

  // REAL-WORLD AP & CENTRAL ELIGIBILITY CALCULATOR EVALUATION
  const evaluateEligibilityLogic = (targetScheme, land, isITPayee, income) => {
    if (!targetScheme) return { isEligible: true, reason: '' };

    const acres = parseFloat(land);
    const maxLand = targetScheme.maxLandArea || 5.0;
    const isITAllowed = targetScheme.isIncomeTaxPayeeAllowed;
    const maxIncome = targetScheme.maxAnnualIncome || 250000;

    if (isNaN(acres) || acres <= 0) {
      return { isEligible: false, reason: 'Please enter a valid land size in acres.' };
    }

    if (acres > maxLand) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Registered land size of ${acres.toLocaleString()} acres exceeds the maximum scheme limit of ${maxLand} acres for small/marginal farmers.`
      };
    }

    if (!isITAllowed && isITPayee) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Income Tax Payees are strictly excluded from state welfare subsidy assistance under Government of Andhra Pradesh guidelines.`
      };
    }

    if (parseFloat(income) > maxIncome) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Annual household income (₹${parseFloat(income).toLocaleString()}) exceeds the maximum state welfare cap of ₹${maxIncome.toLocaleString()}.`
      };
    }

    return {
      isEligible: true,
      reason: `✓ ELIGIBLE FOR SUBSIDY: Congratulations! Your land size of ${acres} acres, non-IT payee status, and annual income meet the official guidelines for ${targetScheme.name}.`
    };
  };

  const handleCalculatorSubmit = (e) => {
    e.preventDefault();
    const result = evaluateEligibilityLogic(eligibilityCheckScheme, landSizeInput, isITPayeeInput, annualIncomeInput);
    setEligibilityResult(result);
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setComputedFileHash(hashHex);
    } catch (err) {
      console.error('File hash preview error:', err);
    }
  };

  const handleApplyModalSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect your Web3 MetaMask wallet before applying');
      return;
    }
    if (!applySchemeModal) return;
    if (!file) {
      setError('Please select a supporting document file to upload');
      return;
    }

    const preEval = evaluateEligibilityLogic(applySchemeModal, landSizeInput, isITPayeeInput, annualIncomeInput);
    if (!preEval.isEligible) {
      setError(`Cannot submit application: ${preEval.reason}`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('farmerWallet', walletAddress);
      formData.append('schemeId', applySchemeModal.schemeId);
      formData.append('landAreaAcres', landSizeInput);
      formData.append('isIncomeTaxPayee', isITPayeeInput);
      formData.append('annualIncomeINR', annualIncomeInput);
      formData.append('pattadarPassbookNumber', pattadarPassbookInput);
      formData.append('document', file);

      const res = await api.submitApplication(formData);
      setSuccess(`Application submitted successfully! Application ID: ${res.application.applicationId}. Document pinned to IPFS.`);
      setFile(null);
      setComputedFileHash('');
      setTimeout(() => {
        setApplySchemeModal(null);
        setActiveTab('farmer');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem 0' }}>
      {/* Header Banner — Official AP State & Central Directory */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0a192f 100%)', color: '#ffffff', padding: '2.5rem 2rem', borderLeft: '6px solid #10b981' }}>
        <span style={{ fontSize: '0.775rem', fontWeight: '800', background: '#047857', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Government of Andhra Pradesh — Department of Agriculture
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
          AP State & Central Subsidy Schemes Guidelines Directory
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '850px' }}>
          Explore state welfare programs (AP YSR Rythu Bharosa, Sunna Vaddi, Crop Insurance) & central schemes. Review official eligibility rules, land possession caps, Income Tax payee exclusions, and required land documents.
        </p>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="gov-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search scheme title, AP state code, or category (e.g. AP-YSR-RYTHU-BHAROSA, PM-KISAN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} /> Category Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`nav-btn ${activeCategory === cat ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schemes Grid with AP & Central Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredSchemes.map((scheme) => (
          <div key={scheme.schemeId} className="gov-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: '800', background: scheme.category === 'STATE_AP' || scheme.state === 'Andhra Pradesh' ? '#047857' : '#0284c7', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {scheme.state === 'Andhra Pradesh' || scheme.category === 'STATE_AP' ? 'ANDHRA PRADESH STATE' : 'CENTRAL NATIONAL'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#047857', background: '#ecfdf5', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Aid: ₹{scheme.subsidyAmount?.toLocaleString()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                {scheme.name}
              </h3>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
                Scheme Code: {scheme.schemeId}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                {scheme.description}
              </p>

              {/* Guidelines & Eligibility Rules Summary Box */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.825rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontWeight: '700', color: '#0a192f', marginBottom: '0.15rem' }}>Scheme Guidelines & Eligibility Rules:</div>
                <div>• Category: <strong>{scheme.category}</strong></div>
                <div>• Max Land Holding: <strong>Up to {scheme.maxLandArea || 5.0} Acres</strong></div>
                <div>• Income Tax Payee Rule: <strong>{scheme.isIncomeTaxPayeeAllowed ? 'Allowed' : 'Excluded (Not Allowed)'}</strong></div>
                <div>• Max Household Income: <strong>₹{scheme.maxAnnualIncome?.toLocaleString() || '250,000'}/year</strong></div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSchemeDetails(scheme)}
                className="btn-gov-outline"
                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
              >
                View Guidelines
              </button>

              <button
                onClick={() => { setEligibilityCheckScheme(scheme); setEligibilityResult(null); setLandSizeInput('2.5'); setIsITPayeeInput(false); }}
                className="btn-gov-outline"
                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#0284c7', borderColor: '#bae6fd' }}
              >
                Check Eligibility
              </button>

              <button
                onClick={() => { setApplySchemeModal(scheme); setError(''); setSuccess(''); setFile(null); }}
                className="btn-gov-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', background: '#047857', borderColor: '#047857' }}
              >
                Apply Online <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1. Complete Scheme Guidelines Modal */}
      {selectedSchemeDetails && (
        <div className="modal-overlay" onClick={() => setSelectedSchemeDetails(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="gov-card-header">
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: '800', background: '#047857', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  GOVERNMENT POLICY GUIDELINES
                </span>
                <h3 className="gov-card-title" style={{ marginTop: '0.35rem' }}>{selectedSchemeDetails.name}</h3>
              </div>
              <button onClick={() => setSelectedSchemeDetails(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><strong>Scheme Code:</strong><br /><span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{selectedSchemeDetails.schemeId}</span></div>
                <div><strong>State Jurisdiction:</strong><br /><span>{selectedSchemeDetails.state || 'Andhra Pradesh'}</span></div>
                <div><strong>Financial Subsidy Aid:</strong><br /><span style={{ color: '#047857', fontWeight: '800', fontSize: '1.05rem' }}>₹{selectedSchemeDetails.subsidyAmount?.toLocaleString()}</span></div>
                <div><strong>Max Land Holding Cap:</strong><br /><span style={{ fontWeight: '700' }}>Up to {selectedSchemeDetails.maxLandArea || 5.0} Acres</span></div>
              </div>

              <div>
                <h4 style={{ fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Full Scheme Overview & Objective:</h4>
                <p style={{ color: '#475569', lineHeight: '1.5' }}>{selectedSchemeDetails.description}</p>
              </div>

              <div>
                <h4 style={{ fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Government Eligibility Guidelines:</h4>
                <div style={{ background: '#f0f7ff', border: '1px solid #bae6fd', padding: '0.85rem 1rem', borderRadius: '6px', color: '#0369a1', lineHeight: '1.5' }}>
                  • {selectedSchemeDetails.eligibility || 'Open to registered AP landowning and tenant farmers.'}<br />
                  • <strong>Income Tax Exclusion:</strong> {selectedSchemeDetails.isIncomeTaxPayeeAllowed ? 'Income Tax Payees are allowed.' : 'Income Tax Payees are strictly EXCLUDED under state rules.'}<br />
                  • <strong>Max Household Income Cap:</strong> ₹{selectedSchemeDetails.maxAnnualIncome?.toLocaleString() || '250,000'} / year.
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Required Mandatory Documents:</h4>
                <ul style={{ paddingLeft: '1.25rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedSchemeDetails.requiredDocs ? selectedSchemeDetails.requiredDocs.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  )) : (
                    <>
                      <li>AP Webland Pattadar Passbook Copy / Title Deed</li>
                      <li>Aadhaar Card of Farmer</li>
                      <li>Bank Passbook copy for Direct Benefit Transfer (DBT)</li>
                    </>
                  )}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setSelectedSchemeDetails(null)} className="btn-gov-outline">Close Guidelines</button>
                <button onClick={() => { setSelectedSchemeDetails(null); setApplySchemeModal(selectedSchemeDetails); }} className="btn-gov-primary">
                  Proceed to Online Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Real-World AP Eligibility Calculator Modal */}
      {eligibilityCheckScheme && (
        <div className="modal-overlay" onClick={() => setEligibilityCheckScheme(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">AP State Eligibility Calculator ({eligibilityCheckScheme.schemeId})</h3>
              <button onClick={() => setEligibilityCheckScheme(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleCalculatorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Agricultural Land Holding (in Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5 or 100000"
                  value={landSizeInput}
                  onChange={(e) => setLandSizeInput(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Scheme Threshold: Max {eligibilityCheckScheme.maxLandArea || 5.0} Acres</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Are you an Income Tax Payee? *</label>
                <select value={isITPayeeInput ? 'true' : 'false'} onChange={(e) => setIsITPayeeInput(e.target.value === 'true')} required>
                  <option value="false">NO (Non-Tax Payee Farmer)</option>
                  <option value="true">YES (Income Tax Payee)</option>
                </select>
                <span style={{ fontSize: '0.725rem', color: '#64748b' }}>IT Payees excluded under YSR Rythu Bharosa & PM-KISAN</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Annual Household Income (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  value={annualIncomeInput}
                  onChange={(e) => setAnnualIncomeInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-gov-secondary">Evaluate Eligibility Now</button>
            </form>

            {eligibilityResult && (
              <div style={{
                marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem',
                background: eligibilityResult.isEligible ? '#ecfdf5' : '#fef2f2',
                color: eligibilityResult.isEligible ? '#047857' : '#dc2626',
                border: `1.5px solid ${eligibilityResult.isEligible ? '#a7f3d0' : '#fecaca'}`
              }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {eligibilityResult.isEligible ? <CheckCircle2 size={20} color="#047857" /> : <ShieldAlert size={20} color="#dc2626" />}
                  {eligibilityResult.isEligible ? 'AP STATE ELIGIBILITY PASSED' : 'EXCLUDED UNDER AP STATE RULES'}
                </div>
                <div style={{ lineHeight: '1.4' }}>{eligibilityResult.reason}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Interactive Subsidy Application Modal (With IPFS & Real-World Validation) */}
      {applySchemeModal && (
        <div className="modal-overlay" onClick={() => setApplySchemeModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="gov-card-header">
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: '800', background: '#047857', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  OFFICIAL APPLICATION FORM
                </span>
                <h3 className="gov-card-title" style={{ marginTop: '0.35rem' }}>Apply for {applySchemeModal.name}</h3>
              </div>
              <button onClick={() => setApplySchemeModal(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
            {success && <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>{success}</div>}

            <form onSubmit={handleApplyModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Land Holding (Acres) *</label>
                  <input type="number" step="0.1" value={landSizeInput} onChange={(e) => setLandSizeInput(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Income Tax Payee? *</label>
                  <select value={isITPayeeInput ? 'true' : 'false'} onChange={(e) => setIsITPayeeInput(e.target.value === 'true')} required>
                    <option value="false">NO (Non-Tax Payee)</option>
                    <option value="true">YES (Income Tax Payee)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Annual Income (INR) *</label>
                  <input type="number" value={annualIncomeInput} onChange={(e) => setAnnualIncomeInput(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>AP Pattadar Passbook # *</label>
                  <input type="text" value={pattadarPassbookInput} onChange={(e) => setPattadarPassbookInput(e.target.value)} required />
                </div>
              </div>

              {/* Upload Land Document */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Upload Land Title / Pattadar Passbook Proof (PDF/JPG/PNG) *</label>
                <div className="upload-dropzone" onClick={() => document.getElementById('modalFileInput').click()}>
                  <input
                    id="modalFileInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <Upload size={30} color="#0284c7" style={{ margin: '0 auto 0.4rem' }} />
                  {file ? (
                    <div style={{ fontWeight: '700', color: '#0a192f', fontSize: '0.9rem' }}>{file.name}</div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Click or drop land survey document here (Pinned to IPFS & SHA-256 hashed)</div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setApplySchemeModal(null)} className="btn-gov-outline">Cancel</button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  disabled={isSubmitting || !walletAddress}
                  style={{ padding: '0.7rem 1.5rem', background: '#047857', borderColor: '#047857' }}
                >
                  {isSubmitting ? 'Uploading to IPFS & Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
