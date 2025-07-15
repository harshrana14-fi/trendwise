const axios = require('axios');
const cheerio = require('cheerio');

class GoogleTrendsService {
  constructor() {
    this.baseUrl = 'https://trends.google.com/trends/api';
    this.rssUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss';
  }

  /**
   * Fetch trending topics from Google Trends
   * @param {string} geo - Geographic location (default: 'US')
   * @param {number} hours - Time range in hours (default: 24)
   * @returns {Promise<Array>} Array of trending topics
   */
  async getTrendingTopics(geo = 'US', hours = 24) {
    try {
      const response = await axios.get(`${this.baseUrl}/dailytrends`, {
        params: {
          hl: 'en-US',
          tz: '-480',
          geo: geo,
          ns: 15
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Parse the response (Google Trends returns JSONP)
      const jsonpData = response.data.replace(')]}\',', '');
      const data = JSON.parse(jsonpData);
      
      const trends = [];
      if (data.default && data.default.trendingSearchesDays) {
        data.default.trendingSearchesDays.forEach(day => {
          day.trendingSearches.forEach(trend => {
            trends.push({
              title: trend.title.query,
              traffic: trend.formattedTraffic,
              articles: trend.articles.map(article => ({
                title: article.title,
                url: article.url,
                source: article.source,
                snippet: article.snippet,
                timeAgo: article.timeAgo
              })),
              relatedQueries: trend.relatedQueries || []
            });
          });
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching Google Trends:', error);
      throw new Error('Failed to fetch Google Trends data');
    }
  }

  /**
   * Fetch trending searches from RSS feed
   * @param {string} geo - Geographic location
   * @returns {Promise<Array>} Array of trending searches
   */
  async getTrendingSearchesRSS(geo = 'US') {
    try {
      const response = await axios.get(this.rssUrl, {
        params: { geo },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items = [];

      $('item').each((index, element) => {
        const title = $(element).find('title').text();
        const description = $(element).find('description').text();
        const pubDate = $(element).find('pubDate').text();
        const link = $(element).find('link').text();

        items.push({
          title,
          description,
          pubDate: new Date(pubDate),
          link,
          traffic: this.extractTraffic(description)
        });
      });

      return items;
    } catch (error) {
      console.error('Error fetching RSS trends:', error);
      throw new Error('Failed to fetch RSS trends data');
    }
  }

  /**
   * Extract traffic information from description
   * @param {string} description - Description text
   * @returns {string} Traffic information
   */
  extractTraffic(description) {
    const trafficMatch = description.match(/(\d+[KMB]?\+?\s+searches?)/i);
    return trafficMatch ? trafficMatch[1] : 'N/A';
  }

  /**
   * Search for related articles using Google Search API alternative
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Array of related articles
   */
  async searchRelatedArticles(query, limit = 10) {
    try {
      // Using a news aggregation service or web scraping
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      $('.g').each((index, element) => {
        if (index >= limit) return false;

        const title = $(element).find('h3').text();
        const link = $(element).find('a').attr('href');
        const snippet = $(element).find('.st, .s').text();
        const source = $(element).find('.source').text();

        if (title && link) {
          articles.push({
            title,
            url: link,
            snippet,
            source,
            timestamp: new Date()
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error searching related articles:', error);
      return [];
    }
  }
}

module.exports = GoogleTrendsService;