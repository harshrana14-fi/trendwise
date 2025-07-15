"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", path: "#" },
    { label: "Newsroom", path: "/newsroom" },
    { label: "AI Generate", path: "/generate" },
    { label: "About", path: "/about" },
  ];

  useEffect(() => {
    setHasMounted(true);
    const storedUser = localStorage.getItem("trendwise_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("trendwise_user");
    localStorage.removeItem("trendwise_token");
    setUser(null);
    router.push("/");
  };

  if (!hasMounted) return null;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TrendWise
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="relative group text-gray-700 font-medium text-lg hover:scale-105 transition-transform duration-200"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 w-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full group-hover:w-full transition-all duration-300 ease-out" />
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-full">
                <Image
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name || "User"}
                  fill
                  className="rounded-full ring-2 ring-white shadow-lg object-cover"
                  sizes="48px"
                />
                <span className="text-gray-800 font-medium hidden sm:block truncate max-w-[120px]">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-full bg-white text-blue-600 font-semibold border border-blue-500 hover:bg-blue-50"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white shadow rounded-lg py-4 px-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setMobileMenuOpen(false);
                router.push(item.path);
              }}
              className="block w-full text-left text-gray-700 font-medium hover:text-blue-600 transition"
            >
              {item.label}
            </button>
          ))}

          {user ? (
            <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
              <Image
                src={comment.avatar || "/default-avatar.png"}
                alt={comment.user || "User"}
                fill
                className="rounded-full ring-2 ring-white shadow-lg object-cover"
                sizes="48px"
              />
              <div>
                <p className="text-gray-800 font-semibold">{user.name}</p>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full mt-1 hover:bg-red-200"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/login");
                }}
                className="w-full bg-white border border-blue-500 text-blue-600 py-2 rounded-full font-semibold hover:bg-blue-50 transition"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/register");
                }}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-2 rounded-full font-medium hover:shadow-md transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
