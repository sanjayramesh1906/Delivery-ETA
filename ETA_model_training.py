import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder

print("⏳ Loading dataset...")
# 1. Load the data (make sure delivery_data.csv is in the same folder!)
df = pd.read_csv('delivery_data.csv')

# 2. Select important features for prediction
features = [
    'route_type', 
    'actual_distance_to_destination', 
    'osrm_time', 
    'osrm_distance', 
    'segment_osrm_time', 
    'segment_osrm_distance'
]
target = 'start_scan_to_end_scan'  # The overall delivery time target column

# Drop missing values to avoid calculation errors
df = df.dropna(subset=[target] + features)

X = df[features].copy()
y = df[target].copy()

print("🧹 Processing features...")
# Convert text ('Carting' or 'FTL') into standard numerical categories
le = LabelEncoder()
X['route_type'] = le.fit_transform(X['route_type'])

# 3. Split data into Training (80%) and Testing (20%) sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🤖 Training the Random Forest Model (This might take a minute)...")
# 4. Initialize and Train the Model
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

print("✅ Model Training Complete!")

# 5. Evaluate the model performance
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n📊 --- VS CODE MODEL METRICS ---")
print(f"Mean Absolute Error: {mae:.2f} minutes")
print(f"Model Accuracy (R² Score): {r2 * 100:.2f}%")
print("--------------------------------\n")