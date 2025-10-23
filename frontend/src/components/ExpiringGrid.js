import React from "react";

function FoodTile({ name, note, imageSrc }){
  return (
    <div className="card" style={{padding:18}}>
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
      <div className="section-title">Expiring Soon</div>
      <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
        {items.slice(0,3).map(i=>(
          <FoodTile key={i._id || i.name} name={i.name} note={i.note} imageSrc={i.imageSrc}/>
        ))}
      </div>
    </>
  );
}
