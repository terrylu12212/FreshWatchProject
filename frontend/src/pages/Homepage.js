// src/pages/Homepage.js
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/global.css';
import Header from '../components/header.js';
import StatCard from '../components/Statcard.js';
import ExpiringGrid from '../components/ExpiringGrid.js';
import PantryList from '../components/PantryList.js';
import MealIdeas from '../components/MealIdeas.js';

const Homepage = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const [stats, setStats] = useState({ expiringSoon: 3, fresh: 10, expired: 2 });
  const [expiring, setExpiring] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [sort, setSort] = useState('expiration');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Replace with real API calls when you’re ready:
    // fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()).then(setStats)
    // fetch('/api/pantry').then(r=>r.json()).then(setPantry)
    // fetch('/api/recipes?limit=3').then(r=>r.json()).then(setRecipes)

    setStats({ expiringSoon: 3, fresh: 10, expired: 2 });

    setExpiring([
      { name: 'Tomato', note: 'Expires in 2 days', imageSrc: '/images/tomato.png' },
      { name: 'Yogurt', note: 'Expires tomorrow', imageSrc: '/images/yogurt.png' },
      { name: 'Spinach', note: 'Expires today!', imageSrc: '/images/spinach.png' },
    ]);

    setPantry([
      { name: 'Milk', status: 'Expired' },
      { name: 'Tomato', status: 'Expires in 2 days' },
      { name: 'Cheese', status: 'Fresh' },
      { name: 'Lentils', status: 'Fresh' },
    ]);

    setRecipes([
      { id: 1, title: 'Spinach Omelette', image: '/images/omelette.jpg' },
      { id: 2, title: 'Tomato Pasta', image: '/images/tomato-pasta.jpg' },
      { id: 3, title: 'Tomato Pasta', image: '/images/tomato-pasta-2.jpg' },
    ]);
  }, []);

  const filteredPantry = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = pantry.filter(i => !q || i.name.toLowerCase().includes(q));
    if (sort === 'expiration') {
      const rank = s =>
        s === 'Expired' ? 0 :
        s.startsWith('Expires') ? 1 :
        2;
      data = data.slice().sort((a, b) => rank(a.status) - rank(b.status));
    } else {
      data = data.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [pantry, query, sort]);

  return (
    <div
      style={{
        minHeight: '100vh',
        // Green → black gradient background
        background: 'linear-gradient(150deg, #32ba88ff 0%, #059669 35%, #065F46 60%, #000000 100%)'
      }}
    >
      <Header onLogout={handleLogout} />

      {/* Glassy, semi-transparent content wrapper */}
      <div
        className="container"
        style={{
          marginTop: 16,
          marginBottom: 24,
          padding: '24px 24px 40px',
          background: 'transparent',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'saturate(120%) blur(8px)',
          WebkitBackdropFilter: 'saturate(120%) blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.33)',
        }}
      >
      <main className="container" style={{ marginTop: 4 }}>
        <h1 style={{ fontSize: 45, margin: '20px 0 20px', textAlign: 'center' }}>
          Hi Landon, here's what's fresh<br /> in your pantry today <span role="img" aria-label="leaf">🌿</span>
        </h1>

        <div className="row" style={{ gap: 25, flexWrap: 'wrap', marginTop: 100 }}>
          <StatCard tone="red" value={`${stats.expiringSoon} items expiring`} label="in the next 3 days" />
          <StatCard tone="green" value={`${stats.fresh} items`} label="fresh" />
          <StatCard tone="tan" value={`${stats.expired} items`} label="expired" />
        </div>

        <ExpiringGrid items={expiring} />

        <PantryList
          items={filteredPantry}
          sort={sort}
          onSortChange={setSort}
          query={query}
          onQuery={setQuery}
        />

        <MealIdeas recipes={recipes} />
      </main>
      </div>
    </div>
  );
};

export default Homepage;
