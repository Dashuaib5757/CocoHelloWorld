import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data: items, error } = await supabase
      .from("helloworld")
      .select("*");

  if (error) {
    return (
        <div style={{ padding: "2rem" }}>
          <h1>Error loading data</h1>
          <p>{error.message}</p>
        </div>
    );
  }

  return (
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>My Items</h1>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items?.map((item) => (
              <li
                  key={item.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
              >
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{item.name}</h2>
                <p style={{ color: "#666", margin: "0.5rem 0 0" }}>
                  {item.description}
                </p>
              </li>
          ))}
        </ul>
      </div>
  );
}