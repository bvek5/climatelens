import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Sustainability() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRating = (score) => {
    if (score >= 75) return "🟢 Strong Sustainability";
    if (score >= 50) return "🟡 Moderate Sustainability";
    return "🔴 Needs Improvement";
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/countries`);

        if (!response.ok) {
          throw new Error("Could not load countries.");
        }

        const data = await response.json();
        setCountries(data.countries || []);
      } catch (error) {
        console.error("Countries request failed:", error);
        setError(
          "Could not load the country list. The server may be starting up."
        );
      }
    };

    fetchCountries();
  }, []);

  const searchCountry = async () => {
    const cleanCountry = country.trim();

    if (!cleanCountry) {
      setError("Please enter a country.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const encodedCountry = encodeURIComponent(cleanCountry);

      const response = await fetch(
        `${API_URL}/sustainability/${encodedCountry}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(
          data.error || "Sustainability data was not found for this country."
        );
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Sustainability request failed:", error);
      setError(
        "Could not connect to the ClimateLens server. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchCountry();
    }
  };

  const progressWidth = result
    ? Math.min(Math.max(Number(result.sustainability_index) || 0, 0), 100)
    : 0;

  return (
    <div className="container">
      <h1>🌱 Sustainability Index</h1>

      <p className="subtitle">
        Evaluate countries using climate, energy, and prosperity indicators
      </p>

      <div className="search-box">
        <input
          list="sustainability-country-list"
          type="text"
          placeholder="Search country..."
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <datalist id="sustainability-country-list">
          {countries.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        <button onClick={searchCountry} disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {loading && (
        <p className="loading-message">
          Calculating the Sustainability Index. The server may take a moment to
          wake up.
        </p>
      )}

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="sustainability-card">
          <h2>{result.country}</h2>

          <div className="index-score">
            {result.sustainability_index ?? "N/A"}
            <span>/100</span>
          </div>

          <p className="index-label">
            {getRating(Number(result.sustainability_index) || 0)}
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <p className="index-year">
            Based on {result.year ?? "the latest available"} data
          </p>

          <div className="pillar-grid">
            <div className="pillar">
              <span>Climate Score</span>
              <strong>{result.climate_score ?? "N/A"}</strong>
            </div>

            <div className="pillar">
              <span>Energy Score</span>
              <strong>{result.energy_score ?? "N/A"}</strong>
            </div>

            <div className="pillar">
              <span>Prosperity Score</span>
              <strong>{result.prosperity_score ?? "N/A"}</strong>
            </div>
          </div>

          <div className="explanation-box">
            <h3>Why this score?</h3>

            <p>
              <strong>Climate Score:</strong> Measures emissions pressure using
              CO₂ per capita and greenhouse-gas emissions per capita. A higher
              score means lower climate impact.
            </p>

            <p>
              <strong>Energy Score:</strong> Measures how efficiently a country
              uses energy compared with economic output. A higher score means
              better energy efficiency.
            </p>

            <p>
              <strong>Prosperity Score:</strong> Uses GDP per capita to capture
              economic development. A higher score means stronger economic
              prosperity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sustainability;