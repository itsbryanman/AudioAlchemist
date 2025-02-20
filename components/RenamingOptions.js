const { useState } = React;

const RenamingOptions = ({
  namingPattern,
  customPattern,
  options,
  onPatternChange,
  onCustomPatternChange,
  onOptionsChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Sample book for pattern preview
  const sampleBook = {
    title: "The Great Adventure",
    author: "John Smith",
    series: "Adventure Chronicles",
    seriesNumber: 3,
    narrator: "Jane Doe",
    year: "2023"
  };
  
  // Preview the naming pattern
  const previewPattern = (pattern) => {
    let preview = pattern;
    
    // Replace standard tokens
    preview = preview.replace(/{title}/g, sampleBook.title);
    preview = preview.replace(/{author}/g, sampleBook.author);
    preview = preview.replace(/{year}/g, sampleBook.year);
    preview = preview.replace(/{narrator}/g, sampleBook.narrator);
    
    // Handle series information
    if (options.includeSeries && sampleBook.series) {
      preview = preview.replace(/{series}/g, sampleBook.series);
      preview = preview.replace(/{number}/g, sampleBook.seriesNumber);
    } else {
      // Remove series parts from pattern if series is disabled
      preview = preview.replace(/{series}\//g, '');
      preview = preview.replace(/{series}/g, '');
      preview = preview.replace(/{number}/g, '');
      
      // Clean up artifacts
      preview = preview.replace(/\/\//g, '/');
      preview = preview.trim();
    }
    
    // Clean up any remaining tokens
    preview = preview.replace(/{[^}]+}/g, '');
    
    // Clean up double spaces
    preview = preview.replace(/\s+/g, ' ').trim();
    
    return preview + ".mp3";
  };
  
  // Pattern examples
  const patternExamples = {
    standard: "{title} - {author}",
    series: "{series}/{series} {number} - {title}",
    authorFirst: "{author} - {title}",
    yearIncluded: "{title} ({year}) - {author}",
    custom: customPattern
  };
  
  return (
    <div className="renaming-options">
      <div className="pattern-selector">
        <div>
          <div className="radio-option">
            <input
              type="radio"
              id="pattern-standard"
              name="pattern"
              value="standard"
              checked={namingPattern === 'standard'}
              onChange={() => onPatternChange('standard')}
            />
            <label htmlFor="pattern-standard">Standard</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="pattern-series"
              name="pattern"
              value="series"
              checked={namingPattern === 'series'}
              onChange={() => onPatternChange('series')}
            />
            <label htmlFor="pattern-series">Series</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="pattern-authorFirst"
              name="pattern"
              value="authorFirst"
              checked={namingPattern === 'authorFirst'}
              onChange={() => onPatternChange('authorFirst')}
            />
            <label htmlFor="pattern-authorFirst">Author First</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="pattern-yearIncluded"
              name="pattern"
              value="yearIncluded"
              checked={namingPattern === 'yearIncluded'}
              onChange={() => onPatternChange('yearIncluded')}
            />
            <label htmlFor="pattern-yearIncluded">With Year</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="pattern-custom"
              name="pattern"
              value="custom"
              checked={namingPattern === 'custom'}
              onChange={() => onPatternChange('custom')}
            />
            <label htmlFor="pattern-custom">Custom</label>
          </div>
        </div>
        
        <div>
          <div className="pattern-preview">
            <div className="format-template">
              <label>Template:</label>
              <code>{patternExamples[namingPattern]}</code>
            </div>
            
            <div className="format-example">
              <label>Example:</label>
              <div>{previewPattern(patternExamples[namingPattern])}</div>
            </div>
            
            {namingPattern === 'custom' && (
              <div className="custom-pattern-input">
                <label htmlFor="custom-pattern">Custom Pattern:</label>
                <input
                  id="custom-pattern"
                  type="text"
                  value={customPattern}
                  onChange={(e) => onCustomPatternChange(e.target.value)}
                  placeholder="e.g. {series}/{title} - {author}"
                />
                <div className="pattern-tokens">
                  <p>Available tokens:</p>
                  <span className="token">{'{title}'}</span>
                  <span className="token">{'{author}'}</span>
                  <span className="token">{'{series}'}</span>
                  <span className="token">{'{number}'}</span>
                  <span className="token">{'{year}'}</span>
                  <span className="token">{'{narrator}'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="basic-options">
        <div className="checkbox-option">
          <input 
            type="checkbox"
            id="includeSeries"
            checked={options.includeSeries}
            onChange={(e) => onOptionsChange('includeSeries', e.target.checked)}
          />
          <label htmlFor="includeSeries">Include series information (when available)</label>
        </div>
        
        <div className="checkbox-option">
          <input 
            type="checkbox"
            id="overwriteMetadata"
            checked={options.overwriteMetadata}
            onChange={(e) => onOptionsChange('overwriteMetadata', e.target.checked)}
          />
          <label htmlFor="overwriteMetadata">Write metadata to files after renaming</label>
        </div>
        
        <div className="checkbox-option">
          <input 
            type="checkbox"
            id="createNfoFiles"
            checked={options.createNfoFiles}
            onChange={(e) => onOptionsChange('createNfoFiles', e.target.checked)}
          />
          <label htmlFor="createNfoFiles">Create .nfo files with metadata</label>
        </div>
        
        <div className="checkbox-option">
          <input 
            type="checkbox"
            id="checkDuplicates"
            checked={options.checkDuplicates}
            onChange={(e) => onOptionsChange('checkDuplicates', e.target.checked)}
          />
          <label htmlFor="checkDuplicates">Check for duplicates</label>
        </div>
      </div>
      
      <button 
        className="advanced-toggle secondary small"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
      </button>
      
      {showAdvanced && (
        <div className="advanced-options">
          <div className="advanced-options-header">Advanced Options</div>
          
          <div className="dropdown-option">
            <label htmlFor="duplicateMethod">Duplicate Detection Method:</label>
            <select 
              id="duplicateMethod"
              value={options.duplicateMethod}
              onChange={(e) => onOptionsChange('duplicateMethod', e.target.value)}
            >
              <option value="filename">Filename Only</option>
              <option value="filename+size">Filename + File Size</option>
              <option value="content">Content Hash (Slower)</option>
            </select>
          </div>
          
          <div className="checkbox-option">
            <input 
              type="checkbox"
              id="createTrashFolder"
              checked={options.createTrashFolder}
              onChange={(e) => onOptionsChange('createTrashFolder', e.target.checked)}
            />
            <label htmlFor="createTrashFolder">Move replaced files to .trash folder</label>
          </div>
          
          <div className="checkbox-option">
            <input 
              type="checkbox"
              id="logOperations"
              checked={options.logOperations}
              onChange={(e) => onOptionsChange('logOperations', e.target.checked)}
            />
            <label htmlFor="logOperations">Log all rename operations</label>
          </div>
          
          <div className="checkbox-option">
            <input 
              type="checkbox"
              id="preserveDates"
              checked={options.preserveDates}
              onChange={(e) => onOptionsChange('preserveDates', e.target.checked)}
            />
            <label htmlFor="preserveDates">Preserve file dates</label>
          </div>
          
          <div className="checkbox-option">
            <input 
              type="checkbox"
              id="createDirectories"
              checked={options.createDirectories}
              onChange={(e) => onOptionsChange('createDirectories', e.target.checked)}
            />
            <label htmlFor="createDirectories">Create directories if needed</label>
          </div>
        </div>
      )}
    </div>
  );
};
