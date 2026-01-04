// frontend/src/pages/CreateRecipe.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    tags: '',
    image: null,
    imagePreview: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...form[field]];
    newArray[index] = e.target.value;
    setForm({ ...form, [field]: newArray });
  };

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeField = (field, index) => {
    if (form[field].length > 1) {
      const newArray = form[field].filter((_, i) => i !== index);
      setForm({ ...form, [field]: newArray });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Please login to post a recipe');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();

      // Required fields validation
      if (!form.title.trim()) throw new Error('Title is required');
      data.append('title', form.title.trim());

      if (form.description?.trim()) data.append('description', form.description.trim());

      const validIngredients = form.ingredients.filter(item => item.trim());
      if (validIngredients.length === 0) throw new Error('At least one ingredient is required');
      data.append('ingredients', JSON.stringify(validIngredients));

      const validInstructions = form.instructions.filter(item => item.trim());
      if (validInstructions.length === 0) throw new Error('At least one instruction step is required');
      data.append('instructions', JSON.stringify(validInstructions));

      if (form.tags?.trim()) {
        const tagArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagArray.length > 0) data.append('tags', JSON.stringify(tagArray));
      }

      if (form.image) data.append('image', form.image);

      await api.post('/recipes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Recipe posted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form
      setForm({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        tags: '',
        image: null,
        imagePreview: null,
      });

      navigate('/recipes');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to post recipe';
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Create New Recipe
        </h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleTextChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              placeholder="e.g. Spicy Butter Chicken"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleTextChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              placeholder="Tell the story behind your recipe..."
            />
          </div>

          {/* Ingredients - Dynamic */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Ingredients *
            </label>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-3 mb-3 items-start">
                <span className="text-xl font-bold text-rose-600 mt-3">{idx + 1}.</span>
                <input
                  type="text"
                  value={ing}
                  onChange={(e) => handleArrayChange(e, idx, 'ingredients')}
                  className="flex-1 px-4 py-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. 500g chicken, 2 onions..."
                />
                {form.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField('ingredients', idx)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('ingredients')}
              className="mt-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions - Dynamic */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Instructions *
            </label>
            {form.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3 mb-3 items-start">
                <span className="text-xl font-bold text-rose-600 mt-3">{idx + 1}.</span>
                <textarea
                  value={step}
                  onChange={(e) => handleArrayChange(e, idx, 'instructions')}
                  className="flex-1 px-4 py-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-rose-500"
                  placeholder="Step description..."
                  rows={2}
                />
                {form.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField('instructions', idx)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('instructions')}
              className="mt-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
            >
              + Add Step
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleTextChange}
              placeholder="vegan, indian, spicy, quick, dessert"
              className="w-full px-4 py-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
            />
          </div>

          {/* Image Upload + Preview */}
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Recipe Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
            />
            {form.imagePreview && (
              <div className="mt-6">
                <img
                  src={form.imagePreview}
                  alt="Recipe preview"
                  className="w-full max-h-64 object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Share Your Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
}