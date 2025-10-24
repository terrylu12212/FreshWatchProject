import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function Row({ label, status }){
  const right = status === "Expired" ? "›" : "›";
  const color = status === "Expired" ? "#ff6b6b" : status.includes("Expires") ? "#ffd966" : "var(--color-muted)";
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
      <div className="section-title" style={{marginTop: '45px', fontSize:45}}>Pantry</div>
      <div className="row" style={{gap:12}}>
        <div style={{flex:1}}><SearchBar value={query} onChange={onQuery} placeholder="Search"/></div>
        <div style={{minWidth: 200}}>
          <FormControl fullWidth>
            <InputLabel 
              id="sort-select-label"
              sx={{
                color: '#22c55e',
                '&.Mui-focused': {
                  color: '#86efac',
                }
              }}
            >
              Sort by
            </InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sort}
              label="Sort by"
              onChange={(e) => onSortChange(e.target.value)}
               sx={{
                 color: '#22c55e',
                 '& .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
                   borderColor: '#22c55e',
                 },
                 '&:hover .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
                   borderColor: '#4ade80',
                 },
                 '&.Mui-focused': {
                   color: '#86efac',
                 },
                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
                   borderColor: '#86efac',
                 },
                 height: '45px',
               }}
            >
              <MenuItem value="expiration">Expiration</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{padding:"4px 14px", maxHeight: '420px', overflowY: 'auto'}}>
          {items.map(i=>(
            <Row key={i._id || i.name} label={i.name} status={i.status}/>
          ))}
        </div>
      </div>

      <div style={{marginTop:16, display:'flex', justifyContent:'center', gap:12}}>
        <a href="/pantry" className="btn" aria-label="Add item to pantry" style={{textDecoration:'none'}}>
          + Add Item
        </a>
        <a href="/pantry" className="btn ghost" aria-label="Go to pantry" style={{textDecoration:'none'}}>
          Go to Pantry
        </a>
      </div>
    </>
  );
}

// local import so file is self-contained when copied:
function SearchBar({ value, onChange, placeholder }){
  return <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>;
}
