import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="page">
      <EmptyNotFound />
    </main>
  );
}

function EmptyNotFound() {
  return (
    <div className="empty-state">
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="glow-button" to="/">
        Go Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
