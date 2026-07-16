import './AsciiEye.css';

/** Static ASCII eye — no canvas, no animation, zero runtime cost. */
const STATIC_EYE = `        .:::::::::::::::::::::::::::::::.
      ::'                             '::
     ::  A B C D E F G H I J K L M N O  ::
    ::   0 1 2 3 4 5 6 7 8 9 @ # $ % &  ::
    ::   P Q R S T U V W X Y Z + = - [ ] ::
    ::         · · · · · · · · ·          ::
    ::         · · ·█████· · · ·          ::
    ::         · ·█████████· · ·          ::
    ::         · · ·█████· · · ·          ::
    ::   Z Y X W V U T S R Q P O N M L K  ::
     ::  * & % $ # @ 9 8 7 6 5 4 3 2 1 0 ::
      ::'                             '::
        ':::::::::::::::::::::::::::::::'`;

interface AsciiEyeProps {
  className?: string;
}

export function AsciiEye({ className }: AsciiEyeProps) {
  const rootClass = ['ascii-eye', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} aria-hidden="true">
      <pre className="ascii-eye__art">{STATIC_EYE}</pre>
    </div>
  );
}
