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
import DownloadPDFButton from "../components/DownloadPDFButton";

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

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return Number(value).toLocaleString();
  };

  return (
    <div className="container">
      <h1>🌍 ClimateLens</h1>

      <p className="subtitle">
        Explore climate and emissions data by country
      </p>

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

        <button
          type="button"
          onClick={fetchCountry}
          disabled={loading}
        >
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
        <>
          <div id="dashboard-report" className="pdf-report">
            <div className="card">
              <h2>{data.country}</h2>

              <p className="index-year">
                Climate and emissions overview based on the latest available
                data
              </p>

              <div className="stats">
                <div className="stat">
                  <span>Latest Year</span>
                  <strong>{data.latest_year ?? "N/A"}</strong>
                </div>

                <div className="stat">
                  <span>Population</span>
                  <strong>{formatValue(data.population)}</strong>
                </div>

                <div className="stat">
                  <span>CO₂</span>
                  <strong>{formatValue(data.co2)}</strong>
                </div>

                <div className="stat">
                  <span>CO₂ Per Capita</span>
                  <strong>{formatValue(data.co2_per_capita)}</strong>
                </div>

                <div className="stat">
                  <span>Total GHG</span>
                  <strong>{formatValue(data.total_ghg)}</strong>
                </div>

                <div className="stat">
                  <span>Primary Energy</span>

                  <strong>
                    {formatValue(data.primary_energy_consumption)}
                  </strong>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="chart-card">
                <h2>CO₂ Emissions Trend</h2>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={history}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                    />

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
                      name="CO₂"
                      stroke="#0f766e"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="explanation-box">
              <h3>Report information</h3>

              <p>
                <strong>CO₂:</strong> Annual carbon dioxide emissions for the
                selected country.
              </p>

              <p>
                <strong>CO₂ Per Capita:</strong> Annual carbon dioxide
                emissions divided by population.
              </p>

              <p>
                <strong>Total GHG:</strong> Total greenhouse-gas emissions
                expressed using the available dataset measurement.
              </p>

              <p>
                <strong>Primary Energy:</strong> Total primary-energy
                consumption reported in the source dataset.
              </p>

              <p>
                <strong>Source:</strong> ClimateLens data API using the Our
                World in Data climate dataset.
              </p>
            </div>
          </div>

          <div className="download-pdf-container">
            <DownloadPDFButton
              targetId="dashboard-report"
              fileName={`${data.country}-climate-report.pdf`}
              reportTitle={`${data.country} ClimateLens Report`}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
