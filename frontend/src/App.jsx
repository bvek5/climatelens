import { useState } from "react";
import "./App.css";

function App() {
  const [country, setCountry] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCountry = async () => {
    if (!country.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/country/${country}/latest`
      );

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Country not found.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🌍 ClimateLens</h1>
      <p className="subtitle">
        Explore climate and emissions data by country
      </p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter country..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <button onClick={fetchCountry}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {data && (
        <div className="card">
          <h2>{data.country}</h2>

          <div className="stats">
            <div className="stat">
              <span>Latest Year</span>
              <strong>{data.latest_year}</strong>
            </div>

            <div className="stat">
              <span>Population</span>
              <strong>{Number(data.population).toLocaleString()}</strong>
            </div>

            <div className="stat">
              <span>CO₂</span>
              <strong>{data.co2}</strong>
            </div>

            <div className="stat">
              <span>CO₂ Per Capita</span>
              <strong>{data.co2_per_capita}</strong>
            </div>

            <div className="stat">
              <span>Total GHG</span>
              <strong>{data.total_ghg}</strong>
            </div>

            <div className="stat">
              <span>Primary Energy</span>
              <strong>{data.primary_energy_consumption}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;