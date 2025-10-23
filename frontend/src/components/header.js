import React from "react";

export default function Header(){
  return (
    <header style={{paddingTop: 18, paddingBottom: 0, width:"100%", background:"#fff", boxShadow:"0 2px 4px rgba(0,0,0,0.1)"}}>
      <nav className="row" style={{justifyContent: 'space-between', padding: 20}}>
        <div className="row" style={{gap:14}}>
          <span style={{
            width:32,height:32,borderRadius:8,
            background:"var(--color-primary)", display:"inline-block"
          }} />
          <strong style={{fontSize:18}}>FreshWatch</strong>
        </div>
        <div className="row" style={{gap:20}}>
          <a href="/pantry" className="subtle">Pantry</a>
          <a href="/recipes" className="subtle">Recipes</a>
          <a href="/analytics" className="subtle">Analytics</a>
          <a href="/settings" className="subtle">Settings</a>
        </div>
      </nav>
    </header>
  );
}
