import React from "react";

export default function StatCard({ label, value, tone="tan" }){
  return (
    <div className={`badge ${tone}`} style={{flex:1}}>
      <div>
        <div style={{fontWeight:700}}>{value}</div>
        <div className="subtle" style={{fontSize:13}}>{label}</div>
      </div>
    </div>
  );
}
