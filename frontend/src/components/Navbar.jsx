import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink className="logo" to="/">
        AI Resume Analyzer
      </NavLink>

      <div className="nav-links">
        <NavLink
          to="/analyze"
          className={({ isActive }) =>
            isActive ? "nav-link active-nav-link" : "nav-link"
          }
        >
          Analyze
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "nav-link active-nav-link" : "nav-link"
          }
        >
          History
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;