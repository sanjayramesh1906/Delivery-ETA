# Delhivery Route Intelligence: Backend ML & Graph pipelines

This directory contains the Python-based data pipelines, graph networks, and machine learning models for the Delhivery logistics network.

---

## ⚙️ Core Scripts & Execution

### 1. Hub Scorecard & Name Mapper: `generate_mappings.py`
* **Purpose**: Integrates the raw trip logs (`delivery_data.csv`) and computed hub metrics (`network_hubs_scorecard.csv`) to resolve facility codes into human-readable city labels, states, and facility types.
* **Outputs**: Generates a structured JSON database `hub_mappings.json` copied directly to the React app folder.
* **Execution**:
  ```bash
  python generate_mappings.py
  ```

### 2. Network Visualizer (Regional Names): `displayGraph.py`
* **Purpose**: Builds a directed weighted graph using **NetworkX** and compiles an interactive enterprise dark-theme PyVis canvas with nodes labeled by their real locations (e.g. `Pune fulfillment`).
* **Outputs**: Generates `delhivery_user_friendly_network.html` and launches it in the default browser.
* **Execution**:
  ```bash
  python displayGraph.py
  ```

### 3. Network Visualizer (Centrality IDs): `grapGeneration.py`
* **Purpose**: Identical to the friendly names visualizer, but labels the graph nodes directly with their system IDs (`IND411033AAA`) to allow operators to audit specific chokepoint routes.
* **Outputs**: Generates `delhivery_network_map.html` in the root folder.
* **Execution**:
  ```bash
  python grapGeneration.py
  ```

### 4. ETA ML Pipeline: `ETA_model_training.py`
* **Purpose**: Trains a **Random Forest Regressor** (80 estimators, square root max features) to predict scan-to-scan delivery times. Feeds on OSRM estimates combined with engineered traffic and detour features.
* **Inputs**: `delivery_data.csv`
* **Feature Engineering**:
  * **Calculated OSRM Speed**: $\text{osrm\_distance} / (\text{osrm\_time} / 60.0 + 0.1)$
  * **Distance Ratio (Detour Factor)**: $\text{actual\_distance\_to\_destination} / (\text{osrm\_distance} + 0.1)$
  * **Temporal Features**: `start_hour` (Hour of Day) and `start_day_of_week` (Day of Week).
* **Validation Performance**: R2 score of **89.2%** and Mean Absolute Error (MAE) of ~52 minutes.
* **Execution**:
  ```bash
  python ETA_model_training.py
  ```

### 5. Mode Selection Classifier: `transport_model.py`
* **Purpose**: Trains a **Random Forest Classifier** to automate route mode selection (FTL vs. Carting loops) based on shipment specifications, travel distances, SLA durations, and corridor chokepoints.
* **Validation Performance**: F1 score of **92.4%**.
* **Execution**:
  ```bash
  python transport_model.py
  ```

---

## 📊 Dataset Specifications

The backend operates on two primary data resources:

1. **`delivery_data.csv` (Segment Logs)**:
   * `trip_creation_time`: Date/time of trip registration.
   * `route_type`: Transport Mode (`FTL` or `Carting`).
   * `source_center` / `destination_center`: System facility ID codes.
   * `source_name` / `destination_name`: Raw city name string and state.
   * `actual_distance_to_destination` / `osrm_distance`: Real odometer distance vs. OSRM routing engine coordinates.
   * `start_scan_to_end_scan`: The actual scan-to-scan duration (target variable for regression).
   * `segment_factor`: Median delay ratio computed per travel corridor segment.

2. **`network_hubs_scorecard.csv` (Centrality Scores)**:
   * Generated using graph algorithms to audit structural bottleneck gates.
   * `Hub_ID`: Facility system ID.
   * `Chokepoint_Bridge_Score` (Betweenness Centrality): Operational risk index (0 to 1) representing node path frequencies.
   * `Incoming_Lanes_Count` / `Outgoing_Lanes_Count`: Active degree connections.
