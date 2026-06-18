import { useEffect, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap() {
  const [countries, setCountries] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [bottomCountries, setBottomCountries] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);

  const projection = geoNaturalEarth1().scale(170).translate([450, 250]);
  const pathGenerator = geoPath().projection(projection);

  useEffect(() => {
    const loadMap = async () => {
      const mapResponse = await fetch(geoUrl);
      const mapData = await mapResponse.json();

      const countryFeatures = feature(
        mapData,
        mapData.objects.countries
      ).features;

      setCountries(countryFeatures);
    };

    const loadRankings = async () => {
      const response = await fetch(
        "http://127.0.0.1:8000/rankings/sustainability"
      );
      const data = await response.json();

      setTopCountries(data.top_10 || []);
      setBottomCountries(data.bottom_10 || []);
    };

    loadMap();
    loadRankings();
  }, []);

  const getCountryInfo = (name) => {
    const top = topCountries.find(
      (item) => item.country.toLowerCase() === name.toLowerCase()
    );

    if (top) {
      return {
        fill: "#0f766e",
        data: top,
        label: `${name} | Sustainability Index: ${top.sustainability_index}`,
      };
    }

    const bottom = bottomCountries.find(
      (item) => item.country.toLowerCase() === name.toLowerCase()
    );

    if (bottom) {
      return {
        fill: "#dc2626",
        data: bottom,
        label: `${name} | Sustainability Index: ${bottom.sustainability_index}`,
      };
    }

    return {
      fill: "#d1d5db",
      data: null,
      label: name,
    };
  };

  return (
    <div className="container">
      <h1>🌍 World Sustainability Map</h1>

      <p className="subtitle">
        Green countries are Top 10 sustainability performers. Red countries are
        Bottom 10.
      </p>

      <div className="map-tooltip-space">
        {hoveredCountry && <p className="map-tooltip">{hoveredCountry}</p>}
    </div>

      <div className="map-card">
        <svg viewBox="0 0 900 500" className="world-map-svg">
          {countries.map((country) => {
            const name = country.properties.name;
            const info = getCountryInfo(name);

            return (
              <path
                key={`${country.id}-${country.properties.name}`}
                d={pathGenerator(country)}
                fill={info.fill}
                stroke="#ffffff"
                strokeWidth={0.5}
                style={{ cursor: info.data ? "pointer" : "default" }}
                onMouseEnter={() => setHoveredCountry(info.label)}
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
            {selectedCountry.sustainability_index}
            <span>/100</span>
          </div>

          <p className="index-year">Based on {selectedCountry.year} data</p>

          <div className="pillar-grid">
            <div className="pillar">
              <span>Climate</span>
              <strong>{selectedCountry.climate_score}</strong>
            </div>

            <div className="pillar">
              <span>Energy</span>
              <strong>{selectedCountry.energy_score}</strong>
            </div>

            <div className="pillar">
              <span>Prosperity</span>
              <strong>{selectedCountry.prosperity_score}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldMap;