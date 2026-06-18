import { useEffect, useState } from "react";

function Sustainability() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const getRating = (score) => {
    if (score >= 75) return "🟢 Strong Sustainability";
    if (score >= 50) return "🟡 Moderate Sustainability";
    return "🔴 Needs Improvement";
  };

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("http://127.0.0.1:8000/countries");
      const data = await response.json();
      setCountries(data.countries);
    };

    fetchCountries();
  }, []);

  const searchCountry = async () => {
    if (!country.trim()) {
      setError("Please enter a country.");
      return;
    }

    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/sustainability/${country}`
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend.");
    }
  };

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
          onChange={(e) => setCountry(e.target.value)}
        />

        <datalist id="sustainability-country-list">
          {countries.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        <button onClick={searchCountry}>Calculate</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="sustainability-card">
          <h2>{result.country}</h2>

          <div className="index-score">
            {result.sustainability_index}
            <span>/100</span>
          </div>

          <p className="index-label">{getRating(result.sustainability_index)}</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${result.sustainability_index}%` }}
            ></div>
          </div>

          <p className="index-year">Based on {result.year} data</p>

          <div className="pillar-grid">
            <div className="pillar">
              <span>Climate Score</span>
              <strong>{result.climate_score}</strong>
            </div>

            <div className="pillar">
              <span>Energy Score</span>
              <strong>{result.energy_score}</strong>
            </div>

            <div className="pillar">
              <span>Prosperity Score</span>
              <strong>{result.prosperity_score}</strong>
            </div>
          </div>

          <div className="explanation-box">
            <h3>Why this score?</h3>

            <p>
              <strong>Climate Score:</strong> Measures emissions pressure using
              CO₂ per capita and greenhouse gas emissions per capita. A higher
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