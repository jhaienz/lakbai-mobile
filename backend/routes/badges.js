const express = require('express');
const router = express.Router();
const { BADGES } = require('../data/mockData');

router.get('/', (req, res) => {
  res.json(BADGES);
});

router.get('/user', (req, res) => {
  const unlocked = BADGES.filter(b => b.unlocked);
  res.json(unlocked);
});

module.exports = router;
