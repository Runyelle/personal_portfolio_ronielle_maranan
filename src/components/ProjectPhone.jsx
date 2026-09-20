import { useLayoutEffect, useRef, useState } from 'react';
import { IPhoneMockup } from 'react-device-mockup';
import './ProjectPhone.css';

// react-device-mockup (IPhoneIslandPortrait, frameOnly) derives everything from
// screenWidth with these ratios; mirrored here so the phone can be fitted to the
// space the Projects panel actually has.
const SCREEN_H = 19.5 / 9; // mHeight = screenWidth * 2.1667
const FRAME = 14 / 390; // frameWidth on each side
const SW_MIN = 200;
const SW_MAX = 410;

const radiusOf = (sw) => Math.max(Math.floor((sw * 64) / 390), 1);

function useFittedScreenWidth() {
  const stageRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(SW_MIN);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    // clientWidth/clientHeight are layout sizes, unaffected by the scale
    // transform Showcase applies to panels while scrolling
    const measure = () => {
      const byHeight = el.clientHeight / (SCREEN_H + 2 * FRAME);
      const byWidth = el.clientWidth / (1 + 2 * FRAME);
      const next = Math.max(SW_MIN, Math.min(SW_MAX, Math.floor(Math.min(byHeight, byWidth))));
      setScreenWidth((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return [stageRef, screenWidth];
}

// The project screenshots are wide desktop captures, so the phone shows them as
// an app-style project screen (shot as a header image) rather than cropping one
// into a portrait frame.
export default function ProjectPhone({ project, frame, isHovered }) {
  const [stageRef, screenWidth] = useFittedScreenWidth();
  const screenHeight = Math.floor(screenWidth * SCREEN_H);
  // the screen is authored at 390pt (iPhone logical width) and zoomed to fit
  const zoom = screenWidth / 390;

  return (
    <div className="pp-stage" ref={stageRef}>
      <div
        className="pp-device"
        style={{ borderRadius: radiusOf(screenWidth) + Math.round(screenWidth * FRAME) }}
      >
        <IPhoneMockup
          screenWidth={screenWidth}
          hideStatusBar
          hideNavBar
          frameOnly
          frameColor="#1c1c1e"
        >
          <div className="pp-screen" style={{ width: 390, height: screenHeight / zoom, zoom }}>
            <div className="pp-statusbar">
              <span>9:41</span>
              <span className="pp-statusbar-right" aria-hidden="true">
                <i className="pp-signal" />
                <i className="pp-battery" />
              </span>
            </div>

            {/* keyed on the name so every swap replays the fade */}
            <div className="pp-app" key={project.name}>
              <div className="pp-shot">
                {project.shots.map((src, i) => (
                  <img key={src} src={src} alt="" className={i === frame % project.shots.length ? 'is-on' : ''} />
                ))}
              </div>

              <div className="pp-body">
                <span className="pp-eyebrow">
                  {isHovered ? project.tag : 'Hover a project'}
                </span>
                <h3 className="pp-name">{project.name}</h3>
                <p className="pp-blurb">{project.blurb}</p>

                <div className="pp-tech">
                  <span className="pp-tech-head">Tech</span>
                  <ul>
                    {project.tech.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pp-links">
                  <span className="pp-pill">Code</span>
                  {project.live && <span className="pp-pill pp-pill--live">Live</span>}
                </div>
              </div>
            </div>

            <div className="pp-home" aria-hidden="true" />
          </div>
        </IPhoneMockup>
      </div>
    </div>
  );
}
