const { useState, useEffect } = React;

const MetadataManager = ({ files, selectedFiles, metadata, onUpdateMetadata }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [activeSource, setActiveSource] = useState('current');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [coverFallback, setCoverFallback] = useState(''); // for fallback cover image

  // Set the first selected file as active when selection changes
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setActiveFile(selectedFiles[0]);
    } else if (files.length > 0) {
      setActiveFile(files[0].id);
    } else {
      setActiveFile(null);
    }
  }, [selectedFiles, files]);
  
  // Reset edit data when active file changes
  useEffect(() => {
    if (activeFile && metadata[activeFile]) {
      setEditData({ ...metadata[activeFile] });
    } else {
      setEditData({});
    }
    setEditMode(false);
    setCoverFallback(''); // reset fallback when file changes
  }, [activeFile, metadata]);
  
  // Handle metadata source change
  const handleSourceChange = (source) => {
    setActiveSource(source);
    if (source !== 'current' && activeFile) {
      const alternativeMetadata = generateAlternativeMetadata(source);
      setEditData(alternativeMetadata);
    }
  };
  
  // Mock function to generate alternative metadata
  const generateAlternativeMetadata = (source) => {
    const sourcePrefix = source === 'openlibrary' ? 'OpenLib' : 'Google';
    
    return {
      title: `${sourcePrefix} - Sample Title`,
      author: `${sourcePrefix} Author`,
      series: Math.random() > 0.3 ? `${sourcePrefix} Series` : null,
      seriesNumber: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : null,
      isbn: `978${Math.floor(Math.random() * 10000000000)}`,
      description: `This is a sample book description from ${source}.`,
      coverUrl: `/api/placeholder/200/300?text=${sourcePrefix}`,
      year: `${2010 + Math.floor(Math.random() * 13)}`,
      narrator: `${sourcePrefix} Narrator`
    };
  };
  
  // Handle edit field change
  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle apply metadata
  const handleApplyMetadata = () => {
    if (activeFile) {
      onUpdateMetadata(activeFile, editData);
      setEditMode(false);
    }
  };

  // Handle auto-detect metadata from file using jsmediatags
  const handleAutoDetectMetadata = async () => {
    try {
      const currentFileObj = files.find(f => f.id === activeFile);
      if (!currentFileObj || !currentFileObj.file) {
        throw new Error("No valid file selected");
      }
      // Call your metadata service extraction method
      const detected = await metadataService.extractFromFile(currentFileObj);
      // Update both editData and the main metadata state
      setEditData(detected);
      onUpdateMetadata(activeFile, detected);
    } catch (error) {
      console.error("Auto-detect metadata failed:", error);
      alert("Failed to auto-detect metadata. Please try again.");
    }
  };

  // Fallback cover handler
  const handleCoverError = (e) => {
    if (!coverFallback) {
      // Provide a default fallback cover image URL (update as needed)
      setCoverFallback('https://via.placeholder.com/200x300?text=No+Cover');
    }
  };
  
  // Render no selection state
  if (!activeFile) {
    return (
      <div className="metadata-manager metadata-empty">
        <p>Select a file to view and edit metadata</p>
      </div>
    );
  }
  
  // Get current file and its metadata
  const currentFile = files.find(f => f.id === activeFile);
  const currentMetadata = metadata[activeFile] || {};
  const displayData = editMode ? editData : currentMetadata;
  
  return (
    <div className="metadata-manager">
      {/* File selector */}
      <div className="metadata-file-selector">
        <select
          value={activeFile}
          onChange={(e) => setActiveFile(e.target.value)}
        >
          {files.map(file => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
        
        <div className="file-navigation">
          <button 
            className="icon-button"
            disabled={files.indexOf(currentFile) === 0}
            onClick={() => {
              const currentIndex = files.findIndex(f => f.id === activeFile);
              if (currentIndex > 0) {
                setActiveFile(files[currentIndex - 1].id);
              }
            }}
          >
            &larr; Prev
          </button>
          <span>{files.indexOf(currentFile) + 1} of {files.length}</span>
          <button 
            className="icon-button"
            disabled={files.indexOf(currentFile) === files.length - 1}
            onClick={() => {
              const currentIndex = files.findIndex(f => f.id === activeFile);
              if (currentIndex < files.length - 1) {
                setActiveFile(files[currentIndex + 1].id);
              }
            }}
          >
            Next &rarr;
          </button>
        </div>
      </div>
      
      {/* Metadata source selector */}
      <div className="metadata-source-selector">
        <div 
          className={`metadata-source-button ${activeSource === 'current' ? 'active' : ''}`}
          onClick={() => handleSourceChange('current')}
        >
          Current Metadata
        </div>
        <div 
          className={`metadata-source-button ${activeSource === 'openlibrary' ? 'active' : ''}`}
          onClick={() => handleSourceChange('openlibrary')}
        >
          OpenLibrary
        </div>
        <div 
          className={`metadata-source-button ${activeSource === 'googlebooks' ? 'active' : ''}`}
          onClick={() => handleSourceChange('googlebooks')}
        >
          Google Books
        </div>
      </div>
      
      {/* Metadata display/edit */}
      <div className="metadata-content">
        <div className="metadata-fields">
          {/* Left column */}
          <div className="metadata-field-column">
            <div className="metadata-field">
              <label>Title:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.title || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Author:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.author || ''}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.author || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Series:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.series || ''}
                  onChange={(e) => handleFieldChange('series', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.series || 'N/A'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Series #:</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editData.seriesNumber || ''}
                  onChange={(e) => handleFieldChange('seriesNumber', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.seriesNumber || 'N/A'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Narrator:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.narrator || ''}
                  onChange={(e) => handleFieldChange('narrator', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.narrator || 'Unknown'}</div>
              )}
            </div>
          </div>
          
          {/* Right column */}
          <div className="metadata-field-column">
            <div className="metadata-field">
              <label>ISBN:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.isbn || ''}
                  onChange={(e) => handleFieldChange('isbn', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.isbn || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Year:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.year || ''}
                  onChange={(e) => handleFieldChange('year', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.year || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Language:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.language || ''}
                  onChange={(e) => handleFieldChange('language', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.language || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Publisher:</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.publisher || ''}
                  onChange={(e) => handleFieldChange('publisher', e.target.value)}
                />
              ) : (
                <div className="field-value">{displayData.publisher || 'Unknown'}</div>
              )}
            </div>
            
            <div className="metadata-field">
              <label>Duration:</label>
              <div className="field-value">{currentFile.duration || 'Unknown'}</div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="metadata-description">
          <label>Description:</label>
          {editMode ? (
            <textarea
              value={editData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
            />
          ) : (
            <div className="field-value description-text">
              {displayData.description || 'No description available'}
            </div>
          )}
        </div>
        
        {/* Cover image */}
        <div className="metadata-cover">
          <label>Cover:</label>
          <div className="cover-preview-container">
            {displayData.coverUrl || coverFallback ? (
              <img 
                src={displayData.coverUrl || coverFallback} 
                alt="Book cover" 
                className="cover-preview"
                onError={handleCoverError}
              />
            ) : (
              <div className="cover-placeholder">No cover available</div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="metadata-actions">
          <div className="metadata-button-group">
            {editMode ? (
              <>
                <button onClick={handleApplyMetadata}>Apply Changes</button>
                <button 
                  className="secondary"
                  onClick={() => {
                    setEditData(currentMetadata);
                    setEditMode(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(true)}>Edit Metadata</button>
                <button onClick={handleAutoDetectMetadata}>Auto-Detect Metadata</button>
              </>
            )}
          </div>
          {activeSource !== 'current' && (
            <button 
              onClick={() => handleApplyMetadata()}
              disabled={editMode}
            >
              Us
