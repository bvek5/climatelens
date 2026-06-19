import { useEffect, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import { API_URL } from "../config";

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
    const loadWorldMap = async () => {
      try {
        const mapResponse = await fetch(geoUrl);

        if (!mapResponse.ok) {
          throw new Error("Could not load the world map.");
        }

        const mapData = await mapResponse.json();

        const countryFeatures = feature(
          mapData,
          mapData.objects.countries
        ).features;

        setCountries(countryFeatures);
      } catch (error) {
        console.error("World map request failed:", error);
        throw error;
      }
    };

    const loadRankings = async () => {
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
        throw error;
      }
    };

    const loadPageData = async () => {
      setLoading(true);
      setError("");

      try {
        await Promise.all([loadWorldMap(), loadRankings()]);
      } catch (error) {
        console.error("World map page failed to load:", error);

        setError(
          "Could not load the sustainability map. The server may be starting up. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const normalizeCountryName = (name) =>
    name
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const countryNameAliases = {
    "united states of america": "united states",
    "russian federation": "russia",
    "republic of korea": "south korea",
    "democratic republic of the congo": "democratic republic of congo",
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

  return (
    <div className="container">
      <h1>🌍 World Sustainability Map</h1>

      <p className="subtitle">
        Green countries are Top 10 sustainability performers. Red countries
        are Bottom 10.
      </p>

      {loading && (
        <p className="loading-message">
          Loading the world map and sustainability rankings. The server may
          take a moment to wake up.
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
              aria-label="World map showing top and bottom sustainability countries"
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
                {formatScore(
                  selectedCountry.sustainability_index
                )}
                <span>/100</span>
              </div>

              <p className="index-year">
                Based on {selectedCountry.year ?? "the latest available"} data
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
        </>
      )}
    </div>
  );
}

export default WorldMap;

