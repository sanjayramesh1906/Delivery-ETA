import React, { useState, useEffect } from 'react';
import { apiService, HUBS_DATA, CORRIDORS_DATA } from '../services/api';
import type { HubScore, CorridorData, PredictionResult, ModeRecommendation } from '../services/api';
import './dashboard.css';

interface DashboardProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  user?: { name: string; email: string };
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab, onTabChange, user }) => {
  // Global simulation states (can be modified in Admin tab)
  const [peakTrafficMultiplier, setPeakTrafficMultiplier] = useState<number>(1.25);
  const [baseDwellTimeAdder, setBaseDwellTimeAdder] = useState<number>(0);
  const [severeDwellThreshold, setSevereDwellThreshold] = useState<number>(100);

  // Dynamic hubs and corridors loaded from API service
  const [hubs, setHubs] = useState<HubScore[]>(HUBS_DATA);
  const [corridors, setCorridors] = useState<CorridorData[]>(CORRIDORS_DATA);
  const [selectedHubId, setSelectedHubId] = useState<string>('IND000000ACB'); // Default Bangalore Hub
  const [loading, setLoading] = useState<boolean>(false);

  // Graph tab toggle: 'standard' | 'interactive-id'
  const [graphMode, setGraphMode] = useState<'standard' | 'interactive-id'>('standard');

  // Search/Filter states
  const [hubSearchQuery, setHubSearchQuery] = useState<string>('');
  const [corridorSearchQuery, setCorridorSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // ETA Prediction Form States
  const [etaOrigin, setEtaOrigin] = useState<string>('IND000000ACB');
  const [etaDest, setEtaDest] = useState<string>('IND562132AAA');
  const [etaActualDist, setEtaActualDist] = useState<number>(1020);
  const [etaOsrmDist, setEtaOsrmDist] = useState<number>(980);
  const [etaOsrmTime, setEtaOsrmTime] = useState<number>(1140); // in minutes (19 hrs)
  const [etaStartHour, setEtaStartHour] = useState<number>(18); // 6 PM
  const [etaDayOfWeek, setEtaDayOfWeek] = useState<number>(1); // Monday
  const [etaRouteType, setEtaRouteType] = useState<string>('FTL');
  const [etaResult, setEtaResult] = useState<PredictionResult | null>(null);

  // FTL vs Carting Form States
  const [recDistance, setRecDistance] = useState<number>(450);
  const [recWeight, setRecWeight] = useState<number>(5500);
  const [recSla, setRecSla] = useState<number>(12); // 12 hours
  const [recCorridorRisk, setRecCorridorRisk] = useState<number>(0.04);
  const [recResult, setRecResult] = useState<ModeRecommendation | null>(null);

  // Alerts Logs State
  const [alertsLog, setAlertsLog] = useState<any[]>([]);

  // Simulation Recalculator
  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      // Modify hubs based on simulation weights
      const simulatedHubs = HUBS_DATA.map(h => {
        let adjDwell = h.dwellTimeMin + baseDwellTimeAdder;
        if (h.bridgeScore > 0.05) adjDwell = Math.round(adjDwell * 1.15); // Congestion compounded
        
        let status: 'Critical' | 'Moderate' | 'Smooth' = 'Smooth';
        if (adjDwell > severeDwellThreshold) status = 'Critical';
        else if (adjDwell > severeDwellThreshold * 0.6) status = 'Moderate';
        
        return {
          ...h,
          dwellTimeMin: adjDwell,
          status
        };
      });
      setHubs(simulatedHubs);

      // Recalculate predictions if active
      triggerEtaPrediction();
      triggerModeRecommendation();
      
      setLoading(false);
    }, 800);
  };

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      const liveHubs = await apiService.getHubs();
      const liveCorridors = await apiService.getCorridors();
      setHubs(liveHubs);
      setCorridors(liveCorridors);
    };
    fetchData();
  }, []);

  // Set up default alerts
  useEffect(() => {
    const defaultAlerts = [
      { id: 1, type: 'severe', hub: 'IND000000ACB', title: 'Severe Hub Congestion Alert', message: 'Bengaluru Hub (ACB) dwell time has reached 185 mins. Chokepoint index is critical.', timestamp: 'Just Now' },
      { id: 2, type: 'warning', hub: 'IND131028AAB', title: 'SLA Breach Threat Warning', message: 'Sonipat Linehaul (131) experiencing high incoming queues, bottlenecking Delhi-Chandigarh route.', timestamp: '12 mins ago' },
      { id: 3, type: 'warning', corridor: 'IND562132AAA-IND131028AAB', title: 'Corridor Travel Delay', message: 'Mumbai to Sonipat transit corridor median delay factor spiked to 1.62x due to regional weather restrictions.', timestamp: '45 mins ago' },
      { id: 4, type: 'info', hub: 'IND712311AAA', title: 'Route Optimization Triggered', message: 'Carting routes between Kolkata Gateway (712) and Bhubaneswar Delivery recommended for FTL consolidation to bypass hub processing queues.', timestamp: '2 hours ago' },
    ];
    setAlertsLog(defaultAlerts);
  }, []);

  // Trigger ETA Prediction
  const triggerEtaPrediction = async () => {
    const result = await apiService.predictEta({
      sourceId: etaOrigin,
      destId: etaDest,
      actualDistance: etaActualDist,
      osrmDistance: etaOsrmDist,
      osrmTimeMin: etaOsrmTime,
      startHour: etaStartHour,
      dayOfWeek: etaDayOfWeek,
      routeType: etaRouteType
    });

    // Apply simulation multipliers if any
    let predicted = result.predictedEtaMin;
    if (etaStartHour >= 17 && etaStartHour <= 20) {
      predicted = Math.round(predicted * peakTrafficMultiplier);
    }
    const delta = Math.max(0, predicted - result.traditionalEtaMin);
    const risk = Math.min(100, Math.round((delta / result.traditionalEtaMin) * 100));

    setEtaResult({
      ...result,
      predictedEtaMin: predicted,
      delayRiskFactor: risk
    });
  };

  // Trigger Mode Recommendation
  const triggerModeRecommendation = async () => {
    const result = await apiService.recommendTransportMode({
      distance: recDistance,
      weightKg: recWeight,
      slaHours: recSla,
      corridorRisk: recCorridorRisk
    });
    setRecResult(result);
  };

  // Run predictions initially on render/state changes
  useEffect(() => {
    triggerEtaPrediction();
  }, [etaOrigin, etaDest, etaActualDist, etaOsrmDist, etaOsrmTime, etaStartHour, etaDayOfWeek, etaRouteType, peakTrafficMultiplier]);

  useEffect(() => {
    triggerModeRecommendation();
  }, [recDistance, recWeight, recSla, recCorridorRisk]);

  const selectedHub = hubs.find(h => h.id === selectedHubId) || hubs[0];
  const selectedHubInflow = corridors.filter(c => c.destId === selectedHubId);
  const selectedHubOutflow = corridors.filter(c => c.sourceId === selectedHubId);

  return (
    <div className="logistics-dashboard-container">
      {/* Simulation Info Bar */}
      <div className="sim-info-bar">
        <div className="sim-status">
          <span className="pulse-indicator"></span>
          <span>Simulation Engine Active</span>
          <span className="divider">|</span>
          <span className="metric">Peak Traffic Multiplier: <strong>{peakTrafficMultiplier}x</strong></span>
          <span className="divider">|</span>
          <span className="metric">Severe Queue Dwell: <strong>{severeDwellThreshold}m</strong></span>
        </div>
        <button className="sim-recalc-btn" onClick={runSimulation} disabled={loading}>
          {loading ? 'Recalculating Plan...' : 'Trigger Simulation Run'}
        </button>
      </div>

      <div className="dashboard-content-grid">
        
        {/* TAB 1: NETWORK GRAPH */}
        {activeTab === 'network-graph' && (
          <div className="tab-pane network-graph-pane">
            <div className="pane-header">
              <div>
                <h2>Logistics Network Topology Graph</h2>
                <p className="pane-desc">Directed infrastructure map colored by betweenness centrality scores. Hover nodes for dwell-times.</p>
              </div>
              <div className="graph-toggles">
                <button 
                  className={`toggle-btn ${graphMode === 'standard' ? 'active' : ''}`}
                  onClick={() => setGraphMode('standard')}
                >
                  Regional Hub Names
                </button>
                <button 
                  className={`toggle-btn ${graphMode === 'interactive-id' ? 'active' : ''}`}
                  onClick={() => setGraphMode('interactive-id')}
                >
                  Centrality ID Mapping
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mini-kpi-grid">
              <div className="mini-card">
                <div className="label">Total System Hubs</div>
                <div className="value">{hubs.length}</div>
              </div>
              <div className="mini-card warning">
                <div className="label">Chokepoints Detected</div>
                <div className="value">{hubs.filter(h => h.bridgeScore > 0.05).length}</div>
              </div>
              <div className="mini-card info">
                <div className="label">Active Lanes</div>
                <div className="value">{corridors.length}</div>
              </div>
              <div className="mini-card">
                <div className="label">Avg Hub Dwell Time</div>
                <div className="value">{Math.round(hubs.reduce((acc, curr) => acc + curr.dwellTimeMin, 0) / hubs.length)} mins</div>
              </div>
            </div>

            {/* Network Visualization Container */}
            <div className="visual-canvas-container">
              <iframe 
                src={graphMode === 'standard' ? '/delhivery_network_map.html' : '/delhivery_interactive_network_IDS.html'} 
                className="pyvis-iframe"
                title="Delhivery Logistics Network Visualizer"
              />
              <div className="canvas-legend">
                <div className="legend-title">Risk & Dwell centralities</div>
                <div className="legend-item"><span className="legend-color severe"></span> Severe Bottleneck (Bridge Score &gt; 0.05)</div>
                <div className="legend-item"><span className="legend-color moderate"></span> Moderate Risk Hub (Bridge Score 0.01 - 0.05)</div>
                <div className="legend-item"><span className="legend-color clear"></span> Clear Hub (Bridge Score &lt; 0.01)</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOTTLENECK ANALYSIS */}
        {activeTab === 'bottleneck' && (
          <div className="tab-pane bottleneck-pane">
            <div className="pane-header">
              <div>
                <h2>Centrality Bottleneck & Chokepoint Scorecard</h2>
                <p className="pane-desc">Identify routing congestion centers ranked by Betweenness Centrality. Nodes with elevated bridge scores represent critical network gateways causing SLA failures.</p>
              </div>
            </div>

            <div className="table-filter-bar">
              <input 
                type="text" 
                placeholder="Search Hub by ID or Name..." 
                className="search-input"
                value={hubSearchQuery}
                onChange={(e) => setHubSearchQuery(e.target.value)}
              />
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Severity Levels</option>
                <option value="Critical">Critical (Severe Dwell)</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="Smooth">Smooth running</option>
              </select>
            </div>

            <div className="table-responsive">
              <table className="scorecard-table">
                <thead>
                  <tr>
                    <th>Hub ID</th>
                    <th>Facility Name</th>
                    <th>Bridge Centrality Score</th>
                    <th>Lanes Count (In/Out)</th>
                    <th>Queue Dwell Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hubs
                    .filter(h => {
                      const matchesSearch = h.id.toLowerCase().includes(hubSearchQuery.toLowerCase()) || 
                                            h.name.toLowerCase().includes(hubSearchQuery.toLowerCase());
                      const matchesFilter = statusFilter === 'All' || h.status === statusFilter;
                      return matchesSearch && matchesFilter;
                    })
                    .sort((a, b) => b.bridgeScore - a.bridgeScore)
                    .map(h => (
                      <tr key={h.id} className={h.status === 'Critical' ? 'severe-row' : ''}>
                        <td><code>{h.id}</code></td>
                        <td><strong>{h.name}</strong></td>
                        <td>
                          <div className="centrality-cell">
                            <span>{h.bridgeScore.toFixed(4)}</span>
                            <div className="progress-bar-container">
                              <div className="progress-bar" style={{ width: `${Math.min(100, h.bridgeScore * 400)}%`, backgroundColor: h.status === 'Critical' ? '#EF4444' : h.status === 'Moderate' ? '#F59E0B' : '#10B981' }}></div>
                            </div>
                          </div>
                        </td>
                        <td>{h.incomingLanes} In / {h.outgoingLanes} Out</td>
                        <td><strong>{h.dwellTimeMin} mins</strong></td>
                        <td>
                          <span className={`badge ${h.status.toLowerCase()}`}>{h.status}</span>
                        </td>
                        <td>
                          <button className="table-action-btn" onClick={() => { setSelectedHubId(h.id); if (onTabChange) onTabChange('hub'); }}>
                            Inspect Hub
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ETA PREDICTION */}
        {activeTab === 'eta' && (
          <div className="tab-pane eta-pane">
            <div className="pane-header">
              <div>
                <h2>Random Forest ETA Predictor</h2>
                <p className="pane-desc">Calculates delay-risk enhanced transit ETAs, overriding optimistic OSRM metrics with historical hub bottlenecks.</p>
              </div>
            </div>

            <div className="prediction-grid">
              {/* Form Input */}
              <div className="form-card card-glass">
                <h3>Transit Corridor Parameters</h3>
                <div className="form-group">
                  <label>Origin Logistics Hub</label>
                  <select value={etaOrigin} onChange={(e) => setEtaOrigin(e.target.value)}>
                    {hubs.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Destination Hub</label>
                  <select value={etaDest} onChange={(e) => setEtaDest(e.target.value)}>
                    {hubs.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Actual Route Dist (km)</label>
                    <input 
                      type="number" 
                      value={etaActualDist} 
                      onChange={(e) => setEtaActualDist(Number(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>OSRM Est Dist (km)</label>
                    <input 
                      type="number" 
                      value={etaOsrmDist} 
                      onChange={(e) => setEtaOsrmDist(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>OSRM Est Time (mins)</label>
                    <input 
                      type="number" 
                      value={etaOsrmTime} 
                      onChange={(e) => setEtaOsrmTime(Number(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Departure Hour (0-23)</label>
                    <select value={etaStartHour} onChange={(e) => setEtaStartHour(Number(e.target.value))}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i-12} PM` : `${i} AM`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select value={etaDayOfWeek} onChange={(e) => setEtaDayOfWeek(Number(e.target.value))}>
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Route Mode Type</label>
                    <select value={etaRouteType} onChange={(e) => setEtaRouteType(e.target.value)}>
                      <option value="FTL">FTL (Full Truckload)</option>
                      <option value="Carting">Carting (Frequent Loops)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Prediction Visual Output */}
              <div className="output-card card-glass">
                {etaResult && (
                  <>
                    <h3>ML Prediction Intelligence Report</h3>
                    
                    <div className="eta-comparison-block">
                      <div className="compare-circle predicted">
                        <div className="val">{Math.round(etaResult.predictedEtaMin / 60)}h {etaResult.predictedEtaMin % 60}m</div>
                        <div className="lbl">Model Predicted ETA</div>
                      </div>
                      <div className="compare-circle traditional">
                        <div className="val">{Math.round(etaResult.traditionalEtaMin / 60)}h {etaResult.traditionalEtaMin % 60}m</div>
                        <div className="lbl">Traditional OSRM ETA</div>
                      </div>
                    </div>

                    <div className="risk-factor-section">
                      <div className="risk-header">
                        <span>Predicted Delay Risk Factor:</span>
                        <span className={`risk-val ${etaResult.delayRiskFactor > 30 ? 'critical' : etaResult.delayRiskFactor > 15 ? 'moderate' : 'smooth'}`}>
                          {etaResult.delayRiskFactor}% Increased Risk
                        </span>
                      </div>
                      <div className="risk-bar-bg">
                        <div className="risk-bar-fill" style={{ 
                          width: `${Math.min(100, etaResult.delayRiskFactor)}%`,
                          backgroundColor: etaResult.delayRiskFactor > 30 ? '#EF4444' : etaResult.delayRiskFactor > 15 ? '#F59E0B' : '#10B981'
                        }}></div>
                      </div>
                    </div>

                    <div className="diagnostic-insight">
                      <h4>Delay Analysis Diagnoses:</h4>
                      <p className="insight-text">"{etaResult.delayReason}"</p>
                      <div className="alert-callout">
                        <strong>Operational Advice:</strong> Consider switching departure times to off-peak slots or utilizing alternative routes bypassing origin bottleneck corridors.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CORRIDOR INTELLIGENCE */}
        {activeTab === 'corridor' && (
          <div className="tab-pane corridor-pane">
            <div className="pane-header">
              <div>
                <h2>Chronically Delayed Corridor Intelligence</h2>
                <p className="pane-desc">Audit transport lanes experiencing high delay multipliers and view real-time operations congestion factors.</p>
              </div>
            </div>

            <div className="table-filter-bar">
              <input 
                type="text" 
                placeholder="Search by origin or destination city..." 
                className="search-input"
                value={corridorSearchQuery}
                onChange={(e) => setCorridorSearchQuery(e.target.value)}
              />
            </div>

            <div className="corridor-grid">
              {corridors
                .filter(c => {
                  return c.sourceName.toLowerCase().includes(corridorSearchQuery.toLowerCase()) || 
                         c.destName.toLowerCase().includes(corridorSearchQuery.toLowerCase());
                })
                .map((c, i) => {
                  const delaySeverity = c.medianDelayFactor > 1.4 ? 'high-risk' : c.medianDelayFactor > 1.2 ? 'mod-risk' : 'low-risk';
                  return (
                    <div key={i} className={`corridor-card card-glass ${delaySeverity}`}>
                      <div className="card-top">
                        <span className="mode-badge">{c.routeType} Route</span>
                        <span className={`risk-badge ${delaySeverity}`}>{c.medianDelayFactor.toFixed(2)}x Delay</span>
                      </div>
                      <h4>{c.sourceName} &rarr; {c.destName}</h4>
                      <div className="route-meta">
                        <div className="meta-item">
                          <span className="label">Transit Distance</span>
                          <span className="val">{c.distance} km</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Active Trucks</span>
                          <span className="val">{c.activeTrips} units</span>
                        </div>
                      </div>
                      <div className="corridor-alert-footer">
                        {c.medianDelayFactor > 1.3 ? (
                          <span className="corridor-status critical">⚠️ High congestion: Recommend mode consolidation</span>
                        ) : (
                          <span className="corridor-status clear">✅ Smooth travel velocity: Corridor clear</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 5: FTL VS CARTING RECOMMENDATIONS */}
        {activeTab === 'ftl-vs-carting' && (
          <div className="tab-pane ftl-vs-carting-pane">
            <div className="pane-header">
              <div>
                <h2>Optimal Mode Advisor (FTL vs Carting)</h2>
                <p className="pane-desc">Predicts optimal transportation mode leveraging a Random Forest Classifier trained on cargo consolidation weight, travel speed ratios, and SLA constraints.</p>
              </div>
            </div>

            <div className="advisor-grid">
              <div className="form-card card-glass">
                <h3>Shipment Specifications</h3>
                
                <div className="form-group">
                  <label>Transit Distance (km)</label>
                  <input 
                    type="range" 
                    min="50" 
                    max="2000" 
                    step="50"
                    value={recDistance} 
                    onChange={(e) => setRecDistance(Number(e.target.value))} 
                  />
                  <div className="range-val">{recDistance} km</div>
                </div>

                <div className="form-group">
                  <label>Total Cargo Weight (kg)</label>
                  <input 
                    type="number" 
                    value={recWeight} 
                    onChange={(e) => setRecWeight(Number(e.target.value))} 
                  />
                </div>

                <div className="form-group">
                  <label>Delivery SLA Threshold (hours)</label>
                  <input 
                    type="range" 
                    min="2" 
                    max="72" 
                    value={recSla} 
                    onChange={(e) => setRecSla(Number(e.target.value))} 
                  />
                  <div className="range-val">{recSla} hours (Required speed: {(recDistance / recSla).toFixed(1)} km/h)</div>
                </div>

                <div className="form-group">
                  <label>Expected Corridor Risk centralities</label>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="0.3" 
                    step="0.01"
                    value={recCorridorRisk} 
                    onChange={(e) => setRecCorridorRisk(Number(e.target.value))} 
                  />
                  <div className="range-val">{(recCorridorRisk * 100).toFixed(0)}% chokepoint delay chance</div>
                </div>
              </div>

              <div className="output-card card-glass">
                {recResult && (
                  <>
                    <h3>Classifier Mode Recommendation</h3>
                    
                    <div className="rec-result-hero">
                      <div className="rec-title">Recommended System Action:</div>
                      <div className={`rec-value ${recResult.recommendedMode.toLowerCase()}`}>
                        {recResult.recommendedMode === 'FTL' ? 'Full Truckload (FTL)' : 'Carting Fleet (Loops)'}
                      </div>
                      <div className="rec-confidence">Model Confidence Level: <strong>{recResult.confidence}%</strong></div>
                    </div>

                    <div className="rec-reason">
                      <strong>Core Driver Rationale:</strong>
                      <p>"{recResult.reason}"</p>
                    </div>

                    <div className="drivers-chart-section">
                      <h4>Model Feature Importances:</h4>
                      <div className="drivers-list">
                        {recResult.drivers.map((drv, i) => (
                          <div key={i} className="driver-row">
                            <div className="drv-name">{drv.factor}</div>
                            <div className="drv-bar-wrapper">
                              <div className="drv-bar-fill" style={{ width: `${drv.score}%` }}></div>
                            </div>
                            <div className="drv-val">{drv.score} pts</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: HUB DETAILS */}
        {activeTab === 'hub' && (
          <div className="tab-pane hub-pane">
            <div className="pane-header">
              <div>
                <h2>Logistics Facility Hub Deep Dive</h2>
                <p className="pane-desc">Examine lane connectivity, average warehouse dwell timings, and active shipments for a selected logistics hub.</p>
              </div>
              <div className="hub-selector">
                <label>Select Logistics Hub: </label>
                <select value={selectedHubId} onChange={(e) => setSelectedHubId(e.target.value)}>
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hub-deep-grid">
              {/* Hub Summary Card */}
              <div className="hub-meta-card card-glass">
                <div className={`hub-status-stripe ${selectedHub.status.toLowerCase()}`}></div>
                <h3>{selectedHub.name} Overview</h3>
                <div className="meta-list">
                  <div className="meta-item">
                    <span className="label">Hub System ID</span>
                    <span className="val"><code>{selectedHub.id}</code></span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Node Betweenness Score</span>
                    <span className="val"><strong>{selectedHub.bridgeScore.toFixed(4)}</strong></span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Average Dwell Time</span>
                    <span className="val"><strong>{selectedHub.dwellTimeMin} mins</strong></span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Current Status Level</span>
                    <span className={`val badge ${selectedHub.status.toLowerCase()}`}>{selectedHub.status}</span>
                  </div>
                </div>
                
                <div className="queue-simulation">
                  <h4>Live Queue Length Projection:</h4>
                  <div className="simulation-val">
                    <strong>{Math.round(selectedHub.bridgeScore * 280)} parcels</strong> in stack queue
                  </div>
                  <div className="alert-box">
                    {selectedHub.status === 'Critical' ? (
                      <span className="txt critical">🚨 Bottleneck active: Warehouse is processing at capacity limits. Recommend rerouting incoming vehicles.</span>
                    ) : selectedHub.status === 'Moderate' ? (
                      <span className="txt warning">⚠️ Backlog threat: Queues building due to shift transitions. Monitor performance.</span>
                    ) : (
                      <span className="txt clear">✅ Station nominal: All loading docks clear. Speed is optimal.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hub Lanes Analysis */}
              <div className="hub-lanes-card card-glass">
                <h3>Connecting Corridors Flow Analysis</h3>
                
                <div className="lanes-direction-grid">
                  <div className="lane-column">
                    <h4>Incoming Transit Lanes ({selectedHubInflow.length})</h4>
                    <div className="lanes-scroll-list">
                      {selectedHubInflow.length > 0 ? selectedHubInflow.map((lane, i) => (
                        <div key={i} className="lane-tile incoming">
                          <span className="lane-city">&larr; {lane.sourceName}</span>
                          <span className="lane-delay">{lane.medianDelayFactor.toFixed(2)}x delay</span>
                        </div>
                      )) : (
                        <p className="no-data">No active incoming lanes tracked in sample.</p>
                      )}
                    </div>
                  </div>

                  <div className="lane-column">
                    <h4>Outgoing Distribution Lanes ({selectedHubOutflow.length})</h4>
                    <div className="lanes-scroll-list">
                      {selectedHubOutflow.length > 0 ? selectedHubOutflow.map((lane, i) => (
                        <div key={i} className="lane-tile outgoing">
                          <span className="lane-city">{lane.destName} &rarr;</span>
                          <span className="lane-delay">{lane.medianDelayFactor.toFixed(2)}x delay</span>
                        </div>
                      )) : (
                        <p className="no-data">No active outgoing lanes tracked in sample.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="tab-pane alerts-pane">
            <div className="pane-header">
              <div>
                <h2>Real-time Incident Alerts Log</h2>
                <p className="pane-desc">Ongoing warehouse congestion alerts, SLA delay triggers, and system overrides.</p>
              </div>
            </div>

            <div className="alerts-stack">
              {alertsLog.map((alert) => (
                <div key={alert.id} className={`incident-banner alert-glass ${alert.type}`}>
                  <div className="incident-icon">
                    {alert.type === 'severe' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div className="incident-body">
                    <div className="incident-title-row">
                      <h4>{alert.title}</h4>
                      <span className="timestamp">{alert.timestamp}</span>
                    </div>
                    <p>{alert.message}</p>
                    <div className="actions-row">
                      <button className="resolve-btn" onClick={() => setAlertsLog(alertsLog.filter(a => a.id !== alert.id))}>
                        Acknowledge Alert
                      </button>
                      {alert.hub && (
                        <button className="navigate-btn" onClick={() => { setSelectedHubId(alert.hub); if (onTabChange) onTabChange('hub'); }}>
                          Go to Hub Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {alertsLog.length === 0 && (
                <div className="no-incidents card-glass">
                  <h3>✅ Clear Operational Log</h3>
                  <p>All network hubs are operating within optimal SLA limits.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: REPORTS & OPERATIONAL IMPACT */}
        {activeTab === 'reports' && (
          <div className="tab-pane reports-pane">
            <div className="pane-header">
              <div>
                <h2>Operational Performance & Cost Impact Report</h2>
                <p className="pane-desc">Quantify how hub congestion costs the delivery network and estimate potential savings via mode routing adjustments.</p>
              </div>
            </div>

            {/* Financial Impact Dashboard */}
            <div className="reports-top-kpi">
              <div className="impact-card card-glass red-border">
                <div className="impact-lbl">Est. Monthly Congestion Delay Loss</div>
                <div className="impact-val">&#8377; 42,80,000</div>
                <p className="impact-desc">Valuation calculated from delayed transport loops and penalty clauses.</p>
              </div>
              <div className="impact-card card-glass green-border">
                <div className="impact-lbl">Mode Consolidation Savings Opportunity</div>
                <div className="impact-val">&#8377; 18,50,000</div>
                <p className="impact-desc">Estimated savings if optimal FTL mode advises are prioritized over Carting loops.</p>
              </div>
              <div className="impact-card card-glass">
                <div className="impact-lbl">Avg SLA Compliance Ratio</div>
                <div className="impact-val">84.2%</div>
                <p className="impact-desc">System target: 95.0% compliance.</p>
              </div>
            </div>

            {/* SVG Visualizations Panel */}
            <div className="reports-visuals-grid">
              {/* Chart 1: Centrality vs Dwell Time */}
              <div className="report-chart-card card-glass">
                <h3>Hub Dwell Time vs. Bridge Score Correlation</h3>
                <div className="svg-chart-container">
                  <svg viewBox="0 0 500 220" className="svg-chart">
                    {/* Y Axis Gridlines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#2e303a" strokeDasharray="3,3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#2e303a" strokeDasharray="3,3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#2e303a" strokeDasharray="3,3" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#2e303a" strokeDasharray="3,3" />
                    
                    {/* Graph Labels */}
                    <text x="35" y="25" textAnchor="end" fill="#9ca3af" fontSize="10">200m</text>
                    <text x="35" y="75" textAnchor="end" fill="#9ca3af" fontSize="10">150m</text>
                    <text x="35" y="125" textAnchor="end" fill="#9ca3af" fontSize="10">100m</text>
                    <text x="35" y="175" textAnchor="end" fill="#9ca3af" fontSize="10">50m</text>
                    
                    <text x="250" y="210" textAnchor="middle" fill="#9ca3af" fontSize="11">Bridge Centrality score (Origin-to-Destination Path Frequency)</text>

                    {/* Plots */}
                    {hubs.map((hub, idx) => {
                      const cx = 40 + (hub.bridgeScore * 1800); // Scale bridge score
                      const cy = 170 - (hub.dwellTimeMin * 0.7); // Scale dwell time
                      const dotColor = hub.status === 'Critical' ? '#EF4444' : hub.status === 'Moderate' ? '#F59E0B' : '#38BDF8';
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="6" fill={dotColor} opacity="0.8" />
                          {hub.bridgeScore > 0.04 && (
                            <text x={cx + 8} y={cy + 3} fill="#f3f4f6" fontSize="8" textAnchor="start">{hub.name.split(' ')[0]}</text>
                          )}
                        </g>
                      );
                    })}
                    
                    {/* Axes */}
                    <line x1="40" y1="10" x2="40" y2="180" stroke="#9ca3af" />
                    <line x1="40" y1="180" x2="480" y2="180" stroke="#9ca3af" />
                  </svg>
                </div>
              </div>

              {/* Chart 2: Delay Risks Distributions */}
              <div className="report-chart-card card-glass">
                <h3>Active Corridor Route Delay Factors</h3>
                <div className="svg-chart-container">
                  <svg viewBox="0 0 500 220" className="svg-chart">
                    {/* Bar plots representing corridor distance vs delay factor */}
                    {corridors.map((c, idx) => {
                      const width = 25;
                      const gap = 15;
                      const x = 50 + idx * (width + gap);
                      const height = (c.medianDelayFactor - 1.0) * 200; // Scale height
                      const y = 170 - height;
                      const barColor = c.medianDelayFactor > 1.4 ? '#EF4444' : c.medianDelayFactor > 1.2 ? '#F59E0B' : '#38BDF8';
                      return (
                        <g key={idx}>
                          <rect x={x} y={y} width={width} height={height} rx="3" fill={barColor} />
                          <text x={x + width/2} y={y - 5} textAnchor="middle" fill="#f3f4f6" fontSize="9">{c.medianDelayFactor}x</text>
                          <text x={x + width/2} y="190" textAnchor="middle" fill="#9ca3af" fontSize="8" transform={`rotate(15, ${x + width/2}, 190)`}>
                            {c.sourceName.split(' ')[0]}-{c.destName.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Axes */}
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#9ca3af" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="tab-pane admin-pane">
            <div className="pane-header">
              <div>
                <h2>Operational Simulation Dashboard Settings</h2>
                <p className="pane-desc">System configurations. Override chokepoint models, test route failure loops, and simulate extreme gridlock conditions.</p>
              </div>
            </div>

            <div className="admin-grid">
              <div className="admin-section card-glass">
                <h3>Global Traffic Simulation Multipliers</h3>
                
                <div className="form-group">
                  <label>Peak Hour Corridor Delay Coefficient: <strong>{peakTrafficMultiplier}x</strong></label>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.5" 
                    step="0.05"
                    value={peakTrafficMultiplier}
                    onChange={(e) => setPeakTrafficMultiplier(Number(e.target.value))}
                  />
                  <p className="help-text">Increases estimated travel times during peak morning and evening delivery hours.</p>
                </div>

                <div className="form-group">
                  <label>Baseline Hub Dwell Adder (mins): <strong>{baseDwellTimeAdder} mins</strong></label>
                  <input 
                    type="range" 
                    min="0" 
                    max="120" 
                    step="5"
                    value={baseDwellTimeAdder}
                    onChange={(e) => setBaseDwellTimeAdder(Number(e.target.value))}
                  />
                  <p className="help-text">Adds a fixed processing delay to all hubs to simulate system-wide sorting failures.</p>
                </div>

                <div className="form-group">
                  <label>Critical Dwell Alert Threshold: <strong>{severeDwellThreshold} mins</strong></label>
                  <input 
                    type="range" 
                    min="45" 
                    max="240" 
                    step="5"
                    value={severeDwellThreshold}
                    onChange={(e) => setSevereDwellThreshold(Number(e.target.value))}
                  />
                  <p className="help-text">Dwell times exceeding this trigger a severe chokepoint alert.</p>
                </div>
              </div>

              <div className="admin-section card-glass">
                <h3>Machine Learning Model Metadata</h3>
                <div className="metadata-table">
                  <div className="meta-row">
                    <span>ETA Model Pipeline:</span>
                    <strong>Random Forest Regressor (sklearn)</strong>
                  </div>
                  <div className="meta-row">
                    <span>Features Extracted:</span>
                    <span>calculated_osrm_speed, distance_ratio, chokepoint_bridge_score</span>
                  </div>
                  <div className="meta-row">
                    <span>Validation Accuracy (R2):</span>
                    <strong>0.892 (89.2% Accuracy)</strong>
                  </div>
                  <div className="meta-row">
                    <span>Mode Classifier Pipeline:</span>
                    <strong>Random Forest Classifier (sklearn)</strong>
                  </div>
                  <div className="meta-row">
                    <span>Classification Metric (F1):</span>
                    <strong>0.924 (92.4% Score)</strong>
                  </div>
                </div>

                <div className="admin-actions-block">
                  <button className="admin-danger-btn" onClick={() => {
                    setPeakTrafficMultiplier(1.25);
                    setBaseDwellTimeAdder(0);
                    setSevereDwellThreshold(100);
                    setHubs(HUBS_DATA);
                    alert('Simulation parameters reset to historical averages.');
                  }}>
                    Reset Model Coefficients
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
