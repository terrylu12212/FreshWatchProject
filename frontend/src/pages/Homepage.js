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
    // Keep existing sample stats/expiring/recipes until their endpoints exist
    setStats({ expiringSoon: 3, fresh: 10, expired: 2 });
    setExpiring([
      { name: 'Tomato', note: 'Expires in 2 days', imageSrc: '/images/tomato.png' },
      { name: 'Yogurt', note: 'Expires tomorrow', imageSrc: '/images/yogurt.png' },
      { name: 'Spinach', note: 'Expires today!', imageSrc: '/images/spinach.png' },
    ]);
    setRecipes([
      { id: 1, title: 'Spinach Omelette', image: '/images/omelette.jpg' },
      { id: 2, title: 'Tomato Pasta', image: '/images/tomato-pasta.jpg' },
      { id: 3, title: 'Tomato Pasta', image: '/images/tomato-pasta-2.jpg' },
    ]);

    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const t = await res.text();
          console.error('Homepage failed to fetch items', res.status, t);
          return;
        }
        const items = await res.json();
        const mapped = items.map(it => ({
          _id: it._id,
          name: it.name,
          status: computeStatusFromItem(it)
        }));
        setPantry(mapped);
      } catch (e) {
        console.error('Homepage error fetching items', e);
      }
    };
    fetchItems();
  }, []);

  const computeStatusFromItem = (it) => {
    if (!it || !it.expirationDate) return 'Fresh';
    const exp = new Date(it.expirationDate);
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = exp.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000*60*60*24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today!';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const filteredPantry = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = pantry.filter(i => !q || i.name.toLowerCase().includes(q));
    if (sort === 'expiration') {
      const daysUntil = (s = '') => {
        if (s === 'Expired') return -1; // already expired
        if (s === 'Expires today!') return 0;
        if (s === 'Expires tomorrow') return 1;
        const m = s.match(/Expires in (\d+) days?/);
        if (m) return parseInt(m[1], 10);
        return 9999; // treat other statuses (e.g., Fresh) as farthest
      };
      data = data
        .slice()
        .sort((a, b) => {
          const da = daysUntil(a.status);
          const db = daysUntil(b.status);
          if (da !== db) return da - db; // closest first
          return a.name.localeCompare(b.name);
        });
    } else {
      data = data.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [pantry, query, sort]);

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 80,
        backgroundImage: "url('/images/plantBackground.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header onLogout={handleLogout} />

      {/* Dark, semi-transparent content wrapper over the background image */}
      <div
        className="container"
        style={{
          marginBottom: 24,
          padding: '24px 24px 40px',
          background: 'rgba(0,0,0,0.45)',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'saturate(120%) blur(8px)',
          WebkitBackdropFilter: 'saturate(120%) blur(8px)',
          color: '#fff'
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
