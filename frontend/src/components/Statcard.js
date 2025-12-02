import React from "react";

export default function StatCard({ label, value, tone="tan" }){
  return (
    <div className={`badge ${tone}`} style={{flex:1, padding: '24px', textAlign: 'center'}}>
      <div>
        <div style={{fontWeight:700, fontSize:32}}>{value}</div>
        <div style={{fontSize:25, color: 'rgba(255, 255, 255, 0.95)'}}>{label}</div>
      </div>
    </div>
  );
}
