import React from 'react';
import { BookOpen, TrendingUp, Users, Star, Eye, MessageCircle } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { icon: BookOpen, value: '500+', label: 'Articles Published', color: 'from-blue-500 to-purple-500' },
    { icon: TrendingUp, value: '1M+', label: 'Monthly Readers', color: 'from-green-500 to-teal-500' },
    { icon: Users, value: '50K+', label: 'Community Members', color: 'from-orange-500 to-red-500' },
    { icon: Star, value: '4.9/5', label: 'Reader Rating', color: 'from-purple-500 to-pink-500' },
    { icon: Eye, value: '10M+', label: 'Total Views', color: 'from-indigo-500 to-blue-500' },
    { icon: MessageCircle, value: '25K+', label: 'Comments', color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <section className="py-20 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600">Join our growing community of tech enthusiasts and stay informed</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;