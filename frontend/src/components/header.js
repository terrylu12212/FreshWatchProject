import React from "react";
import { useNavigate } from 'react-router-dom';

export default function Header(){
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
      paddingTop: 12,
      paddingBottom: 12
    }}>
      <nav className="row" style={{justifyContent: 'space-between', padding: '0 20px'}}>
        <div className="row" style={{gap:14}}>
          <span style={{
            width:32,height:32,borderRadius:8,
            background:"var(--color-primary)", display:"inline-block"
          }} />
          <strong style={{fontSize:18, color: '#fff'}}>FreshWatch</strong>
        </div>
        <div className="row" style={{gap:20, alignItems: 'center'}}>
          <a href="/" style={{color: 'rgba(255,255,255,0.85)', textDecoration: 'none'}}>Home</a>
          <a href="/pantry" style={{color: 'rgba(255,255,255,0.85)', textDecoration: 'none'}}>Pantry</a>
          <a href="/recipes" style={{color: 'rgba(255,255,255,0.85)', textDecoration: 'none'}}>Recipes</a>
          <a href="/analytics" style={{color: 'rgba(255,255,255,0.85)', textDecoration: 'none'}}>Analytics</a>
          <a href="/settings" style={{color: 'rgba(255,255,255,0.85)', textDecoration: 'none'}}>Settings</a>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'normal',
              textDecoration: 'none',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
              verticalAlign: 'baseline'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255,255,255,0.85)';
            }}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
