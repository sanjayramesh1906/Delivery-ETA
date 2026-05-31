// API Service Layer for Delhivery ETA Logistics Intelligence Platform
// Integrates live FastAPI calls with high-fidelity client-side ML simulators

export interface HubScore {
  id: string;
  name: string;
  bridgeScore: number;
  incomingLanes: number;
  outgoingLanes: number;
  dwellTimeMin: number;
  status: 'Critical' | 'Moderate' | 'Smooth';
}

export interface CorridorData {
  sourceId: string;
  sourceName: string;
  destId: string;
  destName: string;
  distance: number;
  medianDelayFactor: number;
  activeTrips: number;
  routeType: 'FTL' | 'Carting';
}

export interface PredictionResult {
  predictedEtaMin: number;
  traditionalEtaMin: number;
  delayRiskFactor: number;
  delayReason: string;
}

export interface ModeRecommendation {
  recommendedMode: 'FTL' | 'Carting';
  confidence: number;
  reason: string;
  drivers: { factor: string; score: number }[];
}

const BACKEND_URL = 'http://localhost:8000/api';

// Live Hub Dataset from network_hubs_scorecard.csv & delivery_data.csv (Core Sample)
export const HUBS_DATA: HubScore[] = [
  { id: 'IND000000ACB', name: 'Bengaluru Hub (ACB)', bridgeScore: 0.238, incomingLanes: 45, outgoingLanes: 49, dwellTimeMin: 185, status: 'Critical' },
  { id: 'IND562132AAA', name: 'Mumbai Linehaul Hub (562)', bridgeScore: 0.136, incomingLanes: 36, outgoingLanes: 35, dwellTimeMin: 142, status: 'Critical' },
  { id: 'IND501359AAE', name: 'Hyderabad Central (501)', bridgeScore: 0.083, incomingLanes: 30, outgoingLanes: 27, dwellTimeMin: 98, status: 'Critical' },
  { id: 'IND712311AAA', name: 'Kolkata Gateway (712)', bridgeScore: 0.080, incomingLanes: 24, outgoingLanes: 22, dwellTimeMin: 110, status: 'Critical' },
  { id: 'IND160002AAC', name: 'Chandigarh Dispatch (160)', bridgeScore: 0.053, incomingLanes: 32, outgoingLanes: 29, dwellTimeMin: 85, status: 'Moderate' },
  { id: 'IND411033AAA', name: 'Pune Fulfillment (411)', bridgeScore: 0.052, incomingLanes: 23, outgoingLanes: 20, dwellTimeMin: 74, status: 'Moderate' },
  { id: 'IND131028AAB', name: 'Sonipat Linehaul (131)', bridgeScore: 0.049, incomingLanes: 20, outgoingLanes: 20, dwellTimeMin: 68, status: 'Moderate' },
  { id: 'IND209304AAA', name: 'Kanpur Center (209)', bridgeScore: 0.043, incomingLanes: 16, outgoingLanes: 13, dwellTimeMin: 62, status: 'Moderate' },
  { id: 'IND302014AAA', name: 'Jaipur Sorting (302)', bridgeScore: 0.042, incomingLanes: 10, outgoingLanes: 8, dwellTimeMin: 55, status: 'Moderate' },
  { id: 'IND382430AAB', name: 'Ahmedabad Hub (382)', bridgeScore: 0.030, incomingLanes: 17, outgoingLanes: 13, dwellTimeMin: 48, status: 'Moderate' },
  { id: 'IND462022AAA', name: 'Bhopal Distribution (462)', bridgeScore: 0.028, incomingLanes: 13, outgoingLanes: 9, dwellTimeMin: 42, status: 'Moderate' },
  { id: 'IND751002AAB', name: 'Bhubaneswar Delivery (751)', bridgeScore: 0.016, incomingLanes: 13, outgoingLanes: 6, dwellTimeMin: 35, status: 'Smooth' },
  { id: 'IND000000ACA', name: 'Chennai Hub (ACA)', bridgeScore: 0.012, incomingLanes: 13, outgoingLanes: 9, dwellTimeMin: 38, status: 'Smooth' },
  { id: 'IND521225AAB', name: 'Vijayawada Center (521)', bridgeScore: 0.011, incomingLanes: 8, outgoingLanes: 8, dwellTimeMin: 28, status: 'Smooth' },
  { id: 'IND474003AAA', name: 'Gwalior Gateway (474)', bridgeScore: 0.008, incomingLanes: 8, outgoingLanes: 6, dwellTimeMin: 25, status: 'Smooth' },
  { id: 'IND248001AAA', name: 'Dehradun Delivery (248)', bridgeScore: 0.0016, incomingLanes: 3, outgoingLanes: 1, dwellTimeMin: 18, status: 'Smooth' },
  { id: 'IND125001AAA', name: 'Hisar Sorting (125)', bridgeScore: 0.006, incomingLanes: 7, outgoingLanes: 8, dwellTimeMin: 22, status: 'Smooth' }
];

