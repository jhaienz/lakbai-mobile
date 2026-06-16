const express = require('express');
const router = express.Router();
const { PLACES } = require('../data/mockData');

router.get('/', (req, res) => {
  const { tag, verified } = req.query;
  let results = [...PLACES];

  if (tag) {
    results = results.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }
  if (verified === 'true') {
    results = results.filter(p => p.isVerified);
  }
  res.json(results);
});

router.get('/featured', (req, res) => {
  const featured = PLACES.filter(p => p.isVerified).slice(0, 4);
  res.json(featured);
});

router.get('/:id', (req, res) => {
  const place = PLACES.find(p => p.id === req.params.id);
  if (!place) return res.status(404).json({ error: 'Place not found' });
  res.json(place);
});

module.exports = router;
