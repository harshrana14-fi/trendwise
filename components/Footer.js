'use client';

import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand & Description */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">TrendWise</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Your AI-powered source for the latest trends, insights, and digital intelligence.
            Stay ahead with real-time discoveries and future-forward articles.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors duration-200">Home</Link>
            </li>
            <li>
              <Link href="/newsroom" className="hover:text-blue-400 transition-colors duration-200">Newsroom</Link>
            </li>
            <li>
              <Link href="/generate" className="hover:text-blue-400 transition-colors duration-200">AI Generate</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-400 transition-colors duration-200">About</Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
              <Facebook size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
              <Twitter size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition">
              <Instagram size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} TrendWise. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
