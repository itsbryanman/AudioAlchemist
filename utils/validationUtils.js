/**
 * Validate file path for cross-platform compatibility
 * @param {string} path - Path to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validationUtils = {
  // ... (other validation functions)

  validatePath: (path) => {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (!path) {
      result.isValid = false;
      result.errors.push('Path cannot be empty');
      return result;
    }
    
    // Check for control characters (ASCII codes 0-31)
    const controlChars = path.match(/[\x00-\x1F]/g);
    if (controlChars) {
      result.isValid = false;
      result.errors.push('Path contains control characters');
    }
    
    // Check for invalid characters for Windows: <>:"|?*
    const invalidChars = path.match(/[<>:"|?*]/g);
    if (invalidChars) {
      result.isValid = false;
      result.errors.push(`Invalid characters found: ${Array.from(new Set(invalidChars)).join(' ')}`);
    }
    
    // Split the path into segments (works for both "/" and "\")
    const segments = path.split(/[/\\]/);
    
    // List of reserved Windows filenames
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    // Validate each segment individually
    segments.forEach(segment => {
      // Ignore empty segments (can occur with leading/trailing slashes)
      if (!segment) return;
      
      // Windows does not allow filenames to end with a space or a period
      if (segment.endsWith(' ') || segment.endsWith('.')) {
        result.isValid = false;
        result.errors.push(`Segment "${segment}" should not end with a space or period`);
      }
      
      // Check if the base filename is a reserved Windows name
      const baseName = segment.split('.')[0];
      if (reservedNames.includes(baseName.toUpperCase())) {
        result.isValid = false;
        result.errors.push(`"${baseName}" is a reserved filename`);
      }
    });
    
    // Check for overall path length (260 characters is a common default limit on Windows)
    if (path.length > 260) {
      result.isValid = false;
      result.errors.push('Path exceeds maximum length (260 characters)');
    }
    
    return result;
  }
};

// Example usage:
const samplePath = "C:\\MyFolder\\InvalidFileName .txt";
const validationResult = validationUtils.validatePath(samplePath);
if (!validationResult.isValid) {
  console.log("Path validation errors:", validationResult.errors);
} else {
  console.log("Path is valid!");
}
