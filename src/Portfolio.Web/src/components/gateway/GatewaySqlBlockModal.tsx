import { VectorIcon } from '../../components/icons/VectorIcon';
import '../../components/icons/VectorIcon.css';
import './GatewaySqlBlockModal.css';

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

        <div className="sql-block-window__media" aria-hidden="true">
          <VectorIcon name="shield" className="sql-block-window__icon vector-icon--xl" />
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
