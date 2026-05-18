import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page" style={{ paddingTop: '4rem' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div className="header-rules">
          <div className="r1" />
          <div className="r2" />
        </div>

        <p className="home-eyebrow">Document Exchange</p>

        <h1 className="home-title">
          Get My<br />
          <span className="italic">Paper.</span>
        </h1>

        <div className="home-rule" />
        <div className="home-rule thick" />

        <p className="home-subtitle">
          Share any PDF securely. Upload to receive a code.
          Share the code — anyone can retrieve your document instantly.
        </p>

        <div className="btn-group">
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            ↑ &nbsp;Upload Paper
          </button>
          <button className="btn-outline" onClick={() => navigate('/download')}>
            ↓ &nbsp;Get Paper
          </button>
        </div>

        <div className="home-rule" style={{ marginTop: '2rem' }} />

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--ink-light)',
          letterSpacing: '0.04em',
          marginTop: '1rem'
        }}>
          No account required &nbsp;·&nbsp; PDF only &nbsp;·&nbsp; 4-digit retrieval code
        </p>
      </div>

      <footer className="page-footer">
        GET MY PAPER &nbsp;—&nbsp; DOCUMENT EXCHANGE SERVICE
      </footer>
    </div>
  )
}
