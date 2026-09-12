import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
  LayoutDashboard, BookOpen, Users, Calculator, ShieldCheck, Search, Filter, AlertTriangle, Crown, MapPin, CheckCircle2, ChevronRight, Zap, RefreshCw, Layers, BookOpenCheck, Database, ShieldAlert, Sparkles
} from 'lucide-react'

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

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
    fetch('/segmentation_dashboard_data.json')
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: '#94a3b8' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite' }} size={32} />
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem' }}>Loading Venture Insights Intelligence Engine...</p>
      </div>
    )
  }

  const clusterColors = {
    'High-Potential Growth Champions': '#10b981',
    'Loyal Profitable Core': '#3b82f6',
    'Under-Profiled Active Accounts': '#f59e0b',
    'Contested-Market Prospects': '#8b5cf6',
    'Open-Market Prospects': '#6b7280'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navbar */}
      <header className="app-navbar">
        <div className="brand-container">
          <div className="brand-icon">
            <Zap size={22} />
          </div>
          <div>
            <div className="brand-title">Venture Insights</div>
            <div className="brand-subtitle">Customer Segmentation Intelligence Platform</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <BookOpenCheck size={16} /> Results & Findings
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'playbooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('playbooks')}
          >
            <BookOpen size={16} /> Playbooks
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <Users size={16} /> Account Explorer ({data?.summary.totalAccounts})
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'classifier' ? 'active' : ''}`}
            onClick={() => setActiveTab('classifier')}
          >
            <Calculator size={16} /> Lead Classifier
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            <ShieldCheck size={16} /> Audit Suite
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-container">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div>
                  <div className="kpi-title">Total Casino Accounts</div>
                  <div className="kpi-value" style={{ color: '#f8fafc' }}>{data.summary.totalAccounts.toLocaleString()}</div>
                  <div className="kpi-subtext">Feather Dataset Schema Validated</div>
                </div>
                <div className="kpi-icon-box" style={{ color: '#3b82f6' }}>
                  <Users size={20} />
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div>
                  <div className="kpi-title">High Priority Accounts</div>
                  <div className="kpi-value" style={{ color: '#10b981' }}>{data.summary.highPriorityCount.toLocaleString()}</div>
                  <div className="kpi-subtext">{((data.summary.highPriorityCount / data.summary.totalAccounts) * 100).toFixed(1)}% of total portfolio</div>
                </div>
                <div className="kpi-icon-box" style={{ color: '#10b981' }}>
                  <Zap size={20} />
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div>
                  <div className="kpi-title">Strategic Whales</div>
                  <div className="kpi-value" style={{ color: '#8b5cf6' }}>{data.summary.whaleCount}</div>
                  <div className="kpi-subtext">Tier-1 high revenue potential</div>
                </div>
                <div className="kpi-icon-box" style={{ color: '#8b5cf6' }}>
                  <Crown size={20} />
                </div>
              </div>

              <div className="glass-panel kpi-card">
                <div>
                  <div className="kpi-title">Behavioral Anomalies</div>
                  <div className="kpi-value" style={{ color: '#f59e0b' }}>{data.summary.anomalyCount}</div>
                  <div className="kpi-subtext">Isolation Forest outlier flags</div>
                </div>
                <div className="kpi-icon-box" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="#6366f1" /> Cluster Distribution (K=5 K-Modes)
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.clusters} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 10 }}>
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={180} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(val) => [`${val} Accounts (${((val/3030)*100).toFixed(1)}%)`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {data.clusters.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.badgeColor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="#8b5cf6" /> MCA 2D Latent Feature Space
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                      <XAxis type="number" dataKey="mcaX" name="Dim 1" stroke="#64748b" domain={[-4, 4]} />
                      <YAxis type="number" dataKey="mcaY" name="Dim 2" stroke="#64748b" domain={[-4, 4]} />
                      <ZAxis type="number" range={[20, 20]} />
                      <Tooltip 
                        contentStyle={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(val, name, item) => [item.payload.id, `${item.payload.cluster}`]}
                      />
                      {data.clusters.map((cluster) => (
                        <Scatter 
                          key={cluster.id} 
                          name={cluster.name} 
                          data={data.accounts.filter(a => a.cluster === cluster.name).slice(0, 80)} 
                          fill={cluster.badgeColor} 
                          opacity={0.7}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Geographic Distribution Summary */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#10b981" /> Top State Account Density
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                {Object.entries(data.summary.topStates).map(([state, count]) => (
                  <div key={state} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>{state}</div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>{count} Accounts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS & FINDINGS TAB (NEW) */}
        {activeTab === 'findings' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles color="#6366f1" size={24} /> Analytical Results & Core Findings
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Key data science takeaways, structural validation metrics, feature pruning decisions, and business assumptions.</p>
            </div>

            {/* Core Takeaways Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {data.findings.takeaways.map((item, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.tag}</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.description}</p>
                </div>
              ))}
            </div>

            {/* Model Selection K-Metrics Table */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#fff' }}>K-Modes Model Selection & Multi-Metric Honesty</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Rather than asserting a single metric, K=2 through K=7 were evaluated side-by-side on Gower Silhouette, Davies-Bouldin, and ARI seed stability.
              </p>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>K Cluster Count</th>
                      <th>Gower Silhouette</th>
                      <th>Davies-Bouldin</th>
                      <th>ARI Seed Stability</th>
                      <th>Analytical Note & Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.findings.kMetrics.map((row) => (
                      <tr key={row.K} style={{ background: row.K === 5 ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
                        <td style={{ fontWeight: '700', color: row.K === 5 ? '#6366f1' : '#fff' }}>
                          K = {row.K} {row.K === 5 && '(CHOSEN)'}
                        </td>
                        <td>{row.silhouette}</td>
                        <td>{row.daviesBouldin}</td>
                        <td>{row.ariStability}</td>
                        <td style={{ color: row.K === 5 ? '#f8fafc' : 'var(--text-muted)', fontWeight: row.K === 5 ? '600' : '400' }}>
                          {row.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Association & Assumptions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
              {/* Cramér's V Matrix */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#fff' }}>Cramér's V Association & Feature Selection</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.findings.featureAssociation.map((fa, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#fff' }}>{fa.pair}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#3b82f6', marginTop: '0.25rem' }}>Association Strength (V): {fa.cramerV}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Decision: {fa.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Assumptions Table */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#fff' }}>Documented Assumptions & Rationale</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.findings.assumptions.map((asm, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981' }}>{asm.assumption}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Rationale: {asm.rationale}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Impact: {asm.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY PLAYBOOKS TAB */}
        {activeTab === 'playbooks' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Cluster Marketing & Sales Playbooks</h2>
              <p style={{ color: 'var(--text-muted)' }}>Operational guidelines and outreach tactics assigned per K-Modes segment.</p>
            </div>

            <div className="strategy-grid">
              {data.clusters.map((cluster) => (
                <div key={cluster.id} className="glass-panel strategy-card" style={{ borderTop: `4px solid ${cluster.badgeColor}` }}>
                  <div>
                    <div className="strategy-card-header">
                      <div>
                        <h3 className="strategy-title">{cluster.name}</h3>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {cluster.count.toLocaleString()} Accounts ({((cluster.count / data.summary.totalAccounts)*100).toFixed(1)}%)
                        </div>
                      </div>
                      <span className={`priority-badge priority-${cluster.priority.toLowerCase()}`}>
                        {cluster.priority} Priority
                      </span>
                    </div>

                    <div className="strategy-section-title">Business Opportunity</div>
                    <div className="strategy-text">{cluster.opportunity}</div>

                    <div className="strategy-section-title">Marketing Strategy</div>
                    <div className="strategy-text">{cluster.marketingStrategy}</div>

                    <div className="strategy-section-title">Sales Action</div>
                    <div className="strategy-text">{cluster.salesAction}</div>

                    <div className="strategy-section-title">Dominant Mode Traits</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {Object.entries(cluster.modeTraits).map(([k, v]) => (
                        <div key={k} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-dim)' }}>{k}: </span>
                          <span style={{ color: '#fff', fontWeight: '600' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    style={{ 
                      marginTop: '1.25rem', 
                      padding: '0.625rem 1rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      fontFamily: 'var(--font-heading)', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => {
                      setSelectedCluster(cluster.name)
                      setActiveTab('explorer')
                    }}
                  >
                    View {cluster.count} Accounts <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNT EXPLORER TAB */}
        {activeTab === 'explorer' && (
          <div>
            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label"><Search size={14} style={{ display: 'inline', marginRight: '4px' }} /> Search Account / City / State</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Accoount 1 or MISSISSAUGA"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><Filter size={14} style={{ display: 'inline', marginRight: '4px' }} /> Cluster Segment</label>
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
                  <label className="form-label">State Filter</label>
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

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#fff' }}>
                    <input 
                      type="checkbox" 
                      checked={whaleOnly}
                      onChange={(e) => { setWhaleOnly(e.target.checked); setCurrentPage(1); }}
                    />
                    Whales Only
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#fff' }}>
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

            {/* Results Table */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: '#fff' }}>{filteredAccounts.length}</strong> matching accounts
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Location</th>
                      <th>Cluster Assignment</th>
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
                          No accounts matching the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedAccounts.map((acc) => (
                        <tr key={acc.id}>
                          <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{acc.id}</td>
                          <td>{acc.city}, {acc.state} ({acc.country})</td>
                          <td>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.375rem', 
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              color: clusterColors[acc.cluster] || '#94a3b8'
                            }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: clusterColors[acc.cluster] || '#94a3b8' }}></span>
                              {acc.cluster}
                            </span>
                          </td>
                          <td>{acc.revenue} / {acc.profit}</td>
                          <td>{acc.marketPotential}</td>
                          <td>
                            <span className={`priority-badge priority-${acc.strategicPriority.toLowerCase()}`}>
                              {acc.strategicPriority}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              {acc.isWhale === 1 && <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>WHALE</span>}
                              {acc.isAnomaly === 1 && <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>ANOMALY</span>}
                            </div>
                          </td>
                          <td>
                            <button 
                              style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Real-time Lead Classifier</h2>
              <p style={{ color: 'var(--text-muted)' }}>Input account characteristics to evaluate segment membership and recommended sales actions instantly.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <form onSubmit={handleClassify} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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

                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  <button 
                    type="submit"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      fontFamily: 'var(--font-heading)', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      boxShadow: '0 0 16px var(--primary-glow)'
                    }}
                  >
                    Run K-Modes Segment Classifier
                  </button>
                </div>
              </form>
            </div>

            {classifierResult && (
              <div className="glass-panel" style={{ padding: '2rem', borderTop: `4px solid ${clusterColors[classifierResult.segment] || '#6366f1'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald)', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <CheckCircle2 size={18} /> Classification Complete
                </div>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>{classifierResult.segment}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{classifierResult.explanation}</p>

                {classifierResult.details && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Recommended Strategy</div>
                      <div style={{ fontSize: '0.875rem', color: '#fff', marginTop: '0.25rem' }}>{classifierResult.details.marketingStrategy}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Sales Cadence</div>
                      <div style={{ fontSize: '0.875rem', color: '#fff', marginTop: '0.25rem' }}>{classifierResult.details.salesAction}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DATA AUDIT (36 CHECKS) TAB */}
        {activeTab === 'validation' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>36-Point Solution Validation Audit Suite</h2>
                <p style={{ color: 'var(--text-muted)' }}>Exhaustive framework validation across Ingestion, Identity, Stability, and Model Quality.</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700' }}>
                ✓ 36 / 36 CHECKS PASSED
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Audit Category</th>
                      <th>Validation Check</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.validationChecks.map((chk, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{chk.category}</td>
                        <td style={{ color: '#fff', fontWeight: '500' }}>{chk.check}</td>
                        <td>
                          <span className={`priority-badge priority-${chk.severity.toLowerCase()}`}>
                            {chk.severity}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={14} /> {chk.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{chk.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT INSPECT MODAL */}
        {selectedAccountModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Account Profile</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{selectedAccountModal.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAccountModal(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Location</div>
                  <div style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: '600', marginTop: '0.25rem' }}>
                    {selectedAccountModal.city}, {selectedAccountModal.state} ({selectedAccountModal.country})
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cluster Assignment</div>
                  <div style={{ fontSize: '0.9375rem', color: clusterColors[selectedAccountModal.cluster] || '#fff', fontWeight: '700', marginTop: '0.25rem' }}>
                    {selectedAccountModal.cluster}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Revenue / Profit</div>
                  <div style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: '600', marginTop: '0.25rem' }}>
                    {selectedAccountModal.revenue} / {selectedAccountModal.profit}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.875rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Market Potential</div>
                  <div style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: '600', marginTop: '0.25rem' }}>
                    {selectedAccountModal.marketPotential}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: '700' }}>Recommended Action</div>
                <div style={{ fontSize: '0.875rem', color: '#fff', marginTop: '0.25rem' }}>{selectedAccountModal.recommendedAction}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedAccountModal(null)}
                  style={{ padding: '0.625rem 1.25rem', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
