// components/SquareGrid.tsx

import { useEffect, useState } from "react";

interface SquareData {
  greenList: number[];
  redList: number[];
}

const SquareGrid: React.FC = () => {
  const [greenList, setGreenList] = useState<number[]>([]);
  const [redList, setRedList] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/squares");
        const data: SquareData = await response.json();
        setGreenList(data.greenList);
        setRedList(data.redList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Create a 5x5 grid
  const gridSize = 5;

  // Create a 2D array for the grid
  const grid = Array.from({ length: gridSize }, (_, rowIndex) =>
    Array.from({ length: gridSize }, (_, colIndex) => {
      const squareIndex = rowIndex * gridSize + colIndex + 1; // Calculate the square ID (1-based)
      const isGreen = greenList.includes(squareIndex);
      const isRed = redList.includes(squareIndex);
      return { id: squareIndex, isGreen, isRed };
    })
  );

  return (
    <div className="grid grid-cols-5 gap-2"> {/* Add spacing between rows and columns */}
      {grid.flat().map((square) => ( // Flatten the grid and map over squares directly
        <div
          key={square.id}
          className={`w-10 h-10 ${
            square.isGreen ? "bg-green-500" : square.isRed ? "bg-red-500" : "bg-gray-500"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default SquareGrid;
