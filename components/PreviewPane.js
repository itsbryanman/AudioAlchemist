const PreviewPane = ({ preview, selectedFiles }) => {
  // Filter preview items based on selection
  const filteredPreview = {};
  if (selectedFiles.length > 0) {
    // Only show selected files
    selectedFiles.forEach(id => {
      if (preview[id]) {
        filteredPreview[id] = preview[id];
      }
    });
  } else {
    // Show all files
    Object.assign(filteredPreview, preview);
  }
  
  const previewCount = Object.keys(filteredPreview).length;
  
  if (previewCount === 0) {
    return (
      <div className="preview-pane preview-empty">
        <p>No files to preview</p>
      </div>
    );
  }
  
  return (
    <div className="preview-pane">
      <div className="preview-header">
        <div className="preview-count">
          Showing {previewCount} file{previewCount !== 1 ? 's' : ''}
        </div>
        <div className="preview-legend">
          <span className="preview-legend-item">
            <span className="status-dot status-ok"></span> Safe to rename
          </span>
          <span className="preview-legend-item">
            <span className="status-dot status-warning"></span> Path will change
          </span>
          <span className="preview-legend-item">
            <span className="status-dot status-error"></span> Potential conflict
          </span>
        </div>
      </div>
      
      <div className="preview-list">
        {Object.values(filteredPreview).map((item) => {
          // Determine status
          let status = 'ok';
          let statusText = 'Safe to rename';
          
          // Check if directory will change
          const originalDir = item.path.substring(0, item.path.lastIndexOf('/'));
          const newDir = item.newPath.substring(0, item.newPath.lastIndexOf('/'));
          
          if (originalDir !== newDir) {
            status = 'warning';
            statusText = 'Directory will change';
          }
          
          // In a real implementation, we would check for conflicts here
          
          return (
            <div key={item.originalName} className="preview-item">
              <div className="preview-item-header">
                <span className={`preview-status status-${status}`}>
                  {statusText}
                </span>
              </div>
              <div className="preview-content">
                <div className="preview-original">
                  <div className="preview-label">Original:</div>
                  <div className="preview-value">{item.originalName}</div>
                </div>
                <div className="preview-arrow">?</div>
                <div className="preview-new">
                  <div className="preview-label">New:</div>
                  <div className="preview-value">{item.newName}</div>
                </div>
              </div>
              {status === 'warning' && (
                <div className="preview-details">
                  <div className="preview-path-change">
                    <div>From: {originalDir}</div>
                    <div>To: {newDir}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};