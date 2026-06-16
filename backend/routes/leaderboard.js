const express = require('express');
const router = express.Router();
const { LEADERBOARD } = require('../data/mockData');

router.get('/', (req, res) => {
  res.json(LEADERBOARD);
});

module.exports = router;
