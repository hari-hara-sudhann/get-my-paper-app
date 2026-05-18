import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../lib/api";

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [code, setCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are accepted.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus(null);
    setCode(null);
    setErrorMsg("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const toBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleUpload = async () => {
    if (!file) return;
    setStatus("loading");
    setCode(null);
    setErrorMsg("");

    try {
      const base64 = await toBase64(file);
      const data = await fetchJson("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: base64 }),
      });

      if (!data.code) throw new Error("No code returned from server.");

      setCode(String(data.code).padStart(4, "0"));
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
      setStatus("error");
    }
  };

  const digits = code ? code.split("") : [];

  return (
    <div className="page" style={{ paddingTop: "5rem" }}>
      {/* Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          borderBottom: "2px solid var(--ink)",
          padding: "1.1rem 2rem",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontFamily: "Playfair Display, serif",
            fontWeight: 900,
            fontSize: "1rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          GET MY <span style={{ color: "var(--red)" }}>PAPER</span>
        </span>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="card">
        <p className="card-eyebrow">Step 1 of 1</p>
        <h2 className="card-title">Upload Paper</h2>
        <p className="card-desc">
          Select your PDF. We'll give you a 4-digit code to share.
        </p>

        <hr className="divider" />

        {/* Drop zone */}
        <div
          className={`upload-zone ${dragover ? "dragover" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragover(true);
          }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />

          {file ? (
            <>
              <span className="upload-icon">📄</span>
              <p className="upload-zone-title">{file.name}</p>
              <p className="upload-zone-sub">
                {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
                <span
                  style={{
                    color: "var(--red)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setStatus(null);
                    setCode(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  Change file
                </span>
              </p>
            </>
          ) : (
            <>
              <span className="upload-icon">⬆</span>
              <p className="upload-zone-title">Drop your PDF here</p>
              <p className="upload-zone-sub">or click to browse</p>
            </>
          )}
        </div>

        {/* Upload button */}
        {status !== "success" && (
          <button
            className="btn-red"
            style={{ marginTop: "1.25rem" }}
            onClick={handleUpload}
            disabled={!file || status === "loading"}
          >
            {status === "loading" ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                }}
              >
                <span className="spinner" /> Uploading…
              </span>
            ) : (
              "Upload & Get Code"
            )}
          </button>
        )}

        {/* Status messages */}
        {status === "error" && (
          <div className="status error">
            <span className="status-icon">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && code && (
          <>
            <div className="code-display" style={{ marginTop: "1.5rem" }}>
              <p className="code-label">Your retrieval code</p>
              <div className="code-number">
                {digits.map((d, i) => (
                  <span key={i} className="digit">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <p className="code-hint">
              Share this code with anyone who needs the document.
            </p>

            <hr className="divider" />

            <button
              className="btn-outline"
              style={{ width: "100%", marginTop: "0.5rem" }}
              onClick={() => {
                setFile(null);
                setStatus(null);
                setCode(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Upload Another
            </button>
          </>
        )}
      </div>

      <footer className="page-footer">
        GET MY PAPER &nbsp;—&nbsp; DOCUMENT EXCHANGE SERVICE
      </footer>
    </div>
  );
}
