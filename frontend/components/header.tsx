import { useState } from "react";
import Link from "next/link";
import HeaderGif from "@/components/HeaderGif";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // NO OPACITY RN BUT CAN BE INVISIBLE
      <header
        className={`fixed top-0 w-full bg-black z-10 px-4 lg:px-6 h-14 flex flex-col items-center transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-100" 
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link className="flex items-center justify-center py-2" href="#">
          <HeaderGif/>
        </Link>
      </header>
  );
}
