export default function Navbar() {
  return (
    <div className="navbar px-5" id="desktop">
      <div className="flex-1">
        <a href="/" className="uppercase text-xl">
          <strong>seiji.life</strong>
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#experience">Experience</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
