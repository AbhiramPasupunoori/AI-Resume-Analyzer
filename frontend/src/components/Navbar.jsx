import { NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import UserProfileMenu from "./UserProfileMenu";
import { loadLastBuilderRoute } from "../utils/resumeBuilderStorage";
import { useAuth } from "../context/authContext";

function Navbar() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const assetBase = import.meta.env.BASE_URL;
  const resumeBuilderPath = pathname.startsWith("/resume-builder")
    ? pathname
    : loadLastBuilderRoute();
  return (
    <nav className="navbar">
      <NavLink className="logo" to="/">
        <span className="logo-mark" aria-hidden="true">
          <img
            className="logo-image logo-image-dark"
            src={`${assetBase}logo-ai-head-dark.png`}
            alt=""
          />
          <img
            className="logo-image logo-image-light"
            src={`${assetBase}logo-ai-head-light.png`}
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

        {user && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active-nav-link" : "nav-link"
            }
          >
            Dashboard
          </NavLink>
        )}

        {user && (
          <NavLink
            to="/analyze"
            className={({ isActive }) =>
              isActive ? "nav-link active-nav-link" : "nav-link"
            }
          >
            Analyze
          </NavLink>
        )}

        {user && (
          <NavLink
            to={resumeBuilderPath}
            className={({ isActive }) =>
              isActive ? "nav-link active-nav-link" : "nav-link"
            }
          >
            Resume Builder
          </NavLink>
        )}

        {!loading && !user && (
          <NavLink to="/login" className="nav-auth-button">
            Login/Register
          </NavLink>
        )}

        {user && (
          <UserProfileMenu />
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
