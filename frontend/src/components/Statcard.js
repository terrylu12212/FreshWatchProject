import React from "react";

export default function StatCard({ label, value, tone="tan" }){
  return (
    <div className={`badge ${tone}`} style={{flex:1, padding: '24px', textAlign: 'center'}}>
      <div>
        <div style={{fontWeight:700, fontSize:32}}>{value}</div>
        <div className="subtle" style={{fontSize:25}}>{label}</div>
      </div>
    </div>
  );
}
