# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import torch
import torch.nn as nn
import torch.optim as optim
import random

# -----------------------------
# Configuration Parameters
# -----------------------------
GRID_SIZE = 10          # Grid will be GRID_SIZE x GRID_SIZE
THRESHOLD = 0.5         # Weight threshold

# -----------------------------
# Define the Neural Network
# -----------------------------
class SimpleNet(nn.Module):
    def __init__(self, input_size=10, hidden_size=10):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        # You can add more layers if desired

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        return out

# Initialize the model
input_size = GRID_SIZE  # For visualization purposes
hidden_size = GRID_SIZE
model = SimpleNet(input_size=input_size, hidden_size=hidden_size)
optimizer = optim.SGD(model.parameters(), lr=0.01)
criterion = nn.MSELoss()

# -----------------------------
# Initialize Flask App
# -----------------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# -----------------------------
# Utility Functions
# -----------------------------
def get_weights_grid():
    weights = model.fc1.weight.data.clone().view(-1).tolist()
    # Ensure the weights fit the grid
    if len(weights) < GRID_SIZE * GRID_SIZE:
        weights += [0.0] * (GRID_SIZE * GRID_SIZE - len(weights))
    else:
        weights = weights[:GRID_SIZE * GRID_SIZE]
    return weights

def simulate_training_step():
    # Generate random input and target
    input_tensor = torch.randn(1, input_size)
    target = torch.randn(1, hidden_size)

    # Forward pass
    output = model(input_tensor)
    loss = criterion(output, target)

    # Backward pass and optimization
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# -----------------------------
# API Routes
# -----------------------------

@app.route('/api/weights', methods=['GET'])
def get_weights():
    weights = get_weights_grid()
    return jsonify({'weights': weights})

@app.route('/api/train', methods=['POST'])
def train_model():
    simulate_training_step()
    weights = get_weights_grid()
    return jsonify({'weights': weights})

@app.route('/')
def index():
    return "Neural Network Weights Visualization API"

# -----------------------------
# Run the Flask App
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
