/**
 * Service for handling metadata operations
 */
const metadataService = {
  /**
   * Fetch metadata from OpenLibrary
   * @param {Object} file - File object
   * @returns {Promise<Object>} - Metadata
   */
  fetchFromOpenLibrary: async (file) => {
    try {
      // Extract likely search terms from filename
      const searchQuery = metadataService.extractSearchQuery(file.name);
      
      // Search OpenLibrary
      const results = await openLibraryService.search(searchQuery);
      
      if (results.length === 0) {
        throw new Error(`No results found for "${searchQuery}"`);
      }
      
      // Get the first result
      const bookData = results[0];
      
      // Check for series information
      const seriesInfo = openLibraryService.extractSeriesInfo(bookData.title);
      
      return {
        title: seriesInfo ? seriesInfo.title : bookData.title,
        author: bookData.author,
        series: seriesInfo ? seriesInfo.series : null,
        seriesNumber: seriesInfo ? seriesInfo.seriesNumber : null,
        isbn: bookData.isbn,
        year: bookData.year,
        description: bookData.description || '',
        publisher: bookData.publisher,
        language: bookData.language,
        coverUrl: bookData.coverUrl
      };
    } catch (error) {
      console.error('Error fetching from OpenLibrary:', error);
      throw error;
    }
  },
  
  /**
   * Fetch metadata from Google Books
   * @param {Object} file - File object
   * @returns {Promise<Object>} - Metadata
   */
  fetchFromGoogleBooks: async (file) => {
    try {
      // Extract likely search terms from filename
      const searchQuery = metadataService.extractSearchQuery(file.name);
      
      // Search Google Books with audiobook filter
      const results = await googleBooksService.searchAudiobooks(searchQuery);
      
      if (results.length === 0) {
        // Fall back to regular search if no audiobooks found
        const regularResults = await googleBooksService.search(searchQuery);
        if (regularResults.length === 0) {
          throw new Error(`No results found for "${searchQuery}"`);
        }
        
        // Use the first regular result
        const bookData = regularResults[0];
        
        // Check for series information
        const seriesInfo = googleBooksService.extractSeriesInfo(bookData);
        
        return {
          title: seriesInfo ? seriesInfo.title : bookData.title,
          author: bookData.author,
          series: seriesInfo ? seriesInfo.series : null,
          seriesNumber: seriesInfo ? seriesInfo.seriesNumber : null,
          narrator: null, // Not available in regular results
          isbn: bookData.isbn,
          year: bookData.year,
          description: bookData.description || '',
          publisher: bookData.publisher,
          language: bookData.language,
          coverUrl: bookData.coverUrl
        };
      }
      
      // Use the first audiobook result
      const bookData = results[0];
      
      // Check for series information
      const seriesInfo = googleBooksService.extractSeriesInfo(bookData);
      
      return {
        title: seriesInfo ? seriesInfo.title : bookData.title,
        author: bookData.author,
        series: seriesInfo ? seriesInfo.series : null,
        seriesNumber: seriesInfo ? seriesInfo.seriesNumber : null,
        narrator: bookData.narrator,
        isbn: bookData.isbn,
        year: bookData.year,
        description: bookData.description || '',
        publisher: bookData.publisher,
        language: bookData.language,
        coverUrl: bookData.coverUrl
      };
    } catch (error) {
      console.error('Error fetching from Google Books:', error);
      throw error;
    }
  },
  
  /**
   * Extract metadata from the audio file using jsmediatags.
   * @param {Object} file - File object containing the actual audio File in file.file
   * @returns {Promise<Object>} - Extracted metadata
   */
  extractFromFile: async (file) => {
    try {
      return new Promise((resolve, reject) => {
        jsmediatags.read(file.file, {
          onSuccess: (tag) => {
            const tags = tag.tags;
            // Extract cover image if available
            let coverUrl = null;
            if (tags.picture) {
              let base64String = "";
              for (let i = 0; i < tags.picture.data.length; i++) {
                base64String += String.fromCharCode(tags.picture.data[i]);
              }
              coverUrl = `data:${tags.picture.format};base64,${btoa(base64String)}`;
            }
            // Use file name as fallback for title
            const title = tags.title || file.name.split('.')[0];
            const author = tags.artist || 'Unknown';
            resolve({
              title: title,
              author: author,
              album: tags.album || null,
              year: tags.year || null,
              genre: tags.genre || null,
              coverUrl: coverUrl,
              duration: null // Duration extraction would require additional methods
            });
          },
          onError: (error) => {
            console.error('Error reading tags:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error extracting metadata from file:', error);
      throw error;
    }
  },
  
  /**
   * Extract search query from filename
   * @param {string} filename - File name
   * @returns {string} - Search query
   */
  extractSearchQuery: (filename) => {
    // Remove extension
    let query = filename.split('.').slice(0, -1).join('.');
    
    // Remove common audiobook indicators
    query = query.replace(/\(unabridged\)/i, '')
                .replace(/\(audiobook\)/i, '')
                .replace(/\[audiobook\]/i, '')
                .replace(/audiobook/i, '')
                .replace(/unabridged/i, '');
    
    // Remove track numbers like [01], (01), 01 - 
    query = query.replace(/^\s*[\[(]?\d+[\])]?\s*-?\s*/i, '');
    
    // Clean up remaining punctuation and extra spaces
    query = query.replace(/[_\-\.]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
    
    return query;
  },
  
  /**
   * Extract series information from filename
   * @param {string} filename - File name
   * @returns {Object|null} - Series information or null
   */
  extractSeriesFromFilename: (filename) => {
    // Remove extension
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    
    // Common patterns for series in filenames:
    // "Series Name - Book N - Title"
    // "Title - Series Name Book N"
    // "Series Name Book N - Title"
    // "Title (Series Name, Book N)"
    
    const patterns = [
      // Series Name - Book N - Title
      /^(.+?)\s*-\s*Book\s*(\d+(\.\d+)?)\s*-\s*(.+)$/i,
      
      // Title - Series Name Book N
      /^(.+?)\s*-\s*(.+?)\s+Book\s*(\d+(\.\d+)?)$/i,
      
      // Series Name Book N - Title
      /^(.+?)\s+Book\s*(\d+(\.\d+)?)\s*-\s*(.+)$/i,
      
      // Title (Series Name, Book N)
      /^(.+?)\s*\(\s*(.+?),\s*Book\s*(\d+(\.\d+)?)\s*\)$/i,
      
      // Simpler pattern for "Series N - Title"
      /^(.+?)\s*(\d+(\.\d+)?)\s*-\s*(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          return {
            series: match[1].trim(),
            seriesNumber: parseFloat(match[2]),
            title: match[4].trim()
          };
        } else if (pattern === patterns[1]) {
          return {
            title: match[1].trim(),
            series: match[2].trim(),
            seriesNumber: parseFloat(match[3])
          };
        } else if (pattern === patterns[2]) {
          return {
            series: match[1].trim(),
            seriesNumber: parseFloat(match[2]),
            title: match[4].trim()
          };
        } else if (pattern === patterns[3]) {
          return {
            title: match[1].trim(),
            series: match[2].trim(),
            seriesNumber: parseFloat(match[3])
          };
        } else if (pattern === patterns[4]) {
          const potentialSeries = match[1].trim();
          if (potentialSeries.split(' ').length <= 4 && 
              !potentialSeries.match(/\b(the|and|or|if|but|because|as|than|then)\b/i)) {
            return {
              series: potentialSeries,
              seriesNumber: parseFloat(match[2]),
              title: match[4].trim()
            };
          }
        }
      }
    }
    
    return null;
  }
};
