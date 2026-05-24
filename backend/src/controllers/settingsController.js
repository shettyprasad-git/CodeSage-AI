const Settings = require('../models/Settings');

// @desc    Get current user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    
    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        theme: 'dark',
        geminiKey: '',
        githubToken: '',
        notifications: { email: true, push: false }
      });
    }

    // Mask sensitive keys before returning to frontend
    const maskedSettings = {
      theme: settings.theme,
      geminiKey: settings.geminiKey ? '••••••••••••••••' + settings.geminiKey.slice(-4) : '',
      githubToken: settings.githubToken ? '••••••••••••••••' + settings.githubToken.slice(-4) : '',
      notifications: settings.notifications,
      hasGeminiKey: !!settings.geminiKey,
      hasGithubToken: !!settings.githubToken
    };

    res.json({
      success: true,
      data: maskedSettings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { theme, geminiKey, githubToken, notifications } = req.body;
    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = new Settings({ userId: req.user._id });
    }

    if (theme) settings.theme = theme;
    
    // Only update key if it is not the masked placeholder
    if (geminiKey && !geminiKey.startsWith('••••')) {
      settings.geminiKey = geminiKey;
    }
    
    if (githubToken && !githubToken.startsWith('••••')) {
      settings.githubToken = githubToken;
    }

    if (notifications) {
      settings.notifications = {
        ...settings.notifications,
        ...notifications
      };
    }

    await settings.save();

    const maskedSettings = {
      theme: settings.theme,
      geminiKey: settings.geminiKey ? '••••••••••••••••' + settings.geminiKey.slice(-4) : '',
      githubToken: settings.githubToken ? '••••••••••••••••' + settings.githubToken.slice(-4) : '',
      notifications: settings.notifications,
      hasGeminiKey: !!settings.geminiKey,
      hasGithubToken: !!settings.githubToken
    };

    res.json({
      success: true,
      data: maskedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
