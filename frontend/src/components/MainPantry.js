import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, LinearProgress, Divider } from '@mui/material';

function Row({ label, status, checked, onCheckChange }){
  const color = status === "Expired" ? "#ff6b6b" : status.includes("Expires") ? "#ffd966" : "var(--color-muted)";
  
  // Parse expiration from status text
  const getExpirationData = () => {
    if (status === "Expired") {
      return { percent: 100, color: '#ff6b6b', days: -1 }; // Red
    } else if (status === "Expires today!") {
      return { percent: 100, color: '#ff9797', days: 0 }; // Light red
    } else if (status === "Expires tomorrow") {
      return { percent: 90, color: '#ffd966', days: 1 }; // Yellow
    } else if (status.includes("Expires in")) {
      const match = status.match(/Expires in (\d+) days?/);
      if (match) {
        const days = parseInt(match[1]);
        // Assume 14 days is "fresh" (0%), expired is 100%
        const maxDays = 14;
        const percent = Math.max(0, Math.min(100, ((maxDays - days) / maxDays) * 100));
        
        // Color based on days remaining
        let barColor;
        if (days <= 1) {
          barColor = '#ffd966'; // Yellow
        } else if (days <= 3) {
          barColor = '#ffe16a'; // Light yellow
        } else if (days <= 7) {
          barColor = '#86efac'; // Light green
        } else {
          barColor = '#22c55e'; // Vibrant green
        }
        
        return { percent, color: barColor, days };
      }
    }
    // Fresh - no expiration
    return { percent: 0, color: '#22c55e', days: 999 };
  };

  const expirationData = getExpirationData();
  
  return (
    <div style={{padding:"14px 6px"}}>
      {/* Single row: checkbox + name | progress bar | status */}
      <div style={{display:'flex', alignItems:'center', gap:0}}>
        {/* Left: checkbox + name */}
        <div style={{display:'flex', alignItems:'center', gap:12, minWidth: 220}}>
          <input 
            type="checkbox" 
            checked={checked}
            onChange={(e) => onCheckChange(e.target.checked)}
            style={{
              width: 20,
              height: 20,
              accentColor: checked ? '#22c55e' : '#999',
              cursor: 'pointer'
            }}
          />
          <div style={{fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</div>
        </div>

        {/* Middle: progress bar fills available space */}
        <div style={{flex:1}}>
          <LinearProgress 
            variant="determinate" 
            value={expirationData.percent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.12)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: expirationData.color,
                borderRadius: 3,
              }
            }}
          />
        </div>

        {/* Right: status */}
        <div className="row" style={{gap:10, color, minWidth: 180, justifyContent:'flex-end'}}>
          <span>{status}</span><span aria-hidden>›</span>
        </div>
      </div>
    </div>
  );
}

export default function MainPantry({ items=[] , sort="expiration", onSortChange=()=>{} , query, onQuery}){
  // Track checked state per item by name (or _id if available)
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheck = (itemKey, checked) => {
    setCheckedItems(prev => ({ ...prev, [itemKey]: checked }));
  };

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
        <div style={{padding:"4px 14px"}}>
          {items.map((i, idx) => {
            const key = i._id || i.name;
            return (
              <React.Fragment key={key}>
                <Row 
                  label={i.name}
                  status={i.status}
                  checked={!!checkedItems[key]}
                  onCheckChange={(checked) => handleCheck(key, checked)}
                />
                {idx < items.length - 1 && (
                  <Divider 
                    variant="fullWidth"
                    sx={{ 
                      borderColor: 'rgba(0,0,0,0.12)', 
                      opacity: 1,
                      borderBottomWidth: 2,
                    }} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

// local import so file is self-contained when copied:
function SearchBar({ value, onChange, placeholder }){
  return <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>;
}
