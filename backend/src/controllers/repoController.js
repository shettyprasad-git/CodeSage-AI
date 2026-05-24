const Repository = require('../models/Repository');
const Settings = require('../models/Settings');
const Review = require('../models/Review');
const { fetchRepoDetails } = require('../utils/githubConnector');
const { generateAIReview } = require('../utils/aiEngine');

// @desc    Import/Fetch a repository from GitHub URL
// @route   POST /api/repos/import
// @access  Private
const importRepository = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400);
      throw new Error('Please provide a repository URL');
    }

    // Get user's github token if saved in Settings
    const settings = await Settings.findOne({ userId: req.user._id });
    const githubToken = settings?.githubToken || '';

    // Fetch repository information
    const repoData = await fetchRepoDetails(repoUrl, githubToken);

    // Save Repository metadata to DB
    let repository = await Repository.findOne({ userId: req.user._id, url: repoData.url });
    if (!repository) {
      repository = await Repository.create({
        userId: req.user._id,
        name: repoData.name,
        owner: repoData.owner,
        url: repoData.url,
        stars: repoData.stars,
        forks: repoData.forks,
        language: repoData.language,
        openIssues: repoData.openIssues
      });
    } else {
      // Update stats
      repository.stars = repoData.stars;
      repository.forks = repoData.forks;
      repository.openIssues = repoData.openIssues;
      await repository.save();
    }

    // Trigger an initial automated review for the main file (index.js or connection.js)
    const mainFile = repoData.files.find(f => f.path === 'index.js') || repoData.files[0];
    let initialReview = null;

    if (mainFile) {
      const geminiKey = settings?.geminiKey || '';
      const analysis = await generateAIReview(mainFile.content, repository.language.toLowerCase(), geminiKey);
      
      initialReview = await Review.create({
        userId: req.user._id,
        title: `Automatic Review: ${repository.name}/${mainFile.path}`,
        code: mainFile.content,
        repoUrl: repository.url,
        status: analysis.verdict,
        score: analysis.score,
        metrics: analysis.metrics,
        issues: analysis.issues,
        confidenceScore: analysis.confidenceScore || 85
      });
    }

    res.status(201).json({
      success: true,
      repository,
      files: repoData.files,
      initialReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all repositories for current user
// @route   GET /api/repos
// @access  Private
const getRepositories = async (req, res, next) => {
  try {
    const repos = await Repository.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importRepository,
  getRepositories
};
