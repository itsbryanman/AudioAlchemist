const { useState, useRef } = React;

// Helper function to recursively read directory entries
const readDirectory = async (directoryHandle) => {
  const files = [];
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      files.push({
        id: `${Date.now()}-${files.length}`,
        name: file.name,
        size: file.size,
        extension: file.name.split('.').pop().toLowerCase(),
        lastModified: file.lastModified,
        path: URL.createObjectURL(file),
        file: file // keep reference to the original File object
      });
    } else if (entry.kind === 'directory') {
      // Recursively read subdirectories
      const subFiles = await readDirectory(entry);
      files.push(...subFiles);
    }
  }
  return files;
};

const FileSelector = ({ onFilesSelected, supportedFormats }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Process files: filter by supported formats
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return supportedFormats.includes(extension);
    });
    
    if (validFiles.length > 0) {
      const processedFiles = validFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        extension: file.name.split('.').pop().toLowerCase(),
        lastModified: file.lastModified,
        path: URL.createObjectURL(file),
        file: file
      }));
      
      onFilesSelected(processedFiles);
      
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };
  
  // Open file dialog
  const openFileSelector = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Handle directory selection for non-Chrome browsers
  const handleDirectorySelection = async (e) => {
    e.preventDefault();
    // If the modern File System Access API is available, use it:
    if (window.showDirectoryPicker) {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        const files = await readDirectory(directoryHandle);
        // Filter files by supported formats
        const validFiles = files.filter(file => {
          return supportedFormats.includes(file.extension);
        });
        if (validFiles.length > 0) {
          onFilesSelected(validFiles);
        }
      } catch (error) {
        console.error("Directory selection cancelled or failed:", error);
      }
    } else {
      // If neither webkitdirectory nor showDirectoryPicker is available, alert the user.
      alert("Directory selection is not supported in this browser. Please use drag-and-drop or select multiple files manually.");
    }
  };
  
  return (
    <div className="file-selector">
      {/* Drag and drop zone */}
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="drop-zone-text">
          <p>Drag and drop audiobook files here or click to browse</p>
          <p className="supported-formats">
            Supported formats: {supportedFormats.map(format => format.toUpperCase()).join(', ')}
          </p>
        </div>
      </div>
      
      {/* File selection options */}
      <div className="file-selector-options">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={supportedFormats.map(format => `.${format}`).join(',')}
          onChange={handleChange}
        />
        
        <button 
          onClick={openFileSelector}
          className="secondary"
        >
          Select Files
        </button>
        
        <button 
          onClick={handleDirectorySelection}
          className="secondary"
        >
          Select Directory
        </button>
      </div>
    </div>
  );
};
