// src/App.js
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/global.css';

import Homepage from './pages/Homepage.js';
import Login from './pages/Login/Login.js';
import Signup from './pages/Signup/Signup.js';
// import Navbar from './components/Navbar.js';
import Pantry from './pages/Pantry/Pantry.js';
import Recipes from './pages/Recipes/Recipes.js';
import { isAuthed } from './utils/auth.js';
import Analytics from './pages/Analytics/Analytics.js';
import Settings from './pages/Settings/Settings.js';

// Simple protected route wrapper
function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthed()) {
    // Clear any stale token and redirect to login with the attempted path
    localStorage.removeItem('token');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Navbar /> */}
        <div className="pages">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
