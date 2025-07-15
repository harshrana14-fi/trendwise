// api/trends/route.js
const express = require('express');
const TrendAggregator = require('@/lib/trendAggregator');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const trendAggregator = new TrendAggregator();

// Rate limiting
const trendsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.use(trendsLimiter);

/**
 * GET /api/trends
 * Get all trending topics from all sources
 */
router.get('/', async (req, res) => {
  try {
    const {
      geo = 'US',
      includeGoogleTrends = 'true',
      includeSocialMedia = 'true',
      includeArticles = 'true',
      articleLimit = '10',
      period = '24h'
    } = req.query;

    const options = {
      geo,
      includeGoogleTrends: includeGoogleTrends === 'true',
      includeSocialMedia: includeSocialMedia === 'true',
      includeArticles: includeArticles === 'true',
      articleLimit: parseInt(articleLimit),
      socialMediaOptions: {
        twitter: true,
        reddit: true,
        youtube: true
      }
    };

    const trends = await trendAggregator.getTrendingTopicsForPeriod(period, options);
    const summary = trendAggregator.generateTrendSummary(trends);

    res.json({
      success: true,
      data: trends,
      summary,
      meta: {
        requestTime: new Date(),
        processingTime: trends.processingTime,
        parameters: options
      }
    });
  } catch (error) {
    console.error('Error in /api/trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

/**
 * GET /api/trends/google
 * Get Google Trends data only
 */
router.get('/google', async (req, res) => {
  try {
    const { geo = 'US' } = req.query;
    
    const googleTrends = trendAggregator.googleTrends;
    const trends = await googleTrends.getTrendingTopics(geo);
    
    res.json({
      success: true,
      data: trends,
      meta: {
        source: 'Google Trends',
        geo,
        count: trends.length,
        requestTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/google:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google Trends',
      message: error.message
    });
  }
});

/**
 * GET /api/trends/social
 * Get social media trends
 */
router.get('/social', async (req, res) => {
  try {
    const {
      platforms = 'twitter,reddit,youtube',
      twitterWoeid = '1',
      redditSubreddit = 'all',
      youtubeRegion = 'US'
    } = req.query;

    const platformList = platforms.split(',');
    const options = {
      twitter: platformList.includes('twitter'),
      reddit: platformList.includes('reddit'),
      youtube: platformList.includes('youtube'),
      twitterWoeid: parseInt(twitterWoeid),
      redditSubreddit,
      youtubeRegion
    };

    const socialMedia = trendAggregator.socialMedia;
    const trends = await socialMedia.getAllTrends(options);
    
    res.json({
      success: true,
      data: trends,
      meta: {
        source: 'Social Media',
        platforms: platformList,
        requestTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/social:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social media trends',
      message: error.message
    });
  }
});

/**
 * GET /api/trends/articles/:query
 * Get articles for a specific topic
 */
router.get('/articles/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const {
      limit = '20',
      useNewsAPI = 'true',
      useGoogleNews = 'true',
      useSerpAPI = 'false'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      useNewsAPI: useNewsAPI === 'true',
      useGoogleNews: useGoogleNews === 'true',
      useSerpAPI: useSerpAPI === 'true'
    };

    const articleService = trendAggregator.articleService;
    const articles = await articleService.fetchAllArticles(query, options);
    
    res.json({
      success: true,
      data: articles,
      meta: {
        query,
        count: articles.length,
        sources: options,
        requestTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

/**
 * GET /api/trends/category/:category
 * Get trends by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const {
      geo = 'US',
      period = '24h',
      articleLimit = '10'
    } = req.query;

    const options = {
      geo,
      articleLimit: parseInt(articleLimit),
      includeGoogleTrends: true,
      includeSocialMedia: true,
      includeArticles: true
    };

    const trends = await trendAggregator.getTrendingTopicsByCategory(category, options);
    const summary = trendAggregator.generateTrendSummary(trends);

    res.json({
      success: true,
      data: trends,
      summary,
      meta: {
        category,
        requestTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category trends',
      message: error.message
    });
  }
});

/**
 * GET /api/trends/summary
 * Get a quick summary of current trends
 */
router.get('/summary', async (req, res) => {
  try {
    const { geo = 'US' } = req.query;
    
    const options = {
      geo,
      includeGoogleTrends: true,
      includeSocialMedia: true,
      includeArticles: false, // Skip articles for faster response
      articleLimit: 0
    };

    const trends = await trendAggregator.aggregateAllTrends(options);
    const summary = trendAggregator.generateTrendSummary(trends);

    res.json({
      success: true,
      data: summary,
      meta: {
        requestTime: new Date(),
        processingTime: trends.processingTime
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends summary',
      message: error.message
    });
  }
});

/**
 * POST /api/trends/analyze
 * Analyze multiple topics at once
 */
router.post('/analyze', async (req, res) => {
  try {
    const { topics, options = {} } = req.body;
    
    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Topics array is required'
      });
    }

    const articleService = trendAggregator.articleService;
    const results = [];

    for (const topic of topics.slice(0, 5)) { // Limit to 5 topics
      try {
        const articles = await articleService.fetchAllArticles(topic, {
          limit: options.articleLimit || 10,
          useNewsAPI: options.useNewsAPI !== false,
          useGoogleNews: options.useGoogleNews !== false,
          useSerpAPI: options.useSerpAPI === true
        });

        results.push({
          topic,
          articles,
          count: articles.length
        });
      } catch (error) {
        console.error(`Error analyzing topic ${topic}:`, error);
        results.push({
          topic,
          articles: [],
          count: 0,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      meta: {
        requestTime: new Date(),
        topicsAnalyzed: topics.length
      }
    });
  } catch (error) {
    console.error('Error in /api/trends/analyze:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze topics',
      message: error.message
    });
  }
});

module.exports = router;