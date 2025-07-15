// lib/trendAggregator.js
const GoogleTrendsService = require('./googleTrendsService');
const SocialMediaService = require('./socialMediaService');
const ArticleService = require('./articleService');

class TrendAggregator {
  constructor() {
    this.googleTrends = new GoogleTrendsService();
    this.socialMedia = new SocialMediaService();
    this.articleService = new ArticleService();
  }

  /**
   * Aggregate trends from all sources
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Aggregated trends data
   */
  async aggregateAllTrends(options = {}) {
    const {
      includeGoogleTrends = true,
      includeSocialMedia = true,
      includeArticles = true,
      geo = 'US',
      socialMediaOptions = {},
      articleLimit = 10
    } = options;

    const startTime = Date.now();
    const results = {
      timestamp: new Date(),
      processingTime: 0,
      trends: {},
      topTopics: [],
      errors: []
    };

    try {
      // Fetch Google Trends
      if (includeGoogleTrends) {
        try {
          console.log('Fetching Google Trends...');
          const googleTrends = await this.googleTrends.getTrendingTopics(geo);
          results.trends.google = googleTrends;
          console.log(`Found ${googleTrends.length} Google trends`);
        } catch (error) {
          console.error('Google Trends error:', error);
          results.errors.push({ source: 'Google Trends', error: error.message });
          results.trends.google = [];
        }
      }

      // Fetch Social Media trends
      if (includeSocialMedia) {
        try {
          console.log('Fetching Social Media trends...');
          const socialTrends = await this.socialMedia.getAllTrends(socialMediaOptions);
          results.trends.social = socialTrends.trends;
          console.log('Social media trends fetched');
        } catch (error) {
          console.error('Social Media error:', error);
          results.errors.push({ source: 'Social Media', error: error.message });
          results.trends.social = {};
        }
      }

      // Extract top topics and fetch related articles
      if (includeArticles) {
        try {
          console.log('Extracting top topics and fetching articles...');
          const topTopics = this.extractTopTopics(results.trends);
          results.topTopics = topTopics;

          // Fetch articles for each top topic
          for (const topic of topTopics.slice(0, 5)) { // Limit to top 5 topics
            try {
              console.log(`Fetching articles for: ${topic.name}`);
              const articles = await this.articleService.fetchAllArticles(
                topic.name,
                { limit: articleLimit }
              );
              topic.articles = articles;
              console.log(`Found ${articles.length} articles for ${topic.name}`);
            } catch (error) {
              console.error(`Error fetching articles for ${topic.name}:`, error);
              topic.articles = [];
            }
          }
        } catch (error) {
          console.error('Article fetching error:', error);
          results.errors.push({ source: 'Articles', error: error.message });
        }
      }

      results.processingTime = Date.now() - startTime;
      console.log(`Total processing time: ${results.processingTime}ms`);
      
      return results;
    } catch (error) {
      console.error('Error in trend aggregation:', error);
      results.errors.push({ source: 'Aggregator', error: error.message });
      results.processingTime = Date.now() - startTime;
      return results;
    }
  }

  /**
   * Extract top topics from all trend sources
   * @param {Object} trends - Trends data from all sources
   * @returns {Array} Array of top topics with scores
   */
  extractTopTopics(trends) {
    const topicScores = new Map();

    // Process Google Trends
    if (trends.google && Array.isArray(trends.google)) {
      trends.google.forEach(trend => {
        const score = this.calculateGoogleTrendScore(trend);
        this.addToTopicScores(topicScores, trend.title, score, 'Google Trends');
      });
    }

    // Process Social Media trends
    if (trends.social) {
      // Twitter trends
      if (trends.social.twitter) {
        trends.social.twitter.forEach(trend => {
          const score = this.calculateTwitterScore(trend);
          this.addToTopicScores(topicScores, trend.name, score, 'Twitter');
        });
      }

      // Reddit trends
      if (trends.social.reddit) {
        trends.social.reddit.forEach(trend => {
          const score = this.calculateRedditScore(trend);
          this.addToTopicScores(topicScores, trend.title, score, 'Reddit');
        });
      }

      // YouTube trends
      if (trends.social.youtube) {
        trends.social.youtube.forEach(trend => {
          const score = this.calculateYouTubeScore(trend);
          this.addToTopicScores(topicScores, trend.title, score, 'YouTube');
        });
      }
    }

    // Convert to array and sort by score
    const topTopics = Array.from(topicScores.entries())
      .map(([name, data]) => ({
        name,
        score: data.score,
        sources: data.sources,
        platforms: [...data.platforms]
      }))
      .sort((a, b) => b.score - a.score);

    return topTopics;
  }

