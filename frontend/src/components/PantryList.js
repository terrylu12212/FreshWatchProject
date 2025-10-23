import React from "react";

function Row({ label, status }){
  const right = status === "Expired" ? "▶" : "›";
  const color = status === "Expired" ? "#8a2d1f" : status.includes("Expires") ? "#7b5c1a" : "var(--color-muted)";
  return (
    <div className="row" style={{padding:"14px 6px", borderBottom:"1px solid rgba(0,0,0,.06)"}}>
      <div style={{fontWeight:600}}>{label}</div>
      <div className="row" style={{gap:10, color}}>
        <span>{status}</span><span aria-hidden>{right}</span>
      </div>
    </div>
  );
}

export default function PantryList({ items=[] , sort="expiration", onSortChange=()=>{} , query, onQuery}){
  return (
    <>
      <div className="section-title">Pantry</div>
      <div className="row" style={{gap:12}}>
        <div style={{flex:1}}><SearchBar value={query} onChange={onQuery} placeholder="Search"/></div>
        <div>
          <button className="btn ghost" onClick={()=>onSortChange(sort==="expiration" ? "category" : "expiration")}>
            Sort by: {sort==="expiration" ? "Expiration" : "Category"}
          </button>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{padding:"4px 14px"}}>
          {items.map(i=>(
            <Row key={i._id || i.name} label={i.name} status={i.status}/>
          ))}
        </div>
      </div>
    </>
  );
}

// local import so file is self-contained when copied:
function SearchBar({ value, onChange, placeholder }){
  return <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>;
}
