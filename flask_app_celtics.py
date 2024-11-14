from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from flask_cors import CORS  # Import CORS for Cross-Origin Resource Sharing

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load and preprocess Boston Celtics data
def load_data():
    player_stats_df = pd.read_csv('bostoncelticsplayerstats.csv')
    player_stats_df = player_stats_df.rename(columns={
        'Unnamed: 0': 'Player',
        'Unnamed: 1': 'PTS/G',
        'Unnamed: 2': 'MP',
        'Unnamed: 3': 'FG%',
        'Unnamed: 4': '3P%',
        'Unnamed: 5': 'AST',
        'Unnamed: 6': 'Tm'
    })

    # Convert 'PTS/G' to numeric (handle non-numeric values if present)
    player_stats_df['PTS/G'] = pd.to_numeric(player_stats_df['PTS/G'], errors='coerce')

    return player_stats_df[['Player', 'PTS/G', 'MP', 'FG%', '3P%', 'AST', 'Tm']]

# Train the model
player_stats_df = load_data()
player_stats_df['High_Scorer'] = player_stats_df['PTS/G'] > 20
X = player_stats_df[['PTS/G', 'MP', 'FG%', '3P%', 'AST']]
y = player_stats_df['High_Scorer']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

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
        
        prediction = model.predict(sample)
        return jsonify({'prediction': bool(prediction[0])})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)  # Run the server on port 8080 to comply with Google Cloud Run requirements
