import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("http://127.0.0.1:8000/countries");
      const result = await response.json();
      setCountries(result.countries);
    };

    fetchCountries();
  }, []);

  const fetchCountry = async () => {
    if (!country.trim()) {
      setError("Please enter a country name.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setHistory([]);

    try {
      const latestResponse = await fetch(
        `http://127.0.0.1:8000/country/${country}/latest`
      );
      const latestResult = await latestResponse.json();

      if (latestResult.error) {
        setError("Country not found. Please select a valid country.");
        setLoading(false);
        return;
      }

      setData(latestResult);

      const historyResponse = await fetch(
        `http://127.0.0.1:8000/country/${country}/history`
      );
      const historyResult = await historyResponse.json();

      const cleanHistory = historyResult.filter((item) => item.co2 !== null);
      setHistory(cleanHistory);
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend. Make sure FastAPI is running.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🌍 ClimateLens</h1>
      <p className="subtitle">Explore climate and emissions data by country</p>

      <div className="search-box">
        <input
          list="country-list"
          type="text"
          placeholder="Search country..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <datalist id="country-list">
          {countries.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        <button onClick={fetchCountry} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

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

      {history.length > 0 && (
        <div className="chart-card">
          <h2>CO₂ Emissions Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="co2"
                stroke="#0f766e"
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;