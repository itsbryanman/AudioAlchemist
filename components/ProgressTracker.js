const { useEffect } = React;

const ProgressTracker = ({ progress, onComplete }) => {
  const { total, processed, success, error } = progress;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  
  // Call onComplete when processing is done
  useEffect(() => {
    if (total > 0 && processed === total) {
      onComplete && onComplete();
    }
  }, [processed, total, onComplete]);
  
  return (
    <div className="progress-tracker">
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="progress-details">
        <span className="progress-percentage">{percentage}% Complete</span>
        <span className="progress-count">
          {processed} of {total} files processed
        </span>
      </div>
      
      <div className="progress-stats">
        <div className="progress-stat">
          <div className="progress-stat-value">{total}</div>
          <div className="progress-stat-label">Total Files</div>
        </div>
        <div className="progress-stat">
          <div className="progress-stat-value">{processed}</div>
          <div className="progress-stat-label">Processed</div>
        </div>
        <div className="progress-stat success">
          <div className="progress-stat-value">{success}</div>
          <div className="progress-stat-label">Successful</div>
        </div>
        <div className="progress-stat error">
          <div className="progress-stat-value">{error}</div>
          <div className="progress-stat-label">Failed</div>
        </div>
      </div>
      
      {processed === total && total > 0 && (
        <div className="progress-complete">
          <div className="progress-summary">
            {error === 0 ? (
              <div className="success-message">
                All files renamed successfully!
              </div>
            ) : (
              <div className="partial-message">
                {success} file{success !== 1 ? 's' : ''} renamed successfully, 
                {error} file{error !== 1 ? 's' : ''} failed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};