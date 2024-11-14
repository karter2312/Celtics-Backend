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
     

