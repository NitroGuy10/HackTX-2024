import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
      <header
        className={`px-4 lg:px-6 h-14 flex items-center transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link className="flex items-center justify-center" href="#">
          <span className="sr-only">Acme Games</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 text-white">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Home
          </Link>
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Games
          </Link> */}
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </Link> */}
        </nav>
      </header>
  );
}
