const duplicateUtils = {
  /**
   * Asynchronously find duplicates in a list of files using the specified method.
   * @param {Object} previews - Rename preview objects (keyed by file id)
   * @param {string} method - Duplicate detection method: 'filename', 'filename+size', or 'content'
   * @returns {Promise<Array>} - Array of duplicate groups
   */
  findDuplicates: async (previews, method) => {
    if (!previews || Object.keys(previews).length === 0) {
      return [];
    }
    
    const dupeMap = new Map();
    const previewArray = Object.values(previews);
    
    // Loop through each preview and generate a duplicate key.
    for (const preview of previewArray) {
      // For content detection, compute the hash asynchronously.
      const key =
        method === 'content'
          ? await duplicateUtils.generateDuplicateKey(preview, method)
          : duplicateUtils.generateDuplicateKeySync(preview, method);
      
      // Store the key on the preview for reference.
      preview.dupeKey = key;
      
      if (!dupeMap.has(key)) {
        dupeMap.set(key, []);
      }
      dupeMap.get(key).push(preview);
    }
    
    // Gather groups with more than one file.
    const duplicates = [];
    dupeMap.forEach((files, key) => {
      if (files.length > 1) {
        duplicates.push({
          key,
          files
        });
      }
    });
    
    return duplicates;
  },
  
  /**
   * Synchronous duplicate key generation for 'filename' and 'filename+size' methods.
   * @param {Object} preview - Rename preview object
   * @param {string} method - Detection method
   * @returns {string} - Duplicate key
   */
  generateDuplicateKeySync: (preview, method) => {
    if (method === 'filename') {
      return preview.newName.toLowerCase();
    } else if (method === 'filename+size') {
      // Assuming preview.metadata.size holds the file size.
      return `${preview.newName.toLowerCase()}_${preview.metadata?.size || 0}`;
    } else {
      return preview.newName.toLowerCase();
    }
  },
  
  /**
   * Asynchronously generate a duplicate key using content hash.
   * @param {Object} preview - Rename preview object
   * @param {string} method - Expected to be 'content'
   * @returns {Promise<string>} - Duplicate key based on file content
   */
  generateDuplicateKey: async (preview, method) => {
    if (method === 'content') {
      // If already computed, return the hash.
      if (preview.metadata && preview.metadata.contentHash) {
        return preview.metadata.contentHash;
      } else {
        // Compute the hash using our fileService.
        const hash = await fileService.calculateContentHash(preview.file);
        preview.metadata = { ...preview.metadata, contentHash: hash };
        return hash;
      }
    } else {
      // Fallback to the synchronous version.
      return duplicateUtils.generateDuplicateKeySync(preview, method);
    }
  },
  
  /**
   * Check if a file would cause a duplicate given an array of existing files.
   * @param {string} newPath - New file path
   * @param {Array} existingFiles - Array of existing files
   * @returns {boolean} - True if duplicate
   */
  wouldCauseDuplicate: (newPath, existingFiles) => {
    if (!existingFiles || existingFiles.length === 0) {
      return false;
    }
    
    const normalizedPath = newPath.toLowerCase();
    return existingFiles.some(file => file.path.toLowerCase() === normalizedPath);
  },
  
  /**
   * Suggest an alternative name for a duplicate file.
   * @param {Object} preview - Rename preview object
   * @param {number} index - Number to append
   * @returns {Object} - Updated preview with alternative name
   */
  suggestAlternativeName: (preview, index = 1) => {
    const extension = preview.newName.split('.').pop();
    const nameWithoutExtension = preview.newName.substring(0, preview.newName.length - extension.length - 1);
    
    const alternativeName = `${nameWithoutExtension} (${index}).${extension}`;
    const alternativePath = preview.newPath.replace(preview.newName, alternativeName);
    
    return {
      ...preview,
      newName: alternativeName,
      newPath: alternativePath,
      isAlternative: true
    };
  },
  
  /**
   * Auto-resolve duplicates using a specified strategy.
   * @param {Array} duplicates - Array of duplicate groups
   * @param {string} strategy - Resolution strategy: 'keep-first', 'keep-all', or 'skip-all'
   * @param {Object} previews - All rename previews
   * @returns {Object} - Updated previews
   */
  autoResolveDuplicates: (duplicates, strategy, previews) => {
    if (!duplicates || duplicates.length === 0) {
      return previews;
    }
    
    const result = { ...previews };
    
    duplicates.forEach(dupeGroup => {
      if (strategy === 'keep-first') {
        // Keep only the first file in each group.
        dupeGroup.files.slice(1).forEach(file => {
          delete result[file.id];
        });
      } else if (strategy === 'keep-all') {
        // Rename duplicates by appending a number.
        dupeGroup.files.slice(1).forEach((file, index) => {
          const alternative = duplicateUtils.suggestAlternativeName(file, index + 1);
          result[file.id] = alternative;
        });
      } else if (strategy === 'skip-all') {
        // Remove all files in the duplicate group.
        dupeGroup.files.forEach(file => {
          delete result[file.id];
        });
      }
    });
    
    return result;
  }
};
