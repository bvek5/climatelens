import { useState } from "react";

function App() {
  const [country, setCountry] = useState("");
  const [data, setData] = useState(null);

  const fetchCountry = async () => {
  console.log("Search clicked");

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/country/${country}/latest`
    );

    const result = await response.json();

    console.log(result);

    setData(result);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🌍 ClimateLens</h1>

      <input
        type="text"
        placeholder="Enter country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{
          padding: "10px",
          marginRight: "10px",
          width: "250px",
        }}
      />

      <button
        onClick={fetchCountry}
        style={{
          padding: "10px 15px",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {data && (
        <div style={{ marginTop: "30px" }}>
          <h2>{data.country}</h2>

          <p><strong>Latest Year:</strong> {data.latest_year}</p>
          <p><strong>Population:</strong> {data.population}</p>
          <p><strong>CO₂:</strong> {data.co2}</p>
          <p><strong>CO₂ per Capita:</strong> {data.co2_per_capita}</p>
          <p><strong>Total GHG:</strong> {data.total_ghg}</p>
          <p><strong>Primary Energy:</strong> {data.primary_energy_consumption}</p>
        </div>
      )}
    </div>
  );
}

export default App;