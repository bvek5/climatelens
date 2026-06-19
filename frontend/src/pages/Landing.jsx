import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Landing() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const enterApp = () => {
    setLeaving(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 700);
  };

  return (
    <div className={`landing-page ${leaving ? "landing-exit" : ""}`}>
      <img
        className="landing-earth"
        src="/earth.jpg"
        alt="ClimateLens Earth"
      />

      <h1 className="landing-title">
        Climate<span>Lens</span>
      </h1>

      <div className="landing-divider">
        <span>🌱</span>
      </div>

      <button onClick={enterApp} className="landing-button">
        Enter <span>→</span>
      </button>
    </div>
  );
}

export default Landing;