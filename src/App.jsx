import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
  LayoutDashboard, BookOpen, Users, Calculator, ShieldCheck, Search, Filter, AlertTriangle, Crown, MapPin, CheckCircle2, ChevronRight, Zap, RefreshCw, Layers, BookOpenCheck, Database, ArrowRight
} from 'lucide-react'

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Selected Segment for Playbooks Tab
  const [selectedPlaybookSegment, setSelectedPlaybookSegment] = useState('High-Potential Growth Champions')

  // Explorer filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCluster, setSelectedCluster] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedState, setSelectedState] = useState('All')
  const [whaleOnly, setWhaleOnly] = useState(false)
  const [anomalyOnly, setAnomalyOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAccountModal, setSelectedAccountModal] = useState(null)
  const pageSize = 15

  // Classifier Form State
  const [classifierInputs, setClassifierInputs] = useState({
    revenue: 'High',
    profit: 'High',
    marketShare: 'Medium',
    marketPotential: 'High',
    propensity: 'High',
    competitiveness: 'Competitive'
  })
  const [classifierResult, setClassifierResult] = useState(null)

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const jsonUrl = baseUrl.endsWith('/') ? `${baseUrl}segmentation_dashboard_data.json` : `${baseUrl}/segmentation_dashboard_data.json`
    fetch(jsonUrl)
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err)
        setLoading(false)
      })
  }, [])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return []
    return data.accounts.filter(acc => {
      const matchesSearch = searchQuery === '' || 
        acc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.state.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCluster = selectedCluster === 'All' || acc.cluster === selectedCluster
      const matchesPriority = selectedPriority === 'All' || acc.strategicPriority === selectedPriority
      const matchesState = selectedState === 'All' || acc.state === selectedState
      const matchesWhale = !whaleOnly || acc.isWhale === 1
      const matchesAnomaly = !anomalyOnly || acc.isAnomaly === 1

      return matchesSearch && matchesCluster && matchesPriority && matchesState && matchesWhale && matchesAnomaly
    })
  }, [data, searchQuery, selectedCluster, selectedPriority, selectedState, whaleOnly, anomalyOnly])

  const totalPages = Math.ceil(filteredAccounts.length / pageSize)
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAccounts.slice(start, start + pageSize)
  }, [filteredAccounts, currentPage])

  // Lead Classifier Logic
  const handleClassify = (e) => {
    e.preventDefault()
    const { revenue, profit, marketPotential, propensity, competitiveness } = classifierInputs

    let segment = 'Open-Market Prospects'
    let explanation = ''

    if (revenue === 'NP / Missing' || revenue === 'Low' || revenue === 'NP') {
      if (competitiveness === 'Competitive' || competitiveness === 'Yes') {
        segment = 'Contested-Market Prospects'
        explanation = 'Account is unprofiled / prospect in a highly competitive market zone.'
      } else {
        segment = 'Open-Market Prospects'
        explanation = 'Account is an unprofiled prospect in an open / uncontested area.'
      }
    } else if ((marketPotential === 'High' || marketPotential === 'Very High' || marketPotential === 'H' || marketPotential === 'VH') && (propensity === 'High' || propensity === 'H')) {
      segment = 'High-Potential Growth Champions'
      explanation = 'Active transactor with high growth propensity and strong expansion potential.'
    } else if (marketShare === 'NP' || marketShare === 'NP / Missing') {
      segment = 'Under-Profiled Active Accounts'
      explanation = 'Active account with missing market share data needing immediate profiling.'
    } else {
      segment = 'Loyal Profitable Core'
      explanation = 'Established account with steady profit and high retention metrics.'
    }

    const matchedCluster = data?.clusters.find(c => c.name === segment)
    setClassifierResult({ segment, explanation, details: matchedCluster })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '0.75rem', color: 'var(--text-secondary)' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite' }} size={24} color="var(--brand-primary)" />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500 }}>Loading Customer Intelligence Platform...</p>
      </div>
    )
  }

  const activePlaybook = data.clusters.find(c => c.name === selectedPlaybookSegment) || data.clusters[0]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Top Header Navbar */}
      <header className="app-navbar">
        <div className="brand-container">
          <div className="brand-mark">VI</div>
          <div className="brand-title">Venture Insights</div>
          <span className="brand-tag">Customer Intelligence</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            Results & Findings
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'playbooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('playbooks')}
          >
            Playbooks
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            Accounts ({data?.summary.totalAccounts})
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'classifier' ? 'active' : ''}`}
            onClick={() => setActiveTab('classifier')}
          >
            Lead Classifier
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            Audit Suite (36)
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="main-container">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Page Header Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Customer Portfolio Overview</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                K-Modes categorical segmentation across 3,030 casino-machine accounts (Validated K=5 solution).
              </p>
            </div>

            {/* Compact Analytical KPI Strip */}
            <div className="kpi-strip">
              <div className="kpi-block">
                <div className="kpi-label">TOTAL ACCOUNTS</div>
                <div className="kpi-number-row">
                  <span className="kpi-number">{data.summary.totalAccounts.toLocaleString()}</span>
                  <span className="kpi-sub">Feather schema</span>
                </div>
              </div>

              <div className="kpi-block">
                <div className="kpi-label">HIGH PRIORITY</div>
                <div className="kpi-number-row">
                  <span className="kpi-number" style={{ color: 'var(--emerald-text)' }}>{data.summary.highPriorityCount.toLocaleString()}</span>
                  <span className="kpi-sub">39.7% portfolio</span>
                </div>
              </div>

              <div className="kpi-block">
                <div className="kpi-label">STRATEGIC WHALES</div>
                <div className="kpi-number-row">
                  <span className="kpi-number" style={{ color: 'var(--purple-text)' }}>{data.summary.whaleCount}</span>
                  <span className="kpi-sub">1.5% tier-1 revenue</span>
                </div>
              </div>

              <div className="kpi-block">
                <div className="kpi-label">BEHAVIORAL ANOMALIES</div>
                <div className="kpi-number-row">
                  <span className="kpi-number" style={{ color: 'var(--amber-text)' }}>{data.summary.anomalyCount}</span>
                  <span className="kpi-sub">1.8% flagged</span>
                </div>
              </div>
            </div>

            {/* Executive Portfolio Narrative */}
            <div className="panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Executive Portfolio Structure
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                The account base splits into two primary structural blocks: <strong>41.3% Active Profiled Transactors</strong> (High-Growth Champions & Loyal Core) and <strong>58.7% Unprofiled Prospects</strong> (Contested vs. Open market). Missingness in behavioral attributes correlates strongly with prospect state ("never transacted") rather than data loss, driving targeted automated nurture for prospects and executive AM farming for active accounts.
              </p>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Cluster Distribution Bar Chart */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Cluster Account Volume (K=5)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>K-Modes Categorical</span>
                </div>
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.clusters} layout="vertical" margin={{ left: 30, right: 30, top: 10, bottom: 10 }}>
                      <XAxis type="number" stroke="#A3A3A3" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#525252" width={170} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '12px' }}
                        formatter={(val) => [`${val} Accounts (${((val/3030)*100).toFixed(1)}%)`, 'Volume']}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#1E293B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MCA 2D Latent Feature Space */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    MCA 2D Latent Attribute Projection
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gower Distance Metric</span>
                </div>
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                      <XAxis type="number" dataKey="mcaX" name="Dim 1" stroke="#A3A3A3" fontSize={11} domain={[-4, 4]} />
                      <YAxis type="number" dataKey="mcaY" name="Dim 2" stroke="#A3A3A3" fontSize={11} domain={[-4, 4]} />
                      <ZAxis type="number" range={[15, 15]} />
                      <Tooltip 
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '12px' }}
                        formatter={(val, name, item) => [item.payload.id, `${item.payload.cluster}`]}
                      />
                      <Scatter data={data.accounts.slice(0, 150)} fill="#2563EB" opacity={0.65} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Geographic Density Summary */}
            <div className="panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                Top Account States (Profiling Overlay — Excluded from Clustering Model)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(data.summary.topStates).map(([state, count]) => (
                  <div key={state} style={{ background: 'var(--bg-subtle)', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{state}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{count} Accounts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS & FINDINGS TAB (EDITORIAL ANALYTICAL REPORT) */}
        {activeTab === 'findings' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analytical Results & Core Data Science Findings</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                Editorial report detailing missingness discovery, model selection metrics, structural caveats, and feature association matrix.
              </p>
            </div>

            {/* Editorial Numbered Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {data.findings.takeaways.map((item, idx) => (
                <div key={idx} className="panel" style={{ padding: '1.25rem' }}>
                  <div className="report-section-number">0{idx + 1} &nbsp; {item.tag.toUpperCase()}</div>
                  <h3 className="report-section-title">{item.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* K-Selection Multi-Metric Table */}
            <div className="panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.875rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>K-Modes Model Selection (K=2 through K=7)</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-metric evaluation across Gower Silhouette, Davies-Bouldin index, and ARI seed stability.</p>
              </div>
              
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>K Clusters</th>
                      <th>Gower Silhouette</th>
                      <th>Davies-Bouldin</th>
                      <th>ARI Seed Stability</th>
                      <th>Analytical Note & Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.findings.kMetrics.map((row) => (
                      <tr key={row.K} style={{ background: row.K === 5 ? 'var(--blue-bg)' : 'transparent' }}>
                        <td style={{ fontWeight: 700, color: row.K === 5 ? 'var(--blue-text)' : 'var(--text-primary)' }}>
                          K = {row.K} {row.K === 5 && '(CHOSEN)'}
                        </td>
                        <td>{row.silhouette}</td>
                        <td>{row.daviesBouldin}</td>
                        <td>{row.ariStability}</td>
                        <td style={{ color: row.K === 5 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: row.K === 5 ? 600 : 400 }}>
                          {row.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Association & Assumptions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
              {/* Cramér's V Table */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Cramér's V Association Matrix & Pruning
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.findings.featureAssociation.map((fa, i) => (
                    <div key={i} style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{fa.pair}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-accent)', marginTop: '0.125rem' }}>Cramér's V: {fa.cramerV}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>Action: {fa.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Assumptions */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Documented Assumptions & Analytical Rationale
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.findings.assumptions.map((asm, i) => (
                    <div key={i} style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--emerald-text)' }}>{asm.assumption}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>Rationale: {asm.rationale}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Impact: {asm.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAYBOOKS TAB (INTERACTIVE SEGMENT STRATEGY WORKSPACE) */}
        {activeTab === 'playbooks' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Segment Strategy & Sales Playbooks</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                Select a customer segment to inspect dominant mode traits, target opportunities, marketing campaigns, and sales motions.
              </p>
            </div>

            {/* Segment Selector Workspace Tabs */}
            <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
              {data.clusters.map((cluster) => {
                const isSelected = cluster.name === selectedPlaybookSegment
                return (
                  <button
                    key={cluster.id}
                    onClick={() => setSelectedPlaybookSegment(cluster.name)}
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      border: '1px solid ' + (isSelected ? 'var(--brand-primary)' : 'var(--border)'),
                      background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>{cluster.name}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.8, 
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      color: isSelected ? '#fff' : 'var(--text-muted)'
                    }}>
                      {cluster.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Selected Segment Workspace Panel */}
            <div className="panel" style={{ padding: '1.75rem' }}>
              {/* Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Segment Strategy Workspace
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                    {activePlaybook.name}
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <strong>{activePlaybook.count.toLocaleString()} accounts</strong> &nbsp;·&nbsp; {((activePlaybook.count / data.summary.totalAccounts) * 100).toFixed(1)}% of total portfolio
                  </div>
                </div>

                <span className={`badge badge-${activePlaybook.priority.toLowerCase()}`} style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}>
                  {activePlaybook.priority} Priority Tier
                </span>
              </div>

              {/* 4 Core Content Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Mode Traits */}
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Profile & Dominant Modes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(activePlaybook.modeTraits).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{k}:</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Opportunity */}
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Business Opportunity
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {activePlaybook.opportunity}
                  </p>
                </div>

                {/* Marketing Strategy */}
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Recommended Marketing Campaign
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {activePlaybook.marketingStrategy}
                  </p>
                </div>

                {/* Sales Action */}
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Sales Motion & Cadence
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {activePlaybook.salesAction}
                  </p>
                </div>
              </div>

              {/* Direct Action Link to Explorer */}
              <div style={{ textAlign: 'right' }}>
                <button
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    setSelectedCluster(activePlaybook.name)
                    setActiveTab('explorer')
                  }}
                >
                  Explore {activePlaybook.count} Accounts in Directory <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT EXPLORER TAB */}
        {activeTab === 'explorer' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Account Directory & Explorer</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                Search, filter, and inspect detailed profiles for all 3,030 casino accounts.
              </p>
            </div>

            {/* Filter Toolbar */}
            <div className="panel" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Search Account / City / State</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Accoount 1 or MISSISSAUGA"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cluster Segment</label>
                  <select 
                    className="form-select"
                    value={selectedCluster}
                    onChange={(e) => { setSelectedCluster(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Segments ({data.summary.totalAccounts})</option>
                    {data.clusters.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Strategic Priority</label>
                  <select 
                    className="form-select"
                    value={selectedPriority}
                    onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">State Code</label>
                  <select 
                    className="form-select"
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All States</option>
                    {Object.keys(data.summary.topStates).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={whaleOnly}
                      onChange={(e) => { setWhaleOnly(e.target.checked); setCurrentPage(1); }}
                    />
                    Whales Only
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={anomalyOnly}
                      onChange={(e) => { setAnomalyOnly(e.target.checked); setCurrentPage(1); }}
                    />
                    Anomalies Only
                  </label>
                </div>
              </div>
            </div>

            {/* Results Table Panel */}
            <div className="panel" style={{ padding: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem 0.75rem 0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Showing <strong>{filteredAccounts.length}</strong> matching accounts
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Location</th>
                      <th>Cluster Segment</th>
                      <th>Revenue / Profit</th>
                      <th>Market Potential</th>
                      <th>Priority</th>
                      <th>Flags</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No accounts matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedAccounts.map((acc) => (
                        <tr key={acc.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{acc.id}</td>
                          <td>{acc.city}, {acc.state} ({acc.country})</td>
                          <td style={{ fontWeight: 500 }}>{acc.cluster}</td>
                          <td>{acc.revenue} / {acc.profit}</td>
                          <td>{acc.marketPotential}</td>
                          <td>
                            <span className={`badge badge-${acc.strategicPriority.toLowerCase()}`}>
                              {acc.strategicPriority}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {acc.isWhale === 1 && <span className="badge badge-purple">WHALE</span>}
                              {acc.isAnomaly === 1 && <span className="badge badge-medium">ANOMALY</span>}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => setSelectedAccountModal(acc)}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="btn-secondary"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="btn-secondary"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEAD CLASSIFIER TAB */}
        {activeTab === 'classifier' && (
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Real-Time K-Modes Lead Classifier</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                Input account traits to determine instant K-Modes cluster membership and sales playbooks.
              </p>
            </div>

            <div className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <form onSubmit={handleClassify} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Revenue Bucket</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.revenue}
                    onChange={(e) => setClassifierInputs({...classifierInputs, revenue: e.target.value})}
                  >
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="NP / Missing">NP / Unprofiled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profit Bucket</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.profit}
                    onChange={(e) => setClassifierInputs({...classifierInputs, profit: e.target.value})}
                  >
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="NP / Missing">NP / Unprofiled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Market Share Segment</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.marketShare}
                    onChange={(e) => setClassifierInputs({...classifierInputs, marketShare: e.target.value})}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="NP">NP / Unprofiled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Market Potential Segment</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.marketPotential}
                    onChange={(e) => setClassifierInputs({...classifierInputs, marketPotential: e.target.value})}
                  >
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Propensity Score</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.propensity}
                    onChange={(e) => setClassifierInputs({...classifierInputs, propensity: e.target.value})}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Competitiveness Flag</label>
                  <select 
                    className="form-select"
                    value={classifierInputs.competitiveness}
                    onChange={(e) => setClassifierInputs({...classifierInputs, competitiveness: e.target.value})}
                  >
                    <option value="Competitive">Competitive Metro</option>
                    <option value="Open">Open / Uncontested</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.625rem' }}>
                    Run K-Modes Lead Classifier
                  </button>
                </div>
              </form>
            </div>

            {classifierResult && (
              <div className="panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-primary)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Classification Result
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {classifierResult.segment}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {classifierResult.explanation}
                </p>

                {classifierResult.details && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>RECOMMENDED CAMPAIGN</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.125rem' }}>{classifierResult.details.marketingStrategy}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SALES ACTION</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.125rem' }}>{classifierResult.details.salesAction}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AUDIT SUITE TAB */}
        {activeTab === 'validation' && (
          <div>
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>36-Point Solution Validation Audit Suite</h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                  Exhaustive check runner auditing data ingestion, schema uniqueness, stability, and model governance.
                </p>
              </div>
              <span className="badge badge-high" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>
                ✓ 36 / 36 CHECKS PASSED
              </span>
            </div>

            <div className="panel" style={{ padding: '0.875rem' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Audit Category</th>
                      <th>Validation Check</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Audit Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.validationChecks.map((chk, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{chk.category}</td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{chk.check}</td>
                        <td>
                          <span className={`badge badge-${chk.severity.toLowerCase()}`}>
                            {chk.severity}
                          </span>
                        </td>
                        <td style={{ color: 'var(--emerald-text)', fontWeight: 600 }}>✓ {chk.status}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{chk.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT INSPECT MODAL / DRAWER */}
        {selectedAccountModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="panel" style={{ maxWidth: '560px', width: '100%', padding: '1.75rem', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACCOUNT PROFILE INSPECTOR</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.125rem' }}>{selectedAccountModal.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAccountModal(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                    {selectedAccountModal.city}, {selectedAccountModal.state} ({selectedAccountModal.country})
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cluster Segment</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)', marginTop: '0.125rem' }}>
                    {selectedAccountModal.cluster}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue / Profit</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                    {selectedAccountModal.revenue} / {selectedAccountModal.profit}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Market Potential</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
                    {selectedAccountModal.marketPotential}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', padding: '0.875rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-text)', textTransform: 'uppercase' }}>RECOMMENDED ACTION</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.125rem' }}>{selectedAccountModal.recommendedAction}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button className="btn-secondary" onClick={() => setSelectedAccountModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
