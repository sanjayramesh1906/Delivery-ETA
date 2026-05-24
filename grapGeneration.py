import pandas as pd
import networkx as nx
from pyvis.network import Network
import webbrowser
import os

print("🎨 STEP 1: Reading your processed network data...")

# Load your files
FILE_NAME = "delivery_data.csv"
SCORECARD_NAME = "network_hubs_scorecard.csv"

if not os.path.exists(SCORECARD_NAME):
    raise FileNotFoundError("Could not find 'network_hubs_scorecard.csv'. Please run your graphGeneration.py script first!")

df = pd.read_csv(FILE_NAME, usecols=['source_center', 'source_name', 'destination_center', 'destination_name', 'segment_factor'])
hubs_scorecard = pd.read_csv(SCORECARD_NAME)

# --- 2. MAP THE REAL LOCATION NAMES ---
print("🏷️  STEP 2: Mapping ID codes to real city/facility names...")
name_map_source = dict(zip(df['source_center'], df['source_name']))
name_map_dest = dict(zip(df['destination_center'], df['destination_name']))
hub_names = {**name_map_source, **name_map_dest}

# --- 3. REBUILD THE CORE PATHWAYS ---
print("🔄 STEP 3: Compressing routes for the visual canvas...")
route_summary = df.groupby(['source_center', 'destination_center']).agg(
    median_delay=('segment_factor', 'median')
).reset_index()

# Keep only the top active routes to prevent the visualizer from freezing your screen
if len(route_summary) > 1000:
    print("⚠️  Network is very dense. Filtering for prominent active connections to keep visual smooth...")
    route_summary = route_summary.head(1000)

# --- 4. INITIALIZE THE INTERACTIVE VISUAL LAYER ---
# Setting up an enterprise-grade dark canvas layout
net = Network(height="800px", width="100%", bgcolor="#1a1a1a", font_color="white", directed=True)

# --- 5. PLOT THE HUBS (NODES) ---
print("🔮 STEP 4: Adding color-coded infrastructure hubs...")
for _, row in hubs_scorecard.iterrows():
    hub_id = row['Hub_ID']
    bridge_score = row['Chokepoint_Bridge_Score']
    lanes_count = row['Incoming_Lanes_Count']
    
    # Get the user-friendly name, default to ID if missing
    friendly_name = hub_names.get(hub_id, hub_id)
    
    # Color-coding system: Red is a severe bottleneck, Cyan is running smoothly
    if bridge_score > 0.05:
        node_color = "#FF3333"  # Severe Bottleneck (Red)
        node_size = 35
    elif bridge_score > 0.01:
        node_color = "#FFA500"  # Moderate Risk (Orange)
        node_size = 25
    else:
        node_color = "#00FFCC"  # Smooth running / Clear (Cyan)
        node_size = 15
        
    net.add_node(
        hub_id, 
        label=str(friendly_name),  # Displays the human-readable facility name on the circle
        title=f"ID: {hub_id}\nBridge Score: {bridge_score:.4f}\nLanes: {lanes_count}", # Tooltip on hover
        color=node_color,
        size=node_size
    )

# --- 6. PLOT THE HIGHWAYS (EDGES) ---
print("🛣️  STEP 5: Drawing connecting transit lanes...")
for _, row in route_summary.iterrows():
    source = row['source_center']
    target = row['destination_center']
    
    # Only draw the connection if both nodes exist on our canvas map
    if source in hubs_scorecard['Hub_ID'].values and target in hubs_scorecard['Hub_ID'].values:
        net.add_edge(source, target, value=row['median_delay'], title=f"Delay Factor: {row['median_delay']:.2f}")

# --- 7. SAVE AND FORCE LAUNCH POP-UP ---
net.toggle_physics(True) # Adds smooth animated layout physics
output_html = "delhivery_network_map.html"
net.save_graph(output_html)

print("\n🎉 SUCCESS! Launching the interactive window on your computer screen...")
webbrowser.open('file://' + os.path.realpath(output_html))