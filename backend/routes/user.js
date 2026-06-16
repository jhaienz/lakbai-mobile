const express = require('express');
const router = express.Router();

let currentUser = {
  id: 'u4',
  name: 'Jake Roi',
  vibes: ['Food', 'Heritage', 'Tech'],
  points: 9850,
  level: 'Urban Explorer & Local Supporter',
  contributions: 2400,
  rank: 4,
  mobility: 'Vehicle',
  budget: 'Mid-Range',
  interests: ['Tech', 'Heritage', 'Food'],
};

router.get('/', (req, res) => {
  res.json(currentUser);
});

router.post('/', (req, res) => {
  const { name, vibes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  currentUser = {
    ...currentUser,
    id: `u_${Date.now()}`,
    name,
    vibes: vibes || [],
    interests: vibes || [],
    points: 0,
    rank: 99,
    contributions: 0,
  };
  res.status(201).json(currentUser);
});

router.put('/', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json(currentUser);
});

module.exports = router;
