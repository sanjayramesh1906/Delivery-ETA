import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

def run_logistics_pipeline():
    # Forced absolute path to bypass VS Code environment directory mismatches
    data_filename = r"C:\CA IITG\Delivery-ETA\delivery_data.csv"
    
    if not os.path.exists(data_filename):
        print("Error: Could not find delivery_data.csv at the specified path.")
        print("Path attempted:", data_filename)
        return
        
    print("Dataset found at fixed path. Loading data into memory.")
    df = pd.read_csv(data_filename)
    print("Data loaded successfully.")

    # Data Aggregation
    segment_cols = ['trip_uuid', 'source_center', 'destination_center']
    segment_agg = {
        'route_type': 'first',
        'trip_creation_time': 'first',
        'start_scan_to_end_scan': 'first',
        'actual_distance_to_destination': 'max',
        'actual_time': 'max',
        'osrm_distance': 'max',
        'osrm_time': 'max',
    }
    df_seg = df.groupby(segment_cols).agg(segment_agg).reset_index()

    trip_agg = {
        'route_type': 'first',
        'trip_creation_time': 'first',
        'start_scan_to_end_scan': 'sum',
        'actual_distance_to_destination': 'sum',
        'actual_time': 'sum',
        'osrm_distance': 'sum',
        'osrm_time': 'sum',
    }
    df_trip = df_seg.groupby('trip_uuid').agg(trip_agg).reset_index()

    # Feature Engineering
    df_trip['trip_creation_time'] = pd.to_datetime(df_trip['trip_creation_time'])
    df_trip['hour'] = df_trip['trip_creation_time'].dt.hour
    df_trip['dayofweek'] = df_trip['trip_creation_time'].dt.dayofweek
    
    df_trip['dist_diff'] = df_trip['actual_distance_to_destination'] - df_trip['osrm_distance']
    df_trip['time_diff'] = df_trip['actual_time'] - df_trip['osrm_time']

    le = LabelEncoder()
    df_trip['target'] = le.fit_transform(df_trip['route_type'])

    features = [
        'start_scan_to_end_scan', 'actual_distance_to_destination', 'actual_time', 
        'osrm_distance', 'osrm_time', 'hour', 'dayofweek', 'dist_diff', 'time_diff'
    ]
    
    X = df_trip[features]
    y = df_trip['target']

    # Train Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Model Training
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Output Performance Report
    print("Generating Operational Report")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("Model Prediction Accuracy:", accuracy * 100)
    
    print("Detailed Classification Performance:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    print("Historical Route Averages:")
    avg_metrics = df_trip.groupby('route_type')[['actual_distance_to_destination', 'actual_time']].mean()
    for mode in le.classes_:
        dist = avg_metrics.loc[mode, 'actual_distance_to_destination']
        duration = avg_metrics.loc[mode, 'actual_time'] / 60
        print("Type:", mode, "Distance:", dist, "km, Duration:", duration, "hours")
        
    print("Top Decision Factors:")
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    for i in range(min(4, len(features))):
        print("Rank", i+1, features[indices[i]], "Score:", importances[indices[i]])

    sorted_features = [features[i] for i in indices]
    sorted_imps = importances[indices]
    plt.barh(sorted_features[::-1], sorted_imps[::-1], color='blue')
    plt.xlabel('Importance Weight')
    plt.title('Logistics Decision Drivers')
    plt.tight_layout()
    
    # Save the chart directly to the specific project folder
    plt.savefig(r"C:\CA IITG\Delivery-ETA\vehicle_decision_drivers.png")
    plt.close()
    print("The plot has been saved successfully as vehicle_decision_drivers.png")

if __name__ == "__main__":
    run_logistics_pipeline()