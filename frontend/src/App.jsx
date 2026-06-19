import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
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

  return (
    <>
      {!isLandingPage && (
        <nav className="navbar">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/sustainability">Sustainability</Link>
          <Link to="/rankings">Rankings</Link>
          <Link to="/map">World Map</Link>
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