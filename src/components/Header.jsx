// frontend/src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Uses context for dark mode
import {
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaPlusCircle,
  FaSearch,
} from 'react-icons/fa';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme(); // Global dark mode from context
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(search.trim())}`);
      setSearch(''); // Clear input after search
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity"
          >
            RecipeVerse
          </Link>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-inner"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
            </div>
          </form>

          {/* Actions / User Controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <FaSun className="text-yellow-400 text-xl" />
              ) : (
                <FaMoon className="text-gray-600 dark:text-gray-300 text-xl" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Create Recipe Button */}
                <Link
                  to="/create-recipe"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-full transition-all shadow-sm hover:shadow-md font-medium"
                  title="Create a new recipe"
                >
                  <FaPlusCircle className="text-lg" />
                  <span className="hidden sm:inline">Create</span>
                </Link>

                {/* Profile Link */}
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="View your profile"
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden sm:inline font-medium">{user.username}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-full transition-all shadow-sm hover:shadow-md font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}