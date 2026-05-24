// Shared constants for CodeSage AI

const ISSUE_TYPES = {
  BUG: 'bug',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  SMELL: 'smell',
  READABILITY: 'readability',
  STYLE: 'style'
};

const SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const VERDICTS = {
  APPROVED: 'approved',
  NEEDS_CHANGES: 'needs_changes'
};

module.exports = {
  ISSUE_TYPES,
  SEVERITIES,
  VERDICTS
};
