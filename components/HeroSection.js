import React from 'react';
import { Search, Globe, Zap, Users, Sparkles, TrendingUp } from 'lucide-react';

const HeroSection = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="relative py-24 overflow-hidden">
       {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-100" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-300" />
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-500" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover What&apos;s{' '}
              <span className="relative inline-block">
                <span className="text-yellow-300 animate-pulse">Trending</span>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
              </span>
              {' '}Now
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stay ahead of the curve with AI-powered content that captures the pulse of the digital world
            </p>
          </div>
          
         <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            {[
              { icon: Globe, text: 'Global Trends', color: 'from-green-400 to-blue-400' },
              { icon: Zap, text: 'AI-Powered', color: 'from-yellow-400 to-orange-400' },
              { icon: Users, text: 'Community Driven', color: 'from-purple-400 to-pink-400' },
              { icon: TrendingUp, text: 'Real-time Updates', color: 'from-red-400 to-pink-400' }
            ].map((item, index) => (
              <div key={index} className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white transform hover:scale-105 transition-all duration-300 hover:bg-white/30">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mr-3`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full blur opacity-30 animate-pulse" />
            <div className="relative bg-white rounded-full p-2 shadow-2xl">
              <div className="flex items-center">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for trending topics, technologies, or insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-lg rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 bg-transparent"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;