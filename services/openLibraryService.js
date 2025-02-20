/**
 * Service for interacting with OpenLibrary API
 */
const openLibraryService = {
  /**
   * Search OpenLibrary for books matching the query
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of book results
   */
  search: async (query) => {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${data.message || response.statusText}`);
      }
      
      return data.docs.map(book => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Unknown',
        year: book.first_publish_year,
        publisher: book.publisher ? book.publisher[0] : 'Unknown',
        isbn: book.isbn ? book.isbn[0] : null,
        language: book.language ? book.language[0] : null,
        coverUrl: book.cover_i ? 
          `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null
      }));
    } catch (error) {
      console.error('Error searching OpenLibrary:', error);
      throw error;
    }
  },
  
  /**
   * Get book details by ISBN
   * @param {string} isbn - ISBN of the book
   * @returns {Promise<Object>} - Book details
   */
  getBookByISBN: async (isbn) => {
    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${data.message || response.statusText}`);
      }
      
      const bookData = data[`ISBN:${isbn}`];
      if (!bookData) {
        throw new Error(`Book with ISBN ${isbn} not found`);
      }
      
      return {
        title: bookData.title,
        author: bookData.authors ? bookData.authors[0].name : 'Unknown',
        publisher: bookData.publishers ? bookData.publishers[0].name : 'Unknown',
        year: bookData.publish_date,
        isbn: isbn,
        description: typeof bookData.notes === 'string' ? bookData.notes : bookData.excerpts?.[0]?.text || '',
        coverUrl: bookData.cover ? bookData.cover.medium : null,
        language: bookData.language ? bookData.language[0] : null
      };
    } catch (error) {
      console.error('Error fetching book from OpenLibrary:', error);
      throw error;
    }
  },
  
  /**
   * Extract series information from title
   * @param {string} title - Book title
   * @returns {Object|null} - Series information or null
   */
  extractSeriesInfo: (title) => {
    // Common series patterns:
    // "Series Name #N"
    // "Title (Series Name #N)"
    // "Series Name, Book N: Title"
    
    const patterns = [
      // Pattern: Title (Series Name #N)
      /^(.+?)\s*\((.+?)\s+#(\d+(\.\d+)?)\)$/,
      // Pattern: Series Name #N: Title
      /^(.+?)\s+#(\d+(\.\d+)?):\s+(.+)$/,
      // Pattern: Series Name, Book N: Title
      /^(.+?),\s+Book\s+(\d+(\.\d+)?):\s+(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          // Title (Series Name #N)
          return {
            title: match[1].trim(),
            series: match[2].trim(),
            seriesNumber: parseFloat(match[3])
          };
        } else if (pattern === patterns[1]) {
          // Series Name #N: Title
          return {
            title: match[4].trim(),
            series: match[1].trim(),
            seriesNumber: parseFloat(match[2])
          };
        } else if (pattern === patterns[2]) {
          // Series Name, Book N: Title
          return {
            title: match[4].trim(),
            series: match[1].trim(),
            seriesNumber: parseFloat(match[2])
          };
        }
      }
    }
    
    return null;
  }
};
