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
import "./App.css";

function App() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [countryOne, setCountryOne] = useState("");
  const [countryTwo, setCountryTwo] = useState("");
  const [compareYear, setCompareYear] = useState("2024");
  const [comparison, setComparison] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("http://127.0.0.1:8000/countries");
      const result = await response.json();
      setCountries(result.countries);
    };

    fetchCountries();
  }, []);

  const fetchCountry = async () => {
    if (!country.trim()) return;

    setLoading(true);

    try {
      const latestResponse = await fetch(
        `http://127.0.0.1:8000/country/${country}/latest`
      );
      const latestResult = await latestResponse.json();
      setData(latestResult);

      const historyResponse = await fetch(
        `http://127.0.0.1:8000/country/${country}/history`
      );
      const historyResult = await historyResponse.json();

      const cleanHistory = historyResult.filter((item) => item.co2 !== null);
      setHistory(cleanHistory);
    } catch (error) {
      console.error(error);
      alert("Country not found.");
    }

    setLoading(false);
  };

  const compareCountries = async () => {
    if (!countryOne.trim() || !countryTwo.trim() || !compareYear.trim()) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/compare/${countryOne}/${countryTwo}/${compareYear}`
      );

      const result = await response.json();
      setComparison(result);
    } catch (error) {
      console.error(error);
      alert("Comparison failed.");
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
          onChange={(e) => setCountry(e.target.value)}
        />

        <datalist id="country-list">
          {countries.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

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

      <div className="compare-card">
        <h2>Compare Countries</h2>

        <div className="compare-inputs">
          <input
            list="country-list"
            type="text"
            placeholder="Country 1"
            value={countryOne}
            onChange={(e) => setCountryOne(e.target.value)}
          />

          <input
            list="country-list"
            type="text"
            placeholder="Country 2"
            value={countryTwo}
            onChange={(e) => setCountryTwo(e.target.value)}
          />

          <input
            type="number"
            placeholder="Year"
            value={compareYear}
            onChange={(e) => setCompareYear(e.target.value)}
          />

          <button onClick={compareCountries}>Compare</button>
        </div>

        {comparison.length > 0 && (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  {comparison.map((item) => (
                    <th key={item.country}>{item.country}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Population</td>
                  {comparison.map((item) => (
                    <td key={item.country}>
                      {Number(item.population).toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>CO₂</td>
                  {comparison.map((item) => (
                    <td key={item.country}>{item.co2}</td>
                  ))}
                </tr>

                <tr>
                  <td>CO₂ Per Capita</td>
                  {comparison.map((item) => (
                    <td key={item.country}>{item.co2_per_capita}</td>
                  ))}
                </tr>

                <tr>
                  <td>Total GHG</td>
                  {comparison.map((item) => (
                    <td key={item.country}>{item.total_ghg}</td>
                  ))}
                </tr>

                <tr>
                  <td>Primary Energy</td>
                  {comparison.map((item) => (
                    <td key={item.country}>
                      {item.primary_energy_consumption}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;