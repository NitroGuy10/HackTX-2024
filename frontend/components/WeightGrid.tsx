// src/components/WeightGrid.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const GRID_ROWS = 10; // Must match backend GRID_SIZE
const GRID_COLS = 10;

// Define the shape of the API response
interface WeightsResponse {
  weights: number[];
}

const WeightGrid: React.FC = () => {
  const [weights, setWeights] = useState<number[]>([]);

  // Fetch weights from the backend
  const fetchWeights = async () => {
    try {
      const response = await axios.get<WeightsResponse>('http://127.0.0.1:5000/api/weights');
      setWeights(response.data.weights);
    } catch (error) {
      console.error('Error fetching weights:', error);
    }
  };

  // Trigger a training step and fetch updated weights
  const trainModel = async () => {
    try {
      const response = await axios.post<WeightsResponse>('http://127.0.0.1:5000/api/train');
      setWeights(response.data.weights);
    } catch (error) {
      console.error('Error training model:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWeights();
  }, []);

  return (
      <div className="grid grid-cols-10 gap-3 py-2">
        {weights.map((weight: number, index: number) => {
          const normalizedWeight = Math.abs(weight) / 1.0; // Assuming INITIAL_WEIGHT_RANGE = 1
          const size = 10 + normalizedWeight * 30; // Base size + scaled size
          const color = weight > 0 ? '#4caf50' : '#f44336'; // Green for positive, red for negative

          return (
            <motion.div
              key={index}
              className="circle"
              style={{
                backgroundColor: color,
              }}
              animate={{
                width: size,
                height: size,
                borderRadius: size / 2,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              title={`Weight ${index}: ${weight.toFixed(2)}`}
            />
          );
        })}
      </div>
  );
};

export default WeightGrid;
