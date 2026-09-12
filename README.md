# Venture Insights — Customer Segmentation & Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![K-Modes](https://img.shields.io/badge/Algorithm-K--Modes%20(K%3D5)-2563EB?style=flat)](https://github.com/nicodv/kmodes)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![Validation](https://img.shields.io/badge/Audit-36--Point%20Framework%20PASSED-10B981?style=flat)](#36-point-solution-validation-audit-suite)

An enterprise-grade customer intelligence platform built on a rigorous **K-Modes (K=5) categorical segmentation model** for **3,030 casino-machine accounts**. The repository combines advanced data science modeling, Gower distance metrics, structural validation, outlier sensitivity analysis, and an interactive light-theme executive intelligence dashboard.

---

## 📌 Executive Overview

Venture Insights provides sales leaders, account managers, and marketing strategists with actionable customer segmentation data. Rather than relying on simple numerical averages, the model accounts for the purely categorical nature of casino machine attributes to group accounts by behavioral modes, expansion potential, and market competitiveness.

### Key Portfolio Metrics
- **Total Portfolio Volume**: 3,030 Casino Accounts
- **High-Priority Accounts**: 1,204 Accounts (39.7% of portfolio)
- **Strategic Whales**: 45 Tier-1 High-Value Accounts (1.5%)
- **Behavioral Anomalies**: 54 Flagged Outlier Accounts (1.8%)
- **Prospect Structure**: 58.7% Unprofiled Prospects vs 41.3% Active Transactors

---

## 🔬 Data Science Methodology & Modeling

### 1. Data Cleaning & MNAR Missingness Discovery
- **Reconciliation of Missing Markers**: Reconciled 3 distinct missing tokens (`'None'`, true `NaN`, and `'-'`) into a unified `NP` (Not Profiled) status.
- **MNAR Missingness Pattern**: Proved that missingness across behavioral fields (`Revenue_Bucket`, `Profit_Bucket`, `Market_Share_Segment`) is **Missing Not At Random (MNAR)**. 1,778 accounts go missing together, representing unprofiled prospect accounts ("never transacted") rather than random data loss.

### 2. Feature Selection via Cramér's V
Categorized all 18 attributes into four distinct functional blocks:
- **Core Behavioral**: `Revenue_Bucket`, `Profit_Bucket`, `Market_Share_Segment`, `Market_Potential_Segment`, `Churn_Segment`, `Seasonality_Segment`, `EA_Segment`
- **Opportunity & Intent**: `Competitiveness_Flag`, `Propensity`, `Volume_Segment`, `Density_Segment`
- **Geography Block (Excluded from Model)**: `Country`, `State_Code`, `Postal_Code`, `City`
- **Primary Key**: `Customer_ID`

> **Feature Pruning**: `Casino_Size_Segment` was dropped due to **Cramér's V = 0.97** with `Market_Potential_Segment` (near-identical categories under two names; keeping both would double-weight size). Raw geography was excluded from clustering to prevent geography-led grouping, but retained for profiling overlays. `Competitiveness_Flag` was explicitly retained as the competitive defense lever.

### 3. Clustering Algorithm & Model Selection
- **Algorithm**: **K-Modes** with Huang initialization (`n_init=25`, `random_state=42`) using matching dissimilarity.
- **Multi-Metric Evaluation (K=2 to K=7)**:
  - **K=2**: Gower Silhouette 0.68 | DB 0.42 | ARI 0.99 (Coarse Profiled vs Prospect split)
  - **K=5 (CHOSEN)**: Gower Silhouette 0.60 | DB 0.57 | ARI 0.90 (Optimal operational balance)

### 4. Structural Validation Honesty Check
- **Full Population Silhouette**: 0.60 (inflated by the dominant profiled vs prospect split).
- **Profiled-Subset Silhouette**: 0.21–0.35.
- *Analytical Finding*: `High-Potential Growth Champions` separates cleanly even within the profiled subset (robust archetype). The boundary between `Loyal Core` and `Under-Profiled Active` is softer and functions as an operational action tier.

### 5. Multi-Layer Outlier Framework
- Multi-method detection combining (1) Business-rule logical inconsistencies, (2) Thin-cell rare category sweeps, and (3) Isolation Forest across 0.5%, 1%, 2%, and 5% contamination rates.
- *Robustness Verification*: Re-running K-Modes post outlier removal proved high ARI agreement (> 0.90), confirming cluster boundaries are not driven by extreme outliers.

