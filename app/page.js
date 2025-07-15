'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetail from '@/components/ArticleDetail';
import Footer from '@/components/Footer';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔁 Fetch articles from MongoDB
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (Array.isArray(data)) setArticles(data);
        else if (Array.isArray(data.articles)) setArticles(data.articles);
        else console.error('Invalid articles response:', data);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      }
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCommentSubmit = (articleId) => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: user?.name || 'Anonymous',
      avatar: user?.avatar || '/default-avatar.png',
      content: newComment,
      timestamp: new Date().toISOString()
    };
    setComments(prev => ({
      ...prev,
      [articleId]: [...(prev[articleId] || []), comment]
    }));
    setNewComment('');
  };

  // 📄 Single article view
  if (selectedArticle) {
    return (
      <>
        <Head>
          <title>{selectedArticle.title} - TrendWise</title>
          <meta name="description" content={selectedArticle.excerpt} />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <Header user={user} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="container mx-auto px-4 py-8">
            <ArticleDetail
              article={selectedArticle}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleCommentSubmit={handleCommentSubmit}
              user={user}
              onClose={() => setSelectedArticle(null)}
            />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>TrendWise - Discover What&apos;s Trending Now</title>
        <meta name="description" content="Stay ahead of the curve with AI-powered content that captures the pulse of the digital world" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Header user={user} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <HeroSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {!searchTerm && <StatsSection />}

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 relative">
                  Latest Articles
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transform scale-x-0 animate-pulse" />
                </h2>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore cutting-edge insights, trending topics, and expert analysis from the world of technology and innovation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <ArticleCard
                  key={article._id || article.id}
                  article={article}
                  onSelect={setSelectedArticle}
                  index={index}
                />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">No articles found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your search terms or explore our trending topics</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
