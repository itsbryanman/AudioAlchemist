/**
 * Service for interacting with Google Books API
 */
const googleBooksService = {
  // Google Books API key
  apiKey: 'AIzaSyBndRwJQlWQlEgou9H0GBpBNnO1Gc8q9DI',

  /**
   * Search Google Books for books matching the query
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of book results
   */
  search: async (query) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${googleBooksService.apiKey}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Google Books API error: ${data.error?.message || response.statusText}`);
      }

      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items.map(item => {
        const volumeInfo = item.volumeInfo;
        return {
          id: item.id,
          title: volumeInfo.title,
          subtitle: volumeInfo.subtitle,
          author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
          publisher: volumeInfo.publisher,
          year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null,
          description: volumeInfo.description,
          isbn: volumeInfo.industryIdentifiers ? 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
          language: volumeInfo.language,
          pageCount: volumeInfo.pageCount,
          categories: volumeInfo.categories,
          coverUrl: volumeInfo.imageLinks?.thumbnail || null
        };
      });
    } catch (error) {
      console.error('Error searching Google Books:', error);
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
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${googleBooksService.apiKey}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Google Books API error: ${data.error?.message || response.statusText}`);
      }

      if (!data.items || data.items.length === 0) {
        throw new Error(`Book with ISBN ${isbn} not found`);
      }

      const volumeInfo = data.items[0].volumeInfo;
      return {
        id: data.items[0].id,
        title: volumeInfo.title,
        subtitle: volumeInfo.subtitle,
        author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
        publisher: volumeInfo.publisher,
        year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null,
        description: volumeInfo.description,
        isbn: isbn,
        language: volumeInfo.language,
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories,
        coverUrl: volumeInfo.imageLinks?.thumbnail || null,
        previewLink: volumeInfo.previewLink
      };
    } catch (error) {
      console.error('Error fetching book from Google Books:', error);
      throw error;
    }
  },

  /**
   * Search for audiobooks
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of audiobook results
   */
  searchAudiobooks: async (query) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}+subject:audiobook&key=${googleBooksService.apiKey}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Google Books API error: ${data.error?.message || response.statusText}`);
      }

      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items
        .filter(item => {
          const volumeInfo = item.volumeInfo;
          // Determine if the book is likely an audiobook
          const isAudiobook = 
            // Check categories for audio-related keywords
            (volumeInfo.categories && volumeInfo.categories.some(cat => 
              cat.toLowerCase().includes('audio') || cat.toLowerCase().includes('spoken'))) ||
            // Look for "audiobook" in the title or subtitle
            (volumeInfo.title && volumeInfo.title.toLowerCase().includes('audiobook')) ||
            (volumeInfo.subtitle && volumeInfo.subtitle.toLowerCase().includes('audiobook')) ||
            // Inspect description for indicators like narrator or listening time
            (volumeInfo.description && (
              volumeInfo.description.toLowerCase().includes('audiobook') ||
              volumeInfo.description.toLowerCase().includes('narrator') ||
              volumeInfo.description.toLowerCase().includes('narrated by') ||
              volumeInfo.description.toLowerCase().includes('listening time')
            ));
          
          return isAudiobook;
        })
        .map(item => {
          const volumeInfo = item.volumeInfo;
          // Try to extract narrator information from the description
          let narrator = null;
          if (volumeInfo.description) {
            const narratorMatch = volumeInfo.description.match(/narrated by\s+([^,.]+)/i);
            if (narratorMatch) {
              narrator = narratorMatch[1].trim();
            }
          }
          
          return {
            id: item.id,
            title: volumeInfo.title,
            subtitle: volumeInfo.subtitle,
            author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
            narrator: narrator,
            publisher: volumeInfo.publisher,
            year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null,
            description: volumeInfo.description,
            isbn: volumeInfo.industryIdentifiers ? 
              volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
              volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
            language: volumeInfo.language,
            coverUrl: volumeInfo.imageLinks?.thumbnail || null
          };
        });
    } catch (error) {
      console.error('Error searching Google Books for audiobooks:', error);
      throw error;
    }
  },

  /**
   * Extract series information from book data
   * @param {Object} bookData - Book data from Google Books API
   * @returns {Object|null} - Series information or null
   */
  extractSeriesInfo: (bookData) => {
    if (!bookData.title) return null;

    // Check for series information in the title using common patterns:
    // "Title (Series Name, #N)"
    // "Title (Series Name #N)"
    // "Title: Series Name, Book N"
    const titlePatterns = [
      /^(.+?)\s*\(\s*(.+?),?\s+#(\d+(\.\d+)?)\s*\)$/,  // Title (Series Name, #N)
      /^(.+?)\s*\(\s*(.+?)\s+#(\d+(\.\d+)?)\s*\)$/,    // Title (Series Name #N)
      /^(.+?):\s+(.+?),\s+Book\s+(\d+(\.\d+)?)$/       // Title: Series Name, Book N
    ];

    for (const pattern of titlePatterns) {
      const match = bookData.title.match(pattern);
      if (match) {
        return {
          title: match[1].trim(),
          series: match[2].trim(),
          seriesNumber: parseFloat(match[3])
        };
      }
    }

    // Optionally, check subtitle for series info if not found in title
    if (bookData.subtitle) {
      const subtitlePatterns = [
        /^(?:A|The)?\s*(.+?)\s+(?:Series|Saga|Chronicles)(?:\s+Book)?\s+(\d+(\.\d+)?)$/i,  // e.g., "The Amazing Series Book 2"
        /^Book\s+(\d+(\.\d+)?)\s+(?:of|in)\s+(?:the)?\s*(.+?)(?:\s+(?:Series|Saga|Chronicles))?$/i  // e.g., "Book 2 of The Amazing Series"
      ];

      for (const pattern of subtitlePatterns) {
        const match = bookData.subtitle.match(pattern);
        if (match) {
          if (pattern === subtitlePatterns[0]) {
            return {
              title: bookData.title,
              series: match[1].trim(),
              seriesNumber: parseFloat(match[2])
            };
          } else if (pattern === subtitlePatterns[1]) {
            return {
              title: bookData.title,
              series: match[3].trim(),
              seriesNumber: parseFloat(match[1])
            };
          }
        }
      }
    }

    return null;
  }
};
