import iconMark from '../assets/logo/icon-mark-chrome.png';
import './Brand.css';

export default function Brand() {
  return (
    <div className="brand">
      <img className="brand-mark" src={iconMark} alt="" aria-hidden="true" />
      <div className="brand-text">
        <span className="brand-name">Ronielle Maranan</span>
        <span className="brand-role">Software Engineer</span>
      </div>
    </div>
  );
}
