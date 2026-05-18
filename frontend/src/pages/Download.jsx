import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../lib/api";

export default function Download() {
  const navigate = useNavigate();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState("document.pdf");

  const code = digits.join("");
  const isComplete = code.length === 4 && digits.every((d) => /\d/.test(d));

  const handleDigitChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs[index - 1].current?.focus();
    if (e.key === "ArrowRight" && index < 3)
      inputRefs[index + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 3);
    inputRefs[focusIdx].current?.focus();
  };

  const handleFetch = async () => {
    if (!isComplete) return;
    setStatus("loading");
    setErrorMsg("");
    setDownloadUrl(null);

    try {
      const data = await fetchJson("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!data.body) throw new Error("No document data returned from server.");

      // Convert base64 to blob
      const byteChars = atob(data.body);
      const byteNums = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteNums], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setFileName(`document-${code}.pdf`);
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Could not retrieve document. Check your code and try again.",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const reset = () => {
    setDigits(["", "", "", ""]);
    setStatus(null);
    setErrorMsg("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    inputRefs[0].current?.focus();
  };

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
        <p className="card-eyebrow">Retrieval</p>
        <h2 className="card-title">Get Paper</h2>
        <p className="card-desc">
          Enter the 4-digit code you received to retrieve your document.
        </p>

        <hr className="divider" />

        {/* Code input */}
        <p
          className="code-label"
          style={{ textAlign: "center", marginBottom: "0.75rem" }}
        >
          Enter Code
        </p>
        <div className="code-input-row" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              className="code-digit-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Fetch button */}
        {status !== "success" && (
          <button
            className="btn-red"
            onClick={handleFetch}
            disabled={!isComplete || status === "loading"}
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
                <span className="spinner" /> Retrieving…
              </span>
            ) : (
              "Retrieve Document"
            )}
          </button>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="status error">
            <span className="status-icon">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success */}
        {status === "success" && downloadUrl && (
          <>
            <div className="status success" style={{ marginTop: "1.25rem" }}>
              <span className="status-icon">✓</span>
              <span>Document retrieved successfully.</span>
            </div>

            <a className="download-link" href={downloadUrl} download={fileName}>
              ↓ &nbsp;Download {fileName}
            </a>

            <hr className="divider" />

            <button
              className="btn-outline"
              style={{ width: "100%" }}
              onClick={reset}
            >
              Retrieve Another
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
