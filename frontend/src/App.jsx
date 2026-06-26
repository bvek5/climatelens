import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import Sustainability from "./pages/Sustainability";
import Rankings from "./pages/Rankings";
import WorldMap from "./pages/WorldMap";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const getLinkClass = ({ isActive }) =>
    isActive ? "navbar-link active" : "navbar-link";

  return (
    <>
      {!isLandingPage && (
        <nav className="navbar">
          <div className="navbar-inner">
            <NavLink to="/dashboard" className="navbar-brand">
              Climate<span>Lens</span>
            </NavLink>

            <button
              type="button"
              className="navbar-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((currentValue) => !currentValue)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
              <NavLink to="/dashboard" className={getLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/compare" className={getLinkClass}>
                Compare
              </NavLink>

              <NavLink to="/sustainability" className={getLinkClass}>
                Sustainability
              </NavLink>

              <NavLink to="/rankings" className={getLinkClass}>
                Rankings
              </NavLink>

              <NavLink to="/map" className={getLinkClass}>
                World Map
              </NavLink>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/map" element={<WorldMap />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;