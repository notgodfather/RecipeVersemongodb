// frontend/src/pages/Profile.jsx - FIXED DATE ERROR + PRODUCTION READY
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user data
        const userRes = await api.get(`/api/users/${id}`);
        setProfileUser(userRes.data);

        // Fetch recipes by this user - FIXED API PATH
        const recipesRes = await api.get('/api/recipes', {
          params: { author: id, limit: 12, sort: '-createdAt' }
        });
        setRecipes(recipesRes.data);

        // Fetch social stats
        if (userRes.data.followers) {
          setFollowersCount(userRes.data.followers.length);
          setFollowing(userRes.data.followers.some(f => f.toString() === user?.id));
        }
        if (userRes.data.following) {
          setFollowingCount(userRes.data.following.length);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id]);

  const handleFollow = async () => {
    if (!user) return toast.warning('Please login to follow');
    if (id === user.id) return toast.warning("Can't follow yourself");

    try {
      const res = await api.post(`/api/users/${id}/follow`);
      setFollowing(res.data.following);
      setFollowersCount(prev => res.data.followersCount);
      toast.success(res.data.following ? 'Now following!' : 'Unfollowed');
    } catch (err) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-2xl font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center px-4 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-3xl text-gray-500">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'User not found'}
          </h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === id;

  // ✅ SAFE DATE FORMATTER
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

  const formatDateLong = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-16 border border-white/30 dark:border-gray-700/50">
          {/* Cover Banner */}
          <div className="h-48 sm:h-64 lg:h-72 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 relative overflow-hidden">
            {/* Profile Picture Overlay */}
            <div className="absolute -bottom-20 left-8 sm:left-12 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-8 border-white dark:border-gray-800 shadow-2xl ring-4 ring-white/50 dark:ring-gray-900/50 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                    {profileUser.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-24 pb-12 px-8 sm:px-12 lg:px-16 relative">
            {/* Edit Profile Button - Own Profile Only */}
            {isOwnProfile && (
              <Link
                to="/edit-profile"
                className="absolute top-4 right-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all border border-gray-200/50 dark:border-gray-700/50"
              >
                Edit Profile
              </Link>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 -ml-1">
              {profileUser.username}
            </h1>

            {profileUser.bio && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed font-medium">
                "{profileUser.bio}"
              </p>
            )}

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Member since{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDateLong(profileUser.createdAt)}
              </span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 mb-10 max-w-2xl">
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black text-rose-600 mb-2">
                  {recipes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-rose-500 transition-colors">Recipes</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black text-indigo-600 mb-2">
                  {followersCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-indigo-500 transition-colors">Followers</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black text-amber-600 mb-2">
                  {followingCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-amber-500 transition-colors">Following</div>
              </div>
              <div className="text-center lg:col-span-1">
                <button
                  onClick={handleFollow}
                  disabled={isOwnProfile}
                  className={`w-full px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform hover:scale-[1.02] ${
                    isOwnProfile
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : following
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/25'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25'
                  }`}
                >
                  {isOwnProfile ? 'It\'s you!' : following ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div className="space-y-12">
          <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-rose-600 to-orange-600 bg-clip-text text-transparent text-center mb-2 px-4">
            Recipes by {profileUser.username}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Discover {isOwnProfile ? 'your' : 'their'} culinary creations
          </p>

          {recipes.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-900/40 dark:to-gray-800/40 rounded-3xl shadow-xl backdrop-blur-sm border border-white/40 dark:border-gray-700/40 max-w-4xl mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl">📝</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                No recipes yet
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-md mx-auto">
                {isOwnProfile 
                  ? "Get started by creating your first recipe!" 
                  : "This user hasn't shared any recipes yet"
                }
              </p>
              {isOwnProfile && (
                <Link
                  to="/create-recipe"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 mx-auto"
                >
                  <span>✨</span>
                  Create Your First Recipe
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {recipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 border border-white/40 dark:border-gray-700/40 hover:border-rose-200/50"
                >
                  {/* Image / Placeholder */}
                  <div className="h-60 lg:h-56 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-400 to-orange-500">
                        <span className="text-white text-6xl opacity-40 drop-shadow-lg">🍲</span>
                      </div>
                    )}
                    {/* Quick Stats Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-white shadow-lg">
                        ★ {recipe.avgRating?.toFixed(1) || '—'}
                      </div>
                      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-white shadow-lg">
                        {recipe.likes?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all duration-300 leading-tight">
                      {recipe.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-base leading-relaxed">
                      {recipe.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {/* ✅ FIXED: Proper date format */}
                        {formatDateShort(recipe.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
                        <span className="text-yellow-500 text-lg">★</span>
                        {recipe.avgRating?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
