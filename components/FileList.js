const { useState } = React;

const FileList = ({ files, selectedFiles, onSelectFile, onSelectAll }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Handle header click for sorting
  const handleHeaderClick = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special case for extension - sort alphabetically
    if (sortField === 'extension') {
      aValue = a.extension.toLowerCase();
      bValue = b.extension.toLowerCase();
    }
    
    // Special case for lastModified - convert to date
    if (sortField === 'lastModified') {
      aValue = new Date(a.lastModified);
      bValue = new Date(b.lastModified);
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Calculate if all files are selected
  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < files.length;
  
  return (
    <div className="file-list">
      <div className="file-list-header">
        <div>
          <input 
            type="checkbox" 
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            indeterminate={someSelected}
            ref={el => {
              if (el) {
                el.indeterminate = someSelected;
              }
            }}
          />
        </div>
        <div 
          onClick={() => handleHeaderClick('name')}
          style={{ cursor: 'pointer' }}
        >
          Filename {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </div>
        <div 
          onClick={() => handleHeaderClick('extension')}
          style={{ cursor: 'pointer' }}
        >
          Type {sortField === 'extension' && (sortDirection === 'asc' ? '↑' : '↓')}
        </div>
        <div 
          onClick={() => handleHeaderClick('size')}
          style={{ cursor: 'pointer' }}
        >
          Size {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
        </div>
      </div>
      
      <div className="file-list-items">
        {sortedFiles.map((file) => (
          <div 
            key={file.id} 
            className={`file-list-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
          >
            <div>
              <input 
                type="checkbox" 
                checked={selectedFiles.includes(file.id)}
                onChange={(e) => onSelectFile(file.id, e.target.checked)}
              />
            </div>
            <div className="file-name" title={file.name}>
              {file.name}
            </div>
            <div className="file-extension">
              {file.extension.toUpperCase()}
            </div>
            <div className="file-size">
              {formatFileSize(file.size)}
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="file-list-empty">
            No files selected
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="file-list-footer">
          <div className="file-list-summary">
            {files.length} file{files.length !== 1 ? 's' : ''} | {selectedFiles.length} selected
          </div>
          <div className="file-actions">
            <button 
              className="secondary small"
              onClick={() => onSelectAll(true)}
              disabled={allSelected}
            >
              Select All
            </button>
            <button 
              className="secondary small"
              onClick={() => onSelectAll(false)}
              disabled={selectedFiles.length === 0}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
