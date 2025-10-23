// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import Homepage from './pages/Homepage.js';
import Login from './pages/Login/Login.js';
import Signup from './pages/Signup/Signup.js';
import Navbar from './components/Navbar.js';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Navbar /> */}
        <div className="pages">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
