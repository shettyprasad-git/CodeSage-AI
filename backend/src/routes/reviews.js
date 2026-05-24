const express = require('express');
const router = express.Router();
const { 
  analyzeCode, 
  getReviews, 
  getReviewById, 
  deleteReview,
  chatOnReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/analyze', analyzeCode);
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.delete('/:id', deleteReview);
router.post('/:id/chat', chatOnReview);

module.exports = router;
