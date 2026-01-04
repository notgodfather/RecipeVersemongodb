// frontend/src/pages/LandingPage.jsx - FULLY FIXED DATE ERROR + PRODUCTION READY
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LandingPage() {
  const { user } = useAuth();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ SAFE DATE FORMATTER - Prevents console errors!
  const formatDateShort = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Recent';
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Production-ready: /api/ prefix + trending params
        const res = await api.get('/api/recipes', { 
          params: { 
            limit: 8, 
            sort: '-likes,-avgRating',
            featured: true 
          } 
        });
        setFeaturedRecipes(res.data);
      } catch (err) {
        console.error('Featured recipes error:', err);
        setError('Failed to load featured recipes');
        toast.error('Could not load recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-8 p-4 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/40">
            <span className="text-2xl bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent font-bold animate-bounce">
              🔥 Trending Now
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-gray-900 via-rose-600 to-orange-600 bg-clip-text text-transparent mb-8 leading-tight drop-shadow-2xl">
            Discover &<br className="sm:hidden" />
            <span className="block">Share Delicious</span>
            <span className="text-transparent bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text drop-shadow-2xl">
              Recipes
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
            Join <span className="font-bold text-rose-600 dark:text-rose-400">thousands</span> of home cooks sharing their favorite recipes. 
            From quick dinners to decadent desserts — find inspiration today!
          </p>

          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-8">
            <Link
              to="/recipes"
              className="group relative inline-block px-12 py-6 bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-700 hover:via-pink-700 hover:to-orange-700 text-white text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10">Browse All Recipes</span>
              <div className="absolute inset-0 bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <Link
              to="/create-recipe"
              className="group inline-flex items-center gap-3 px-12 py-6 bg-white dark:bg-gray-900/90 text-rose-600 dark:text-rose-400 border-2 border-rose-600/50 dark:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-gray-800/50 hover:border-rose-600 rounded-3xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 backdrop-blur-sm"
            >
              <span>✨</span>
              Share Your Recipe
            </Link>
          </div>

          {/* Auth Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center text-sm opacity-80">
            {user ? (
              <>
                <Link to="/recipes" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium">
                  Continue Browsing →
                </Link>
                <span>|</span>
                <Link to="/create-recipe" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium">
                  Create Recipe
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium">
                  Login
                </Link>
                <span>|</span>
                <Link to="/register" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-rose-600 bg-clip-text text-transparent mb-6">
              Featured Recipes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most popular recipes right now — loved by our community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-4" />
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full mb-3 w-3/4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl text-rose-500">⚠️</span>
              </div>
              <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                Retry
              </button>
            </div>
          ) : featuredRecipes.length === 0 ? (
            <div className="text-center py-24 max-w-2xl mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl">📭</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                No Recipes Yet
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                Be the first to share your favorite recipes with the community!
              </p>
              <Link
                to={user ? "/create-recipe" : "/register"}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 text-white text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
              >
                <span>✨</span>
                {user ? 'Create Recipe' : 'Join & Create'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden hover:shadow-4xl hover:-translate-y-4 transition-all duration-700 border border-white/50 dark:border-gray-700/50 hover:border-rose-200/60"
                  title={recipe.title}
                >
                  {/* Image with overlay */}
                  <div className="h-64 lg:h-60 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400">
                        <span className="text-white text-6xl opacity-60 drop-shadow-2xl">🍲</span>
                      </div>
                    )}
                    
                    {/* Top-right badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      {recipe.avgRating && (
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl text-white text-xs font-bold shadow-lg">
                          ★ {recipe.avgRating.toFixed(1)}
                        </div>
                      )}
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl text-white text-xs font-bold shadow-lg">
                        {recipe.likes?.length || 0}
                      </div>
                    </div>
                    
                    {/* Bottom gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-8 pb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all duration-300 leading-tight">
                      {recipe.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-base leading-relaxed opacity-90">
                      {recipe.description?.substring(0, 120) || 'Delicious homemade recipe'}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold">
                        <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {recipe.author?.username?.[0]?.toUpperCase() || 'A'}
                        </span>
                        {recipe.author?.username || 'Anonymous'}
                      </span>
                      {/* ✅ FIXED: Proper date format */}
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {formatDateShort(recipe.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More / Pagination Teaser */}
          {featuredRecipes.length > 0 && (
            <div className="text-center mt-20">
              <Link
                to="/recipes"
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-slate-900 to-gray-800 hover:from-slate-800 hover:to-gray-700 text-white text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 backdrop-blur-sm border border-slate-200/20"
              >
                View All Recipes
                <span className="text-rose-400">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/95 via-pink-500/90 to-orange-500/95" />
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl">
              Ready to Cook Something Amazing?
            </h2>
            <p className="text-2xl opacity-95 drop-shadow-lg">
              Join our community of <span className="font-bold text-yellow-300">food lovers</span> today!
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
            <Link
              to={user ? "/create-recipe" : "/register"}
              className="group relative px-12 py-6 bg-white text-rose-600 font-black text-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden backdrop-blur-sm"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 blur opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </Link>
            <Link
              to="/recipes"
              className="px-12 py-6 border-2 border-white/50 hover:border-white text-white font-bold text-xl rounded-3xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Browse Recipes
            </Link>
          </div>

          <p className="mt-12 text-lg opacity-80">
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
