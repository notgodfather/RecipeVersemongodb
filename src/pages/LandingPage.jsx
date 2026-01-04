// frontend/src/pages/LandingPage.jsx - FULL FIXED VERSION
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function LandingPage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // FIXED: Added /api/ prefix - matches backend routes
        const res = await api.get('/api/recipes', { params: { limit: 6 } });
        setFeaturedRecipes(res.data);
      } catch (err) {
        console.error('Featured recipes error:', err);
        toast.error('Failed to load featured recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-6">
            Discover & Share Delicious Recipes
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Join thousands of home cooks sharing their favorite recipes. From quick dinners to decadent desserts — find inspiration today!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/recipes"
              className="inline-block px-10 py-5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Browse All Recipes
            </Link>
            <Link
              to="/create-recipe"
              className="inline-block px-10 py-5 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border-2 border-rose-600 dark:border-rose-500 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              Share Your Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Featured Recipes
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-500 mx-auto"></div>
            </div>
          ) : featuredRecipes.length === 0 ? (
            <p className="text-center text-xl text-gray-600 dark:text-gray-400">
              No featured recipes yet — be the first to share!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="h-56 bg-gradient-to-br from-rose-400 to-orange-500 overflow-hidden">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white text-8xl opacity-40">🍲</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                      {recipe.description || 'Delicious homemade recipe'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>By {recipe.author?.username || 'Anonymous'}</span>
                      <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-rose-500 to-orange-500 text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Share Your Favorite Dish?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join our community of food lovers and showcase your culinary creations!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="px-10 py-5 bg-white text-rose-600 font-bold rounded-xl shadow-xl hover:bg-gray-100 transition-all"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
