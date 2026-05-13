import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const VERTICALS = [
  { id: "agriculture", label: "Agriculture", icon: "🌾", color: "#16a34a" },
  { id: "mining", label: "Mining", icon: "⛏️", color: "#ea580c" },
  { id: "solar", label: "Solar", icon: "☀️", color: "#ca8a04" },
  { id: "carbon", label: "Carbon Mgmt", icon: "🌿", color: "#0d9488" },
  { id: "healthcare", label: "Healthcare", icon: "🏥", color: "#2563eb" },
  { id: "finance", label: "Finance", icon: "📊", color: "#7c3aed" },
];

const ROI_CONFIG = {
  agriculture: {
    inputs: [
      { id: "laborCost", label: "Monthly Labor Cost", unit: "$/mo", placeholder: "2200" },
      { id: "irrigationCost", label: "Monthly Irrigation Cost", unit: "$/mo", placeholder: "800" },
      { id: "yieldLoss", label: "Annual Yield Loss (est.)", unit: "$", placeholder: "6000" },
      { id: "farmSize", label: "Farm Size", unit: "acres", placeholder: "120" },
    ],
    calculate: (v) => [
      { label: "Labor Automation", monthly: (parseFloat(v.laborCost)||0)*0.18, note: "AI scheduling reduces labor 18%" },
      { label: "Irrigation Savings", monthly: (parseFloat(v.irrigationCost)||0)*0.28, note: "Smart irrigation cuts water cost 28%" },
      { label: "Yield Loss Recovery", monthly: (parseFloat(v.yieldLoss)||0)*0.22/12, note: "AI monitoring prevents 22% of losses" },
    ],
  },
  mining: {
    inputs: [
      { id: "maintenanceCost", label: "Monthly Maintenance Cost", unit: "$/mo", placeholder: "12000" },
      { id: "downtimeHours", label: "Monthly Downtime Hours", unit: "hrs", placeholder: "25" },
      { id: "downtimeCost", label: "Cost per Downtime Hour", unit: "$/hr", placeholder: "300" },
      { id: "fleetSize", label: "Fleet Size", unit: "machines", placeholder: "5" },
    ],
    calculate: (v) => [
      { label: "Predictive Maintenance", monthly: (parseFloat(v.maintenanceCost)||0)*0.22, note: "AI cuts maintenance cost 22%" },
      { label: "Downtime Recovery", monthly: (parseFloat(v.downtimeHours)||0)*(parseFloat(v.downtimeCost)||0)*0.35, note: "35% downtime reduction" },
      { label: "Safety Cost Reduction", monthly: (parseFloat(v.maintenanceCost)||0)*0.05, note: "Fewer incidents, lower liability" },
    ],
  },
  solar: {
    inputs: [
      { id: "omCost", label: "Monthly O&M Cost", unit: "$/mo", placeholder: "1200" },
      { id: "capacity", label: "Installed Capacity", unit: "kW", placeholder: "150" },
      { id: "efficiency", label: "Current Efficiency", unit: "%", placeholder: "78" },
      { id: "panelAge", label: "Average Panel Age", unit: "yrs", placeholder: "5" },
    ],
    calculate: (v) => [
      { label: "O&M Optimization", monthly: (parseFloat(v.omCost)||0)*0.25, note: "AI monitoring cuts O&M 25%" },
      { label: "Fault Detection Savings", monthly: (parseFloat(v.capacity)||0)*0.04, note: "Early fault detection value" },
      { label: "Performance Uplift", monthly: (parseFloat(v.omCost)||0)*0.10, note: "10% efficiency improvement" },
    ],
  },
  carbon: {
    inputs: [
      { id: "creditsEarned", label: "Annual Credits Earned", unit: "tons/yr", placeholder: "120" },
      { id: "creditPrice", label: "Credit Price", unit: "$/ton", placeholder: "14" },
      { id: "verificationCost", label: "Annual Verification Cost", unit: "$/yr", placeholder: "4000" },
      { id: "landArea", label: "Project Area", unit: "acres", placeholder: "300" },
    ],
    calculate: (v) => [
      { label: "Additional Credits via AI", monthly: ((parseFloat(v.creditsEarned)||0)*0.30*(parseFloat(v.creditPrice)||0))/12, note: "30% more credits with AI monitoring" },
      { label: "Verification Cost Savings", monthly: (parseFloat(v.verificationCost)||0)*0.40/12, note: "Satellite/AI cuts audit costs 40%" },
      { label: "Market Timing Gains", monthly: ((parseFloat(v.creditsEarned)||0)*(parseFloat(v.creditPrice)||0)*0.12)/12, note: "Optimized credit sale timing" },
    ],
  },
  healthcare: {
    inputs: [
      { id: "opCost", label: "Monthly Operational Cost", unit: "$/mo", placeholder: "28000" },
      { id: "patientVolume", label: "Monthly Patient Volume", unit: "patients", placeholder: "300" },
      { id: "readmissionRate", label: "Readmission Rate", unit: "%", placeholder: "10" },
      { id: "readmissionCost", label: "Avg Readmission Cost", unit: "$", placeholder: "2500" },
    ],
    calculate: (v) => [
      { label: "Operational Efficiency", monthly: (parseFloat(v.opCost)||0)*0.18, note: "18% ops reduction via AI" },
      { label: "Readmission Reduction", monthly: (parseFloat(v.patientVolume)||0)*(parseFloat(v.readmissionRate)||0)/100*(parseFloat(v.readmissionCost)||0)*0.25/12, note: "25% fewer readmissions" },
      { label: "Diagnostic Accuracy", monthly: (parseFloat(v.opCost)||0)*0.08, note: "Reduced errors and rework cost" },
    ],
  },
  finance: {
    inputs: [
      { id: "fraudLosses", label: "Monthly Fraud Losses", unit: "$/mo", placeholder: "4500" },
      { id: "reviewCost", label: "Manual Review Cost", unit: "$/mo", placeholder: "3200" },
      { id: "txVolume", label: "Monthly Transactions", unit: "txns", placeholder: "10000" },
      { id: "falsePosRate", label: "False Positive Rate", unit: "%", placeholder: "15" },
    ],
    calculate: (v) => [
      { label: "Fraud Loss Reduction", monthly: (parseFloat(v.fraudLosses)||0)*0.38, note: "AI cuts fraud losses 38%" },
      { label: "Review Automation", monthly: (parseFloat(v.reviewCost)||0)*0.45, note: "45% of manual review automated" },
      { label: "False Positive Recovery", monthly: (parseFloat(v.reviewCost)||0)*0.15, note: "Fewer blocked legitimate transactions" },
    ],
  },
};

