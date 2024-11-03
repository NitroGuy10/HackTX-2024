
import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import Typewriter from 'typewriter-effect';

interface GameContainerProps {
  showGame: boolean;
}

const GameContainer: React.FC<GameContainerProps> = ({ showGame }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);


  return (
    <div className={` flex flex-col transition-opacity duration-700 ${showGame ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
      <div className="flex space-x-4 p-4">
        <Image
          src="/assets/arcade_frame.png"
          alt="frame"
          className={`w-full  rounded-md -z-10`}
          width={500}
          height={500}>
        </Image>
      </div>
    </div>
  );
};

export default GameContainer;
