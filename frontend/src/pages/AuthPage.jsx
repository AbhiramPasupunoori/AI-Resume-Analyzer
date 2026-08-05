import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/authContext";
import { getErrorMessage } from "../utils/errorUtils";

function AuthPage({ mode }) {
  const isRegistration = mode === "register";
  const { user, loading, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const destination = location.state?.from || "/dashboard";

  if (!loading && user) return <Navigate to={destination} replace />;

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (isRegistration && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      if (isRegistration) {
        await register({ name: form.name, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <div className="auth-card-copy">
          <span className="modern-badge">Secure workspace</span>
          <h1>{isRegistration ? "Create your account" : "Welcome back"}</h1>
          <p>
            {isRegistration
              ? "Register to analyze resumes, build tailored versions and keep your results private."
              : "Log in to continue analyzing and building resumes."}
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistration && (
            <label>
              Full name
              <input name="name" value={form.name} onChange={updateField} autoComplete="name" required minLength="2" />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} autoComplete={isRegistration ? "new-password" : "current-password"} required minLength="8" />
          </label>
          {isRegistration && (
            <>
              <small>Use at least 8 characters in any combination.</small>
              <label>
                Confirm password
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" required minLength="8" />
              </label>
            </>
          )}
          <button className="glow-button" type="submit" disabled={submitting || loading}>
            {submitting ? "Please wait..." : isRegistration ? "Create Account" : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistration ? "Already registered?" : "New to AI Resume Analyzer?"}{" "}
          <Link to={isRegistration ? "/login" : "/register"} state={location.state}>
            {isRegistration ? "Log in" : "Create an account"}
          </Link>
          {!isRegistration && (
            <>
              <span className="auth-link-divider" aria-hidden="true">|</span>
              <Link to="/change-password">Change password</Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
