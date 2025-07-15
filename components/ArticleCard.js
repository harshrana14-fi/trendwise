import React from 'react';
import { Calendar, Eye, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';

const ArticleCard = ({ article, onSelect, index }) => {
  if (!article) return null;

  const {
    thumbnail = '/default-thumbnail.jpg',
    title = 'Untitled',
    excerpt = '',
    trending = false,
    date,
    views,
    author = 'Unknown Author',
    readTime = '1 min',
    tags = [],
  } = article;

  const formattedDate = date ? new Date(date).toLocaleDateString() : 'Unknown Date';
  const formattedViews = typeof views === 'number' ? views.toLocaleString() : '0';

  return (
    <div
      className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/20 hover:border-purple-200"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div className="relative overflow-hidden">
        <Image
    src={thumbnail}
    alt={title}
    fill
    className="object-cover group-hover:scale-110 transition-transform duration-500"
    sizes="100vw"
    priority // optional: for faster loading above the fold
  />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {trending && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg animate-pulse">
            <TrendingUp className="w-4 h-4 mr-1" />
            Trending
          </div>
        )}

        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Eye className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="p-6">
        {/* Date & Views */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formattedDate}
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {formattedViews}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Author + Read More */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-lg">
              {author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{author}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {readTime}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelect(article)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center font-medium"
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 hover:shadow-md transition-all duration-200"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