export const CORRIDORS_DATA: CorridorData[] = [
  { sourceId: 'IND000000ACB', sourceName: 'Bengaluru Hub', destId: 'IND562132AAA', destName: 'Mumbai Linehaul Hub', distance: 980, medianDelayFactor: 1.45, activeTrips: 84, routeType: 'FTL' },
  { sourceId: 'IND562132AAA', sourceName: 'Mumbai Linehaul Hub', destId: 'IND131028AAB', destName: 'Sonipat Linehaul', distance: 1420, medianDelayFactor: 1.62, activeTrips: 112, routeType: 'FTL' },
  { sourceId: 'IND131028AAB', sourceName: 'Sonipat Linehaul', destId: 'IND160002AAC', destName: 'Chandigarh Dispatch', distance: 230, medianDelayFactor: 1.18, activeTrips: 45, routeType: 'Carting' },
  { sourceId: 'IND000000ACB', sourceName: 'Bengaluru Hub', destId: 'IND000000ACA', destName: 'Chennai Hub', distance: 340, medianDelayFactor: 1.12, activeTrips: 72, routeType: 'Carting' },
  { sourceId: 'IND501359AAE', sourceName: 'Hyderabad Central', destId: 'IND000000ACB', destName: 'Bengaluru Hub', distance: 570, medianDelayFactor: 1.35, activeTrips: 63, routeType: 'FTL' },
  { sourceId: 'IND562132AAA', sourceName: 'Mumbai Linehaul Hub', destId: 'IND411033AAA', destName: 'Pune Fulfillment', distance: 150, medianDelayFactor: 1.25, activeTrips: 92, routeType: 'Carting' },
  { sourceId: 'IND382430AAB', sourceName: 'Ahmedabad Hub', destId: 'IND562132AAA', destName: 'Mumbai Linehaul Hub', distance: 530, medianDelayFactor: 1.22, activeTrips: 58, routeType: 'FTL' },
  { sourceId: 'IND712311AAA', sourceName: 'Kolkata Gateway', destId: 'IND751002AAB', destName: 'Bhubaneswar Delivery', distance: 440, medianDelayFactor: 1.31, activeTrips: 34, routeType: 'Carting' }
];