const ASSESSMENT_QUESTIONS = [
  { id:"data", question:"How do you currently collect operational data?", options:[
    {label:"Fully digital — sensors, software, databases",score:10},
    {label:"Mix of digital and manual / paper",score:5},
    {label:"Mostly manual or paper-based",score:0},
  ]},
  { id:"quality", question:"How would you describe the quality of your data?", options:[
    {label:"Structured, clean and consistently recorded",score:10},
    {label:"Partially organized but with gaps",score:5},
    {label:"Scattered and inconsistent",score:0},
  ]},
  { id:"tech", question:"What technology does your business currently use?", options:[
    {label:"ERP, CRM or industry-specific software",score:10},
    {label:"Basic tools like spreadsheets and email",score:5},
    {label:"Minimal to no digital tools",score:0},
  ]},
  { id:"team", question:"Do you have team members who work with data or tech?", options:[
    {label:"Yes — dedicated data / tech staff",score:10},
    {label:"A few people with basic data skills",score:5},
    {label:"No data or tech expertise in-house",score:0},
  ]},
  { id:"problem", question:"How clearly defined is the problem you want AI to solve?", options:[
    {label:"Specific problem with measurable impact identified",score:10},
    {label:"General idea but not fully defined yet",score:5},
    {label:"Still exploring where AI could help",score:0},
  ]},
  { id:"leadership", question:"How does your leadership view AI investment?", options:[
    {label:"Actively supportive and budgeted for it",score:10},
    {label:"Open to it with the right business case",score:5},
    {label:"Skeptical or not yet convinced",score:0},
  ]},
  { id:"timeline", question:"What's your expected AI implementation timeline?", options:[
    {label:"Within 3–6 months",score:10},
    {label:"6–12 months",score:5},
    {label:"No clear timeline yet",score:0},
  ]},
  { id:"budget", question:"Are you open to investing in a 6-month AI pilot?", options:[
    {label:"Yes — budget is or can be allocated",score:10},
    {label:"Maybe — depends on the ROI case",score:5},
    {label:"Not ready for investment yet",score:0},
  ]},
];

const TIERS = [
  { range:[0,30], label:"Foundation Stage", color:"#ea580c", emoji:"🌱",
    headline:"Build your data foundation first",
    desc:"You have real potential, but a few building blocks need to be in place before AI delivers ROI. Omdena can help you create a clear roadmap.",
    actions:["Digitize your data collection processes","Define 1–2 specific problems to solve with AI","Run a low-risk AI discovery workshop with Omdena"] },
  { range:[31,60], label:"Growth Ready", color:"#2563eb", emoji:"🚀",
    headline:"You're ready for your first AI pilot",
    desc:"You have the right foundations. A focused pilot could deliver measurable ROI within 3–6 months — Omdena specializes in exactly this stage.",
    actions:["Launch a focused 90-day AI pilot project","Identify your single highest-ROI use case","Build internal AI capability alongside the project"] },
  { range:[61,80], label:"AI Accelerator", color:"#16a34a", emoji:"⚡",
    headline:"You're primed for full AI deployment",
    desc:"Your organization is AI-ready. The opportunity now is moving fast and scaling across use cases before your competitors do.",
    actions:["Deploy AI across multiple business verticals","Build a custom AI product with Omdena","Establish an internal AI center of excellence"] },
];

const PROJECT_TYPES = [
  {id:"predictive",label:"Predictive Analytics",icon:"📈",desc:"Demand forecasting, yield prediction, risk scoring",base:[12000,20000],weeks:[10,16]},
  {id:"vision",label:"Computer Vision",icon:"👁️",desc:"Defect detection, crop monitoring, safety checks",base:[22000,30000],weeks:[14,22]},
  {id:"nlp",label:"NLP & Text AI",icon:"💬",desc:"Document processing, chatbots, sentiment analysis",base:[16000,25000],weeks:[12,20]},
  {id:"automation",label:"Process Automation",icon:"⚙️",desc:"Workflow automation, RPA with AI, smart routing",base:[10000,17000],weeks:[8,14]},
  {id:"dashboard",label:"AI Dashboard",icon:"📊",desc:"Real-time insights, KPI monitoring, anomaly alerts",base:[8000,15000],weeks:[6,12]},
];

const DATA_OPTIONS = [
  {id:"ready",label:"Ready & clean",desc:"Structured data already available",mult:1.0,icon:"✅"},
  {id:"needs",label:"Needs cleaning",desc:"Data exists but requires prep work",mult:1.3,icon:"🧹"},
  {id:"none",label:"Doesn't exist yet",desc:"Data collection needs to be built",mult:1.6,icon:"🏗️"},
];

const DEPLOY_OPTIONS = [
  {id:"webapp",label:"Web Application",desc:"User-facing browser tool",mult:1.2,icon:"🌐"},
  {id:"api",label:"API / Integration",desc:"Connects to your existing systems",mult:1.0,icon:"🔌"},
  {id:"internal",label:"Internal Tool",desc:"Used by your team only",mult:0.95,icon:"🏢"},
  {id:"mobile",label:"Mobile App",desc:"iOS or Android application",mult:1.4,icon:"📱"},
];

const INVOLVEMENT_OPTIONS = [
  {id:"full",label:"Omdena Builds Fully",desc:"End-to-end delivery by Omdena team",mult:1.0,icon:"🏗️"},
  {id:"collab",label:"Collaborative",desc:"Omdena + your team work together",mult:0.78,icon:"🤝"},
  {id:"advisory",label:"Advisory Only",desc:"Omdena guides your in-house team",mult:0.45,icon:"🎯"},
];

const TIMELINE_OPTIONS = [
  {id:"fast",label:"3 Months",desc:"Accelerated delivery",mult:1.25,icon:"⚡"},
  {id:"standard",label:"6 Months",desc:"Standard pace",mult:1.0,icon:"📅"},
  {id:"relaxed",label:"12 Months",desc:"Relaxed and iterative",mult:0.88,icon:"🌿"},
];

