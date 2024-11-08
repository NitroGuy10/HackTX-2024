import { Button } from "@/components/ui/button"
import Header from "../components/header";
import Link from "next/link";
import { useEffect, useState } from "react";
import SquareGrid from "@/components/SquareGrid";
import WeightGrid from "@/components/WeightGrid";
import Image from "next/image";
import HeaderGif from "@/components/HeaderGif";
import Game from "@/components/Game";


export const canvasSize = 500;
// export const backendUrl = "http://recoil-game.ngrok.app";
export const backendUrl = "http://localhost:4000";  

import CharSelect from "@/components/CharSelect";
import GameContainer from "@/components/GameContainer";



export default function Component() {
  const [showHome, setShowHome] = useState(true);
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    console.log("Selected character:", character);
  };

  // GAME STUFF
  const [player, setPlayer] = useState("player1");
  const [playing, setPlaying] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };




  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-30 px-4 lg:px-6 h-14 flex flex-col items-center`}>
        <Link className={`flex items-center justify-center transition-opacity duration-300 ${!showHome ? "opacity-100" : "opacity-0 pointer-events-none"
          }`} href="#" onClick={() => { setShowCharSelect(false); setShowGame(false); setShowHome(true) }}>
          <HeaderGif />
        </Link>
      </header>

      {/* Main body + Game */}
      <main className="flex-1">
        <section className="w-full h-screen py-12 md:py-24 lg:py-32 xl:py-48 bg-black" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
          {showGame &&
            <div className={`z-40 flex flex-col items-center space-y-4 text-center transition-opacity duration-700 ${showGame ? "opacity-100" : "opacity-0"}`}>
              {playing && <Game canvasSize={canvasSize} player={player} playing={playing} mouseDown={isMouseDown} sprite={selectedCharacter || ""} />}

              {/* <h2 className="text-3xl font-semibold text-white">Game Content</h2> */}
              <p className="z-40 mt-32 px-6 py-3 text-lg font-medium text-white rounded-none font-custom transition-opacity duration-700">
                <button
                  onClick={() => { setPlayer("player1"); setPlaying(true); }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded transition duration-300"
                >
                  Player 1
                </button>
                <button
                  onClick={() => { setPlayer("player2"); setPlaying(true); }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded transition duration-300 ml-4"
                >
                  Player 2
                </button>
  
              </p>
            </div>}


          {!showGame && <div>
            <div className="flex flex-col items-center space-y-4 text-center absolute inset-0 justify-center">
              <div className={`space-y-2 text-4xl font-bold transition-opacity duration-700 ${showGame ? "opacity-0" : "opacity-100"}`}>
                <Image
                  src="/assets/ui/recoil header files/recoil_headeranim.gif"
                  alt="recoil"
                  className={`w-full h-24 object-cover rounded-md transition-opacity duration-700 ${!showHome ? "opacity-0 pointer-events: none;" : "opacity-100 "}`}
                  width={154}
                  height={69}
                />

              </div>
              <Image
                src="/assets/recoil_groupdraftflat.png"
                alt="mascots"
                className={`w-auto object-cover rounded-md transition-opacity duration-700 ${!showHome ? "opacity-0 pointer-events: none" : "opacity-100"}`}
                width={300}
                height={200}
              />
              <div className="space-x-4">
                <Button onClick={() => {
                  setShowGame(false);
                  setShowCharSelect(true);
                  setShowHome(false);
                }}
                  className={`px-6 py-3 text-lg font-medium text-white font-custom rounded-md transition-opacity duration-700 z-40
              ${!showHome ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                  play
                </Button>
              </div>
            </div>
            <div className={`flex flex-col items-center space-y-4 text-center absolute inset-x-10 transition-opacity duration-700 ${showCharSelect && !showGame ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
              <CharSelect onCharacterSelect={handleCharacterSelect} showCharSelect={showCharSelect} />

              {selectedCharacter && (
                <Button onClick={() => {
                  setShowGame(true);
                  setShowCharSelect(false);
                  setShowHome(false);
                }}
                  className={`px-6 py-3 text-lg font-medium text-white rounded-none font-custom transition-opacity
                   duration-700 
              ${selectedCharacter ? "opacity-100 z-40" : "opacity-0 pointer-events-none"}`}>start</Button>
              )}
            </div>
            
          </div>}
          <div className={`flex flex-col items-center space-y-4 text-center absolute inset-0 transition-opacity duration-700 ${showGame || showCharSelect ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}>
              <Image
                src="/assets/arcade_frame.png"
                alt="frame"
                className={`w-full h-screen -z-10`}
                priority
                width={300}
                height={100}>
              </Image>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-1">
        <p className="text-xs text-white font-custom text-center">made by: <span className="text-pink-200">broyo</span> for hacktx 2024 :)</p>
      </footer>
    </div>
  )
}