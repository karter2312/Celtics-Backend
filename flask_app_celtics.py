from flask import Flask, request, jsonify
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from flask_cors import CORS  # Import CORS for Cross-Origin Resource Sharing

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load and preprocess NBA data
def load_data():
    project_path = 'C:\\Users\\karte\\OneDrive\\Desktop\\BostonCelticsApp\\backend'  # Corrected path
    csv_files = [
        '2023-2024 NBA Player Stats_exported.csv',
        'bostoncelticsplayerstats.csv'
    ]
    data_frames = []
    for csv_file in csv_files:
        file_path = os.path.join(project_path, csv_file)
        try:
            df = pd.read_csv(file_path)
            data_frames.append(df)
        except Exception as e:
            print(f"Error: Could not load {csv_file} from {file_path}. Error: {e}")
    return data_frames

# Preprocess data
def preprocess_data(data_frames):
    player_stats_df = data_frames[0]
    player_stats_df = player_stats_df.rename(columns={
        'Unnamed: 0': 'Player',
        'Unnamed: 1': 'PTS/G',
        'Unnamed: 2': 'MP',
        'Unnamed: 3': 'FG%',
        'Unnamed: 4': '3P%',
        'Unnamed: 5': 'AST',
        'Unnamed: 6': 'Tm'  # Assuming 'Tm' is the correct column name for teams
    })
    player_stats_df = player_stats_df[['Player', 'PTS/G', 'MP', 'FG%', '3P%', 'AST', 'Tm']]
    return player_stats_df

# Train the model
player_stats_df = preprocess_data(load_data())
player_stats_df['High_Scorer'] = player_stats_df['PTS/G'] > 20
X = player_stats_df[['PTS/G', 'MP', 'FG%', '3P%', 'AST']]
y = player_stats_df['High_Scorer']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.2f}")
print("Classification Report:")
print(report)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Convert the input data to a DataFrame
        sample = pd.DataFrame([data])
        
        # Ensure all necessary features are provided
        required_features = ['PTS/G', 'MP', 'FG%', '3P%', 'AST']
        if not all(feature in sample.columns for feature in required_features):
            return jsonify({'error': f'Missing one or more required features: {required_features}'}), 400
        
        # Predict using the trained model
        prediction = model.predict(sample)
        return jsonify({'prediction': bool(prediction[0])})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)  # Run the server locally on port 8080
