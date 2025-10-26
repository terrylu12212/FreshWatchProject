import React from "react";

function FoodTile({ name, note, imageSrc, isEmpty }){
  return (
    <div className="card" style={{padding:18, opacity: isEmpty ? 0.4 : 1}}>
      <div style={{height:140, borderRadius:12, background:"var(--color-surface)", display:"grid", placeItems:"center", marginBottom:12}}>
        {imageSrc ? <img alt={name} src={imageSrc} style={{width:110,height:110,objectFit:"contain"}}/> :
          <div style={{width:88,height:88,borderRadius:999, background:"#e2e6dd"}}/>}
      </div>
      <div style={{fontWeight:700}}>{name}</div>
      <div className="subtle" style={{fontSize:13}}>{note}</div>
    </div>
  );
}

export default function ExpiringGrid({ items=[] }){
  return (
    <>
      <div className="section-title" style={{fontSize: 45, marginTop: '75px'}}>Expiring Soon</div>
      <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
        {items.slice(0,3).map((i, idx)=>(
          <FoodTile key={i._id || `empty-${idx}`} name={i.name} note={i.note} imageSrc={i.imageSrc} isEmpty={i.isEmpty}/>
        ))}
      </div>
    </>
  );
}
