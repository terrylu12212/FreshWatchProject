import React from "react";

function RecipeCard({ title, imageSrc }){
  return (
    <div className="card" style={{ padding: 12 }}>
      <div
        style={{
          height: 160,
          borderRadius: 12,
          background: "var(--color-surface)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {imageSrc ? (
          <img
            alt={title}
            src={imageSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="subtle" style={{ fontSize: 12 }}>No image</div>
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={title}
      >
        {title}
      </div>
    </div>
  );
}

export default function MealIdeas({ recipes = [] }) {
  const hasRecipes = Array.isArray(recipes) && recipes.length > 0;
  const topThree = hasRecipes ? recipes.slice(0, 3) : [];

  return (
    <section style={{ marginTop: 32 }}>
      {/* Header row: title on left, link on right */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div className="section-title" style={{ margin: 0, fontSize: 45, lineHeight: 1 }}>Meal Ideas for You</div>
        <a
          href="/recipes"
          className="btn"
          style={{
            padding: "0 14px",
            borderRadius: 8,
            background: "var(--color-primary)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            height: 45
          }}
        >
          See more recipes
        </a>
      </div>

      {/* Content area */}
      {hasRecipes ? (
        <div
          className="grid"
          style={{
            width: "100%",
            marginTop: 12,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {topThree.map((r) => (
            <RecipeCard key={r.id || r.title} title={r.title} imageSrc={r.image} />
          ))}
        </div>
      ) : (
        <div className="subtle" style={{ marginTop: 12 }}>No meal ideas yet. Add items to your pantry to get suggestions.</div>
      )}
    </section>
  );
}
