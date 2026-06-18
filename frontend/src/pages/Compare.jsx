import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Compare() {
  const [countries, setCountries] = useState([]);
  const [countryOne, setCountryOne] = useState("");
  const [countryTwo, setCountryTwo] = useState("");
  const [compareYear, setCompareYear] = useState("2024");
  const [comparison, setComparison] = useState([]);
  const [historyRaw, setHistoryRaw] = useState([]);
  const [sustainabilityComparison, setSustainabilityComparison] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("co2");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const metricLabels = {
    population: "Population",
    co2: "CO₂",
    co2_per_capita: "CO₂ Per Capita",
    total_ghg: "Total GHG",
    primary_energy_consumption: "Primary Energy",
  };

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("http://127.0.0.1:8000/countries");
      const result = await response.json();
      setCountries(result.countries);
    };

    fetchCountries();
  }, []);

  const buildTrendData = (rawData, metric) => {
    const years = {};

    rawData.forEach((item) => {
      if (item[metric] === null || item[metric] === undefined) return;

      if (!years[item.year]) {
        years[item.year] = { year: item.year };
      }

      years[item.year][item.country] = item[metric];
    });

    return Object.values(years).sort((a, b) => a.year - b.year);
  };

  const compareCountries = async () => {
    if (!countryOne.trim() || !countryTwo.trim() || !compareYear.trim()) {
      setError("Please enter two countries and a year.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison([]);
    setHistoryRaw([]);
    setSustainabilityComparison([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/compare/${countryOne}/${countryTwo}/${compareYear}`
      );

      const result = await response.json();

      if (result.error || !Array.isArray(result) || result.length < 2) {
        setError("Comparison not found. Please select two valid countries and year.");
        setLoading(false);
        return;
      }

      setComparison(result);

      const sustainabilityResponse = await fetch(
        `http://127.0.0.1:8000/sustainability-compare/${countryOne}/${countryTwo}`
      );

      const sustainabilityResult = await sustainabilityResponse.json();

      if (!sustainabilityResult.error && Array.isArray(sustainabilityResult)) {
        setSustainabilityComparison(sustainabilityResult);
      }

      const historyResponse = await fetch(
        `http://127.0.0.1:8000/compare-history/${countryOne}/${countryTwo}`
      );

      const historyResult = await historyResponse.json();

      if (historyResult.error || !Array.isArray(historyResult)) {
        setError("Trend data not found for these countries.");
        setLoading(false);
        return;
      }

      setHistoryRaw(historyResult);
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend. Make sure FastAPI is running.");
    }

    setLoading(false);
  };

  const getRating = (score) => {
    if (score >= 75) return "🟢 Strong";
    if (score >= 50) return "🟡 Moderate";
    return "🔴 Needs Improvement";
  };

  const trendData = buildTrendData(historyRaw, selectedMetric);

  return (
    <div className="container">
      <h1>🌍 ClimateLens Compare</h1>
      <p className="subtitle">Compare two countries by year</p>

      <datalist id="country-list">
        {countries.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

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

          <button onClick={compareCountries} disabled={loading}>
            {loading ? "Loading..." : "Compare"}
          </button>
        </div>

        {loading && <p className="loading-message">Loading comparison...</p>}

        {error && <p className="error-message">{error}</p>}

        {comparison.length > 0 && (
          <>
            {sustainabilityComparison.length > 0 && (
              <div className="chart-card">
                <h2>Sustainability Index Comparison</h2>
                
                {(() => {
                    const winner =
                        sustainabilityComparison[0].sustainability_index >=
                        sustainabilityComparison[1].sustainability_index
                            ? sustainabilityComparison[0]
                            : sustainabilityComparison[1];

                    const loser =
                        sustainabilityComparison[0].country === winner.country
                        ? sustainabilityComparison[1]
                        : sustainabilityComparison[0];

                    const difference = Math.abs(
                        winner.sustainability_index - loser.sustainability_index
                        ).toFixed(2);

                    return (
                        <div className="winner-box">
                         <h3>🏆 {winner.country} has the higher Sustainability Index</h3>
                         <p>
                        {winner.country} scores {difference} points higher than {loser.country}.
                         </p>
                        </div>
                      );
                })()}

                <div className="sustainability-compare-grid">
                  {sustainabilityComparison.map((item) => (
                    <div className="sustainability-mini-card" key={item.country}>
                      <h3>{item.country}</h3>

                      <div className="mini-index-score">
                        {item.sustainability_index}
                        <span>/100</span>
                      </div>

                      <p className="mini-rating">
                        {getRating(item.sustainability_index)}
                      </p>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.sustainability_index}%` }}
                        ></div>
                      </div>

                      <div className="mini-pillars">
                        <p>
                          Climate: <strong>{item.climate_score}</strong>
                        </p>
                        <p>
                          Energy: <strong>{item.energy_score}</strong>
                        </p>
                        <p>
                          Prosperity: <strong>{item.prosperity_score}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="metric-selector">
              <label>Chart Metric: </label>

              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="co2">CO₂</option>
                <option value="population">Population</option>
                <option value="co2_per_capita">CO₂ Per Capita</option>
                <option value="total_ghg">Total GHG</option>
                <option value="primary_energy_consumption">
                  Primary Energy
                </option>
              </select>
            </div>

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

            <div className="chart-card">
              <h2>{metricLabels[selectedMetric]} Comparison</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis
                    width={90}
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(1)}M`
                        : value
                    }
                  />
                  <Tooltip
                    formatter={(value) => Number(value).toLocaleString()}
                  />
                  <Bar dataKey={selectedMetric} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {trendData.length > 0 && (
              <div className="chart-card">
                <h2>{metricLabels[selectedMetric]} Trend Over Time</h2>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                      width={90}
                      tickFormatter={(value) =>
                        value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}M`
                          : value
                      }
                    />
                    <Tooltip
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                    <Line
                      type="monotone"
                      dataKey={countryOne}
                      stroke="#0f766e"
                      strokeWidth={4}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={countryTwo}
                      stroke="#2563eb"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Compare;