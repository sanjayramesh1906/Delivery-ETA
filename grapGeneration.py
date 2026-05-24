import pandas as pd
import numpy as np
import networkx as nx
import os

FILE_NAME = "delhivery_data.csv" 

print(" Step 1: Reading your dataset into Python...")
if not os.path.exists(FILE_NAME):
    raise FileNotFoundError(f"Could not find '{FILE_NAME}'. Please upload it to Colab's file panel first!")

# Read CSV (Use pd.read_excel(FILE_NAME) if your file is an Excel sheet)
df = pd.read_csv(FILE_NAME)
print(f"Dataset successfully loaded! Total rows detected: {len(df):,}")

# Drop rows that are missing critical routing IDs
df = df.dropna(subset=['source_center', 'destination_center', 'segment_factor'])


print("\n Step 2: Compressing 1Lakh+ rows into unique lanes...")
# Since thousands of trucks travel the same roads, we group them to find the true baseline network map
route_summary = df.groupby(['source_center', 'destination_center']).agg(
    median_segment_factor=('segment_factor', 'median'),
    total_trips_tracked=('segment_factor', 'count')
).reset_index()

print(f" Compression complete! Reduced heavy data into {len(route_summary):,} unique network lanes.")


print("\n Step 3: Constructing the Directed Network Graph...")
# Initialize a Directed Graph (DiGraph) because traffic flows from a specific Source to a Destination
G = nx.DiGraph()

# Feed the compressed unique routes into NetworkX
for _, row in route_summary.iterrows():
    G.add_edge(
        row['source_center'],
        row['destination_center'],
        weight=row['median_segment_factor'],  # Road weight = historical delay multiplier
        trips=row['total_trips_tracked']      # Tracked lane volume
    )

print(f"Network Map Complete! Total Infrastructure Hubs (Nodes): {G.number_of_nodes()} | Total Corridors (Edges): {G.number_of_edges()}")


# ==========================================
print("\n Step 4: Running Graph Theory Math (This might take a few seconds)...")

# Calculate Betweenness Centrality (Flags major geographical bridges/chokepoints)
print("   ↳ Calculating Bridge Scores (Betweenness Centrality)...")
betweenness = nx.betweenness_centrality(G, weight='weight')

# Calculate In-Degree and Out-Degree (Counts unique connecting lanes per hub)
in_degree = dict(G.in_degree())
out_degree = dict(G.out_degree())

# Create a clean, master scorecard table of your network hubs
hubs_scorecard = pd.DataFrame({
    'Hub_ID': list(betweenness.keys()),
    'Chokepoint_Bridge_Score': list(betweenness.values()),
    'Incoming_Lanes_Count': [in_degree[node] for node in betweenness.keys()],
    'Outgoing_Lanes_Count': [out_degree[node] for node in betweenness.keys()]
})

# Save the scorecard table as a fresh CSV file for your team
hubs_scorecard.to_csv("network_hubs_scorecard.csv", index=False)
print("💾 Saved network metrics to 'network_hubs_scorecard.csv'")


print("\n === TOP 15 CRITICAL BOTTLENECK HUBS DETECTED ===")
top_15 = hubs_scorecard.sort_values(by='Chokepoint_Bridge_Score', ascending=False).head(15)
print(top_15.to_string(index=False))
print("==================================================\n")


print(" Step 5: Injecting graph features back into the original 1Lakh+ dataset...")

# Merge the source hub metrics into the main 100,000+ row dataset
df = df.merge(hubs_scorecard[['Hub_ID', 'Chokepoint_Bridge_Score', 'Incoming_Lanes_Count']], 
              left_on='source_center', right_on='Hub_ID', how='left')
df.rename(columns={'Chokepoint_Bridge_Score': 'source_chokepoint_score', 
                   'Incoming_Lanes_Count': 'source_incoming_lanes'}, inplace=True)
df.drop(columns=['Hub_ID'], inplace=True)

# Merge the destination hub metrics into the main 100,000+ row dataset
df = df.merge(hubs_scorecard[['Hub_ID', 'Chokepoint_Bridge_Score', 'Incoming_Lanes_Count']], 
              left_on='destination_center', right_on='Hub_ID', how='left')
df.rename(columns={'Chokepoint_Bridge_Score': 'dest_chokepoint_score', 
                   'Incoming_Lanes_Count': 'dest_incoming_lanes'}, inplace=True)
df.drop(columns=['Hub_ID'], inplace=True)

# Fill any structural gaps with 0 just in case
df[['source_chokepoint_score', 'dest_chokepoint_score']] = df[['source_chokepoint_score', 'dest_chokepoint_score']].fillna(0)

# Save the brand new, graph-enhanced dataset for the ML Engineer
df.to_csv("graph_enhanced_ml_dataset.csv", index=False)
print(" Success! Generated 'graph_enhanced_ml_dataset.csv' containing your 1Lakh+ rows appended with structural graph columns.")