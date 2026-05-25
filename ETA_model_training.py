import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder

print("\nStep 1: Loading dataset...")
try:
    df = pd.read_csv('delivery_data.csv')
except FileNotFoundError:
    print("Error: 'delivery_data.csv' not found in this folder. Make sure the script and CSV are together!")
    exit()

print("Step 2: Running Advanced Feature Engineering...")

# 1. Convert timestamp strings into real Date/Time objects
df['od_start_time'] = pd.to_datetime(df['od_start_time'])

# 2. Extract Time Features (Traffic & Dispatch patterns change by hour/day)
df['start_hour'] = df['od_start_time'].dt.hour
df['start_day_of_week'] = df['od_start_time'].dt.dayofweek

# 3. Calculate Speed Features (Helps the AI recognize slow vs fast segments)
df['calculated_osrm_speed'] = df['osrm_distance'] / (df['osrm_time'] / 60.0 + 0.1)
df['segment_osrm_speed'] = df['segment_osrm_distance'] / (df['segment_osrm_time'] / 60.0 + 0.1)

# 4. Create Ratios (Tracks structural bottlenecks and routing detours)
df['distance_ratio'] = df['actual_distance_to_destination'] / (df['osrm_distance'] + 0.1)

# List of advanced features to feed into the model
features = [
    'route_type', 
    'source_center',
    'destination_center',
    'actual_distance_to_destination', 
    'osrm_time', 
    'osrm_distance', 
    'segment_osrm_time', 
    'segment_osrm_distance',
    'start_hour',
    'start_day_of_week',
    'calculated_osrm_speed',
    'segment_osrm_speed',
    'distance_ratio'
]
target = 'start_scan_to_end_scan'

# Clean up rows with missing data
df = df.dropna(subset=[target] + features)

X = df[features].copy()
y = df[target].copy()

# Encode all text categories into mathematical inputs
le = LabelEncoder()
for col in ['route_type', 'source_center', 'destination_center']:
    X[col] = le.fit_transform(X[col].astype(str))

# Split data (80% training, 20% validation testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Step 3: Training High-Capacity Random Forest Regressor...")
model = RandomForestRegressor(n_estimators=80, max_features='sqrt', random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
print("Model Training Complete!")

# Evaluate the model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n=======================================")
print("     UPGRADED MODEL PERFORMANCE METRICS    ")
print("=======================================")
print(f" New Model Accuracy (R2 Score): {r2 * 100:.2f}%")
print(f" Mean Absolute Error (MAE): {mae:.2f} minutes")
print("=======================================\n")

# ====================================================
# LIVE INTERACTIVE PREDICTION LOOP
# ====================================================
print("--- LIVE HIGH-ACCURACY PREDICTIONS ---")
while True:
    try:
        print("\nEnter trip details to run prediction (or type 'exit' to quit):")
        dist_input = input("Enter actual distance to destination (in km): ")
        if dist_input.lower() == 'exit': 
            print("Exiting application.")
            break
            
        ot = float(input("Enter OSRM estimated time (in minutes): "))
        od = float(input("Enter OSRM estimated distance (in km): "))
        hr = int(input("Enter dispatch hour of day (0-23): "))
        day = int(input("Enter day of week (0=Monday, 6=Sunday): "))
        
        # Pre-compute the custom engineered ratios for the live case
        speed = od / (ot / 60.0 + 0.1)
        dist_ratio = float(dist_input) / (od + 0.1)
        
        # Build vector matching feature order exactly
        live_case = np.array([[0, 0, 0, float(dist_input), ot, od, ot, od, hr, day, speed, speed, dist_ratio]])
        predicted_eta = model.predict(live_case)
        
        print(f"\nPredicted ETA: {predicted_eta[0]:.2f} minutes (approx. {predicted_eta[0]/60:.1f} hours)")
        print("-" * 50)
    except ValueError:
        print("Invalid entry. Please use numbers.")