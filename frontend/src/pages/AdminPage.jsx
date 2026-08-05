import { useEffect, useState } from "react";

import { getAdminUser, getAdminUsers, resetAdminUserPassword } from "../api/adminApi";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { getErrorMessage } from "../utils/errorUtils";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Never";
}

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  async function openUser(userId) {
    try {
      setDetailLoading(true);
      setError("");
      setPassword("");
      setPasswordMessage("");
      setSelected(await getAdminUser(userId));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    try {
      setPasswordMessage("");
      const response = await resetAdminUserPassword(selected.user.id, password);
      setPassword("");
      setPasswordMessage(response.message);
    } catch (requestError) {
      setPasswordMessage(getErrorMessage(requestError));
    }
  }

  return (
    <main className="page admin-page">
      <header className="page-header">
        <span className="modern-badge">Administrator only</span>
        <h1>User Administration</h1>
        <p>Review registered accounts, analysis activity, login records and securely reset passwords.</p>
      </header>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner message="Loading users..." />
      ) : (
        <div className="admin-layout">
          <section className="admin-user-list" aria-label="Registered users">
            <div className="admin-section-heading">
              <h2>Users</h2>
              <span>{users.length}</span>
            </div>
            {users.map((user) => (
              <button
                type="button"
                className={selected?.user.id === user.id ? "admin-user-row selected" : "admin-user-row"}
                key={user.id}
                onClick={() => openUser(user.id)}
              >
                <span className="admin-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span>
                  <strong>{user.name}{user.is_admin ? " · Admin" : ""}</strong>
                  <small>{user.email}</small>
                  <small>{user.analysis_count} analyses · Last login: {formatDate(user.last_login_at)}</small>
                </span>
              </button>
            ))}
          </section>

          <section className="admin-user-detail">
            {detailLoading && <LoadingSpinner message="Loading user activity..." />}
            {!detailLoading && !selected && <p className="admin-empty-detail">Select a user to review their details and history.</p>}
            {!detailLoading && selected && (
              <>
                <div className="admin-detail-header">
                  <div>
                    <span>Account #{selected.user.id}</span>
                    <h2>{selected.user.name}</h2>
                    <p>{selected.user.email}</p>
                    <small>Registered {formatDate(selected.user.created_at)}</small>
                  </div>
                </div>

                <form className="admin-password-form" onSubmit={handlePasswordReset}>
                  <div>
                    <h3>Reset password</h3>
                    <p>This immediately invalidates the user’s existing login sessions.</p>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="New password (minimum 8 characters)"
                    minLength="8"
                    required
                    autoComplete="new-password"
                  />
                  <button className="glow-button" type="submit">Update Password</button>
                  {passwordMessage && <small>{passwordMessage}</small>}
                </form>

                <div className="admin-detail-section">
                  <h3>Analysis history ({selected.analyses.length})</h3>
                  {selected.analyses.length === 0 ? <p>No analyses yet.</p> : selected.analyses.map((analysis) => (
                    <article className="admin-history-row" key={analysis.id}>
                      <strong>{analysis.job_description?.job_title || "Untitled role"}</strong>
                      <span>{analysis.resume?.original_filename || "Resume"}</span>
                      <span>Score: {analysis.overall_score ?? "—"}</span>
                      <small>{formatDate(analysis.created_at)}</small>
                    </article>
                  ))}
                </div>

                <div className="admin-detail-section">
                  <h3>Login activity ({selected.events.length})</h3>
                  {selected.events.length === 0 ? <p>No login records yet.</p> : selected.events.map((event) => (
                    <article className="admin-event-row" key={event.id}>
                      <strong>{event.event.replaceAll("_", " ")}</strong>
                      <span>{formatDate(event.created_at)}</span>
                      <small>{event.ip_address}</small>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminPage;
