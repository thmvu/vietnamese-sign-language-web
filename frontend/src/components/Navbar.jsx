import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">🤟 Sign Language</div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/course">Course</Link>
        <Link to="/about">About</Link>
        <Link to="/account">Account</Link>
      </nav>
    </header>
  );
}
