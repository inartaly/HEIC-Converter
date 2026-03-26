import React, { useState, useRef } from "react";

export default function FileDropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length) {
      onFilesAdded(files);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length) {
      onFilesAdded(files);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
      <p className="dropzone-title">Drop HEIC/HEIF files here</p>
      <p className="dropzone-subtitle">or</p>
      <button type="button" className="secondary" onClick={handleBrowseClick}>
        Browse files
      </button>
    </div>
  );
}
