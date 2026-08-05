import { useState } from "react";
import { Link } from "react-router-dom";

import { changeAccountPassword, changePasswordWithCredentials } from "../api/authApi";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/authContext";
import { getErrorMessage } from "../utils/errorUtils";

function ChangePasswordPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const response = user
        ? await changeAccountPassword(currentPassword, newPassword)
        : await changePasswordWithCredentials(email, currentPassword, newPassword);
      setEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(response.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page auth-page change-password-page">
      <section className="auth-card">
        <div className="auth-card-copy">
          <span className="modern-badge">Account security</span>
          <h1>Change Password</h1>
          <p>Enter your current password before choosing a new password.</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <div className="password-success" role="status">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!user && (
            <label>
              Email address
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
          )}
          <label>
            Current password
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          <label>
            New password
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
          </label>
          <small>Use at least 8 characters in any combination.</small>
          <label>
            Confirm new password
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
          </label>
          <button className="glow-button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Change Password"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to={user ? "/dashboard" : "/login"}>{user ? "Return to Dashboard" : "Return to Login"}</Link>
        </p>
      </section>
    </main>
  );
}

export default ChangePasswordPage;
