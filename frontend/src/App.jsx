import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import "./App.css";
import Sustainability from "./pages/Sustainability";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/sustainability">Sustainability</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/sustainability" element={<Sustainability />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;