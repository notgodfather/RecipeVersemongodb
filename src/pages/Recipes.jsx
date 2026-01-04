// frontend/src/pages/Recipes.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError('');
        const url = searchQuery ? `/recipes?search=${encodeURIComponent(searchQuery)}` : '/recipes';
        const res = await api.get(url);
        setRecipes(res.data);
      } catch (err) {
        console.error('Recipes fetch error:', err);
        setError('Failed to load recipes. Please try again.');
        toast.error('Could not fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchQuery]); // Re-fetch when search query changes

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-rose-500 to-orange-600 bg-clip-text text-transparent mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'Discover Recipes'}
          </h1>

          {searchQuery && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Showing {recipes.length} result{recipes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-rose-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-xl text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Recipes Found */}
        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
              {searchQuery
                ? 'No recipes match your search. Try different keywords!'
                : 'No recipes yet... be the first to share your creation!'}
            </p>

            {!searchQuery && (
              <Link
                to="/create-recipe"
                className="inline-block px-10 py-5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link
                key={recipe._id}
                to={`/recipe/${recipe._id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2"
              >
                {/* Image / Placeholder */}
                <div className="h-56 bg-gradient-to-br from-rose-400 to-orange-500 relative overflow-hidden">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-8xl opacity-40">🍲</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                    {recipe.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      By {recipe.author?.username || 'Anonymous'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}