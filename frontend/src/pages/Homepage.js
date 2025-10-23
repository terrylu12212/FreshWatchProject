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
    <div style={{ minHeight: '100vh', backgroundColor: '#e4d8d0ff' }}>
      <Header onLogout={handleLogout} />

      <main className="container" style={{ marginTop: 4 }}>
        <h1 style={{ fontSize: 36, margin: '6px 0 20px' }}>
          Hi Landon, here's what's fresh<br /> in your pantry today <span role="img" aria-label="leaf">🌿</span>
        </h1>

        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
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
  );
};

export default Homepage;
