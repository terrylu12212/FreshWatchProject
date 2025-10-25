// src/pages/Pantry/Pantry.js
import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import Header from '../../components/header.js';
import MainPantry from '../../components/MainPantry.js';

export default function Pantry() {
  const [pantry, setPantry] = useState([]);
  const [sort, setSort] = useState('expiration');
  const [query, setQuery] = useState('');

  // Add-item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Produce');
  const [expirationWeeks, setExpirationWeeks] = useState(0);
  const [expirationDays, setExpirationDays] = useState(0);

  // Autocomplete UI state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

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

  const onSubmitAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    
    // Calculate total days
    const totalDays = (expirationWeeks * 7) + expirationDays;
    
    // Generate status text
    let status = 'Fresh';
    if (totalDays === 0) {
      status = 'Expires today!';
    } else if (totalDays === 1) {
      status = 'Expires tomorrow';
    } else if (totalDays > 1) {
      status = `Expires in ${totalDays} days`;
    }
    
    // Save to backend food template
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:4000/api/food-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category: newCategory,
          defaultWeeks: expirationWeeks,
          defaultDays: expirationDays
        })
      });
    } catch (error) {
      console.error('Failed to save food template:', error);
    }
    
    setPantry(prev => [{ name, status, category: newCategory }, ...prev]);
    setNewName('');
    setNewCategory('Produce');
    setExpirationWeeks(0);
    setExpirationDays(0);
    setShowSuggestions(false);
  };

  // Handle name input change with autocomplete from backend
  const handleNameChange = async (value) => {
    setNewName(value);
    
    if (value.trim().length > 0) {
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Searching for:', value.trim());
        console.log('🔑 Token exists:', !!token);
        console.log('🔑 Token value:', token);
        
        const url = `http://localhost:4000/api/food-templates?search=${encodeURIComponent(value.trim())}`;
        console.log('📡 Fetching URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const templates = await response.json();
          console.log('✅ Templates found:', templates);
          console.log('✅ Templates count:', templates.length);
          setFilteredSuggestions(templates);
          setShowSuggestions(templates.length > 0);
          console.log('✅ showSuggestions set to:', templates.length > 0);
        } else {
          const errorText = await response.text();
          console.error('❌ Response not OK:', response.status, response.statusText, errorText);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('❌ Failed to fetch food templates:', error);
        setShowSuggestions(false);
      }
    } else {
      console.log('⚠️ Value is empty, hiding suggestions');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Auto-fill form when suggestion is selected
  const selectSuggestion = (food) => {
    setNewName(food.name);
    setNewCategory(food.category);
    setExpirationWeeks(food.defaultWeeks);
    setExpirationDays(food.defaultDays);
    setShowSuggestions(false);
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
          <div className="card" style={{ padding: '24px', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, marginTop: 0, marginBottom: 20, color: '#fff' }}>
              Add New Food Item
            </h2>
            <form onSubmit={onSubmitAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                
                {/* Name Input */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>
                    Item Name
                  </label>
                  <input
                    className="input"
                    placeholder="e.g., Milk, Tomatoes, Bread"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => {
                      if (newName.trim().length > 0 && filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestion
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    style={{ width: '100%' }}
                    required
                  />
                  
                  {/* Autocomplete dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 8,
                      marginTop: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }}>
                      {filteredSuggestions.map((food, idx) => (
                        <div
                          key={food._id || idx}
                          onClick={() => selectSuggestion(food)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                            color: '#333',
                            fontSize: 14
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600 }}>{food.name}</div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {food.category} • {food.defaultWeeks}w {food.defaultDays}d
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>
                    Category
                  </label>
                  <select
                    className="input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', height: 44 }}
                  >
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Grains">Grains</option>
                    <option value="Pantry Staples">Pantry Staples</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Expiration: Weeks */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>
                    Expires in (Weeks)
                  </label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    max="52"
                    value={expirationWeeks}
                    onChange={(e) => setExpirationWeeks(parseInt(e.target.value) || 0)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Expiration: Days */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#86efac' }}>
                    + Days
                  </label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    max="365"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
                    style={{ width: '100%' }}
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ 
                    padding: '12px 32px', 
                    fontSize: 16,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: 'none'
                  }}
                >
                  + Add to Pantry
                </button>
              </div>
            </form>
          </div>

          {/* Full Pantry List */}
          <div style={{ marginTop: 20 }}>
            <MainPantry
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
