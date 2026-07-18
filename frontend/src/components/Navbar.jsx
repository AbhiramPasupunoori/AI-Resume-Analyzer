import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink className="logo" to="/">
        <span className="logo-mark" aria-hidden="true">
          <img
            className="logo-image logo-image-dark"
            src="/logo-ai-head-dark.png"
            alt=""
          />
          <img
            className="logo-image logo-image-light"
            src="/logo-ai-head-light.png"
            alt=""
          />
        </span>
        <span>AI Resume Analyzer</span>
      </NavLink>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active-nav-link" : "nav-link"
          }
          end
        >
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active-nav-link" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

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

        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
