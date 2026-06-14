import pandas as pd
import json
import os

print("Starting mapping generation...")
# Load datasets
hubs = pd.read_csv("network_hubs_scorecard.csv")
trips = pd.read_csv("delivery_data.csv", usecols=["source_center", "source_name", "destination_center", "destination_name"])

# Build map
name_map = {}
for _, row in trips.iterrows():
    name_map[row["source_center"]] = row["source_name"]
    name_map[row["destination_center"]] = row["destination_name"]

print(f"Mapped {len(name_map)} unique hub names.")

result = []
for _, row in hubs.iterrows():
    hub_id = row["Hub_ID"]
    centrality = float(row["Chokepoint_Bridge_Score"])
    in_lanes = int(row["Incoming_Lanes_Count"])
    out_lanes = int(row["Outgoing_Lanes_Count"])
    
    # Get friendly name
    raw_name = name_map.get(hub_id, hub_id)
    
    # Let's clean up name and extract state
    # Example raw_name: "Anand_VUNagar_DC (Gujarat)"
    name_clean = str(raw_name)
    state = "Unknown"
    if isinstance(raw_name, str) and "(" in raw_name and ")" in raw_name:
        parts = raw_name.split("(")
        name_clean = parts[0].strip().replace("_", " ")
        state = parts[1].replace(")", "").strip()
    elif isinstance(raw_name, str):
        name_clean = raw_name.strip().replace("_", " ")
        
    # Infer hub role
    role = "Logistics Facility"
    name_upper = name_clean.upper()
    if "HUB" in name_upper or (isinstance(raw_name, str) and ("_H" in raw_name or "HB" in raw_name)):
        role = "Linehaul Hub"
    elif "GATEWAY" in name_upper or (isinstance(raw_name, str) and ("GW" in name_upper or "_G" in raw_name)):
        role = "Network Gateway"
    elif "SORT" in name_upper or (isinstance(raw_name, str) and ("SRT" in name_upper or "ST" in name_upper)):
        role = "Sorting Center"
    elif "DISPATCH" in name_upper or (isinstance(raw_name, str) and ("DPC" in name_upper or "DP" in name_upper)):
        role = "Dispatch Center"
    elif "FULFILL" in name_upper or (isinstance(raw_name, str) and ("FC" in name_upper)):
        role = "Fulfillment Center"
    elif "DELIVERY" in name_upper or (isinstance(raw_name, str) and ("DC" in name_upper or "PC" in name_upper)):
        role = "Last-Mile Delivery Hub"
        
    # Categorize status based on centrality
    if centrality > 0.05:
        status = "Critical"
        dwell = int(120 + centrality * 300)
    elif centrality > 0.01:
        status = "Moderate"
        dwell = int(60 + centrality * 200)
    else:
        status = "Smooth"
        dwell = int(15 + centrality * 100)
        
    result.append({
        "id": hub_id,
        "name": name_clean,
        "rawName": str(raw_name),
        "state": state,
        "centrality": round(centrality, 5),
        "inLanes": in_lanes,
        "outLanes": out_lanes,
        "dwellTimeMin": dwell,
        "status": status,
        "role": role
    })

# Save JSON file
out_path = "../frontend/my-react-app/src/services/hub_mappings.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Generated {len(result)} mappings in {out_path}.")
