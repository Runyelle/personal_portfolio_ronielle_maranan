// Shared state for the <TextMe /> chat card.
//
// The card is rendered twice (Showcase "Outside Work" slide + Contact section)
// and both instances are the same conversation: answer in either one and both
// update, and both lock once it's finished. A module-level store (rather than
// component state) is what makes that work, and it also enforces the "one
// conversation per page load" rule — a refresh resets it.

const TYPING_MS = 900; // "..." bubble before one of my messages lands
const GAP_MS = 380; // beat between two of my messages
const REPLY_MS = 700; // beat before the scripted "Sounds good" reply

// from: 'me' = Ronielle (left, grey), 'them' = the visitor (right, blue)
// ask: pause here and wait for the visitor to type; the answer is saved under this key
// gate: pause here until the visitor taps into the card — the opener plays on its
//   own, but nothing asks them anything until they show up
export const SCRIPT = [
  { from: 'me', text: 'Want to work together? Just wanna chat? Hit me up (no nonchalant).' },
  { from: 'them', text: 'Sounds good 👍' },
  { gate: true },
  { from: 'me', text: "What's your name?" },
  { ask: true, key: 'name', placeholder: 'Your name' },
  { from: 'me', text: 'Nice to meet you 👋' },
  { from: 'me', text: 'What you wanna talk about?' },
  { ask: true, key: 'topic', placeholder: 'What’s on your mind' },
  { from: 'me', text: 'Muy interesante', italic: true },
  { from: 'me', text: "What's your email?" },
  { ask: true, key: 'email', placeholder: 'you@example.com', type: 'email' },
  { from: 'me', text: 'Thanks' },
  { from: 'me', text: 'Anything else you wanna tell me?' },
  { ask: true, key: 'extra', placeholder: 'Anything else' },
  { from: 'me', text: 'Bet, gtg tho 🙌' },
  { from: 'me', text: "I'll hit you back up as soon as i can" },
  { from: 'me', text: 'Talk soon :)' },
];

const MAX_LENGTH = 500;
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

let state = {
  messages: [], // { id, from, text, italic }
  typing: false, // show the "..." bubble
  ask: null, // the SCRIPT step waiting on an answer, or null
  waiting: false, // parked on a gate — waiting for a tap on the card
  answers: {},
  done: false, // conversation finished — locked until a refresh
  sendError: false, // the email didn't go through; the card offers a fallback
};

let listeners = new Set();
let step = 0;
let started = false;
let nextId = 0;

const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const push = (message) =>
  emit({ messages: [...state.messages, { id: nextId++, ...message }] });

async function send(answers) {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    emit({ sendError: true });
  }
}

// walk the script until it needs the visitor, then stop and wait for answer()
function run() {
  const current = SCRIPT[step];

  if (!current) {
    emit({ done: true, ask: null });
    return;
  }

  if (current.gate) {
    emit({ waiting: true, typing: false });
    return;
  }

  if (current.ask) {
    emit({ ask: current, typing: false });
    return;
  }

  if (current.from === 'them') {
    setTimeout(() => {
      push({ from: 'them', text: current.text });
      step += 1;
      run();
    }, REPLY_MS);
    return;
  }

  emit({ typing: true });
  setTimeout(() => {
    emit({ typing: false });
    push({ from: 'me', text: current.text, italic: current.italic });
    step += 1;
    setTimeout(run, GAP_MS);
  }, TYPING_MS);
}

export function start() {
  if (started) return;
  started = true;
  run();
}

// the visitor tapped the thread or the composer — step past the gate they're parked on
export function engage() {
  if (!state.waiting) return;
  emit({ waiting: false });
  step += 1;
  run();
}

// returns an error string to show under the composer, or null when accepted
export function answer(rawText) {
  const text = rawText.trim().slice(0, MAX_LENGTH);
  const { ask } = state;
  if (!ask || state.done) return null;
  if (!text) return 'Type something first.';
  if (ask.type === 'email' && !isEmail(text)) return "That doesn't look like an email.";

  push({ from: 'them', text });
  const answers = { ...state.answers, [ask.key]: text };
  emit({ answers, ask: null });
  step += 1;

  // the last answer completes the form — send it while I "type" the goodbyes
  if (ask.key === 'extra') send(answers);

  setTimeout(run, GAP_MS);
  return null;
}

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => state;
