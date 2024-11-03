import React from "react";
import WeightGrid from "@/components/WeightGrid";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeathModal: React.FC<GameOverModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Only render if isOpen is true

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-lg mx-auto">
        <h2 className="text-2xl font-bold text-red-600 font-custom">Game Over</h2>
        <WeightGrid/>
        <p className="mt-2 text-gray-700">
          You have lost the game. Better luck next time!
        </p>
        <button
          onClick={onClose} // Trigger onClose to hide the modal
          className="mt-4 px-4 text-white bg-red-600 rounded-md hover:bg-red-700 font-custom" 
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DeathModal;
