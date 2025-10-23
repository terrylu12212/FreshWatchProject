import React from "react";

function RecipeCard({ title, imageSrc }){
  return (
    <div className="card" style={{padding:8}}>
      <div style={{height:110, borderRadius:12, background:"var(--color-surface)", display:"grid", placeItems:"center", overflow:"hidden", marginBottom:8}}>
        {imageSrc ? <img alt={title} src={imageSrc} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : null}
      </div>
      <div style={{fontWeight:700, fontSize:14}}>{title}</div>
    </div>
  );
}

export default function MealIdeas({ recipes=[] }){
  return (
    <div className="row" style={{marginTop:24}}>
      <div className="section-title" style={{margin:0, flex:1}}>Meal Ideas for You</div>
      <a href="/recipes" className="subtle">See More Recipes</a>
      <div style={{width:8}}/>
      <div style={{width:"100%"}}/>
      <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)", width:"100%", marginTop:12}}>
        {recipes.slice(0,3).map(r=>(
          <RecipeCard key={r.id || r.title} title={r.title} imageSrc={r.image}/>
        ))}
      </div>
    </div>
  );
}
