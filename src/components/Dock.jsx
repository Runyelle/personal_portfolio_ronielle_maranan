import { forwardRef } from 'react';
import iconMark from '../assets/logo/icon-mark-chrome.png';
import photos from '../assets/dock/photos.png';
import notes from '../assets/dock/notes.png';
import notion from '../assets/dock/notion.png';
import minecraft from '../assets/dock/minecraft.png';
import settings from '../assets/dock/settings.png';
import './Dock.css';

// icon files supplied by the site owner; trimmed to 128×128 tiles
const MAIN = [
  { name: 'photos', src: photos },
  { name: 'notes', src: notes },
  { name: 'notion', src: notion },
  { name: 'minecraft', src: minecraft },
];
// sits after the divider, like a pinned utility
const AFTER_DIVIDER = [{ name: 'settings', src: settings }];

function Tile({ app }) {
  return (
    <div className="dock-item" aria-hidden="true">
      <div className="dock-icon dock-tile">
        <img src={app.src} alt="" draggable="false" />
      </div>
      <span className="dock-dot" />
    </div>
  );
}

/**
 * macOS-style dock (see LaunchDock). Hidden unless `.is-active` (launch
 * intro, set by useLaunchIntro) or `docked` (footer reprise). Only the app
 * icon is interactive, and only while docked at the footer — there it's a
 * "Back to top" button; everything else is decorative.
 */
const Dock = forwardRef(function Dock(
  { iconRef, dotRef, docked = false, onAppClick, appLabel = 'Back to top' },
  ref
) {
  return (
    <div className={`dock${docked ? ' is-docked' : ''}`} ref={ref}>
      <div className="dock-shelf">
        <div className="dock-item">
          <button
            type="button"
            className="dock-icon dock-app"
            ref={iconRef}
            onClick={onAppClick}
            aria-label={appLabel}
            aria-hidden={docked ? undefined : true}
            tabIndex={docked ? 0 : -1}
          >
            <img src={iconMark} alt="" />
          </button>
          <span className="dock-dot dock-dot--app" ref={dotRef} aria-hidden="true" />
        </div>
        {MAIN.map((app) => (
          <Tile key={app.name} app={app} />
        ))}
        <div className="dock-sep" aria-hidden="true" />
        {AFTER_DIVIDER.map((app) => (
          <Tile key={app.name} app={app} />
        ))}
      </div>
    </div>
  );
});

export default Dock;
