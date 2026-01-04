// frontend/src/pages/RecipeDetail.jsx
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
  const [userRating, setUserRating] = useState(0); // User's personal rating

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`);
        setRecipe(res.data);

        // Set user's existing rating if any
        const existing = res.data.ratings?.find(r => r.user === user?.id);
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
      const res = await api.post(`/recipes/${id}/like`);
      setRecipe(prev => ({
        ...prev,
        likes: res.data.liked 
          ? [...(prev.likes || []), user.id]
          : (prev.likes || []).filter(like => like !== user.id)
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
      const res = await api.post(`/recipes/${id}/comment`, { text: commentText.trim() });
      setRecipe(prev => ({ ...prev, comments: res.data }));
      setCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleRating = async (value) => {
    if (!user) return toast.warning('Please login to rate');
    if (value === userRating) return; // No change

    try {
      await api.post(`/recipes/${id}/rate`, { value });
      setUserRating(value);

      // Optimistic update for average rating
      setRecipe(prev => {
        const newRatings = prev.ratings?.map(r => 
          r.user === user.id ? { ...r, value } : r
        ) || [];
        if (!prev.ratings?.some(r => r.user === user.id)) {
          newRatings.push({ user: user.id, value });
        }
        const avg = newRatings.reduce((sum, r) => sum + r.value, 0) / newRatings.length;
        return { ...prev, ratings: newRatings, avgRating: avg.toFixed(1) };
      });

      toast.success('Rating submitted!');
    } catch (err) {
      toast.error('Failed to submit rating');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-medium text-gray-600 dark:text-gray-400 animate-pulse">
        Loading delicious details...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-red-600 dark:text-red-400 text-center px-4">
        {error}
      </div>
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600 dark:text-gray-400">Recipe not found</div>
    </div>
  );

  const isLiked = user && recipe.likes?.some(like => like.toString() === user.id);
  const avgRating = recipe.ratings?.reduce((sum, r) => sum + r.value, 0) / (recipe.ratings?.length || 1) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Hero Image */}
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-8xl opacity-40">🍲</span>
          </div>
        )}

        <div className="p-8 lg:p-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {recipe.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <span>By 
              <Link 
                to={`/profile/${recipe.author?._id}`} 
                className="text-rose-600 hover:underline font-medium ml-1"
              >
                {recipe.author?.username || 'Anonymous'}
              </Link>
            </span>
            <span>•</span>
            <span>{new Date(recipe.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            {recipe.description || 'No description provided for this delicious creation.'}
          </p>

          {/* Quick Stats & Interactions */}
          <div className="flex flex-wrap gap-6 mb-12">
            <button
              onClick={handleLike}
              className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all font-medium ${
                isLiked 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
              <span>{recipe.likes?.length || 0} Likes</span>
            </button>

            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30">
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="font-bold text-xl">{avgRating.toFixed(1)}</span>
              <span className="text-gray-600 dark:text-gray-400">({recipe.ratings?.length || 0} ratings)</span>
            </div>
          </div>

          {/* Ingredients */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ingredients</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-lg">
              {recipe.ingredients?.length > 0 ? (
                recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="pl-2">{ing}</li>
                ))
              ) : (
                <li>No ingredients listed</li>
              )}
            </ul>
          </section>

          {/* Instructions */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Instructions</h2>
            <ol className="list-decimal pl-6 space-y-4 text-gray-700 dark:text-gray-300 text-lg">
              {recipe.instructions?.length > 0 ? (
                recipe.instructions.map((step, idx) => (
                  <li key={idx} className="pl-2">{step}</li>
                ))
              ) : (
                <li>No instructions provided</li>
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
                    className="px-4 py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-full text-base font-medium"
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
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Rate this Recipe</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="text-4xl focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= userRating ? (
                      <FaStar className="text-yellow-400 drop-shadow-md" />
                    ) : (
                      <FaRegStar className="text-gray-400 hover:text-yellow-300 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Your rating: {userRating || 'Not rated yet'}
              </p>
            </section>
          )}

          {/* Comments Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
              <FaCommentDots className="text-rose-500" />
              Comments ({recipe.comments?.length || 0})
            </h2>

            {recipe.comments?.length > 0 ? (
              <div className="space-y-6 mb-10">
                {recipe.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl shadow-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      {comment.user?.username || 'Anonymous'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-8">No comments yet — be the first!</p>
            )}

            {user ? (
              <form onSubmit={handleComment} className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="4"
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Post Comment
                </button>
              </form>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                <Link to="/login" className="text-rose-600 hover:underline font-medium">Login</Link> to join the conversation
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}