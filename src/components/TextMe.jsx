import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { answer, engage, getSnapshot, start, subscribe } from '../state/chatStore.js';
import './TextMe.css';

const EMAIL = 'ron.maranan01@gmail.com';
const LINKEDIN = 'https://linkedin.com/in/ronielle-maranan';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.46-2.2 2.96V21H9z" />
    </svg>
  );
}

export default function TextMe() {
  const chat = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const threadRef = useRef(null);

  useEffect(start, []);

  // keep the newest message in view as the conversation grows
  useLayoutEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages, chat.typing]);

  const submit = (e) => {
    e.preventDefault();
    // still parked on the gate: open it and keep whatever they've typed, so the
    // draft is ready to send once the question lands
    if (!chat.ask) {
      engage();
      return;
    }
    const problem = answer(draft);
    setError(problem);
    if (!problem) setDraft('');
  };

  // waiting on a tap still leaves the field live — tapping it is what opens the gate
  const locked = chat.done || (!chat.ask && !chat.waiting);

  return (
    <article className="tm glass">
      {/* the conversation opens on its own but doesn't ask anything until the
          visitor taps in — anywhere in the thread or the composer counts */}
      <div
        className={`tm-thread${chat.waiting ? ' is-waiting' : ''}`}
        ref={threadRef}
        onClick={engage}
      >
        {chat.messages.map((m) => (
          <p key={m.id} className={`tm-bubble tm-bubble--${m.from}${m.italic ? ' is-italic' : ''}`}>
            {m.text}
          </p>
        ))}

        {chat.typing && (
          <p className="tm-bubble tm-bubble--me tm-typing" aria-label="Ronielle is typing">
            <i />
            <i />
            <i />
          </p>
        )}
      </div>

      {chat.sendError && (
        <p className="tm-note mono">
          That didn&rsquo;t send — email me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> instead.
        </p>
      )}

      <div className="tm-composer">
        <a className="tm-icon" href={`mailto:${EMAIL}`} aria-label="Email Ronielle">
          <MailIcon />
        </a>
        <a
          className="tm-icon"
          href={LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ronielle on LinkedIn"
        >
          <LinkedInIcon />
        </a>

        {/* noValidate: the card answers a bad email in the thread's own voice,
            instead of the browser's native validation tooltip */}
        <form
          className={`tm-field${chat.waiting ? ' is-waiting' : ''}`}
          onSubmit={submit}
          onClick={engage}
          onFocus={engage}
          noValidate
        >
          <input
            type={chat.ask?.type === 'email' ? 'email' : 'text'}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            placeholder={chat.done ? 'Talk soon :)' : chat.ask?.placeholder || 'iMessage'}
            aria-label={chat.ask ? chat.ask.placeholder : 'Message'}
            disabled={locked}
            maxLength={500}
          />
          <button type="submit" disabled={locked || !draft.trim()} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 19V5m0 0-6 6m6-6 6 6" />
            </svg>
          </button>
        </form>
      </div>

      {error && <p className="tm-error mono">{error}</p>}
    </article>
  );
}
