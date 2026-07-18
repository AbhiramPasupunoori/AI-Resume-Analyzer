function ErrorMessage({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-box">
      <strong>Error</strong>
      <p>{message}</p>

      {onRetry && (
        <button className="secondary-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
