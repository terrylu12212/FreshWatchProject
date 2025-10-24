// src/pages/Pantry/Pantry.js
import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import Header from '../../components/header.js';
import PantryList from '../../components/PantryList.js';

export default function Pantry() {
  const [pantry, setPantry] = useState([]);
  const [sort, setSort] = useState('expiration');
  const [query, setQuery] = useState('');

  // Simple add-item form state
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState('Fresh');

  useEffect(() => {
    // Seed with same style of dummy data as Homepage
    setPantry([
      { name: 'Milk', status: 'Expired' },
      { name: 'Tomato', status: 'Expires in 2 days' },
      { name: 'Cheese', status: 'Fresh' },
      { name: 'Lentils', status: 'Fresh' },
      { name: 'Yogurt', status: 'Expires tomorrow' },
      { name: 'Spinach', status: 'Expires today!' },
      { name: 'Bread', status: 'Expired' },
      { name: 'Eggs', status: 'Fresh' },
      { name: 'Apples', status: 'Expires in 5 days' },
      { name: 'Bananas', status: 'Expires in 1 day' },
      { name: 'Chicken', status: 'Fresh' },
      { name: 'Rice', status: 'Fresh' },
      { name: 'Black Beans', status: 'Fresh' },
      { name: 'Lettuce', status: 'Expires in 3 days' },
      { name: 'Carrots', status: 'Fresh' },
      { name: 'Cucumbers', status: 'Expires in 4 days' },
      { name: 'Bell Peppers', status: 'Fresh' },
      { name: 'Onions', status: 'Fresh' },
      { name: 'Garlic', status: 'Fresh' },
      { name: 'Potatoes', status: 'Fresh' },
      { name: 'Oats', status: 'Fresh' },
      { name: 'Cereal', status: 'Fresh' },
      { name: 'Tuna', status: 'Expires in 10 days' },
      { name: 'Salmon', status: 'Expires in 2 days' },
      { name: 'Beef', status: 'Expires in 3 days' },
      { name: 'Pork', status: 'Fresh' },
      { name: 'Tofu', status: 'Expires in 6 days' },
      { name: 'Tempeh', status: 'Fresh' },
      { name: 'Broccoli', status: 'Expires in 2 days' },
      { name: 'Cauliflower', status: 'Fresh' },
      { name: 'Mushrooms', status: 'Expires tomorrow' },
      { name: 'Zucchini', status: 'Expires in 5 days' },
      { name: 'Eggplant', status: 'Fresh' },
      { name: 'Strawberries', status: 'Expires in 1 day' },
      { name: 'Blueberries', status: 'Fresh' },
      { name: 'Grapes', status: 'Expires in 4 days' },
      { name: 'Oranges', status: 'Fresh' },
      { name: 'Lemons', status: 'Fresh' },
      { name: 'Limes', status: 'Fresh' },
      { name: 'Avocado', status: 'Expires tomorrow' },
      { name: 'Kale', status: 'Expires in 3 days' },
    ]);
  }, []);

  const filteredPantry = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = pantry.filter(i => !q || i.name.toLowerCase().includes(q));
    if (sort === 'expiration') {
      const rank = s =>
        s === 'Expired' ? 0 :
        (s || '').startsWith('Expires') ? 1 :
        2;
      data = data.slice().sort((a, b) => rank(a.status) - rank(b.status));
    } else {
      data = data.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [pantry, query, sort]);

  const onSubmitAdd = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setPantry(prev => [{ name, status: newStatus }, ...prev]);
    setNewName('');
    setNewStatus('Fresh');
  };

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
      <Header />

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
          <h1 style={{ fontSize: 42, margin: '20px 0 20px', textAlign: 'center' }}>
            Your Pantry
          </h1>

          {/* Add Item form */}
          <form onSubmit={onSubmitAdd} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ maxWidth: 360 }}
              placeholder="Item name (e.g., Milk)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <select
              className="input"
              style={{ maxWidth: 220, height: 44 }}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Fresh">Fresh</option>
              <option value="Expires tomorrow">Expires tomorrow</option>
              <option value="Expires today!">Expires today!</option>
              <option value="Expires in 2 days">Expires in 2 days</option>
              <option value="Expires in 3 days">Expires in 3 days</option>
              <option value="Expired">Expired</option>
            </select>
            <button type="submit" className="btn">+ Add</button>
          </form>

          {/* Full Pantry List */}
          <div style={{ marginTop: 20 }}>
            <PantryList
              items={filteredPantry}
              sort={sort}
              onSortChange={setSort}
              query={query}
              onQuery={setQuery}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
