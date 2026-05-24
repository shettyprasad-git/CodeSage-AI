const Review = require('../models/Review');
const Repository = require('../models/Repository');

// @desc    Get dashboard analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const repos = await Repository.find({ userId: req.user._id });

    // Base totals
    const totalReviews = reviews.length;
    const totalRepos = repos.length;
    
    let totalScoreSum = 0;
    let totalBugs = 0;
    let totalSecurity = 0;
    let totalPerformance = 0;
    let totalSmells = 0;
    let totalReadability = 0;

    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    reviews.forEach(review => {
      totalScoreSum += review.score;
      totalBugs += review.metrics.bugs || 0;
      totalSecurity += review.metrics.security || 0;
      totalPerformance += review.metrics.performance || 0;
      totalSmells += review.metrics.smells || 0;
      totalReadability += review.metrics.readability || 0;

      review.issues.forEach(issue => {
        if (issue.severity === 'critical') criticalIssues++;
        else if (issue.severity === 'high') highIssues++;
        else if (issue.severity === 'medium') mediumIssues++;
        else if (issue.severity === 'low') lowIssues++;
      });
    });

    const averageScore = totalReviews > 0 ? Math.round(totalScoreSum / totalReviews) : 100;

    // Quality Trend over time (newest reviews first, reversed for chronological chart display)
    const qualityTrend = reviews.slice(0, 10).map(r => ({
      name: r.title.length > 15 ? r.title.substring(0, 12) + '...' : r.title,
      score: r.score,
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })).reverse();

    // Default trend filler if none exist
    const defaultTrend = [
      { name: 'Initial', score: 100, date: 'May 20' },
    ];

    res.json({
      success: true,
      data: {
        stats: {
          totalReviews,
          totalRepos,
          averageScore,
          totalIssues: totalBugs + totalSecurity + totalPerformance + totalSmells + totalReadability,
          openIssuesInRepos: repos.reduce((sum, r) => sum + r.openIssues, 0)
        },
        issueDistribution: [
          { name: 'Bugs', value: totalBugs },
          { name: 'Security', value: totalSecurity },
          { name: 'Performance', value: totalPerformance },
          { name: 'Code Smells', value: totalSmells },
          { name: 'Readability', value: totalReadability }
        ],
        severitySplit: [
          { name: 'Critical', value: criticalIssues, color: '#EF4444' }, // Red
          { name: 'High', value: highIssues, color: '#F97316' },       // Orange
          { name: 'Medium', value: mediumIssues, color: '#EAB308' },   // Yellow
          { name: 'Low', value: lowIssues, color: '#3B82F6' }          // Blue
        ],
        qualityTrend: qualityTrend.length > 0 ? qualityTrend : defaultTrend,
        // Active reviews count per weekday simulation
        activity: compileActivitySummary(reviews)
      }
    });
  } catch (error) {
    next(error);
  }
};

const compileActivitySummary = (reviews) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

  // Calculate review counts for current week
  reviews.forEach(review => {
    const dayName = weekdays[new Date(review.createdAt).getDay()];
    counts[dayName]++;
  });

  return Object.keys(counts).map(day => ({
    day,
    reviews: counts[day]
  }));
};

module.exports = { getSummary };
