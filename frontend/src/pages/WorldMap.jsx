import { useEffect, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";

import { API_URL } from "../config";
import DownloadCSVButton from "../components/DownloadCSVButton";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap() {
  const [countries, setCountries] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [bottomCountries, setBottomCountries] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const projection = geoNaturalEarth1()
    .scale(170)
    .translate([450, 250]);

  const pathGenerator = geoPath().projection(projection);

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      setError("");

      try {
        const [mapResponse, rankingsResponse] = await Promise.all([
          fetch(geoUrl),
          fetch(`${API_URL}/rankings/sustainability`),
        ]);

        if (!mapResponse.ok) {
          throw new Error("Could not load the world map.");
        }

        if (!rankingsResponse.ok) {
          throw new Error("Could not load sustainability rankings.");
        }

        const mapData = await mapResponse.json();
        const rankingsData = await rankingsResponse.json();

        const countryFeatures = feature(
          mapData,
          mapData.objects.countries
        ).features;

        setCountries(countryFeatures);

        setTopCountries(
          Array.isArray(rankingsData.top_10)
            ? rankingsData.top_10
            : []
        );

        setBottomCountries(
          Array.isArray(rankingsData.bottom_10)
            ? rankingsData.bottom_10
            : []
        );
      } catch (error) {
        console.error("World map page failed:", error);

        setError(
          "Could not load the sustainability map. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const normalizeCountryName = (name) =>
    name?.toLowerCase().trim().replace(/\s+/g, " ");

  const countryNameAliases = {
    "united states of america": "united states",
    "russian federation": "russia",
    "republic of korea": "south korea",
    "democratic republic of the congo":
      "democratic republic of congo",
    "republic of the congo": "congo",
    "czech republic": "czechia",
    "ivory coast": "cote d'ivoire",
    "bosnia and herz.": "bosnia and herzegovina",
    "dominican rep.": "dominican republic",
    "central african rep.": "central african republic",
    "eq. guinea": "equatorial guinea",
    "solomon is.": "solomon islands",
    "s. sudan": "south sudan",
  };

  const getComparableCountryName = (name) => {
    const normalizedName = normalizeCountryName(name);

    return countryNameAliases[normalizedName] || normalizedName;
  };

  const findCountryData = (rankingCountries, mapCountryName) => {
    const comparableMapName = getComparableCountryName(mapCountryName);

    return rankingCountries.find(
      (item) =>
        getComparableCountryName(item.country) === comparableMapName
    );
  };

  const getCountryInfo = (name) => {
    const topCountry = findCountryData(topCountries, name);

    if (topCountry) {
      return {
        fill: "#0f766e",
        data: topCountry,
        label: `${topCountry.country} | Sustainability Index: ${topCountry.sustainability_index}`,
      };
    }

    const bottomCountry = findCountryData(bottomCountries, name);

    if (bottomCountry) {
      return {
        fill: "#dc2626",
        data: bottomCountry,
        label: `${bottomCountry.country} | Sustainability Index: ${bottomCountry.sustainability_index}`,
      };
    }

    return {
      fill: "#d1d5db",
      data: null,
      label: name,
    };
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

  const mapCSVColumns = [
    {
      key: "group",
      label: "Map Group",
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

  const mapCSVData = [
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
      <h1>🌍 World Sustainability Map</h1>

      <p className="subtitle">
        Green countries are Top 10 sustainability performers. Red countries
        are Bottom 10.
      </p>

      {loading && (
        <p className="loading-message">
          Loading the world map and sustainability rankings.
        </p>
      )}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="map-tooltip-space">
            {hoveredCountry && (
              <p className="map-tooltip">{hoveredCountry}</p>
            )}
          </div>

          <div className="map-card">
            <svg
              viewBox="0 0 900 500"
              className="world-map-svg"
              role="img"
              aria-label="World sustainability map"
            >
              {countries.map((country) => {
                const name =
                  country.properties?.name || "Unknown country";

                const info = getCountryInfo(name);

                return (
                  <path
                    key={`${country.id}-${name}`}
                    d={pathGenerator(country) || ""}
                    fill={info.fill}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      cursor: info.data ? "pointer" : "default",
                    }}
                    onMouseEnter={() =>
                      setHoveredCountry(info.label)
                    }
                    onMouseLeave={() => setHoveredCountry("")}
                    onClick={() => {
                      if (info.data) {
                        setSelectedCountry(info.data);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>

          <div className="map-legend">
            <span>🟢 Top 10 Sustainability</span>
            <span>🔴 Bottom 10 Sustainability</span>
            <span>⚪ Other Countries</span>
          </div>

          {selectedCountry && (
            <div className="sustainability-card">
              <h2>{selectedCountry.country}</h2>

              <div className="index-score">
                {formatScore(selectedCountry.sustainability_index)}
                <span>/100</span>
              </div>

              <p className="index-year">
                Based on{" "}
                {selectedCountry.year ?? "the latest available"} data
              </p>

              <div className="pillar-grid">
                <div className="pillar">
                  <span>Climate</span>
                  <strong>
                    {formatScore(selectedCountry.climate_score)}
                  </strong>
                </div>

                <div className="pillar">
                  <span>Energy</span>
                  <strong>
                    {formatScore(selectedCountry.energy_score)}
                  </strong>
                </div>

                <div className="pillar">
                  <span>Prosperity</span>
                  <strong>
                    {formatScore(selectedCountry.prosperity_score)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
              >
                Close
              </button>
            </div>
          )}

          <div className="download-actions">
            <DownloadCSVButton
              data={mapCSVData}
              columns={mapCSVColumns}
              fileName="world-sustainability-map-data.csv"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default WorldMap;