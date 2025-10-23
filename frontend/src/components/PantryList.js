import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
      <div className="section-title" style={{marginTop: '45px', fontSize:45}}>Pantry</div>
      <div className="row" style={{gap:12}}>
        <div style={{flex:1}}><SearchBar value={query} onChange={onQuery} placeholder="Search"/></div>
        <div style={{minWidth: 200}}>
          <FormControl fullWidth>
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sort}
              label="Sort by"
              onChange={(e) => onSortChange(e.target.value)}
               sx={{
                 '& .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
                 },
                 '&:hover .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
                 },
                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                   borderWidth: '2px',
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
