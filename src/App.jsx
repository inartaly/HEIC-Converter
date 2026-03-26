import React, { useState, useCallback } from "react";
import heic2any from "heic2any";
import FileDropZone from "./components/FileDropZone.jsx";
import FormatSelector from "./components/FormatSelector.jsx";
import FileList from "./components/FileList.jsx";

const OUTPUT_FORMATS = ["jpeg", "png", "webp"];

export default function App() {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState("jpeg");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesAdded = useCallback((incomingFiles) => {
    const heicFiles = Array.from(incomingFiles).filter((file) =>
      /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
    );

    const mapped = heicFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      status: "pending", // pending | converting | done | error
      outputBlob: null,
      outputUrl: null,
      outputName: null,
      error: null,
    }));

    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const buildOutputName = (originalName, format) => {
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const ext = format === "jpeg" ? "jpg" : format;
    return `${baseName}.${ext}`;
  };

  const convertSingleFile = async (item, format) => {
    try {
      const resultBlob = await heic2any({
        blob: item.file,
        toType: `image/${format}`,
        quality: format === "jpeg" ? 0.9 : 1.0,
      });

      const blob =
        resultBlob instanceof Blob ? resultBlob : resultBlob[0] || resultBlob;
      const url = URL.createObjectURL(blob);
      const outputName = buildOutputName(item.name, format);

      return {
        ...item,
        status: "done",
        outputBlob: blob,
        outputUrl: url,
        outputName,
        error: null,
      };
    } catch (err) {
      console.error("Conversion error:", err);
      return {
        ...item,
        status: "error",
        error: err?.message || "Conversion failed",
      };
    }
  };

  const handleConvertAll = async () => {
    if (!files.length) return;
    setError(null);
    setIsConverting(true);

    try {
      const pending = files.map((item) =>
        item.status === "done" && item.outputBlob && item.outputUrl
          ? Promise.resolve(item)
          : convertSingleFile({ ...item, status: "converting", error: null }, targetFormat)
      );

      const updated = await Promise.all(pending);
      setFiles(updated);
    } catch (err) {
      console.error(err);
      setError("Something went wrong during conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    files.forEach((f) => {
      if (f.outputUrl) URL.revokeObjectURL(f.outputUrl);
    });
    setFiles([]);
    setError(null);
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDownloadFile = (item) => {
    if (!item.outputUrl) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = item.outputName || buildOutputName(item.name, targetFormat);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    files.forEach((item) => {
      if (item.status === "done" && item.outputUrl) {
        handleDownloadFile(item);
      }
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>HEIC Converter</h1>
        <p>Convert HEIC/HEIF images to JPEG, PNG, or WebP directly in your browser.</p>
      </header>

      <main className="app-main">
        <section className="controls">
          <FormatSelector
            formats={OUTPUT_FORMATS}
            value={targetFormat}
            onChange={setTargetFormat}
          />

          <div className="buttons-row">
            <button
              className="primary"
              onClick={handleConvertAll}
              disabled={!files.length || isConverting}
            >
              {isConverting ? "Converting..." : "Convert all"}
            </button>
            <button
              className="secondary"
              onClick={handleDownloadAll}
              disabled={!files.some((f) => f.status === "done")}
            >
              Download all
            </button>
            <button
              className="ghost"
              onClick={handleClear}
              disabled={!files.length}
            >
              Clear
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}
        </section>

        <section className="dropzone-section">
          <FileDropZone onFilesAdded={handleFilesAdded} />
        </section>

        <section className="filelist-section">
          <FileList
            files={files}
            onRemove={handleRemoveFile}
            onDownload={handleDownloadFile}
          />
        </section>
      </main>

      <footer className="app-footer">
        <small>All conversion happens locally in your browser. No files are uploaded.</small>
      </footer>
    </div>
  );
}
