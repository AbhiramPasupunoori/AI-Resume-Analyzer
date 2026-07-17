import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        AI Resume Analyzer
      </Link>

      <div className="nav-links">
        <Link to="/analyze">Analyze</Link>
        <Link to="/history">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;