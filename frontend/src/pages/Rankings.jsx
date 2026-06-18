import { useEffect, useState } from "react";

function Rankings() {
  const [topCountries, setTopCountries] = useState([]);
  const [bottomCountries, setBottomCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/rankings/sustainability"
        );

        const data = await response.json();

        setTopCountries(data.top_10);
        setBottomCountries(data.bottom_10);
      } catch (err) {
        console.error(err);
        setError("Could not load rankings. Make sure FastAPI is running.");
      }

      setLoading(false);
    };

    fetchRankings();
  }, []);

  const renderTable = (countries) => (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Country</th>
          <th>Index</th>
          <th>Climate</th>
          <th>Energy</th>
          <th>Prosperity</th>
        </tr>
      </thead>

      <tbody>
        {countries.map((item, index) => (
          <tr key={item.country}>
            <td>{index + 1}</td>
            <td>{item.country}</td>
            <td>{item.sustainability_index}</td>
            <td>{item.climate_score}</td>
            <td>{item.energy_score}</td>
            <td>{item.prosperity_score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container">
      <h1>🏆 Sustainability Rankings</h1>
      <p className="subtitle">
        Explore the highest and lowest Sustainability Index scores globally
      </p>

      {loading && <p className="loading-message">Loading rankings...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="chart-card">
            <h2>Top 10 Sustainability Index Countries</h2>
            <div className="comparison-table">{renderTable(topCountries)}</div>
          </div>

          <div className="chart-card">
            <h2>Bottom 10 Sustainability Index Countries</h2>
            <div className="comparison-table">
              {renderTable(bottomCountries)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Rankings;