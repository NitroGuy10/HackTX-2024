// components/CharSelect.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import Typewriter from 'typewriter-effect'; 

interface CharSelectProps {
  onCharacterSelect: (character: string) => void;
  showCharSelect: boolean;
}

const CharSelect: React.FC<CharSelectProps> = ({ onCharacterSelect, showCharSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const characters = [
    { name: "Frog", src: "/assets/FROG/recoil_froghead.svg", gif: "/assets/heart_sparkle.gif" },
    { name: "Bird", src: "/assets/BIRD/recoil_birdhead.svg", gif: "/assets/heart_sparkle.gif" },
    { name: "Fox", src: "/assets/FOX/recoil_foxhead.svg", gif: "/assets/heart_sparkle.gif" },
  ];

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    onCharacterSelect(character);
  };

return (
    <div className={` flex flex-col transition-opacity duration-700 z-40 ${
              showCharSelect ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
        <div className="flex space-x-4 p-4 justify-center">
            <p className="font-scroll text-white text-3xl">Player Select</p>
        </div>
        <div className="flex space-x-4 p-4">
            {characters.map((character) => (
                <div
                key={character.name}
                className="relative cursor-pointer"
                onClick={() => handleCharacterSelect(character.name)}
                >
                <Image
                    src={character.src}
                    alt={character.name}
                    width={75} // Set the desired width
                    height={75} // Set the desired height
                    className={`rounded-md transition-opacity duration-700 ${
                    showCharSelect ? "opacity-100" : "opacity-0 pointer-events-none"
                    } hover:opacity-75`} // Add hover effect
                />
                {selectedCharacter === character.name && (
                    <Image
                    src={character.gif}
                    alt={`${character.name} hover effect`}
                    width={33} // Set the same size as the character images
                    height={33}
                    className="absolute -inset-y-8 inset-x-5" // Positioning it over the character image
                    />
                )}
                </div>
            ))}
            </div>
            <div className=" border-white border stroke-border px-10 py-5 font-scroll text-white">
                {showCharSelect && (
                    <Typewriter
                    onInit={(typewriter) => { 
                        typewriter.typeString('Choose Your Character') 
                        .start(); 
                    }} 
                    />
                )}

      </div>
    </div>
  );
};

export default CharSelect;
