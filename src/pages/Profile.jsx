// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user data
        const userRes = await api.get(`/users/${id}`);
        setProfileUser(userRes.data);

        // Fetch recipes by this user
        const recipesRes = await api.get('/recipes', {
          params: { author: id } // Backend should support filtering by author
        });
        setRecipes(recipesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-xl font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error || 'User not found'}
          </h2>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-12 border border-gray-100 dark:border-gray-700">
          {/* Cover Banner */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-rose-500 to-orange-500 relative">
            {/* Profile Picture Overlay */}
            <div className="absolute -bottom-16 left-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-xl">
              <span className="text-5xl sm:text-7xl text-gray-600 dark:text-gray-300 font-bold">
                {profileUser.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-10 px-8 sm:px-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              {profileUser.username}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Member since{' '}
              {new Date(profileUser.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-md">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-rose-600">
                  {recipes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-amber-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          Recipes by {profileUser.username}
        </h2>

        {recipes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              No recipes posted yet
            </p>
            {/* Optional: Show create button only if viewing own profile */}
            {/* {user?.id === id && ( */}
              <Link
                to="/create-recipe"
                className="inline-block px-10 py-5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Create Your First Recipe
              </Link>
            {/* )} */}
          </div>
        ) : (
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
                    {recipe.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {recipe.likes?.length || 0} Likes
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