import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import "./App.css";
import Sustainability from "./pages/Sustainability";
import Rankings from "./pages/Rankings";
import WorldMap from "./pages/WorldMap";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/sustainability">Sustainability</Link>
        <Link to="/rankings">Rankings</Link>
        <Link to="/map">World Map</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/map" element={<WorldMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;