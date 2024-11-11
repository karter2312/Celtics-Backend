const express = require('express');
     const cors = require('cors');
     const fs = require('fs');
     const csv = require('csv-parser');
     const path = require('path');
     const app = express();
     const PORT = 5000;

     app.use(cors());
     app.use(express.json());

     // Load Boston Celtics player data from CSV files
     let players = [];

     // Dynamically load all CSV files in the backend folder
     const backendFolderPath = path.join(__dirname);

     fs.readdir(backendFolderPath, (err, files) => {
       if (err) {
         console.error('Error reading backend folder:', err);
         return;
       }
       files.filter(file => file.endsWith('.csv')).forEach((file) => {
         fs.createReadStream(path.join(backendFolderPath, file))
           .pipe(csv())
           .on('data', (row) => {
             players.push({
               id: row.PlayerID || row.Player,  // Replace with actual column names from each CSV file
               name: row.PlayerName || row.Player, 
               pointsPerGame: parseFloat(row.PTS || row['Points Per Game'] || row['PTS/G']),
               assists: parseFloat(row.AST || row['Assists']),
               rebounds: parseFloat(row.REB || row['Rebounds']),
               team: 'Boston Celtics'
             });
           })
           .on('end', () => {
             console.log(`${file} data loaded successfully.`);
           });
       });
     });

     // API routes to serve player data
     app.get('/api/players', (req, res) => {
       res.json(players);
     });

     app.get('/api/players/:id', (req, res) => {
       const player = players.find(p => p.id === req.params.id);
       if (player) {
         res.json(player);
       } else {
         res.status(404).send('Player not found');
       }
     });

     app.listen(PORT, () => {
       console.log(`Server running on http://localhost:${PORT}`);
     });
     ```

   - **flask_app_celtics.py**
     ```python
     # flask_app_celtics.py
     from flask import Flask, request, jsonify
     import pandas as pd
     from sklearn.ensemble import RandomForestClassifier
     from sklearn.model_selection import train_test_split
     from flask_cors import CORS
     import os

     app = Flask(__name__)
     CORS(app)

     # Load and preprocess Boston Celtics data
     def load_data():
         # Load all CSV files in the backend directory
         csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
         dataframes = []
         for file in csv_files:
             df = pd.read_csv(file)
             df = df.rename(columns={
                 'Unnamed: 0': 'Player',
                 'Unnamed: 1': 'PTS/G',
                 'Unnamed: 2': 'MP',
                 'Unnamed: 3': 'FG%',
                 'Unnamed: 4': '3P%',
                 'Unnamed: 5': 'AST',
                 'Unnamed: 6': 'Tm'
             })
             df['PTS/G'] = pd.to_numeric(df['PTS/G'], errors='coerce')
             dataframes.append(df[['Player', 'PTS/G', 'MP', 'FG%', '3P%', 'AST', 'Tm']])
         return pd.concat(dataframes, ignore_index=True)

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
             sample = pd.DataFrame([data])
             prediction = model.predict(sample)
             return jsonify({'prediction': bool(prediction[0])})
         except Exception as e:
             return jsonify({'error': str(e)}), 400

     if __name__ == '__main__':
         app.run(port=5001)