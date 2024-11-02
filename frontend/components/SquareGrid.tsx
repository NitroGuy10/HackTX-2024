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

  // Determine the total number of squares to display
  const totalSquares = Math.max(greenList.length, redList.length);

  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: totalSquares }).map((_, index) => {
        const isGreen = greenList.includes(index + 1);
        const isRed = redList.includes(index + 1);
        
        return (
          <div
            key={index}
            className={`w-20 h-20 ${
              isGreen ? "bg-green-500" : isRed ? "bg-red-500" : "bg-gray-500"
            }`}
          ></div>
        );
      })}
    </div>
  );
};

export default SquareGrid;
