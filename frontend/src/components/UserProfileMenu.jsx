import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";

function UserProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/");
  }

  function handleHistory() {
    setOpen(false);
    navigate("/history");
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user profile menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="profile-avatar" aria-hidden="true">
          {user.name.trim().charAt(0).toUpperCase() || "U"}
        </span>
        <span className="profile-caret" aria-hidden="true"></span>
      </button>

      {open && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-identity">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" role="menuitem" onClick={handleHistory}>History</button>
          {user.is_admin && (
            <button type="button" role="menuitem" onClick={() => { setOpen(false); navigate("/admin"); }}>
              Admin Dashboard
            </button>
          )}
          <button type="button" role="menuitem" onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
}

export default UserProfileMenu;