export const apiService = {
  // Fetch list of network hubs
  async getHubs(): Promise<HubScore[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/network/hubs`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.log('FastAPI offline, using Client Simulator for getHubs');
    }
    return HUBS_DATA;
  },

  // Fetch delayed corridors
  async getCorridors(): Promise<CorridorData[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/network/corridors`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.log('FastAPI offline, using Client Simulator for getCorridors');
    }
    return CORRIDORS_DATA;
  },

  // Predict trip ETA (Random Forest Regressor Pipeline simulation)
  async predictEta(inputs: {
    sourceId: string;
    destId: string;
    actualDistance: number;
    osrmDistance: number;
    osrmTimeMin: number;
    startHour: number;
    dayOfWeek: number;
    routeType: string;
  }): Promise<PredictionResult> {
    try {
      const response = await fetch(`${BACKEND_URL}/predict-eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.log('FastAPI offline, running Random Forest Regressor simulator');
    }

    // Client-side simulation of RandomForestRegressor:
    const sourceHub = HUBS_DATA.find(h => h.id === inputs.sourceId);
    const destHub = HUBS_DATA.find(h => h.id === inputs.destId);

    const sourceRisk = sourceHub ? sourceHub.bridgeScore : 0.01;
    const destRisk = destHub ? destHub.bridgeScore : 0.01;
    
    // Feature Engineering matches ETA_model_training.py:
    const speed = inputs.osrmDistance / (inputs.osrmTimeMin / 60.0 + 0.1);
    const distRatio = inputs.actualDistance / (inputs.osrmDistance + 0.1);
    
    // Core prediction logic incorporating congestion coefficients:
    let baseMultiplier = 1.15; // OSRM is typically optimistic
    
    // Hour of day traffic factor
    if (inputs.startHour >= 8 && inputs.startHour <= 11) baseMultiplier += 0.20; // Morning Peak
    if (inputs.startHour >= 17 && inputs.startHour <= 20) baseMultiplier += 0.25; // Evening Peak

    // Node congestion factor (Betweenness chokepoint delays)
    const congestionAdder = (sourceRisk * 120) + (destRisk * 150);

    // Route type factor (Carting has more segment stops than FTL)
    const routeFactor = inputs.routeType === 'Carting' ? 1.10 : 0.98;

    const predictedEtaMin = (inputs.osrmTimeMin * baseMultiplier * routeFactor * distRatio) + congestionAdder;
    const traditionalEtaMin = inputs.osrmTimeMin * baseMultiplier;

    let delayReason = 'Standard transit speed constraints.';
    if (sourceRisk > 0.05) delayReason = `High dwell time at congested Origin Hub (${sourceHub?.name}).`;
    else if (destRisk > 0.05) delayReason = `Bottleneck chokepoint queuing at Destination Hub (${destHub?.name}).`;
    else if (inputs.startHour >= 17 && inputs.startHour <= 20) delayReason = 'Peak hours corridor traffic congestion.';

    return {
      predictedEtaMin: Math.round(predictedEtaMin),
      traditionalEtaMin: Math.round(traditionalEtaMin),
      delayRiskFactor: Math.min(100, Math.round(((predictedEtaMin - traditionalEtaMin) / traditionalEtaMin) * 100)),
      delayReason
    };
  },

  // Recommend optimal transport mode (Random Forest Classifier Pipeline simulation)
  async recommendTransportMode(inputs: {
    distance: number;
    weightKg: number;
    slaHours: number;
    corridorRisk: number; // 0 to 1
  }): Promise<ModeRecommendation> {
    try {
      const response = await fetch(`${BACKEND_URL}/recommend-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.log('FastAPI offline, running RandomForestClassifier simulator');
    }

    // Client-side simulation of RandomForestClassifier:
    // Large weights or long distances lean towards FTL.
    // Extremely urgent SLAs over short distances lean towards Carting.
    // High corridor risk favors FTL due to higher security/dedicated routing.
    
    let scoreFTL = 0;
    let scoreCarting = 0;

    // Rule 1: Distance
    if (inputs.distance > 500) scoreFTL += 30;
    else scoreCarting += 25;

    // Rule 2: Weight
    if (inputs.weightKg > 8000) scoreFTL += 40;
    else scoreCarting += 30;

    // Rule 3: SLA Urgency (Speed vs Cost)
    const requiredSpeed = inputs.distance / inputs.slaHours; // km/h needed
    if (requiredSpeed > 55) {
      scoreCarting += 35; // Carting operates on higher frequency loops
    } else {
      scoreFTL += 20; // FTL is cost-efficient for relaxed SLAs
    }

    // Rule 4: Corridor Risk
    if (inputs.corridorRisk > 0.05) {
      scoreFTL += 25; // FTL has lower transit-point handling risk
    } else {
      scoreCarting += 15;
    }

    const total = scoreFTL + scoreCarting;
    const recommendedMode = scoreFTL >= scoreCarting ? 'FTL' : 'Carting';
    const confidence = Math.round((Math.max(scoreFTL, scoreCarting) / total) * 100);

    let reason = '';
    if (recommendedMode === 'FTL') {
      reason = inputs.weightKg > 8000 
        ? 'Heavy bulk load requires FTL container capacity for optimal cost-per-ton-mile.'
        : 'Long-haul distance and relaxed SLA allow FTL consolidated routing for maximum efficiency.';
    } else {
      reason = requiredSpeed > 55 
        ? 'High velocity transit threshold required. Carting scheduling bypasses terminal consolidation dwell times.'
        : 'Short distance cargo load fits optimal Carting fleet frequency guidelines.';
    }

    // Decision importance weights matching transport_model.py
    const drivers = [
      { factor: 'SLA Speed Threshold', score: Math.round(35 * (requiredSpeed / 50)) },
      { factor: 'Cargo Load Weight', score: Math.min(45, Math.round(inputs.weightKg / 250)) },
      { factor: 'Route Distance Diff', score: Math.min(30, Math.round(inputs.distance / 20)) },
      { factor: 'Hub Chokepoint Risk', score: Math.round(inputs.corridorRisk * 200) }
    ].sort((a, b) => b.score - a.score);

    return {
      recommendedMode,
      confidence,
      reason,
      drivers
    };
  }
};
