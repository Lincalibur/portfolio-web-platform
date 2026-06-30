import './GatewaySqlBlockModal.css';

/** Drop your GIF at public/gateway-sql-blocked.gif to replace the placeholder. */
const BLOCKED_GIF_PATH = '/gateway-sql-blocked.gif';

interface GatewaySqlBlockModalProps {
  open: boolean;
  fieldLabel?: string;
  onClose: () => void;
}

export function GatewaySqlBlockModal({ open, fieldLabel, onClose }: GatewaySqlBlockModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="sql-block-overlay" role="dialog" aria-modal="true" aria-labelledby="sql-block-title">
      <div className="sql-block-window">
        <div className="sql-block-window__glow" aria-hidden="true" />

        <div className="sql-block-window__media">
          <img
            src={BLOCKED_GIF_PATH}
            alt=""
            className="sql-block-window__gif"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              const fallback = event.currentTarget.nextElementSibling;
              if (fallback instanceof HTMLElement) {
                fallback.hidden = false;
              }
            }}
          />
          <div className="sql-block-window__gif-fallback" hidden aria-hidden="true">
            🛑
          </div>
        </div>

        <h2 id="sql-block-title" className="sql-block-window__title">
          No no NO — don&apos;t do that!
        </h2>

        <p className="sql-block-window__message">
          Nice try. A suspicious SQL-style payload was detected
          {fieldLabel ? ` in the ${fieldLabel} field` : ''} and was blocked before it reached the server.
        </p>

        <p className="sql-block-window__sub">
          This gateway uses input validation and rate limiting. Enter your real details to request access.
        </p>

        <button type="button" className="btn sql-block-window__btn" onClick={onClose}>
          I&apos;ll behave
        </button>
      </div>
    </div>
  );
}
