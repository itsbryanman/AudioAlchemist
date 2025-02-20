/**
 * Service for handling file operations using the File System Access API
 */
const fileService = {
  /**
   * Rename a file by copying its contents to a new file and deleting the old one.
   * @param {Object} renameInfo - Contains: fileHandle, originalName, newName, parentDirectoryHandle
   * @returns {Promise<boolean>} - Success status
   */
  renameFile: async (renameInfo) => {
    try {
      const { fileHandle, originalName, newName, parentDirectoryHandle } = renameInfo;
      // Read file data
      const file = await fileHandle.getFile();
      const contents = await file.arrayBuffer();
      
      // Create new file with the new name
      const newFileHandle = await parentDirectoryHandle.getFileHandle(newName, { create: true });
      const writable = await newFileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
      
      // Remove the original file (if supported)
      await parentDirectoryHandle.removeEntry(originalName);
      
      console.log(`Renamed ${originalName} to ${newName}`);
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  },
  
  /**
   * Create a directory under a given parent directory.
   * @param {string} dirName - Name of the new directory
   * @param {FileSystemDirectoryHandle} parentDirectoryHandle - Parent directory handle
   * @returns {Promise<FileSystemDirectoryHandle>} - The new directory handle
   */
  createDirectory: async (dirName, parentDirectoryHandle) => {
    try {
      const newDirHandle = await parentDirectoryHandle.getDirectoryHandle(dirName, { create: true });
      console.log(`Created directory: ${dirName}`);
      return newDirHandle;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  },
  
  /**
   * Write metadata to an NFO file in XML format.
   * @param {string} fileName - Name of the NFO file (should include .nfo extension)
   * @param {Object} metadata - Metadata to write
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory where the file will be created
   * @returns {Promise<boolean>} - Success status
   */
  writeNfoFile: async (fileName, metadata, directoryHandle) => {
    try {
      // Basic XML conversion for demonstration
      const xmlContent = `<metadata>
  <title>${metadata.title}</title>
  <author>${metadata.author}</author>
  <year>${metadata.year || ''}</year>
  <description>${metadata.description || ''}</description>
  <isbn>${metadata.isbn || ''}</isbn>
</metadata>`;
      
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(xmlContent);
      await writable.close();
      console.log(`Written NFO file to ${fileName}`);
      return true;
    } catch (error) {
      console.error('Error writing NFO file:', error);
      throw error;
    }
  },
  
  /**
   * Write a log file with operations data.
   * @param {string} fileName - Name of the log file (e.g., log.txt)
   * @param {Array} operations - Array of operation log strings
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory where the file will be created
   * @returns {Promise<boolean>} - Success status
   */
  writeLogFile: async (fileName, operations, directoryHandle) => {
    try {
      const logContent = operations.join('\n');
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(logContent);
      await writable.close();
      console.log(`Written log file to ${fileName}`);
      return true;
    } catch (error) {
      console.error('Error writing log file:', error);
      throw error;
    }
  },
  
  /**
   * Move a file to a trash folder by copying it and then deleting the original.
   * @param {string} fileName - Name of the file to move
   * @param {FileSystemDirectoryHandle} sourceDirectoryHandle - Handle of the source directory
   * @param {FileSystemDirectoryHandle} trashDirectoryHandle - Handle of the trash directory
   * @returns {Promise<boolean>} - Success status
   */
  moveToTrash: async (fileName, sourceDirectoryHandle, trashDirectoryHandle) => {
    try {
      // Get original file
      const fileHandle = await sourceDirectoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const contents = await file.arrayBuffer();
      
      // Write file into trash directory
      const trashFileHandle = await trashDirectoryHandle.getFileHandle(fileName, { create: true });
      const writable = await trashFileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
      
      // Remove original file
      await sourceDirectoryHandle.removeEntry(fileName);
      console.log(`Moved ${fileName} to trash`);
      return true;
    } catch (error) {
      console.error('Error moving file to trash:', error);
      throw error;
    }
  },
  
  /**
   * Extract metadata from an audio file.
   * @param {File} file - Audio file to extract metadata from
   * @returns {Promise<Object>} - Extracted metadata
   */
  extractMetadata: async (file) => {
    try {
      // In a real implementation, use a library (e.g., jsmediatags) to extract metadata.
      // Here we simulate extraction.
      await new Promise(resolve => setTimeout(resolve, 300));
      const filenameParts = file.name.split(' - ');
      let title = file.name;
      let author = 'Unknown';
      if (filenameParts.length > 1) {
        title = filenameParts[0].trim();
        author = filenameParts[1].split('.')[0].trim();
      }
      return {
        title,
        author,
        year: null,
        genre: null,
        narrator: null,
        duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60)
          .toString().padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString().padStart(2, '0')}`
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      throw error;
    }
  },
  
  /**
   * Calculate SHA-256 hash of file contents for duplicate detection.
   * @param {File} file - File to hash
   * @returns {Promise<string>} - Hexadecimal content hash
   */
  calculateContentHash: async (file) => {
    try {
      const fileData = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Error calculating content hash:', error);
      throw error;
    }
  },
  
  /**
   * Write metadata to an audio file.
   * Since modifying audio file metadata directly in the browser is challenging,
   * we simulate this by writing the metadata to a separate JSON file.
   * @param {string} fileName - Original audio file name
   * @param {Object} metadata - Metadata to write
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory where the file resides
   * @returns {Promise<boolean>} - Success status
   */
  writeMetadata: async (fileName, metadata, directoryHandle) => {
    try {
      const metadataContent = JSON.stringify(metadata, null, 2);
      const metaFileName = fileName.replace(/\.[^.]+$/, '') + '.meta.json';
      const fileHandle = await directoryHandle.getFileHandle(metaFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(metadataContent);
      await writable.close();
      console.log(`Written metadata to ${metaFileName}`);
      return true;
    } catch (error) {
      console.error('Error writing metadata:', error);
      throw error;
    }
  }
};
