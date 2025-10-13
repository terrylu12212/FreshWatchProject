import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage.js';
import Navbar from './components/Navbar.js';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
      <div className="pages">
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
