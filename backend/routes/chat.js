const express = require('express');
const router = express.Router();
const { CHAT_RESPONSES } = require('../data/mockData');

function classifyMessage(message) {
  const lower = message.toLowerCase();
  if (/food|eat|bicolano|spicy|pinangat|bicol express|kain|restaurant|lunch|dinner/.test(lower)) return 'food';
  if (/nature|green|hills|park|eco|environment|forest/.test(lower)) return 'nature';
  if (/hike|hiking|trek|mayon|volcano|climb|mountain/.test(lower)) return 'hiking';
  if (/heritage|history|church|ruins|museum|culture|historic/.test(lower)) return 'heritage';
  return 'default';
}

router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const category = classifyMessage(message);
  const response = CHAT_RESPONSES[category] || CHAT_RESPONSES.default;

  setTimeout(() => res.json(response), 600);
});

module.exports = router;
