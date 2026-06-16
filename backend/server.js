const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const placesRoutes = require('./routes/places');
const itineraryRoutes = require('./routes/itinerary');
const chatRoutes = require('./routes/chat');
const leaderboardRoutes = require('./routes/leaderboard');
const badgesRoutes = require('./routes/badges');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LakbAI API', version: '1.0.0' });
});

app.use('/api/user', userRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`LakbAI API running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/user');
  console.log('  POST /api/user');
  console.log('  GET  /api/places');
  console.log('  GET  /api/places/featured');
  console.log('  POST /api/itinerary/generate');
  console.log('  POST /api/chat');
  console.log('  GET  /api/leaderboard');
  console.log('  GET  /api/badges');
});
