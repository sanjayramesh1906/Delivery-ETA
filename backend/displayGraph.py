import pandas as pd
import networkx as nx
from pyvis.network import Network
import webbrowser
import os

print("🎨 Preparing your user-friendly network visualization...")

# --- 1. LOAD THE DATASETS ---
df = pd.read_csv("delhivery_data.csv")
hubs_scorecard = pd.read_csv("network_hubs_scorecard.csv")

# --- 2. CREATE AN ID-TO-NAME DICTIONARY ---
# This matches every Hub ID to its real human-readable name automatically
print("🏷️  Mapping Hub IDs to real location names...")
name_map_source = dict(zip(df['source_center'], df['source_name']))
name_map_dest = dict(zip(df['destination_center'], df['destination_name']))

# Combine both maps to make sure we don't miss any hub name
hub_names = {**name_map_source, **name_map_dest}

# --- 3. REBUILD THE GRAPH NETWORK WITH NAMES ---
print("🔄 Rebuilding graph structure...")
route_summary = df.groupby(['source_center', 'destination_center']).agg(
    median_segment_factor=('segment_factor', 'median'),
    total_trips_tracked=('segment_factor', 'count')
).reset_index()

G = nx.DiGraph()
for _, row in route_summary.iterrows():
    G.add_edge(row['source_center'], row['destination_center'], 
               weight=row['median_segment_factor'], trips=row['total_trips_tracked'])

# --- 4. INITIALIZE THE PYVIS NET CANVAS ---
net = Network(height="800px", width="100%", bgcolor="#222222", font_color="white", directed=True)

# --- 5. ADD NODES USING HUMAN LABELS ---
for _, row in hubs_scorecard.iterrows():
    hub_id = row['Hub_ID']
    bridge_score = row['Chokepoint_Bridge_Score']
    lanes_count = row['Incoming_Lanes_Count']
    
    # Get the friendly name from our dictionary. If missing, fall back to the ID.
    friendly_name = hub_names.get(hub_id, hub_id)
    
    # Color coding based on bottleneck severity
    if bridge_score > 0.1:
        node_color = "#FF3333"  # Bright Red
        node_size = 35
    elif bridge_score > 0.02:
        node_color = "#FFA500"  # Orange
        node_size = 25
    else:
        node_color = "#00FFCC"  # Cyan/Blue-Green
        node_size = 15
        
    net.add_node(
        hub_id, 
        label=friendly_name,  # CHANGE IS HERE: The circle text will show the real city/hub name!
        title=f"ID: {hub_id}\nBridge Score: {bridge_score:.4f}\nLanes Connected: {lanes_count}", # Tooltip on hover
        color=node_color,
        size=node_size
    )

# --- 6. ADD ROAD CONNECTION LINES ---
for source, target, data in G.edges(data=True):
    if source in hubs_scorecard['Hub_ID'].values and target in hubs_scorecard['Hub_ID'].values:
        net.add_edge(source, target, value=data['weight'], title=f"Delay Factor: {data['weight']:.2f}")

# --- 7. SAVE AND LAUNCH ---
net.toggle_physics(True)
output_filename = "delhivery_user_friendly_network.html"
net.save_graph(output_filename)

print("🎉 Complete! Opening your readable map in your web browser...")
webbrowser.open('file://' + os.path.realpath(output_filename))