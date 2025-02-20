/**
 * Service for handling file naming operations
 */
const namingService = {
  /**
   * Generate new filename based on pattern and metadata
   * @param {string} pattern - Naming pattern
   * @param {Object} metadata - File metadata
   * @param {string} extension - File extension
   * @param {Object} options - Naming options
   * @returns {string} - New filename
   */
  generateFilename: (pattern, metadata, extension, options) => {
    let filename = pattern;
    
    // Replace tokens with metadata values
    if (metadata.title) {
      filename = filename.replace(/{title}/g, namingService.sanitizeFilename(metadata.title));
    } else {
      filename = filename.replace(/{title}/g, 'Unknown Title');
    }
    
    if (metadata.author) {
      filename = filename.replace(/{author}/g, namingService.sanitizeFilename(metadata.author));
    } else {
      filename = filename.replace(/{author}/g, 'Unknown Author');
    }
    
    if (metadata.narrator) {
      filename = filename.replace(/{narrator}/g, namingService.sanitizeFilename(metadata.narrator));
    } else {
      filename = filename.replace(/{narrator}/g, '');
    }
    
    if (metadata.year) {
      filename = filename.replace(/{year}/g, metadata.year);
    } else {
      filename = filename.replace(/{year}/g, '');
    }
    
    // Handle series information
    if (options.includeSeries && metadata.series) {
      filename = filename.replace(/{series}/g, namingService.sanitizeFilename(metadata.series));
      
      if (metadata.seriesNumber) {
        // Format series number (e.g., 1.5 -> "01.5", 2 -> "02")
        let formattedNumber;
        if (Number.isInteger(metadata.seriesNumber)) {
          formattedNumber = metadata.seriesNumber.toString().padStart(2, '0');
        } else {
          const parts = metadata.seriesNumber.toString().split('.');
          formattedNumber = parts[0].padStart(2, '0') + '.' + parts[1];
        }
        filename = filename.replace(/{number}/g, formattedNumber);
      } else {
        filename = filename.replace(/{number}/g, '');
      }
    } else {
      // Remove series parts from pattern if series info isn't used
      filename = filename.replace(/{series}\//g, '');
      filename = filename.replace(/{series}/g, '');
      filename = filename.replace(/{number}/g, '');
    }
    
    // Clean up any remaining tokens
    filename = filename.replace(/{[^}]+}/g, '');
    
    // Clean up artifacts from the template
    filename = filename.replace(/\/\//g, '/');
    filename = filename.replace(/\s+/g, ' ');
    filename = filename.trim();
    
    // Add extension
    if (extension && !filename.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
      filename = `${filename}.${extension}`;
    }
    
    return namingService.sanitizeFilename(filename);
  },
  
  /**
   * Sanitize a string for use in filenames
   * @param {string} input - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeFilename: (input) => {
    if (!input) return '';
    
    // Replace illegal characters
    let sanitized = input.replace(/[<>:"/\\|?*]/g, '_');
    
    // Replace multiple spaces with a single space
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Trim spaces from the start and end
    sanitized = sanitized.trim();
    
    // Ensure the filename isn't too long (255 chars is common max length)
    if (sanitized.length > 240) {
      sanitized = sanitized.substring(0, 240);
    }
    
    return sanitized;
  },
  
  /**
   * Generate a full path based on pattern and metadata
   * @param {string} pattern - Naming pattern
   * @param {Object} metadata - File metadata
   * @param {string} basePath - Base directory path
   * @param {string} extension - File extension
   * @param {Object} options - Naming options
   * @returns {string} - Full file path
   */
  generatePath: (pattern, metadata, basePath, extension, options) => {
    // Generate filename
    const filename = namingService.generateFilename(pattern, metadata, extension, options);
    
    // Determine directory structure
    let dirStructure = '';
    
    if (options.includeSeries && metadata.series) {
      // If the pattern already includes directory structure, don't add more
      if (!pattern.includes('/')) {
        dirStructure = namingService.sanitizeFilename(metadata.series);
      }
    }
    
    // Combine base path, directory structure, and filename
    let fullPath = basePath;
    if (fullPath && !fullPath.endsWith('/')) {
      fullPath += '/';
    }
    
    if (dirStructure) {
      fullPath += dirStructure + '/';
    }
    
    fullPath += filename;
    
    return fullPath;
  },
  
  /**
   * Resolve duplicate filenames
   * @param {Array} previews - Array of rename previews
   * @param {string} dupeKey - Duplicate key to resolve
   * @param {string} resolution - Resolution method
   * @returns {Object} - Updated previews
   */
  resolveDuplicates: (previews, dupeKey, resolution) => {
    // Find all previews with this duplicate key
    const dupes = Object.values(previews).filter(preview => {
      // Get the key based on the current duplicate detection method
      // In a real implementation, this would match the method used in the App component
      return preview.dupeKey === dupeKey;
    });
    
    if (dupes.length <= 1) {
      return previews; // Nothing to resolve
    }
    
    const updatedPreviews = { ...previews };
    
    if (resolution === 'keep-first') {
      // Keep only the first file, skip the rest
      dupes.slice(1).forEach(dupe => {
        delete updatedPreviews[dupe.id];
      });
    } 
    else if (resolution === 'keep-all') {
      // Add numbers to filenames to make them unique
      dupes.forEach((dupe, index) => {
        if (index === 0) return; // Skip the first one
        
        const fileExt = `.${dupe.extension}`;
        const nameWithoutExt = dupe.newName.slice(0, -fileExt.length);
        updatedPreviews[dupe.id] = {
          ...dupe,
          newName: `${nameWithoutExt} (${index})${fileExt}`,
          newPath: dupe.newPath.replace(dupe.newName, `${nameWithoutExt} (${index})${fileExt}`)
        };
      });
    }
    else if (resolution === 'skip') {
      // Skip all files in this duplicate group
      dupes.forEach(dupe => {
        delete updatedPreviews[dupe.id];
      });
    }
    else if (resolution === 'manual') {
      // In a real app, this would trigger a UI for manual resolution
      // For now, just keep them all as is
    }
    
    return updatedPreviews;
  },
  
  /**
   * Generate preview of rename operations
   * @param {Array} files - Array of files
   * @param {Object} metadata - Metadata for each file
   * @param {string} pattern - Naming pattern
   * @param {Object} options - Naming options
   * @returns {Object} - Rename previews
   */
  generatePreviews: (files, metadata, pattern, options) => {
    const previews = {};
    
    files.forEach(file => {
      if (metadata[file.id]) {
        const fileMetadata = metadata[file.id];
        
        // Get original path components
        const pathParts = file.path.split('/');
        const originalDir = pathParts.slice(0, -1).join('/');
        
        // Generate new filename
        const newName = namingService.generateFilename(
          pattern, 
          fileMetadata, 
          file.extension, 
          options
        );
        
        // Generate new path
        let newPath;
        if (options.createDirectories) {
          newPath = namingService.generatePath(
            pattern,
            fileMetadata,
            originalDir,
            file.extension,
            options
          );
        } else {
          newPath = `${originalDir}/${newName}`;
        }
        
        previews[file.id] = {
          id: file.id,
          originalName: file.name,
          newName: newName,
          path: file.path,
          newPath: newPath,
          extension: file.extension,
          metadata: fileMetadata
        };
      }
    });
    
    return previews;
  }
};