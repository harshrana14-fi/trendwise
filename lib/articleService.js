// lib/articleService.js
const axios = require('axios');
const cheerio = require('cheerio');
const { URLSearchParams } = require('url');

class ArticleService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsApiUrl = 'https://newsapi.org/v2';
    this.serpApiKey = process.env.SERP_API_KEY;
    this.serpApiUrl = 'https://serpapi.com/search';
  }

  /**
   * Fetch articles from NewsAPI
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of articles
   */
  async fetchFromNewsAPI(query, options = {}) {
    try {
      if (!this.newsApiKey) {
        throw new Error('NewsAPI key not configured');
      }

      const {
        sortBy = 'publishedAt',
        pageSize = 20,
        language = 'en',
        from = null,
        to = null
      } = options;

      const params = {
        q: query,
        sortBy,
        pageSize,
        language,
        apiKey: this.newsApiKey
      };

      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axios.get(`${this.newsApiUrl}/everything`, { params });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        author: article.author,
        content: article.content,
        platform: 'NewsAPI'
      }));
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  /**
   * Fetch trending articles from various news sources
   * @param {string} country - Country code (default: 'us')
   * @param {string} category - News category
   * @returns {Promise<Array>} Array of trending articles
   */
  async fetchTrendingNews(country = 'us', category = 'general') {
    try {
      if (!this.newsApiKey) {
        throw new Error('NewsAPI key not configured');
      }

      const response = await axios.get(`${this.newsApiUrl}/top-headlines`, {
        params: {
          country,
          category,
          pageSize: 50,
          apiKey: this.newsApiKey
        }
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        author: article.author,
        content: article.content,
        platform: 'NewsAPI',
        category
      }));
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return [];
    }
  }

  /**
   * Scrape articles from Google News
   * @param {string} query - Search query
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} Array of articles
   */
  async scrapeGoogleNews(query, limit = 20) {
    try {
      const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      $('article').each((index, element) => {
        if (index >= limit) return false;

        const titleElement = $(element).find('h3 a, h4 a');
        const title = titleElement.text().trim();
        const relativeUrl = titleElement.attr('href');
        const url = relativeUrl ? `https://news.google.com${relativeUrl}` : null;
        
        const source = $(element).find('div[data-n-tid] a').text().trim();
        const timeElement = $(element).find('time');
        const publishedAt = timeElement.attr('datetime') || timeElement.text();
        
        if (title && url) {
          articles.push({
            title,
            url,
            source,
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
            platform: 'Google News',
            description: null,
            content: null
          });
        }
      });

      return articles;
    } catch (error) {
      console.error('Error scraping Google News:', error);
      return [];
    }
  }

  /**
   * Fetch articles using SerpAPI (Google Search)
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of articles
   */
  async fetchWithSerpAPI(query, options = {}) {
    try {
      if (!this.serpApiKey) {
        throw new Error('SerpAPI key not configured');
      }

      const {
        engine = 'google',
        tbm = 'nws', // news search
        num = 20,
        hl = 'en'
      } = options;

      const params = {
        engine,
        q: query,
        tbm,
        num,
        hl,
        api_key: this.serpApiKey
      };

      const response = await axios.get(this.serpApiUrl, { params });
      const articles = [];

      if (response.data.news_results) {
        articles.push(...response.data.news_results.map(article => ({
          title: article.title,
          url: article.link,
          source: article.source,
          publishedAt: new Date(article.date),
          snippet: article.snippet,
          thumbnail: article.thumbnail,
          platform: 'SerpAPI'
        })));
      }

      return articles;
    } catch (error) {
      console.error('Error fetching with SerpAPI:', error);
      return [];
    }
  }

  /**
   * Fetch articles from multiple sources for a given query
   * @param {string} query - Search query
   * @param {Object} options - Configuration options
   * @returns {Promise<Array>} Combined array of articles from all sources
   */
  async fetchAllArticles(query, options = {}) {
    const {
      useNewsAPI = true,
      useGoogleNews = true,
      useSerpAPI = false,
      limit = 50
    } = options;

    const allArticles = [];
    const promises = [];

    if (useNewsAPI) {
      promises.push(
        this.fetchFromNewsAPI(query, { pageSize: Math.min(limit, 100) })
          .catch(error => {
            console.error('NewsAPI failed:', error);
            return [];
          })
      );
    }

    if (useGoogleNews) {
      promises.push(
        this.scrapeGoogleNews(query, Math.min(limit, 100))
          .catch(error => {
            console.error('Google News scraping failed:', error);
            return [];
          })
      );
    }

    if (useSerpAPI) {
      promises.push(
        this.fetchWithSerpAPI(query, { num: Math.min(limit, 100) })
          .catch(error => {
            console.error('SerpAPI failed:', error);
            return [];
          })
      );
    }

    try {
      const results = await Promise.all(promises);
      
      results.forEach(articles => {
        allArticles.push(...articles);
      });

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicateArticles(allArticles);

      // Sort by publication date (newest first)
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      return uniqueArticles.slice(0, limit);
    } catch (error) {
      console.error('Error fetching all articles:', error);
      return [];
    }
  }

  /**
   * Remove duplicate articles based on title similarity
   * @param {Array} articles - Array of articles
   * @returns {Array} Array of unique articles
   */
  removeDuplicateArticles(articles) {
    const seen = new Set();
    const unique = [];

    for (const article of articles) {
      const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        unique.push(article);
      }
    }

    return unique;
  }

  /**
   * Extract full article content from URL
   * @param {string} url - Article URL
   * @returns {Promise<Object>} Article content
   */
  async extractArticleContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Remove unwanted elements
      $('script, style, nav, footer, header, aside, .advertisement, .ad').remove();
      
      // Try to find main content
      const contentSelectors = [
        'article',
        '.entry-content',
        '.post-content',
        '.article-content',
        '.content',
        'main',
        '.main-content'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // Fallback to body content
      if (!content) {
        content = $('body').text().trim();
      }

      return {
        url,
        content: content.substring(0, 5000), // Limit content length
        title: $('title').text().trim(),
        meta: {
          description: $('meta[name="description"]').attr('content'),
          keywords: $('meta[name="keywords"]').attr('content'),
          author: $('meta[name="author"]').attr('content')
        }
      };
    } catch (error) {
      console.error('Error extracting article content:', error);
      return { url, content: '', title: '', meta: {} };
    }
  }
}

module.exports = ArticleService;