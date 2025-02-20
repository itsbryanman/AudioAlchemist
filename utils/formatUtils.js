/**
 * Utility functions for formatting
 */
const formatUtils = {
  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted size
   */
  formatFileSize: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  
  /**
   * Format duration in HH:MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  formatDuration: (seconds) => {
    if (!seconds) return '00:00:00';
    
    seconds = Math.floor(seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  },
  
  /**
   * Format date in YYYY-MM-DD format
   * @param {Date|string|number} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return [
      d.getFullYear(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0')
    ].join('-');
  },
  
  /**
   * Truncate a string and add ellipsis if needed
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated string
   */
  truncate: (str, maxLength) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength - 3) + '...';
  },
  
  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} - Title case string
   */
  toTitleCase: (str) => {
    if (!str) return '';
    
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
    
    return str.replace(/\w\S*/g, (txt, idx) => {
      if (idx !== 0 && smallWords.test(txt)) {
        return txt.toLowerCase();
      }
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
  
  /**
   * Escape HTML special characters
   * @param {string} html - String to escape
   * @returns {string} - Escaped string
   */
  escapeHtml: (html) => {
    if (!html) return '';
    
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};