const axios = require('axios');
const cheerio = require('cheerio');

class SocialMediaService {
  constructor() {
    this.config = {
      twitter: {
        baseUrl: 'https://api.twitter.com/2',
        bearerToken: process.env.TWITTER_BEARER_TOKEN
      },
      reddit: {
        baseUrl: 'https://www.reddit.com',
        userAgent: 'TrendWise/1.0'
      },
      youtube: {
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        apiKey: process.env.YOUTUBE_API_KEY
      }
    };
  }

  /**
   * Fetch trending topics from Twitter
   * @param {string} woeid - Where On Earth ID (default: 1 for worldwide)
   * @returns {Promise<Array>} Array of trending topics
   */
  async getTwitterTrends(woeid = 1) {
    try {
      if (!this.config.twitter.bearerToken) {
        throw new Error('Twitter Bearer Token not configured');
      }

      const response = await axios.get(`${this.config.twitter.baseUrl}/trends/place`, {
        params: { id: woeid },
        headers: {
          'Authorization': `Bearer ${this.config.twitter.bearerToken}`,
          'User-Agent': 'TrendWise/1.0'
        }
      });

      const trends = response.data[0].trends.map(trend => ({
        name: trend.name,
        query: trend.query,
        volume: trend.tweet_volume,
        url: trend.url,
        platform: 'Twitter'
      }));

      return trends;
    } catch (error) {
      console.error('Error fetching Twitter trends:', error);
      return [];
    }
  }

  /**
   * Fetch trending posts from Reddit
   * @param {string} subreddit - Subreddit name (default: 'all')
   * @param {number} limit - Number of posts to fetch
   * @returns {Promise<Array>} Array of trending posts
   */
  async getRedditTrends(subreddit = 'all', limit = 25) {
    try {
      const response = await axios.get(`${this.config.reddit.baseUrl}/r/${subreddit}/hot.json`, {
        params: { limit },
        headers: {
          'User-Agent': this.config.reddit.userAgent
        }
      });

      const posts = response.data.data.children.map(post => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        comments: post.data.num_comments,
        subreddit: post.data.subreddit,
        author: post.data.author,
        created: new Date(post.data.created_utc * 1000),
        platform: 'Reddit'
      }));

      return posts;
    } catch (error) {
      console.error('Error fetching Reddit trends:', error);
      return [];
    }
  }

  /**
   * Fetch trending videos from YouTube
   * @param {string} regionCode - Region code (default: 'US')
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<Array>} Array of trending videos
   */
  async getYouTubeTrends(regionCode = 'US', maxResults = 50) {
    try {
      if (!this.config.youtube.apiKey) {
        throw new Error('YouTube API Key not configured');
      }

      const response = await axios.get(`${this.config.youtube.baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults,
          key: this.config.youtube.apiKey
        }
      });

      const videos = response.data.items.map(video => ({
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
        channel: video.snippet.channelTitle,
        publishedAt: new Date(video.snippet.publishedAt),
        thumbnail: video.snippet.thumbnails.medium.url,
        platform: 'YouTube'
      }));

      return videos;
    } catch (error) {
      console.error('Error fetching YouTube trends:', error);
      return [];
    }
  }

  /**
   * Fetch trending topics from multiple platforms
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Object containing trends from all platforms
   */
  async getAllTrends(options = {}) {
    const {
      twitter = true,
      reddit = true,
      youtube = true,
      twitterWoeid = 1,
      redditSubreddit = 'all',
      youtubeRegion = 'US'
    } = options;

    const results = {
      timestamp: new Date(),
      trends: {}
    };

    // Fetch trends from all platforms concurrently
    const promises = [];

    if (twitter) {
      promises.push(
        this.getTwitterTrends(twitterWoeid)
          .then(trends => ({ platform: 'twitter', data: trends }))
      );
    }

    if (reddit) {
      promises.push(
        this.getRedditTrends(redditSubreddit)
          .then(trends => ({ platform: 'reddit', data: trends }))
      );
    }

    if (youtube) {
      promises.push(
        this.getYouTubeTrends(youtubeRegion)
          .then(trends => ({ platform: 'youtube', data: trends }))
      );
    }

    try {
      const responses = await Promise.allSettled(promises);
      
      responses.forEach(response => {
        if (response.status === 'fulfilled') {
          results.trends[response.value.platform] = response.value.data;
        } else {
          console.error(`Failed to fetch trends:`, response.reason);
          results.trends[response.value?.platform || 'unknown'] = [];
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching all trends:', error);
      throw error;
    }
  }

  /**
   * Search for trending hashtags across platforms
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of hashtag trends
   */
  async searchHashtagTrends(query) {
    try {
      const results = [];

      // Search Twitter hashtags
      if (this.config.twitter.bearerToken) {
        try {
          const twitterResponse = await axios.get(`${this.config.twitter.baseUrl}/tweets/search/recent`, {
            params: {
              query: `#${query}`,
              max_results: 10,
              'tweet.fields': 'public_metrics,created_at'
            },
            headers: {
              'Authorization': `Bearer ${this.config.twitter.bearerToken}`
            }
          });

          if (twitterResponse.data.data) {
            results.push(...twitterResponse.data.data.map(tweet => ({
              platform: 'Twitter',
              content: tweet.text,
              engagement: tweet.public_metrics.retweet_count + tweet.public_metrics.like_count,
              created: new Date(tweet.created_at)
            })));
          }
        } catch (error) {
          console.error('Error searching Twitter hashtags:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching hashtag trends:', error);
      return [];
    }
  }
}

module.exports = SocialMediaService;