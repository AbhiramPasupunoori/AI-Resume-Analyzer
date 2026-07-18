function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-box">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;