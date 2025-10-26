// src/pages/Pantry/Pantry.js
import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/global.css';
import Header from '../../components/header.js';
import MainPantry from '../../components/MainPantry.js';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

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
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const t = await res.text();
          console.error('Failed to fetch items', res.status, t);
          return;
        }
        const items = await res.json();
        // Map API items to UI shape with status text
        const mapped = items.map(it => ({
          _id: it._id,
          name: it.name,
          expirationDate: it.expirationDate,
          status: computeStatusFromItem(it)
        }));
        setPantry(mapped);
      } catch (e) {
        console.error('Error fetching items', e);
      }
    };
    fetchItems();
  }, []);

  const computeStatusFromItem = (it) => {
    if (!it || !it.expirationDate) return 'Fresh';
    const exp = new Date(it.expirationDate);
    const today = new Date();
    // Zero out time for date diff
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

  const onSubmitAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    
    // Calculate expiration date from weeks/days
    const totalDays = (expirationWeeks * 7) + expirationDays;
    const expDate = new Date();
    expDate.setHours(0,0,0,0);
    if (totalDays > 0) {
      expDate.setDate(expDate.getDate() + totalDays);
    }

    // Save template (for autocomplete) and create item in DB
    try {
      const token = localStorage.getItem('token');
      // Fire-and-forget template save
      fetch('http://localhost:4000/api/food-templates', {
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
      }).catch(()=>{});

      // Create the item
      const res = await fetch('http://localhost:4000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          // categoryId can be wired later; leaving undefined for now
          expirationDate: totalDays > 0 ? expDate.toISOString() : undefined,
          purchaseDate: new Date().toISOString(),
          status: 'active'
        })
      });

      if (res.ok) {
        const created = await res.json();
        setPantry(prev => [{
          _id: created._id,
          name: created.name,
          expirationDate: created.expirationDate,
          status: computeStatusFromItem(created)
        }, ...prev]);
      } else {
        const t = await res.text();
        console.error('Failed to create item', res.status, t);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    }
    
    setNewName('');
    setNewCategory('Produce');
    setExpirationWeeks(0);
    setExpirationDays(0);
    setShowSuggestions(false);
  };

  // Edit dialog state
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editWeeks, setEditWeeks] = useState(0);
  const [editDays, setEditDays] = useState(0);

  const openEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    // derive days remaining from expirationDate
    let remaining = 0;
    if (item.expirationDate) {
      const exp = new Date(item.expirationDate);
      const today = new Date();
      exp.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      remaining = Math.max(0, Math.round((exp.getTime() - today.getTime())/(1000*60*60*24)));
    }
    setEditWeeks(Math.floor(remaining/7));
    setEditDays(remaining % 7);
  };

  const closeEdit = () => {
    setEditingItem(null);
  };

  const saveEdit = async () => {
    if (!editingItem?._id) return closeEdit();
    const total = (parseInt(editWeeks)||0)*7 + (parseInt(editDays)||0);
    const newExp = new Date();
    newExp.setHours(0,0,0,0);
    if (total > 0) newExp.setDate(newExp.getDate()+total);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/items/${editingItem._id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ name: editName.trim(), expirationDate: total>0 ? newExp.toISOString(): undefined })
      });
      if (res.ok){
        const updated = await res.json();
        setPantry(prev => prev.map(p => p._id === updated._id ? ({
          _id: updated._id,
          name: updated.name,
          expirationDate: updated.expirationDate,
          status: computeStatusFromItem(updated)
        }) : p));
        closeEdit();
      } else {
        const t = await res.text();
        console.error('Failed to update item', res.status, t);
      }
    } catch(e){
      console.error('Error updating item', e);
    }
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
              onEditItem={openEdit}
              onDeleteItem={async (item) => {
                if (!item?._id) {
                  // Local (non-DB) item — just remove from UI
                  setPantry(prev => prev.filter(p => (p._id || p.name) !== (item._id || item.name)));
                  return;
                }
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`http://localhost:4000/api/items/${item._id}` , {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (res.ok) {
                    setPantry(prev => prev.filter(p => p._id !== item._id));
                  } else {
                    const t = await res.text();
                    console.error('Failed to delete item', res.status, t);
                  }
                } catch (e) {
                  console.error('Error deleting item', e);
                }
              }}
            />
          </div>
        {/* Edit Item Dialog */}
        {editingItem && (
          <Dialog open={!!editingItem} onClose={closeEdit} fullWidth maxWidth="sm">
            <DialogTitle>Edit Item</DialogTitle>
            <DialogContent dividers>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={editName}
                    onChange={(e)=>setEditName(e.target.value)}
                  />
                </div>
                <TextField
                  type="number"
                  label="Expires in (Weeks)"
                  value={editWeeks}
                  onChange={(e)=>setEditWeeks(parseInt(e.target.value)||0)}
                  inputProps={{ min:0, max: 52 }}
                />
                <TextField
                  type="number"
                  label="+ Days"
                  value={editDays}
                  onChange={(e)=>setEditDays(parseInt(e.target.value)||0)}
                  inputProps={{ min:0, max: 365 }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeEdit}>Cancel</Button>
              <Button onClick={saveEdit} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        )}
        </main>
      </div>
    </div>
  );
}