const COST_STEPS = [
  { key:"projectType", label:"What do you want to build?", options: PROJECT_TYPES.map(p=>({id:p.id,icon:p.icon,label:p.label,desc:p.desc})) },
  { key:"dataReadiness", label:"What's the state of your data?", options: DATA_OPTIONS.map(d=>({id:d.id,icon:d.icon,label:d.label,desc:d.desc})) },
  { key:"deployment", label:"How should the AI be deployed?", options: DEPLOY_OPTIONS.map(d=>({id:d.id,icon:d.icon,label:d.label,desc:d.desc})) },
  { key:"involvement", label:"How involved will your team be?", options: INVOLVEMENT_OPTIONS.map(i=>({id:i.id,icon:i.icon,label:i.label,desc:i.desc})) },
  { key:"timeline", label:"What's your preferred timeline?", options: TIMELINE_OPTIONS.map(t=>({id:t.id,icon:t.icon,label:t.label,desc:t.desc})) },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ede6;}
  .wrap{font-family:'Outfit',sans-serif;background:#f0ede6;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:28px 16px 60px;}
  .card{background:#fff;border-radius:24px;padding:40px;width:100%;max-width:700px;box-shadow:0 4px 40px rgba(0,0,0,0.10);animation:up .35s ease forwards;border:2px solid #bfdbfe;}
  @media(max-width:600px){
    .wrap{padding:12px 8px 40px;}
    .card{padding:24px 18px;border-radius:16px;}
    h1{font-size:24px !important;}
    .tool-grid{grid-template-columns:1fr !important;}
    .vgrid{grid-template-columns:repeat(2,1fr) !important;}
    .frow{grid-template-columns:1fr !important;}
    .cost-bd{grid-template-columns:1fr !important;}
    .roi-preview .rp-value{font-size:36px !important;}
    .scircle{width:100px !important;height:100px !important;}
    .snum{font-size:30px !important;}
    .ch-range{font-size:28px !important;}
    .qtext{font-size:17px !important;}
  }
  @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .brand{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#111;margin-bottom:36px;display:flex;align-items:center;gap:8px;}
  .brand-pill{background:#111;color:#f0ede6;border-radius:4px;padding:2px 8px;font-size:9px;letter-spacing:2px;}
  h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:32px;font-weight:800;line-height:1.15;color:#111;margin-bottom:10px;}
  h1 em{font-style:normal;color:#1d4ed8;}
  .sub{font-size:16px;color:#4b5563;line-height:1.65;margin-bottom:12px;}
  .interactive-hint{font-size:13px;color:#1d4ed8;font-weight:600;margin-bottom:22px;display:flex;align-items:center;gap:6px;}
  .tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
  .tool-card{border:2px solid #e5e7eb;border-radius:16px;padding:22px 16px;cursor:pointer;transition:all .2s;background:#fafafa;display:flex;flex-direction:column;gap:7px;}
  .tool-card:hover{border-color:#111;background:#fff;transform:translateY(-2px);}
  .tc-icon{font-size:26px;}
  .tc-name{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:800;color:#111;}
  .tc-desc{font-size:12px;color:#9ca3af;line-height:1.5;}
  .tc-tag{margin-top:4px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:4px;display:inline-block;align-self:flex-start;}
  .tc-cta{margin-top:8px;font-size:13px;font-weight:700;color:#1d4ed8;}
  .chip{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:14px;}
  .back{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:#9ca3af;cursor:pointer;margin-bottom:26px;transition:color .2s;}
  .back:hover{color:#111;}
  .vgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:26px;}
  .vbtn{border:2px solid #e5e7eb;border-radius:12px;padding:16px 10px;cursor:pointer;text-align:center;transition:all .2s;background:#fafafa;display:flex;flex-direction:column;align-items:center;gap:5px;}
  .vbtn:hover,.vbtn.sel{border-color:var(--vc,#111);background:#fff;}
  .vi{font-size:22px;}
  .vl{font-size:12px;font-weight:600;color:#6b7280;}
  .vbtn.sel .vl{color:#111;}
  .igroup{margin-bottom:16px;}
  .igroup label{display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:7px;}
  .irow{display:flex;align-items:center;border:2px solid #e5e7eb;border-radius:10px;overflow:hidden;transition:border-color .2s;}
  .irow:focus-within{border-color:#111;}
  .irow input{flex:1;border:none;outline:none;padding:11px 14px;font-family:'Outfit',sans-serif;font-size:15px;color:#111;background:transparent;}
  .iunit{padding:0 14px;font-size:12px;color:#9ca3af;background:#f9fafb;border-left:2px solid #e5e7eb;min-height:44px;display:flex;align-items:center;}
  .btn{width:100%;padding:14px;background:#111;color:#fff;border:none;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:6px;letter-spacing:0.3px;}
  .btn:hover{background:#1d4ed8;transform:translateY(-1px);}
  .btn:disabled{background:#e5e7eb;color:#9ca3af;cursor:not-allowed;transform:none;}
  .btn-out{background:transparent;border:2px solid #e5e7eb;color:#6b7280;border-radius:10px;padding:10px 22px;font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;transition:all .2s;margin-top:12px;}
  .btn-out:hover{border-color:#111;color:#111;}

  /* ROI preview */
  .roi-preview{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #bfdbfe;border-radius:16px;padding:28px;text-align:center;margin-bottom:22px;}
  .rp-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6b7280;margin-bottom:6px;}
  .rp-value{font-family:'Plus Jakarta Sans',sans-serif;font-size:48px;font-weight:800;color:#1d4ed8;}
  .rp-sub{font-size:13px;color:#6b7280;margin-top:4px;}
  .rp-hint{font-size:13px;color:#374151;margin-top:14px;padding-top:14px;border-top:2px solid #bfdbfe;}

  /* ROI full breakdown */
  .rgrid{display:grid;gap:10px;margin-bottom:20px;}
  .rrow{display:flex;justify-content:space-between;align-items:center;border:2px solid #f3f4f6;border-radius:12px;padding:16px 18px;background:#fafafa;}
  .rlab{font-size:14px;color:#374151;}
  .rnote{font-size:11px;color:#9ca3af;margin-top:2px;}
  .rval{font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:800;color:#1d4ed8;}

  /* Score preview */
  .score-preview{text-align:center;padding:28px 20px;background:linear-gradient(135deg,#f8faff,#f0fdf4);border:2px solid #e5e7eb;border-radius:16px;margin-bottom:22px;}
  .scircle{width:120px;height:120px;border-radius:50%;border:4px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px;}
  .snum{font-family:'Plus Jakarta Sans',sans-serif;font-size:38px;font-weight:800;}
  .sdenom{font-size:13px;color:#9ca3af;}
  .sbadge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:2px solid;margin-bottom:10px;}
  .sp-headline{font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;color:#111;margin-bottom:8px;}
  .sp-hint{font-size:13px;color:#6b7280;line-height:1.6;}

  /* Locked section */
  .locked{border:2px dashed #e5e7eb;border-radius:14px;padding:20px;margin-bottom:22px;position:relative;overflow:hidden;}
  .locked-overlay{position:absolute;inset:0;background:rgba(255,255,255,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:12px;}
  .locked-icon{font-size:24px;}
  .locked-text{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;color:#374151;}
  .locked-sub{font-size:12px;color:#9ca3af;}
  .locked-items{display:flex;flex-direction:column;gap:8px;filter:blur(4px);}
  .locked-item{background:#f3f4f6;border-radius:8px;padding:12px 16px;height:48px;}
  .blur-preview{filter:blur(10px);user-select:none;pointer-events:none;opacity:0.55;}
  .preview-wrap{position:relative;border:2px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:16px;background:#fafafa;overflow:hidden;text-align:center;}
  .preview-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,0.55);}
  .preview-lock{font-size:26px;}
  .preview-lock-text{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;color:#374151;}
  .preview-lock-sub{font-size:12px;color:#9ca3af;}

  /* Cost preview */
  .cost-preview{background:linear-gradient(135deg,#1e3a5f,#1d4ed8);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;color:#fff;}
  .cp-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#93c5fd;margin-bottom:8px;}
  .cp-range{font-family:'Plus Jakarta Sans',sans-serif;font-size:36px;font-weight:800;}
  .cp-sub{font-size:13px;color:#93c5fd;margin-top:6px;}
  .cp-hint{font-size:13px;color:#bfdbfe;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2);}

  /* Cost full breakdown */
  .cost-bd{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
  .cbd{border:2px solid #f3f4f6;border-radius:12px;padding:16px;background:#fafafa;}
  .cbd-label{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px;}
  .cbd-value{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:#111;}
  .cbd-note{font-size:11px;color:#9ca3af;margin-top:2px;}

  /* Assessment full results */
  .shead{font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:800;color:#111;margin-bottom:10px;}
  .sdesc{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:20px;}
  .alist{border:2px solid #f3f4f6;border-radius:14px;padding:20px;margin-bottom:20px;background:#fafafa;}
  .altitle{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:12px;}
  .aitem{display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:14px;color:#374151;border-bottom:2px solid #f3f4f6;}
  .aitem:last-child{border-bottom:none;}
  .aitem::before{content:'→';font-weight:800;flex-shrink:0;color:#1d4ed8;}

  /* Email gate */
  .egate{border:2px solid #bfdbfe;border-radius:16px;padding:26px;background:#eff6ff;}
  .egate h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:17px;font-weight:800;color:#111;margin-bottom:6px;}
  .egate p{font-size:13px;color:#6b7280;margin-bottom:18px;line-height:1.6;}
  .frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
  .finput{width:100%;border:2px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-family:'Outfit',sans-serif;font-size:14px;color:#111;outline:none;transition:border-color .2s;background:#fff;}
  .finput:focus{border-color:#111;}
  .finput::placeholder{color:#d1d5db;}

  /* CTA box */
  .cta-box{background:#111;border-radius:16px;padding:26px;text-align:center;margin-bottom:0;}
  .cta-box h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:8px;}
  .cta-box p{font-size:13px;color:#9ca3af;margin-bottom:18px;line-height:1.6;}
  .cta-box .cbtn{background:#1d4ed8;color:#fff;border:none;border-radius:10px;padding:13px 28px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;}
  .cta-box .cbtn:hover{background:#1e40af;}

  /* Questions */
  .qbar{display:flex;align-items:center;gap:14px;margin-bottom:26px;}
  .qprog{flex:1;height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;}
  .qfill{height:100%;background:#111;border-radius:2px;transition:width .4s ease;}
  .qtext{font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;color:#111;line-height:1.4;margin-bottom:20px;}
  .opts{display:flex;flex-direction:column;gap:10px;}
  .opt{display:flex;align-items:center;gap:14px;padding:15px 18px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all .2s;font-size:14px;color:#374151;font-family:'Outfit',sans-serif;background:#fafafa;}
  .opt:hover{border-color:#111;background:#fff;}
  .opt.sel{border-color:#111;background:#fff;}
  .oradio{width:18px;height:18px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;transition:all .2s;display:flex;align-items:center;justify-content:center;}
  .opt.sel .oradio{border-color:#111;background:#111;}
  .opt.sel .oradio::after{content:'';width:6px;height:6px;background:#fff;border-radius:50%;}

  /* Cost options */
  .cost-opts{display:grid;gap:10px;margin-bottom:20px;}
  .copt{display:flex;align-items:center;gap:14px;padding:16px 18px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all .2s;background:#fafafa;}
  .copt:hover,.copt.sel{border-color:#111;background:#fff;}
  .copt-icon{font-size:22px;flex-shrink:0;}
  .copt-info{flex:1;}
  .copt-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;color:#111;}
  .copt-desc{font-size:12px;color:#9ca3af;margin-top:2px;}
  .copt-check{width:20px;height:20px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;transition:all .2s;display:flex;align-items:center;justify-content:center;}
  .copt.sel .copt-check{border-color:#111;background:#111;}
  .copt.sel .copt-check::after{content:'';width:7px;height:7px;background:#fff;border-radius:50%;}

  .privacy{display:flex;align-items:center;gap:6px;font-size:12px;color:#9ca3af;margin-top:10px;justify-content:center;}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => "$" + Math.round(n).toLocaleString();
const getTier = (score) => TIERS.find(t => score >= t.range[0] && score <= t.range[1]);

function calcCost(cs) {
  const pt = PROJECT_TYPES.find(p => p.id === cs.projectType);
  if (!pt) return null;
  const dm = DATA_OPTIONS.find(d => d.id === cs.dataReadiness)?.mult || 1;
  const dep = DEPLOY_OPTIONS.find(d => d.id === cs.deployment)?.mult || 1;
  const inv = INVOLVEMENT_OPTIONS.find(i => i.id === cs.involvement)?.mult || 1;
  const tim = TIMELINE_OPTIONS.find(t => t.id === cs.timeline)?.mult || 1;
  const mult = dm * dep * inv * tim;
  const low = Math.round(pt.base[0] * mult / 1000) * 1000;
  const high = Math.round(pt.base[1] * mult / 1000) * 1000;
  const wMult = cs.timeline === "fast" ? 0.62 : cs.timeline === "relaxed" ? 1.38 : 1;
  const wLow = Math.round(pt.weeks[0] * wMult);
  const wHigh = Math.round(pt.weeks[1] * wMult);
  return { low, high, wLow, wHigh, pt };
}

const GA_ID = "G-TEV21NE260";
const OMDENA_GA_ID = "G-JTHDH3SLKN";

function trackEvent(eventName, params = {}) {
  try {
    // Track on tool's own GA4
    if(typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if(typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
      } else {
        window.dataLayer.push({ event: eventName, ...params });
      }
    }
    // Send to parent page (omdena.com) via postMessage
    if(typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({
        type: "omdena_tool_event",
        eventName,
        params
      }, "*");
    }
  } catch(e) {
    console.log("GA4 event error:", e);
  }
}

// ─── EMAIL GATE COMPONENT ────────────────────────────────────────────────────

const JOTFORM_ID = "261178454458062";

function EmailGate({title, subtitle, btnText, next, toolUsed, result, vertical, lead, setLead, onSubmit}) {
  return (
    <div className="egate">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <div className="frow">
        <input className="finput" placeholder="Full name" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} />
        <input className="finput" placeholder="Company name" value={lead.company} onChange={e=>setLead({...lead,company:e.target.value})} />
      </div>
      <input className="finput" style={{marginBottom:14}} placeholder="Work email address" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})} />
      <button className="btn" onClick={()=>onSubmit(next, toolUsed, result)} disabled={!lead.name||!lead.email.includes("@")}>{btnText}</button>
      <div className="privacy">🔒 Your data is private and never shared</div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home");
  const [tool, setTool] = useState(null);
  const [vertical, setVertical] = useState(null);
  const [roiInputs, setRoiInputs] = useState({});
  const [roiResults, setRoiResults] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [lead, setLead] = useState({name:"",company:"",email:""});
  const [costState, setCostState] = useState({projectType:null,dataReadiness:null,deployment:null,involvement:null,timeline:null});
  const [costStep, setCostStep] = useState(0);

  const reset = () => {
    setScreen("home"); setTool(null); setVertical(null); setRoiInputs({});
    setRoiResults(null); setAnswers({}); setCurrentQ(0); setScore(0);
    setLead({name:"",company:"",email:""});
    setCostState({projectType:null,dataReadiness:null,deployment:null,involvement:null,timeline:null});
    setCostStep(0);
  };

  const vConfig = vertical ? VERTICALS.find(v=>v.id===vertical) : null;
  const selectTool = (t) => {
    trackEvent("tool_selected", { tool: t });
    setTool(t);
    if(t==="roi") setScreen("roi-vertical");
    else if(t==="assess") setScreen("assess-vertical");
    else setScreen("cost-vertical");
  };
  const calcROI = () => {
    trackEvent("roi_calculated", { vertical });
    setRoiResults(ROI_CONFIG[vertical].calculate(roiInputs));
    setScreen("roi-gate");
  };
  const answerQ = (qId, s) => {
    const na = {...answers,[qId]:s};
    setAnswers(na);
    if(currentQ < ASSESSMENT_QUESTIONS.length-1) setCurrentQ(currentQ+1);
    else {
      const total = Object.values(na).reduce((a,b)=>a+b,0);
      trackEvent("assessment_completed", { vertical, score: total });
      setScore(total);
      setScreen("assess-gate");
    }
  };

  const submitGate = async (next, toolUsed, result) => {
    if(!lead.email.includes("@")||!lead.name) return;
    try {
      const formData = new FormData();
      const nameParts = lead.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const fullName = lead.name.trim();
      const verticalCapitalized = vertical ? vertical.charAt(0).toUpperCase() + vertical.slice(1) : "";
      const utmCampaign = new URLSearchParams(window.location.search).get("utm_campaign") || "";

      // Route to correct JotForm based on tool
      let formId = "";
      if(toolUsed === "ROI Calculator") {
        formId = "261181254868059";
        formData.append("q3_name[first]", firstName);
        formData.append("q3_name[last]", lastName);
        formData.append("q4_companyName", lead.company);
        formData.append("q5_email", lead.email);
        formData.append("q6_toolsUsed", toolUsed);
        formData.append("q7_typeA7", result || "");
        formData.append("q8_typeA8", verticalCapitalized);
        formData.append("q9_displayName", fullName);
        formData.append("q11_utmCampaign", utmCampaign);
      } else if(toolUsed === "AI Readiness Assessment") {
        formId = "261180607481051";
        formData.append("q3_name[first]", firstName);
        formData.append("q3_name[last]", lastName);
        formData.append("q4_companyName", lead.company);
        formData.append("q6_email", lead.email);
        formData.append("q7_toolUsed", toolUsed);
        formData.append("q8_typeA8", result || "");
        formData.append("q9_typeA9", verticalCapitalized);
        formData.append("q11_displayName", fullName);
        formData.append("q12_utmCampaign", utmCampaign);
      } else if(toolUsed === "Project Cost Calculator") {
        formId = "261180767653059";
        formData.append("q3_name[first]", firstName);
        formData.append("q3_name[last]", lastName);
        formData.append("q4_companyName", lead.company);
        formData.append("q6_email", lead.email);
        formData.append("q7_toolUsed", toolUsed);
        formData.append("q8_typeA8", result || "");
        formData.append("q9_typeA9", verticalCapitalized);
        formData.append("q10_displayName", fullName);
        formData.append("q11_utmCampaign", utmCampaign);
      }

      if(formId) {
        await fetch(`https://submit.jotform.com/submit/${formId}/`, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        });
      }
    } catch(e) { console.log("JotForm submit:", e); }
    trackEvent("email_gate_submitted", { tool: toolUsed, vertical });
    setScreen(next);
  };

  const selectCostOpt = (key, val) => {
    const next = {...costState,[key]:val};
    setCostState(next);
    if(costStep < COST_STEPS.length-1) setCostStep(costStep+1);
    else {
      trackEvent("cost_calculator_completed", { vertical });
      setScreen("cost-gate");
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <div className="card">
          <div className="brand">Omdena <span className="brand-pill">AI Tools</span></div>

          {/* HOME */}
          {screen==="home"&&<>
            <h1>Find out how much AI could <em>save your business</em></h1>
            <p className="sub">Calculate your savings, check your AI readiness, or estimate your project cost in under 2 minutes.</p>
            <div className="interactive-hint">👇 Click a tool below to get started</div>
            <div className="tool-grid">
              {[
                {t:"roi",icon:"💰",name:"ROI Calculator",desc:"See how much AI could save your business in real dollars.",cta:"Calculate my savings →"},
                {t:"assess",icon:"🎯",name:"AI Readiness Assessment",desc:"Get a personalized score and action plan for your AI journey.",cta:"Check my readiness →"},
                {t:"cost",icon:"🧮",name:"Project Cost Calculator",desc:"Estimate what an AI project with Omdena would actually cost.",cta:"Estimate my project cost →"},
              ].map(({t,icon,name,desc,cta})=>(
                <div key={t} className="tool-card" onClick={()=>selectTool(t)}>
                  <div className="tc-icon">{icon}</div>
                  <div className="tc-name">{name}</div>
                  <div className="tc-desc">{desc}</div>
                  <div className="tc-cta">{cta}</div>
                </div>
              ))}
            </div>
          </>}

          {/* ── ROI VERTICAL ── */}
          {screen==="roi-vertical"&&<>
            <div className="back" onClick={reset}>← Back</div>
            <div className="chip">ROI Calculator · Step 1 of 2</div>
            <h1 style={{fontSize:26}}>What's your <em>industry?</em></h1>
            <p className="sub" style={{marginBottom:20}}>We tailor the calculation to your operational context.</p>
            <div className="vgrid">
              {VERTICALS.map(v=>(
                <div key={v.id} className={`vbtn${vertical===v.id?" sel":""}`} style={{"--vc":v.color}} onClick={()=>{setVertical(v.id);setScreen("roi-inputs");}}>
                  <span className="vi">{v.icon}</span><span className="vl">{v.label}</span>
                </div>
              ))}
            </div>
          </>}

          {/* ── ROI INPUTS ── */}
          {screen==="roi-inputs"&&vertical&&<>
            <div className="back" onClick={()=>setScreen("roi-vertical")}>← Back</div>
            <div className="chip">{vConfig?.icon} {vConfig?.label} · Step 2 of 2</div>
            <h1 style={{fontSize:26}}>Tell us about your <em>operation</em></h1>
            <p className="sub" style={{marginBottom:22}}>Enter your current figures to calculate your AI savings potential.</p>
            {ROI_CONFIG[vertical].inputs.map(inp=>(
              <div className="igroup" key={inp.id}>
                <label>{inp.label}</label>
                <div className="irow">
                  <input type="number" placeholder={inp.placeholder} value={roiInputs[inp.id]||""} onChange={e=>setRoiInputs({...roiInputs,[inp.id]:e.target.value})} />
                  <span className="iunit">{inp.unit}</span>
                </div>
              </div>
            ))}
            <button className="btn" onClick={calcROI}>Calculate My ROI →</button>
          </>}

          {/* ── ROI GATE ── */}
          {screen==="roi-gate"&&roiResults&&(()=>{
            const total=roiResults.reduce((a,r)=>a+r.monthly,0);
            return <>
              <div className="back" onClick={()=>setScreen("roi-inputs")}>← Back</div>
              <div className="chip">{vConfig?.icon} {vConfig?.label} · Your Results Are Ready</div>
              <h1 style={{fontSize:26,marginBottom:20}}>Your savings report is <em>ready</em></h1>
              <div className="preview-wrap">
                <div className="blur-preview">
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:42,fontWeight:800,color:"#1d4ed8",marginBottom:4}}>{fmt(total)}</div>
                  <div style={{fontSize:13,color:"#6b7280",marginBottom:12}}>estimated monthly savings</div>
                  <div style={{display:"grid",gap:8}}>
                    {roiResults.map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",background:"#f3f4f6",borderRadius:8,padding:"10px 14px"}}>
                        <span style={{fontSize:13,color:"#374151"}}>{r.label}</span>
                        <span style={{fontSize:13,fontWeight:700,color:"#1d4ed8"}}>{fmt(r.monthly)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="preview-overlay">
                  <div className="preview-lock">🔒</div>
                  <div className="preview-lock-text">Enter your details to unlock</div>
                  <div className="preview-lock-sub">Free — takes 10 seconds</div>
                </div>
              </div>
              <EmailGate
                title="Unlock your free AI savings report"
                subtitle="See your full savings breakdown by category. We'll also send a copy to your inbox."
                btnText="Show My Savings Report →"
                next="roi-results"
                toolUsed="ROI Calculator"
                result={`Monthly savings: ${fmt(total)} | Annual: ${fmt(total*12)}`}
                vertical={vertical}
                lead={lead}
                setLead={setLead}
                onSubmit={submitGate}
              />
            </>;
          })()}

          {/* ── ROI RESULTS ── */}
          {screen==="roi-results"&&roiResults&&(()=>{
            const total=roiResults.reduce((a,r)=>a+r.monthly,0);
            return <>
              <div className="chip">{vConfig?.icon} {vConfig?.label} · Full Breakdown</div>
              <h1 style={{fontSize:26,marginBottom:20}}>Your <em>AI savings</em> breakdown</h1>
              <div className="roi-preview">
                <div className="rp-label">Total Estimated Monthly Savings</div>
                <div className="rp-value">{fmt(total)}</div>
                <div className="rp-sub">≈ {fmt(total*12)} per year · based on industry benchmarks</div>
              </div>
              <div className="rgrid">
                {roiResults.map((r,i)=>(
                  <div className="rrow" key={i}>
                    <div><div className="rlab">{r.label}</div><div className="rnote">{r.note}</div></div>
                    <div className="rval">{fmt(r.monthly)}<span style={{fontSize:11,color:"#9ca3af"}}>/mo</span></div>
                  </div>
                ))}
              </div>
              <div className="cta-box">
                <h3>Want to capture this ROI?</h3>
                <p>Omdena has delivered AI projects across {vConfig?.label.toLowerCase()} and 10+ other sectors. Let's see what's possible for you.</p>
                <button className="cbtn" onClick={()=>window.open("https://www.omdena.com/contact-us","_blank")}>Book a Free Consultation →</button>
              </div>
              <button className="btn-out" onClick={reset}>← Start over</button>
            </>;
          })()}

          {/* ── ASSESS VERTICAL ── */}
          {screen==="assess-vertical"&&<>
            <div className="back" onClick={reset}>← Back</div>
            <div className="chip">AI Readiness · Select Industry</div>
            <h1 style={{fontSize:26}}>What's your <em>industry?</em></h1>
            <p className="sub" style={{marginBottom:20}}>We'll frame each question in your operational context.</p>
            <div className="vgrid">
              {VERTICALS.map(v=>(
                <div key={v.id} className={`vbtn${vertical===v.id?" sel":""}`} style={{"--vc":v.color}} onClick={()=>{setVertical(v.id);setScreen("assess-questions");}}>
                  <span className="vi">{v.icon}</span><span className="vl">{v.label}</span>
                </div>
              ))}
            </div>
          </>}

          {/* ── ASSESS QUESTIONS ── */}
          {screen==="assess-questions"&&<>
            <div className="back" onClick={()=>currentQ===0?setScreen("assess-vertical"):setCurrentQ(currentQ-1)}>← Back</div>
            <div className="qbar">
              <span className="chip" style={{margin:0,whiteSpace:"nowrap"}}>Q {currentQ+1}/{ASSESSMENT_QUESTIONS.length}</span>
              <div className="qprog"><div className="qfill" style={{width:`${((currentQ+1)/ASSESSMENT_QUESTIONS.length)*100}%`}} /></div>
            </div>
            <div className="qtext">{ASSESSMENT_QUESTIONS[currentQ].question}</div>
            <div className="opts">
              {ASSESSMENT_QUESTIONS[currentQ].options.map((opt,i)=>(
                <button key={i} className={`opt${answers[ASSESSMENT_QUESTIONS[currentQ].id]===opt.score?" sel":""}`} onClick={()=>answerQ(ASSESSMENT_QUESTIONS[currentQ].id,opt.score)}>
                  <div className="oradio" />{opt.label}
                </button>
              ))}
            </div>
          </>}

          {/* ── ASSESS GATE ── */}
          {screen==="assess-gate"&&(()=>{
            const tier=getTier(score);
            return <>
              <div className="back" onClick={()=>{setCurrentQ(ASSESSMENT_QUESTIONS.length-1);setScreen("assess-questions");}}>← Back</div>
              <div className="chip">{vConfig?.icon} {vConfig?.label} · Your Score Is Ready</div>
              <h1 style={{fontSize:26,marginBottom:20}}>Your readiness report is <em>ready</em></h1>
              <div className="preview-wrap">
                <div className="blur-preview">
                  <div className="scircle" style={{borderColor:tier.color,margin:"0 auto 14px"}}>
                    <span className="snum" style={{color:tier.color}}>{score}</span>
                    <span className="sdenom">out of 80</span>
                  </div>
                  <div className="sbadge" style={{borderColor:tier.color+"55",color:tier.color,background:tier.color+"11",margin:"0 auto 10px",display:"inline-flex"}}>{tier.emoji} {tier.label}</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:17,fontWeight:700,color:"#111",marginBottom:8}}>{tier.headline}</div>
                  <div style={{fontSize:13,color:"#6b7280"}}>{tier.desc}</div>
                </div>
                <div className="preview-overlay">
                  <div className="preview-lock">🔒</div>
                  <div className="preview-lock-text">Enter your details to unlock</div>
                  <div className="preview-lock-sub">Free — takes 10 seconds</div>
                </div>
              </div>
              <EmailGate
                title="Unlock your free AI Readiness Report"
                subtitle="See your score, tier and personalised action plan. We'll also send a copy to your inbox."
                btnText="Show My Readiness Report →"
                next="assess-results"
                toolUsed="AI Readiness Assessment"
                result={`Score: ${score}/80 | Tier: ${tier.label}`}
                vertical={vertical}
                lead={lead}
                setLead={setLead}
                onSubmit={submitGate}
              />
            </>;
          })()}

          {/* ── ASSESS RESULTS ── */}
          {screen==="assess-results"&&(()=>{
            const tier=getTier(score);
            return <>
              <div className="chip">{vConfig?.icon} {vConfig?.label} · Full Report</div>
              <div style={{textAlign:"center",padding:"20px 0 14px"}}>
                <div className="scircle" style={{borderColor:tier.color}}>
                  <span className="snum" style={{color:tier.color}}>{score}</span>
                  <span className="sdenom">out of 80</span>
                </div>
                <div className="sbadge" style={{borderColor:tier.color+"55",color:tier.color,background:tier.color+"11"}}>{tier.emoji} {tier.label}</div>
                <div className="shead">{tier.headline}</div>
                <div className="sdesc">{tier.desc}</div>
              </div>
              <div className="alist">
                <div className="altitle">Your personalised next steps</div>
                {tier.actions.map((a,i)=><div className="aitem" key={i}>{a}</div>)}
              </div>
              <div className="cta-box">
                <h3>Ready to take the next step?</h3>
                <p>Omdena works with SMEs at every readiness stage — from data foundation to full AI deployment.</p>
                <button className="cbtn" onClick={()=>window.open("https://www.omdena.com/contact-us","_blank")}>Talk to an Omdena Expert →</button>
              </div>
              <button className="btn-out" onClick={reset}>← Start over</button>
            </>;
          })()}

          {/* ── COST VERTICAL ── */}
          {screen==="cost-vertical"&&<>
            <div className="back" onClick={reset}>← Back</div>
            <div className="chip">Project Cost Calculator · Select Industry</div>
            <h1 style={{fontSize:26}}>What's your <em>industry?</em></h1>
            <p className="sub" style={{marginBottom:20}}>We'll tailor the cost estimate to your sector.</p>
            <div className="vgrid">
              {VERTICALS.map(v=>(
                <div key={v.id} className={`vbtn${vertical===v.id?" sel":""}`} style={{"--vc":v.color}} onClick={()=>{setVertical(v.id);setScreen("cost-q");}}>
                  <span className="vi">{v.icon}</span><span className="vl">{v.label}</span>
                </div>
              ))}
            </div>
          </>}

          {/* ── COST QUESTIONS ── */}
          {screen==="cost-q"&&(()=>{
            const step=COST_STEPS[costStep];
            return <>
              <div className="back" onClick={()=>costStep===0?setScreen("cost-vertical"):setCostStep(costStep-1)}>← Back</div>
              <div className="qbar">
                <span className="chip" style={{margin:0,whiteSpace:"nowrap"}}>Step {costStep+1}/{COST_STEPS.length}</span>
                <div className="qprog"><div className="qfill" style={{width:`${((costStep+1)/COST_STEPS.length)*100}%`}} /></div>
              </div>
              <div className="chip" style={{marginBottom:6}}>AI Project Cost Calculator</div>
              <div className="qtext">{step.label}</div>
              <div className="cost-opts">
                {step.options.map(opt=>(
                  <div key={opt.id} className={`copt${costState[step.key]===opt.id?" sel":""}`} onClick={()=>selectCostOpt(step.key,opt.id)}>
                    <span className="copt-icon">{opt.icon}</span>
                    <div className="copt-info">
                      <div className="copt-label">{opt.label}</div>
                      <div className="copt-desc">{opt.desc}</div>
                    </div>
                    <div className="copt-check" />
                  </div>
                ))}
              </div>
            </>;
          })()}

          {/* ── COST GATE ── */}
          {screen==="cost-gate"&&(()=>{
            const r=calcCost(costState);
            if(!r) return null;
            return <>
              <div className="back" onClick={()=>{setCostStep(COST_STEPS.length-1);setScreen("cost-q");}}>← Back</div>
              <div className="chip">AI Project Cost Calculator · Your Estimate Is Ready</div>
              <h1 style={{fontSize:26,marginBottom:20}}>Your project estimate is <em>ready</em></h1>
              <div className="preview-wrap">
                <div className="blur-preview">
                  <div style={{background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",borderRadius:12,padding:"20px 24px",color:"#fff",marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#93c5fd",marginBottom:6}}>Estimated Project Investment</div>
                    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:34,fontWeight:800}}>{fmt(r.low)} – {fmt(r.high)}</div>
                    <div style={{fontSize:13,color:"#93c5fd",marginTop:4}}>Timeline: {r.wLow}–{r.wHigh} weeks</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {["Project Type","Timeline","Deployment","Engagement"].map((l,i)=>(
                      <div key={i} style={{background:"#f3f4f6",borderRadius:8,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{l}</div>
                        <div style={{fontSize:13,fontWeight:700,color:"#111"}}>████████</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="preview-overlay">
                  <div className="preview-lock">🔒</div>
                  <div className="preview-lock-text">Enter your details to unlock</div>
                  <div className="preview-lock-sub">Free — takes 10 seconds</div>
                </div>
              </div>
              <EmailGate
                title="Unlock your free project estimate"
                subtitle="See your full cost breakdown and scope. An Omdena specialist can turn this into a formal proposal within 48 hours."
                btnText="Show My Cost Estimate →"
                next="cost-results"
                toolUsed="Project Cost Calculator"
                result={`Estimate: ${fmt(r.low)} – ${fmt(r.high)} | Timeline: ${r.wLow}–${r.wHigh} weeks`}
                vertical={vertical}
                lead={lead}
                setLead={setLead}
                onSubmit={submitGate}
              />
            </>;
          })()}

          {/* ── COST RESULTS ── */}
          {screen==="cost-results"&&(()=>{
            const r=calcCost(costState);
            if(!r) return null;
            const invLabel=INVOLVEMENT_OPTIONS.find(i=>i.id===costState.involvement)?.label;
            const depLabel=DEPLOY_OPTIONS.find(d=>d.id===costState.deployment)?.label;
            const timLabel=TIMELINE_OPTIONS.find(t=>t.id===costState.timeline)?.label;
            return <>
              <div className="chip">AI Project Cost Calculator · Full Breakdown</div>
              <div className="cost-preview">
                <div className="cp-label">Estimated Project Investment</div>
                <div className="cp-range">{fmt(r.low)} – {fmt(r.high)}</div>
                <div className="cp-sub">Indicative range · Final proposal may vary based on detailed scope</div>
              </div>
              <div className="cost-bd">
                <div className="cbd"><div className="cbd-label">Project Type</div><div className="cbd-value">{r.pt.label}</div><div className="cbd-note">{r.pt.desc}</div></div>
                <div className="cbd"><div className="cbd-label">Timeline</div><div className="cbd-value">{r.wLow}–{r.wHigh} weeks</div><div className="cbd-note">{timLabel} delivery pace</div></div>
                <div className="cbd"><div className="cbd-label">Deployment</div><div className="cbd-value">{depLabel}</div><div className="cbd-note">How AI will be accessed</div></div>
                <div className="cbd"><div className="cbd-label">Engagement</div><div className="cbd-value">{invLabel}</div><div className="cbd-note">Team involvement level</div></div>
              </div>
              <div className="alist">
                <div className="altitle">What's included in your project</div>
                {["Discovery and requirement scoping","Data pipeline setup and cleaning","Model development and training","Testing, validation and QA","Deployment and integration support","30-day post-launch support"].map((item,i)=>(
                  <div className="aitem" key={i}>{item}</div>
                ))}
              </div>
              <div className="cta-box">
                <h3>Want a formal proposal?</h3>
                <p>Our team can turn this estimate into a detailed scope of work within 48 hours — at no cost to you.</p>
                <button className="cbtn" onClick={()=>window.open("https://www.omdena.com/contact-us","_blank")}>Request a Free Proposal →</button>
              </div>
              <button className="btn-out" onClick={reset}>← Start over</button>
            </>;
          })()}

        </div>
      </div>
    </>
  );
}