  /**
   * Add topic to score tracking
   * @param {Map} topicScores - Map of topic scores
   * @param {string} topicName - Topic name
   * @param {number} score - Topic score
   * @param {string} platform - Platform source
   */
  addToTopicScores(topicScores, topicName, score, platform) {
    const normalizedName = this.normalizeTopicName(topicName);
    
    if (topicScores.has(normalizedName)) {
      const existing = topicScores.get(normalizedName);
      existing.score += score;
      existing.sources.push({ platform, score, originalName: topicName });
      existing.platforms.add(platform);
    } else {
      topicScores.set(normalizedName, {
        score,
        sources: [{ platform, score, originalName: topicName }],
        platforms: new Set([platform])
      });
    }
  }

  /**
   * Normalize topic name for comparison
   * @param {string} name - Topic name
   * @returns {string} Normalized name
   */
  normalizeTopicName(name) {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Calculate Google Trends score
   * @param {Object} trend - Google trend data
   * @returns {number} Score
   */
  calculateGoogleTrendScore(trend) {
    let score = 50; // Base score
    
    // Add score based on traffic
    if (trend.traffic) {
      const trafficMatch = trend.traffic.match(/(\d+)([KMB])?/);
      if (trafficMatch) {
        let traffic = parseInt(trafficMatch[1]);
        const unit = trafficMatch[2];
        
        if (unit === 'K') traffic *= 1000;
        else if (unit === 'M') traffic *= 1000000;
        else if (unit === 'B') traffic *= 1000000000;
        
        score += Math.log10(traffic) * 10;
      }
    }

    // Add score based on number of articles
    if (trend.articles) {
      score += trend.articles.length * 2;
    }

    return score;
  }

  /**
   * Calculate Twitter score
   * @param {Object} trend - Twitter trend data
   * @returns {number} Score
   */
  calculateTwitterScore(trend) {
    let score = 30; // Base score
    
    if (trend.volume) {
      score += Math.log10(trend.volume) * 5;
    }

    return score;
  }

  /**
   * Calculate Reddit score
   * @param {Object} trend - Reddit trend data
   * @returns {number} Score
   */
  calculateRedditScore(trend) {
    let score = 20; // Base score
    
    if (trend.score) {
      score += Math.log10(Math.max(trend.score, 1)) * 3;
    }

    if (trend.comments) {
      score += Math.log10(Math.max(trend.comments, 1)) * 2;
    }

    return score;
  }

  /**
   * Calculate YouTube score
   * @param {Object} trend - YouTube trend data
   * @returns {number} Score
   */
  calculateYouTubeScore(trend) {
    let score = 25; // Base score
    
    if (trend.views) {
      score += Math.log10(Math.max(trend.views, 1)) * 4;
    }

    if (trend.likes) {
      score += Math.log10(Math.max(trend.likes, 1)) * 2;
    }

    return score;
  }

  /**
   * Get trending topics for a specific time period
   * @param {string} period - Time period ('1h', '24h', '7d', '30d')
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Trending topics data
   */
  async getTrendingTopicsForPeriod(period = '24h', options = {}) {
    const cacheKey = `trends_${period}_${JSON.stringify(options)}`;
    
    // Check cache (implement your preferred caching mechanism)
    // For now, we'll always fetch fresh data
    
    const results = await this.aggregateAllTrends(options);
    
    // Filter results based on time period
    const cutoffTime = this.getTimeFromPeriod(period);
    
    // Filter articles by time period
    if (results.topTopics) {
      results.topTopics.forEach(topic => {
        if (topic.articles) {
          topic.articles = topic.articles.filter(article => 
            new Date(article.publishedAt) >= cutoffTime
          );
        }
      });
    }

    return results;
  }

  /**
   * Get cutoff time for period
   * @param {string} period - Time period
   * @returns {Date} Cutoff date
   */
  getTimeFromPeriod(period) {
    const now = new Date();
    const cutoff = new Date(now);

    switch (period) {
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '24h':
        cutoff.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      default:
        cutoff.setDate(now.getDate() - 1);
    }

    return cutoff;
  }

  /**
   * Get trending topics by category
   * @param {string} category - Category ('technology', 'sports', 'entertainment', etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Categorized trending topics
   */
  async getTrendingTopicsByCategory(category, options = {}) {
    const results = await this.aggregateAllTrends(options);
    
    // Filter topics by category (you can implement category classification)
    const categorizedTopics = this.classifyTopicsByCategory(results.topTopics, category);
    
    return {
      ...results,
      category,
      topTopics: categorizedTopics
    };
  }

  /**
   * Classify topics by category
   * @param {Array} topics - Array of topics
   * @param {string} category - Target category
   * @returns {Array} Filtered topics
   */
  classifyTopicsByCategory(topics, category) {
    // This is a simplified classification
    // In a real implementation, you might use NLP or predefined keywords
    const categoryKeywords = {
      technology: ['tech', 'ai', 'software', 'app', 'digital', 'crypto', 'blockchain'],
      sports: ['game', 'match', 'player', 'team', 'score', 'championship', 'olympics'],
      entertainment: ['movie', 'show', 'celebrity', 'music', 'actor', 'film', 'series'],
      politics: ['election', 'government', 'policy', 'president', 'congress', 'vote'],
      health: ['health', 'medical', 'vaccine', 'virus', 'covid', 'disease', 'hospital']
    };

    const keywords = categoryKeywords[category.toLowerCase()] || [];
    
    return topics.filter(topic => {
      const topicText = topic.name.toLowerCase();
      return keywords.some(keyword => topicText.includes(keyword));
    });
  }

  /**
   * Generate trend summary report
   * @param {Object} trendsData - Aggregated trends data
   * @returns {Object} Summary report
   */
  generateTrendSummary(trendsData) {
    const summary = {
      timestamp: trendsData.timestamp,
      processingTime: trendsData.processingTime,
      totalTopics: trendsData.topTopics ? trendsData.topTopics.length : 0,
      platforms: [],
      topTrends: [],
      errors: trendsData.errors || []
    };

    // Count platforms
    const platformCounts = {};
    if (trendsData.trends) {
      Object.keys(trendsData.trends).forEach(platform => {
        if (Array.isArray(trendsData.trends[platform])) {
          platformCounts[platform] = trendsData.trends[platform].length;
        } else if (typeof trendsData.trends[platform] === 'object') {
          platformCounts[platform] = Object.keys(trendsData.trends[platform]).length;
        }
      });
    }

    summary.platforms = Object.entries(platformCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Get top 10 trends
    if (trendsData.topTopics) {
      summary.topTrends = trendsData.topTopics.slice(0, 10).map(topic => ({
        name: topic.name,
        score: Math.round(topic.score),
        platforms: topic.platforms ? Array.from(topic.platforms) : [],
        articleCount: topic.articles ? topic.articles.length : 0
      }));
    }

    return summary;
  }
}

module.exports = TrendAggregator;