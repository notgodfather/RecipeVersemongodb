// frontend/src/pages/RecipeDetail.jsx - FULLY UPDATED PRODUCTION VERSION
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaCommentDots } from 'react-icons/fa';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/api/recipes/${id}`);
        setRecipe(res.data);

        // Set user's existing rating if any
        const existing = res.data.ratings?.find(r => r.user?.toString() === user?.id);
        if (existing) setUserRating(existing.value);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recipe');
        toast.error('Could not load recipe');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user) return toast.warning('Please login to like');
    try {
      const res = await api.post(`/api/recipes/${id}/like`);
      setRecipe(prev => ({
        ...prev,
        likes: res.data.liked 
          ? [...(prev.likes || []), user.id]
          : (prev.likes || []).filter(like => like.toString() !== user.id)
      }));
      toast.success(res.data.liked ? 'Added to favorites!' : 'Removed from favorites');
    } catch (err) {
      toast.error('Failed to like/unlike');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.warning('Please login to comment');
    if (!commentText.trim()) return toast.warning('Comment cannot be empty');

    try {
      const res = await api.post(`/api/recipes/${id}/comment`, { text: commentText.trim() });
      setRecipe(prev => ({ ...prev, comments: res.data }));
      setCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleRating = async (value) => {
    if (!user) return toast.warning('Please login to rate');
    if (value === userRating) return;

    try {
      await api.post(`/api/recipes/${id}/rate`, { value });
      setUserRating(value);

      // Optimistic update for average rating
      setRecipe(prev => {
        const newRatings = prev.ratings?.map(r => 
          r.user?.toString() === user.id ? { ...r, value } : r
        ) || [];
        if (!prev.ratings?.some(r => r.user?.toString() === user.id)) {
          newRatings.push({ user: user.id, value });
        }
        const avg = newRatings.reduce((sum, r) => sum + r.value, 0) / (newRatings.length || 1);
        return { ...prev, ratings: newRatings, avgRating: parseFloat(avg.toFixed(1)) };
      });

      toast.success('Rating submitted!');
    } catch (err) {
      toast.error('Failed to submit rating');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="text-2xl font-medium text-gray-600 dark:text-gray-400 animate-pulse">
        Loading delicious details...
      </div>
    </div>
  );

  if (error || !recipe) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="text-2xl text-red-600 dark:text-red-400 text-center px-4 max-w-md">
        {error || 'Recipe not found'}
      </div>
    </div>
  );

  const isLiked = user && recipe.likes?.some(like => like.toString() === user.id);
  const avgRating = recipe.avgRating || (recipe.ratings?.reduce((sum, r) => sum + r.value, 0) / (recipe.ratings?.length || 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
        {/* Hero Image */}
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-rose-400 via-orange-400 to-amber-500 flex items-center justify-center">
            <span className="text-white text-8xl opacity-40">🍲</span>
          </div>
        )}

        <div className="p-8 lg:p-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {recipe.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <span>By 
              <Link 
                to={`/profile/${recipe.author?._id}`} 
                className="text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 font-medium ml-1 transition-colors"
              >
                {recipe.author?.username || 'Anonymous'}
              </Link>
            </span>
            <span>•</span>
            <span>{new Date(recipe.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            {recipe.description || 'No description provided for this delicious creation.'}
          </p>

          {/* Quick Stats & Interactions */}
          <div className="flex flex-wrap gap-6 mb-12">
            <button
              onClick={handleLike}
              className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all font-medium shadow-md hover:shadow-lg ${
                isLiked 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
              title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
              <span>{recipe.likes?.length || 0} {recipe.likes?.length === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 shadow-md">
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="font-bold text-xl">{avgRating.toFixed(1)}</span>
              <span className="text-gray-600 dark:text-gray-400">({recipe.ratings?.length || 0} ratings)</span>
            </div>
          </div>

          {/* Ingredients */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ingredients</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {recipe.ingredients?.length > 0 ? (
                recipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="pl-6 pr-4 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl border-l-4 border-rose-400 dark:border-rose-500">
                    <span className="text-gray-700 dark:text-gray-300">{ing}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">No ingredients listed</p>
              )}
            </div>
          </section>

          {/* Instructions */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Instructions</h2>
            <ol className="space-y-4 text-gray-700 dark:text-gray-300 text-lg">
              {recipe.instructions?.length > 0 ? (
                recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 pl-2 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-400 dark:border-blue-500">
                    <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-gray-600 dark:text-gray-400">No instructions provided</li>
              )}
            </ol>
          </section>

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {recipe.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-800 dark:text-rose-300 rounded-full text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Rate Section - only if logged in */}
          {user && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Your Rating</h2>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="text-3xl focus:outline-none transition-all hover:scale-110 p-1"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    {star <= userRating ? (
                      <FaStar className="text-yellow-400 drop-shadow-lg" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-300 transition-all duration-200" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Your rating: <span className="text-2xl font-bold text-yellow-500">{userRating || 'Not rated'}</span>
              </p>
            </section>
          )}

          {/* Comments Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
              <FaCommentDots className="text-rose-500 text-3xl" />
              Comments ({recipe.comments?.length || 0})
            </h2>

            {recipe.comments?.length > 0 ? (
              <div className="space-y-6 mb-10">
                {recipe.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {comment.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.user?.username || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                No comments yet — be the first to share your thoughts!
              </p>
            )}

            {user ? (
              <form onSubmit={handleComment} className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your cooking experience, tips, or questions..."
                  rows="4"
                  maxLength={1000}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none text-lg placeholder-gray-500"
                  required
                />
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {commentText.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <Link to="/login" className="text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 font-semibold underline decoration-rose-200">Login</Link> to join the conversation
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Share your thoughts and connect with other food lovers!</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
