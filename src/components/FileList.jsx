import React from "react";

export default function FileList({ files, onRemove, onDownload }) {
  if (!files.length) {
    return <p className="filelist-empty">No files added yet.</p>;
  }

  return (
    <div className="filelist">
      {files.map((item) => (
        <div key={item.id} className="filelist-item">
          <div className="filelist-thumb-wrapper">
            {item.status === "done" && item.outputUrl ? (
              <img
                src={item.outputUrl}
                alt={item.outputName || item.name}
                className="filelist-thumb"
              />
            ) : (
              <div className="filelist-thumb placeholder">
                <span>HEIC</span>
              </div>
            )}
          </div>

          <div className="filelist-main">
            <div className="filelist-name">
              {item.outputName || item.name}
            </div>
            <div className="filelist-status">
              {item.status === "pending" && "Pending"}
              {item.status === "converting" && "Converting..."}
              {item.status === "done" && "Ready to download"}
              {item.status === "error" && (
                <span className="filelist-error">
                  Error: {item.error || "Conversion failed"}
                </span>
              )}
            </div>
          </div>

          <div className="filelist-actions">
            {item.status === "done" && item.outputUrl && (
              <button
                className="primary small"
                onClick={() => onDownload(item)}
              >
                Download
              </button>
            )}
            <button
              className="ghost small"
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
