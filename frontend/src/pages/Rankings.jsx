import { useEffect, useState } from "react";

import { API_URL } from "../config";
import DownloadPDFButton from "../components/DownloadPDFButton";
import DownloadCSVButton from "../components/DownloadCSVButton";

function Rankings() {
  const [topCountries, setTopCountries] = useState([]);
  const [bottomCountries, setBottomCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/rankings/sustainability`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(
            data.error || "Sustainability rankings could not be loaded."
          );
        }

        setTopCountries(
          Array.isArray(data.top_10) ? data.top_10 : []
        );

        setBottomCountries(
          Array.isArray(data.bottom_10) ? data.bottom_10 : []
        );
      } catch (error) {
        console.error("Rankings request failed:", error);

        setError(
          "Could not load rankings. The ClimateLens server may be starting up. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getRankDisplay = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return index + 1;
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) {
      return "N/A";
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return "N/A";
    }

    return numericScore.toFixed(2);
  };

  const renderTable = (countries, showMedals = false) => (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Country</th>
          <th>Index</th>
          <th>Climate</th>
          <th>Energy</th>
          <th>Prosperity</th>
          <th>Year</th>
        </tr>
      </thead>

      <tbody>
        {countries.map((item, index) => (
          <tr key={`${item.country}-${item.year}`}>
            <td>
              {showMedals ? getRankDisplay(index) : index + 1}
            </td>

            <td>{item.country}</td>

            <td>
              <strong>
                {formatScore(item.sustainability_index)}
              </strong>
            </td>

            <td>{formatScore(item.climate_score)}</td>

            <td>{formatScore(item.energy_score)}</td>

            <td>{formatScore(item.prosperity_score)}</td>

            <td>{item.year ?? "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const rankingsCSVColumns = [
    {
      key: "group",
      label: "Ranking Group",
    },
    {
      key: "rank",
      label: "Group Rank",
    },
    {
      key: "country",
      label: "Country",
    },
    {
      key: "sustainability_index",
      label: "Sustainability Index",
    },
    {
      key: "climate_score",
      label: "Climate Score",
    },
    {
      key: "energy_score",
      label: "Energy Score",
    },
    {
      key: "prosperity_score",
      label: "Prosperity Score",
    },
    {
      key: "year",
      label: "Year",
    },
  ];

  const rankingsCSVData = [
    ...topCountries.map((item, index) => ({
      group: "Top 10",
      rank: index + 1,
      country: item.country,
      sustainability_index: item.sustainability_index ?? "",
      climate_score: item.climate_score ?? "",
      energy_score: item.energy_score ?? "",
      prosperity_score: item.prosperity_score ?? "",
      year: item.year ?? "",
    })),

    ...bottomCountries.map((item, index) => ({
      group: "Bottom 10",
      rank: index + 1,
      country: item.country,
      sustainability_index: item.sustainability_index ?? "",
      climate_score: item.climate_score ?? "",
      energy_score: item.energy_score ?? "",
      prosperity_score: item.prosperity_score ?? "",
      year: item.year ?? "",
    })),
  ];

  return (
    <div className="container">
      <h1>🏆 Sustainability Rankings</h1>

      <p className="subtitle">
        Explore the highest and lowest Sustainability Index scores globally
      </p>

      {loading && (
        <p className="loading-message">
          Loading rankings. The server may take a moment to wake up.
        </p>
      )}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div id="rankings-report" className="pdf-report">
            <div className="chart-card">
              <h2>Top 10 Sustainability Index Countries</h2>

              {topCountries.length > 0 ? (
                <div className="comparison-table">
                  {renderTable(topCountries, true)}
                </div>
              ) : (
                <p>No top-ranking country data is available.</p>
              )}
            </div>

            <div className="chart-card">
              <h2>Bottom 10 Sustainability Index Countries</h2>

              {bottomCountries.length > 0 ? (
                <div className="comparison-table">
                  {renderTable(bottomCountries)}
                </div>
              ) : (
                <p>No bottom-ranking country data is available.</p>
              )}
            </div>

            <div className="explanation-box">
              <h3>Ranking methodology</h3>

              <p>
                Rankings are based on the ClimateLens Sustainability Index,
                which combines climate, energy, and prosperity indicators.
              </p>

              <p>
                <strong>Climate Score:</strong> Reflects emissions pressure
                using carbon and greenhouse-gas indicators.
              </p>

              <p>
                <strong>Energy Score:</strong> Reflects energy efficiency
                compared with economic output.
              </p>

              <p>
                <strong>Prosperity Score:</strong> Reflects economic
                development using GDP per capita.
              </p>

              <p>
                <strong>Important:</strong> The ClimateLens Sustainability
                Index is a calculated analytical indicator and should not be
                interpreted as an official international ranking.
              </p>

              <p>
                <strong>Source:</strong> ClimateLens data API using the Our
                World in Data climate dataset.
              </p>
            </div>
          </div>

          <div className="download-actions">
            <DownloadPDFButton
              targetId="rankings-report"
              fileName="global-sustainability-rankings.pdf"
              reportTitle="ClimateLens Global Sustainability Rankings"
            />

            <DownloadCSVButton
              data={rankingsCSVData}
              columns={rankingsCSVColumns}
              fileName="global-sustainability-rankings.csv"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Rankings;