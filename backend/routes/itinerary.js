const express = require('express');
const router = express.Router();
const { ITINERARIES, PLACES } = require('../data/mockData');

router.get('/', (req, res) => {
  res.json(ITINERARIES);
});

router.post('/generate', (req, res) => {
  const { vibes = [], budget = 'Mid-Range', days = 1 } = req.body;

  const filteredPlaces = vibes.length > 0
    ? PLACES.filter(p => p.tags.some(t => vibes.includes(t)))
    : PLACES;

  const selected = filteredPlaces.slice(0, Math.min(3, filteredPlaces.length));
  const startTimes = ['08:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'];

  const vibeLabel = vibes.length > 0 ? vibes.slice(0, 2).join(' & ') : 'Heritage & Spice';

  const itinerary = {
    id: `gen_${Date.now()}`,
    title: `Day ${days}: ${vibeLabel}`,
    subtitle: 'Your personalized journey through Legaspi.',
    day: days,
    totalBudget: budget === 'Budget' ? '₱80' : budget === 'Mid-Range' ? '₱130' : '₱250',
    stops: selected.map((place, i) => ({
      time: startTimes[i],
      place,
      transport: place.transport || 'Tricycle',
      transportCost: place.transportCost || '₱40',
      duration: '1.5 hours',
      notes: place.description,
    })),
  };

  res.json(itinerary);
});

module.exports = router;
