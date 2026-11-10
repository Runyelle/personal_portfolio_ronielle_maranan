import { useRef } from 'react';
import { useDraggableWindow } from '../hooks/useDraggableWindow.js';
import './MacWindow.css';

/**
 * A macOS-style window around an existing card (Showcase "Outside Work"
 * panel). The front window shows coloured traffic lights and a deeper shadow;
 * windows behind it go grey. Clicking or tabbing into a window raises it.
 * In desk mode the title bar drags the window around `deskRef`.
 */
export default function MacWindow({
  id,
  title,
  front,
  zIndex,
  onRaise,
  deskRef,
  draggable,
  reducedMotion,
  homeKey,
  className = '',
  children,
}) {
  const winRef = useRef(null);
  const barRef = useRef(null);

  useDraggableWindow({
    winRef,
    barRef,
    deskRef,
    enabled: draggable,
    reducedMotion,
    onGrab: onRaise,
    homeKey,
  });

  return (
    <div
      ref={winRef}
      className={`mw mw--${id}${front ? ' is-front' : ''}${draggable ? ' is-draggable' : ''} ${className}`}
      role="group"
      aria-label={title}
      style={{ zIndex }}
      onPointerDownCapture={onRaise}
      onFocusCapture={onRaise}
    >
      <div className="mw-bar" ref={barRef}>
        <div className="hw-lights" aria-hidden="true">
          <span className="hw-light red" />
          <span className="hw-light yellow" />
          <span className="hw-light green" />
        </div>
        <span className="mw-title" aria-hidden="true">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
