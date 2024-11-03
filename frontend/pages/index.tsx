import { Button } from "@/components/ui/button"
import Header from "../components/header";
import { useState, useEffect } from "react";
import SquareGrid from "@/components/SquareGrid";
import WeightGrid from "@/components/WeightGrid";
import Game from "@/components/Game";

type Coord = {
  x: number,
  y: number
}


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
      <Header/>

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
              {playing && <p>Playing as {player}</p>}
            </p>
          </div>}

          
          {!showGame &&<div className="flex flex-col items-center space-y-4 text-center absolute inset-0 justify-center">
            <div className={`space-y-2 text-4xl font-bold transition-opacity duration-700 ${showGame ? "opacity-0" : "opacity-100"}`}>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white font-custom">
                recoil
              </h1>
            </div>
            <div className="space-x-4">
              <Button onClick={() => setShowGame(true)} className={`px-6 py-3 text-lg font-medium text-black bg-white rounded-md transition-opacity duration-700 ${showGame ? "opacity-0" : "opacity-100"}`}>
                play
              </Button>
            </div>
          </div>}
          
          
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-1 bg-black">
        <p className="text-xs text-white font-minimal text-center">made by: for hacktx 2024 :)</p>
      </footer>
      <WeightGrid />
    </div>
  )
}