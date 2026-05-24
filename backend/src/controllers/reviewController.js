const Review = require('../models/Review');
const Settings = require('../models/Settings');
const { generateAIReview } = require('../utils/aiEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Generate a code review
// @route   POST /api/reviews/analyze
// @access  Private
const analyzeCode = async (req, res, next) => {
  try {
    const { code, title, language, prDiff, repoUrl } = req.body;

    if (!code && !prDiff) {
      res.status(400);
      throw new Error('Please provide source code or a PR diff to review');
    }

    // Fetch user settings to retrieve any personal Gemini API keys
    const settings = await Settings.findOne({ userId: req.user._id });
    const userApiKey = settings ? settings.geminiKey : '';

    const reviewContent = code || prDiff;
    const reviewTitle = title || (repoUrl ? `Repo Review: ${repoUrl.split('/').pop()}` : 'Source Code Review');
    const reviewLang = language || 'javascript';

    // Generate AI Review
    const analysis = await generateAIReview(reviewContent, reviewLang, userApiKey);

    // Save to DB
    const review = await Review.create({
      userId: req.user._id,
      title: reviewTitle,
      code: code || '',
      prDiff: prDiff || '',
      repoUrl: repoUrl || '',
      status: analysis.verdict,
      score: analysis.score,
      metrics: analysis.metrics,
      issues: analysis.issues,
      confidenceScore: analysis.confidenceScore || 85,
    });

    res.status(201).json({
      success: true,
      data: review,
      source: analysis.reviewSource || 'AI Engine'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for current user
// @route   GET /api/reviews
// @access  Private
const getReviews = async (req, res, next) => {
  try {
    const { search, status, limit = 50 } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Private
const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Chat assistant for debugging review
// @route   POST /api/reviews/:id/chat
// @access  Private
const chatOnReview = async (req, res, next) => {
  try {
    const { message, chatHistory = [] } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Please enter a chat message');
    }

    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      res.status(404);
      throw new Error('Review context not found');
    }

    // Get user's custom api key
    const settings = await Settings.findOne({ userId: req.user._id });
    const geminiKey = settings?.geminiKey || process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Construct history context
        let promptContext = `You are CodeSage AI Chat Assistant. You are debugging code with a developer.
Here is the source code context being reviewed:
\`\`\`
${review.code || review.prDiff}
\`\`\`

Here are the AI review issues found:
${JSON.stringify(review.issues, null, 2)}

Provide clear, helpful guidance. Keep suggestions aligned with fixing these issues.
`;
        
        // Setup Chat history format
        const historyParts = chatHistory.map(ch => ({
          role: ch.role === 'user' ? 'user' : 'model',
          parts: [{ text: ch.content }]
        }));

        const chatSession = model.startChat({
          history: [
            { role: 'user', parts: [{ text: promptContext }] },
            { role: 'model', parts: [{ text: "Understood. I've indexed the code and the issues found. I am ready to answer any questions or provide suggestions to fix these items." }] },
            ...historyParts
          ]
        });

        const result = await chatSession.sendMessage(message);
        return res.json({
          success: true,
          response: result.response.text()
        });
      } catch (aiError) {
        console.error('Gemini chat session error, falling back to mock reply:', aiError.message);
      }
    }

    // Mock Chat fallback responses based on keywords
    let response = "I've analyzed your question. To fix this issue, ensure that you follow the refactoring guides, replace dependencies with safer packages, and properly handle errors in callback functions.";
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('secret') || lowerMessage.includes('password') || lowerMessage.includes('api')) {
      response = "For the hardcoded secret, the best practice is to remove it from this file entirely. Create a file named `.env` in your project root, add `JWT_SECRET=your_super_key_here`, install the `dotenv` package, and call `require('dotenv').config()` in your app startup. Then replace the hardcoded string with `process.env.JWT_SECRET`. Make sure to add `.env` to your `.gitignore` file!";
    } else if (lowerMessage.includes('eval') || lowerMessage.includes('injection')) {
      response = "Using `eval()` creates a severe injection threat because any input passed into query params will execute as Javascript code on your server. To fix this, change it from `eval('req.query.' + query)` to direct key lookup: `const result = req.query[query]`. This prevents expression execution entirely.";
    } else if (lowerMessage.includes('sync') || lowerMessage.includes('readfilesync') || lowerMessage.includes('block')) {
      response = "To refactor synchronous file operations, import `fs` promises or use async callbacks. For example, replace `fs.readFileSync('./tokens.json')` with `const data = await fs.promises.readFile('./tokens.json', 'utf8')`. Make sure the parent function `loadUserTokens` is marked as `async` and the callers use `await` as well. This prevents blocking the Express main thread.";
    } else if (lowerMessage.includes('equality') || lowerMessage.includes('loose') || lowerMessage.includes('==')) {
      response = "To fix loose equality warnings, replace the dual equals (`==`) with triple equals (`===`). This checks both the value and the type, which avoids unexpected Javascript coercion behaviors (such as `'' == false` being true). Changing `adminRole == true` to `adminRole === true` guarantees security verification.";
    }

    res.json({
      success: true,
      response
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeCode,
  getReviews,
  getReviewById,
  deleteReview,
  chatOnReview
};
