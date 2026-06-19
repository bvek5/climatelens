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
import { API_URL } from "../config";

function Dashboard() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/countries`);

        if (!response.ok) {
          throw new Error("Could not load countries.");
        }

        const result = await response.json();
        setCountries(result.countries || []);
      } catch (error) {
        console.error("Countries request failed:", error);
        setError(
          "Could not load the country list. The server may be starting up."
        );
      }
    };

    fetchCountries();
  }, []);

  const fetchCountry = async () => {
    const cleanCountry = country.trim();

    if (!cleanCountry) {
      setError("Please enter a country name.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setHistory([]);

    try {
      const encodedCountry = encodeURIComponent(cleanCountry);

      const latestResponse = await fetch(
        `${API_URL}/country/${encodedCountry}/latest`
      );

      const latestResult = await latestResponse.json();

      if (!latestResponse.ok || latestResult.error) {
        setError("Country not found. Please select a valid country.");
        return;
      }

      setData(latestResult);

      const historyResponse = await fetch(
        `${API_URL}/country/${encodedCountry}/history`
      );

      const historyResult = await historyResponse.json();

      if (!historyResponse.ok || !Array.isArray(historyResult)) {
        setError("Historical data could not be loaded for this country.");
        return;
      }

      const cleanHistory = historyResult.filter(
        (item) => item.co2 !== null && item.co2 !== undefined
      );

      setHistory(cleanHistory);
    } catch (error) {
      console.error("Country request failed:", error);
      setError(
        "Could not connect to the ClimateLens server. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      fetchCountry();
    }
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
          onChange={(event) => setCountry(event.target.value)}
          onKeyDown={handleKeyDown}
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

      {loading && (
        <p className="loading-message">
          Loading country data. The server may take a moment to wake up.
        </p>
      )}

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
              <strong>
                {data.population !== null &&
                data.population !== undefined
                  ? Number(data.population).toLocaleString()
                  : "N/A"}
              </strong>
            </div>

            <div className="stat">
              <span>CO₂</span>
              <strong>{data.co2 ?? "N/A"}</strong>
            </div>

            <div className="stat">
              <span>CO₂ Per Capita</span>
              <strong>{data.co2_per_capita ?? "N/A"}</strong>
            </div>

            <div className="stat">
              <span>Total GHG</span>
              <strong>{data.total_ghg ?? "N/A"}</strong>
            </div>

            <div className="stat">
              <span>Primary Energy</span>
              <strong>{data.primary_energy_consumption ?? "N/A"}</strong>
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

              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

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