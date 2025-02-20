const DuplicateChecker = ({ duplicates, onResolveDuplicate }) => {
  if (duplicates.length === 0) {
    return null;
  }
  
  return (
    <div className="duplicate-checker">
      <div className="duplicate-header">
        <h4>
          Found {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''}
        </h4>
        <p className="duplicate-warning">
          Duplicates must be resolved before proceeding with the rename operation.
        </p>
      </div>
      
      <div className="duplicate-list">
        {duplicates.map((dupe, index) => (
          <div key={`${dupe.key}-${index}`} className="duplicate-item">
            <div className="duplicate-item-header">
              <span className="duplicate-key">Duplicate Key: {dupe.key}</span>
              {dupe.detectionMethod && (
                <span className="duplicate-method">
                  Detected by: {dupe.detectionMethod}
                </span>
              )}
              <span className="duplicate-count">{dupe.files.length} files</span>
            </div>
            
            <div className="duplicate-files">
              {dupe.files.map((file, fileIndex) => (
                <div key={`file-${fileIndex}`} className="duplicate-file">
                  <div className="duplicate-file-name">
                    <span className="duplicate-file-index">{fileIndex + 1}.</span>
                    <span className="duplicate-original">{file.originalName}</span>
                    <span className="duplicate-arrow"> ? </span>
                    <span className="duplicate-new">{file.newName}</span>
                  </div>
                  <div className="duplicate-file-details">
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    {file.hash && (
                      <span className="file-hash">
                        Hash: {file.hash.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="duplicate-resolution">
              <div className="resolution-options">
                <button 
                  className="secondary small"
                  onClick={() => onResolveDuplicate(dupe.key, 'keep-first')}
                >
                  Keep First
                </button>
                <button 
                  className="secondary small"
                  onClick={() => onResolveDuplicate(dupe.key, 'keep-all')}
                >
                  Keep All (Add Number)
                </button>
                <button 
                  className="secondary small"
                  onClick={() => onResolveDuplicate(dupe.key, 'skip')}
                >
                  Skip All
                </button>
              </div>
              <div className="resolution-details">
                <select 
                  className="resolution-method"
                  onChange={(e) => onResolveDuplicate(dupe.key, e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select resolution method...</option>
                  <option value="keep-first">Keep only the first file</option>
                  <option value="keep-all">Keep all (add numbers)</option>
                  <option value="skip">Skip these files</option>
                  <option value="manual">Resolve manually</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
