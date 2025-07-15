'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

const AuthForm = ({ isLogin = true }) => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(isLogin ? 'login' : 'register');

  const toggleForm = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/login' : '/api/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('trendwise_token', data.token);
        localStorage.setItem('trendwise_user', JSON.stringify(data.user));
      }

      router.push('/');
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/40 backdrop-blur-lg shadow-2xl border border-white/30">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
            TrendWise
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-xl text-center font-bold mb-4 text-gray-800">
          {mode === 'login' ? 'Welcome Back 👋' : 'Join the Trend 🚀'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-400"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-400"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-lg transition-all duration-300"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-700">
          {mode === 'login' ? 'New to TrendWise?' : 'Already a member?'}{' '}
          <button onClick={toggleForm} className="text-blue-600 font-medium hover:underline">
            {mode === 'login' ? 'Create account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
