import { Button } from "@/components/ui/button"
import Header from "../components/header";
import Link from "next/link";
import SquareGrid from "@/components/SquareGrid";
import WeightGrid from "@/components/WeightGrid";
import Image from "next/image";
import HeaderGif from "@/components/HeaderGif";
import { useState } from "react";
import Game from "@/components/Game";


export const canvasSize = 600;


export default function Component() {
  const [showGame, setShowGame] = useState(false);

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
        className={`fixed top-0 w-full bg-black z-10 px-4 lg:px-6 h-14 flex flex-col items-center`}>
        <Link className={`flex items-center justify-center py-2 transition-opacity duration-300 ${
          showGame ? "opacity-100" : "opacity-0 cursor-default disabled:true" 
          }`} href="#" onClick={() => setShowGame(false)}>
          <HeaderGif/>
        </Link>
      </header>

      {/* Main body + Game */}
      <main className="flex-1">
        <section className="w-full h-screen py-12 md:py-24 lg:py-32 xl:py-48 bg-black" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {showGame &&
            <div className={`z-40 flex flex-col items-center space-y-4 text-center transition-opacity duration-700 ${showGame ? "opacity-100" : "opacity-0"}`}>
            {playing && <Game canvasSize={canvasSize} player={player} playing={playing} mouseDown={isMouseDown} />}

            {/* <h2 className="text-3xl font-semibold text-white">Game Content</h2> */}
            <p className="mt-4 text-lg text-white">
              <button onClick={() => {setPlayer("player1"); setPlaying(true)}}>Player 1</button>
              <button onClick={() => {setPlayer("player2"); setPlaying(true)}}>Player 2</button>
              {playing && <span>Playing as {player}</span>}
            </p>
          </div>}

          
          {!showGame &&<div className="flex flex-col items-center space-y-4 text-center absolute inset-0 justify-center">
            <div className={`space-y-2 text-4xl font-bold transition-opacity duration-700 ${showGame ? "opacity-0" : "opacity-100"}`}>
            <Image
              src="/assets/ui/recoil header files/recoil_headeranim.gif"
              alt="recoil"
              className="w-full h-24 object-cover rounded-md"
              width={154}
              height={69}
            />

            </div>
            <Image
                src="/assets/recoil_groupdraftflat.png"
                alt="mascots"
                className={`w-auto object-cover rounded-md transition-opacity duration-700 ${showGame ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                width={300}
                height={200}
              />
            <div className="space-x-4">
              <Button onClick={() => setShowGame(true)} className={`px-6 py-3 text-lg font-medium text-white font-custom bg-black rounded-md transition-opacity duration-700 ${showGame ? "opacity-0" : "opacity-100"}`}>
                play
              </Button>
            </div>
          </div>}
          
          
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-1 bg-black">
        <p className="text-xs text-white font-custom text-center">made by: <span className="text-pink-200">broyo</span> for hacktx 2024 :)</p>
      </footer>
    </div>
  )
}