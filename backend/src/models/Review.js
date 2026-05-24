const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bug', 'security', 'performance', 'smell', 'readability', 'style'],
    required: true
  },
  line: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    required: true
  },
  snippet: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
});

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Code Review'
  },
  code: {
    type: String,
    default: ''
  },
  prDiff: {
    type: String,
    default: ''
  },
  repoUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['approved', 'needs_changes'],
    default: 'needs_changes'
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  metrics: {
    bugs: { type: Number, default: 0 },
    security: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    smells: { type: Number, default: 0 },
    readability: { type: Number, default: 0 }
  },
  issues: [IssueSchema],
  confidenceScore: {
    type: Number,
    default: 85
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