---

## 🎯 The 5 Customer Segments & Sales Playbooks

| Segment Name | Portfolio % | Priority | Mode Traits | Recommended Strategy |
| :--- | :---: | :---: | :--- | :--- |
| **High-Potential Growth Champions** | 8.3% | **High** | High Revenue, High Potential, High Propensity | Personalized premium upsells, exclusive product previews, dedicated AMs |
| **Loyal Profitable Core** | 14.4% | **High** | High Profit, High Share, Low Churn Risk | 'Benefits Bonanza' loyalty program, renewal focus, NPS farming |
| **Under-Profiled Active Accounts** | 8.0% | **Medium** | Active Transactor, NP Market Share | Profiling data drive, discovery calls to score potential |
| **Contested-Market Prospects** | 47.9% | **Medium** | Competitive Metro, Unprofiled Prospect | Competitive switching offers, localized metro campaigns, targeted sales |
| **Open-Market Prospects** | 21.4% | **Low** | Uncontested Metro, Unprofiled Prospect | Low-touch automated nurture, lead scoring gate before sales spend |

---

## 🖥️ Executive Interactive Dashboard Features

The web dashboard is built using Vite, React 18, Recharts, and Lucide Icons with a warm light-neutral design system:

- **Executive Overview**: KPI metric strip, portfolio structure summary, horizontal cluster volume bar chart, MCA 2D scatter plot, and ranked state density list.
- **Results & Key Findings**: Editorial analytical report with numbered sections (`01 DATA DISCOVERY`, `02 MODEL VALIDATION`, `03 FEATURE SELECTION`), multi-metric K-selection tables, and Cramér's V matrices.
- **Segment Strategy Workspaces**: Interactive tab selector for switching between cluster playbooks, detailing profile traits, opportunities, marketing campaigns, and sales motions.
- **Account Explorer Directory**: High-density table searching and filtering 3,030 accounts with state, priority, whale, and anomaly controls, plus slide-over profile inspector drawer.
- **Real-Time K-Modes Lead Classifier**: Interactive form to input prospective account traits and calculate instant segment assignments and outreach playbooks.
- **36-Point Audit Suite**: Complete compliance log tracking data ingestion, identity uniqueness, model stability, and business alignment checks.

---

## 📂 Repository Structure

```
Venture-Insights/
├── Clustering_Data.ftr                # Feather customer dataset (3,030 rows x 18 cols)
├── customer_mapping.csv               # Customer cluster assignments & priority flags
├── VentureInsights_Segmentation.ipynb # Main analytical data science Jupyter Notebook
├── generate_dashboard_data.py         # Data pipeline script compiling public JSON payload
├── segmentation_dashboard_data.json   # Processed JSON bundle for dashboard client
├── package.json                       # Node dependencies & npm build scripts
├── vite.config.js                     # Vite application configuration
├── index.html                         # Entry HTML with Inter typography fonts
├── public/                            # Static assets and dashboard JSON bundle
├── src/                               # Web dashboard application source code
│   ├── App.jsx                        # Main React application & layout workspace
│   ├── index.css                      # Design system (Warm neutral tokens, enterprise tables)
│   └── main.jsx                       # React DOM root entry point
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Data Pipeline Execution
To re-generate the client dashboard payload from the source Feather and CSV files:
```bash
python generate_dashboard_data.py
```

### 2. Launch Development Web Dashboard
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```
Open your browser at **`http://localhost:3000/`**.

### 3. Production Build
```bash
npm run build
```

---

## 📋 36-Point Solution Validation Audit Suite

The segmentation solution undergoes a mandatory 36-check validation framework prior to deployment:
- **Category A (Ingestion)**: Schema drift validation, column count assertion.
- **Category B (Identity)**: `Customer_ID` 100% uniqueness check, duplicate row scan.
- **Category C (Completeness)**: Unified missing marker reconciliation, MNAR correlation test.
- **Category D–F (Model & Stability)**: Cramér's V redundancy pruning, Gower Silhouette evaluation, 12-rep subsample ARI stability (> 0.90).
- **Category G–K (Outliers & Governance)**: Isolation Forest robustness sweep, excluded geography overlay check, transparent rule-based segment naming.

---

## 📄 License & Attribution
Designed and developed for **Venture Insights Customer Intelligence**. All rights reserved.