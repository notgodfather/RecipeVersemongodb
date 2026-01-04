// frontend/src/App.jsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // ← Added this import (was missing!)
// Import all page components (make sure these files exist in src/pages/)
import Login from './pages/Login';
import Register from './pages/Register';
import CreateRecipe from './pages/CreateRecipe';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail'; // ← Added this import (was missing!)
import Profile from './pages/Profile';
function App() {
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Header receives both darkMode and setDarkMode props */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main content */}
        <main className="pt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-recipe" element={<CreateRecipe />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={
              <div className="text-center mt-20">
                <h2 className="text-4xl font-bold">404 - Page Not Found</h2>
                <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
                  Go back home
                </Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;