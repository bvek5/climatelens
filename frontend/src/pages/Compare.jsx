import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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
  const [selectedMetric, setSelectedMetric] = useState("co2");

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

          <button onClick={compareCountries}>Compare</button>
        </div>

        {comparison.length > 0 && (
          <>
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
                  <Tooltip  formatter={(value) =>
                  Number(value).toLocaleString()
                  } />
                  <Bar dataKey={selectedMetric} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Compare;