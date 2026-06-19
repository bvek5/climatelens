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
import { API_URL } from "../config";

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

  const buildTrendData = (rawData, metric) => {
    const years = {};

    rawData.forEach((item) => {
      if (item[metric] === null || item[metric] === undefined) {
        return;
      }

      if (!years[item.year]) {
        years[item.year] = { year: item.year };
      }

      years[item.year][item.country] = item[metric];
    });

    return Object.values(years).sort((a, b) => a.year - b.year);
  };

  const compareCountries = async () => {
    const cleanCountryOne = countryOne.trim();
    const cleanCountryTwo = countryTwo.trim();
    const cleanYear = compareYear.trim();

    if (!cleanCountryOne || !cleanCountryTwo || !cleanYear) {
      setError("Please enter two countries and a year.");
      return;
    }

    if (cleanCountryOne.toLowerCase() === cleanCountryTwo.toLowerCase()) {
      setError("Please choose two different countries.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison([]);
    setHistoryRaw([]);
    setSustainabilityComparison([]);

    try {
      const encodedCountryOne = encodeURIComponent(cleanCountryOne);
      const encodedCountryTwo = encodeURIComponent(cleanCountryTwo);

      const response = await fetch(
        `${API_URL}/compare/${encodedCountryOne}/${encodedCountryTwo}/${cleanYear}`
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.error ||
        !Array.isArray(result) ||
        result.length < 2
      ) {
        setError(
          "Comparison not found. Please select two valid countries and a valid year."
        );
        return;
      }

      setComparison(result);

      const sustainabilityResponse = await fetch(
        `${API_URL}/sustainability-compare/${encodedCountryOne}/${encodedCountryTwo}`
      );

      const sustainabilityResult = await sustainabilityResponse.json();

      if (
        sustainabilityResponse.ok &&
        !sustainabilityResult.error &&
        Array.isArray(sustainabilityResult)
      ) {
        setSustainabilityComparison(sustainabilityResult);
      }

      const historyResponse = await fetch(
        `${API_URL}/compare-history/${encodedCountryOne}/${encodedCountryTwo}`
      );

      const historyResult = await historyResponse.json();

      if (
        !historyResponse.ok ||
        historyResult.error ||
        !Array.isArray(historyResult)
      ) {
        setError("Trend data could not be loaded for these countries.");
        return;
      }

      setHistoryRaw(historyResult);
    } catch (error) {
      console.error("Comparison request failed:", error);
      setError(
        "Could not connect to the ClimateLens server. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      compareCountries();
    }
  };

  const getRating = (score) => {
    if (score >= 75) return "🟢 Strong";
    if (score >= 50) return "🟡 Moderate";
    return "🔴 Needs Improvement";
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return Number(value).toLocaleString();
  };

  const formatAxisValue = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return value;
  };

  const trendData = buildTrendData(historyRaw, selectedMetric);

  const chartCountryOne =
    comparison.find(
      (item) =>
        item.country.toLowerCase() === countryOne.trim().toLowerCase()
    )?.country || countryOne.trim();

  const chartCountryTwo =
    comparison.find(
      (item) =>
        item.country.toLowerCase() === countryTwo.trim().toLowerCase()
    )?.country || countryTwo.trim();

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
            onChange={(event) => setCountryOne(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <input
            list="country-list"
            type="text"
            placeholder="Country 2"
            value={countryTwo}
            onChange={(event) => setCountryTwo(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <input
            type="number"
            placeholder="Year"
            value={compareYear}
            onChange={(event) => setCompareYear(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={compareCountries} disabled={loading}>
            {loading ? "Loading..." : "Compare"}
          </button>
        </div>

        {loading && (
          <p className="loading-message">
            Loading comparison data. The server may take a moment to wake up.
          </p>
        )}

        {error && <p className="error-message">{error}</p>}

        {comparison.length > 0 && (
          <>
            {sustainabilityComparison.length >= 2 && (
              <div className="chart-card">
                <h2>Sustainability Index Comparison</h2>

                {(() => {
                  const firstCountry = sustainabilityComparison[0];
                  const secondCountry = sustainabilityComparison[1];

                  const winner =
                    firstCountry.sustainability_index >=
                    secondCountry.sustainability_index
                      ? firstCountry
                      : secondCountry;

                  const loser =
                    winner.country === firstCountry.country
                      ? secondCountry
                      : firstCountry;

                  const difference = Math.abs(
                    winner.sustainability_index -
                      loser.sustainability_index
                  ).toFixed(2);

                  return (
                    <div className="winner-box">
                      <h3>
                        🏆 {winner.country} has the higher Sustainability Index
                      </h3>

                      <p>
                        {winner.country} scores {difference} points higher than{" "}
                        {loser.country}.
                      </p>
                    </div>
                  );
                })()}

                <div className="sustainability-compare-grid">
                  {sustainabilityComparison.map((item) => (
                    <div
                      className="sustainability-mini-card"
                      key={item.country}
                    >
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
                          style={{
                            width: `${Math.min(
                              Math.max(item.sustainability_index, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mini-pillars">
                        <p>
                          Climate:{" "}
                          <strong>{item.climate_score ?? "N/A"}</strong>
                        </p>

                        <p>
                          Energy:{" "}
                          <strong>{item.energy_score ?? "N/A"}</strong>
                        </p>

                        <p>
                          Prosperity:{" "}
                          <strong>{item.prosperity_score ?? "N/A"}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="metric-selector">
              <label htmlFor="metric-select">Chart Metric:</label>

              <select
                id="metric-select"
                value={selectedMetric}
                onChange={(event) => setSelectedMetric(event.target.value)}
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
                        {formatValue(item.population)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td>CO₂</td>

                    {comparison.map((item) => (
                      <td key={item.country}>{formatValue(item.co2)}</td>
                    ))}
                  </tr>

                  <tr>
                    <td>CO₂ Per Capita</td>

                    {comparison.map((item) => (
                      <td key={item.country}>
                        {formatValue(item.co2_per_capita)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td>Total GHG</td>

                    {comparison.map((item) => (
                      <td key={item.country}>
                        {formatValue(item.total_ghg)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td>Primary Energy</td>

                    {comparison.map((item) => (
                      <td key={item.country}>
                        {formatValue(item.primary_energy_consumption)}
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
                    tickFormatter={formatAxisValue}
                  />

                  <Tooltip formatter={(value) => formatValue(value)} />

                  <Bar
                    dataKey={selectedMetric}
                    fill="#0f766e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {trendData.length > 0 && (
              <div className="chart-card">
                <h2>{metricLabels[selectedMetric]} Trend Over Time</h2>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      width={90}
                      tickFormatter={formatAxisValue}
                    />

                    <Tooltip formatter={(value) => formatValue(value)} />

                    <Line
                      type="monotone"
                      dataKey={chartCountryOne}
                      stroke="#0f766e"
                      strokeWidth={4}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey={chartCountryTwo}
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