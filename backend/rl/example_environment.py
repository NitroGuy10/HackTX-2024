import gym
import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from collections import deque

# Hyperparameters
GAMMA = 0.99
LEARNING_RATE = 1e-3
BATCH_SIZE = 64
MEMORY_SIZE = 10000
EPSILON_START = 1.0
EPSILON_END = 0.01
EPSILON_DECAY = 0.995
TARGET_UPDATE_FREQ = 10

# Environment
env = gym.make("CartPole-v1")
n_actions = env.action_space.n
state_dim = env.observation_space.shape[0]

# Q-Network
class QNetwork(nn.Module):
    def __init__(self, input_dim, output_dim):
        super(QNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, output_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# Initialize Networks
q_network = QNetwork(state_dim, n_actions)
target_network = QNetwork(state_dim, n_actions)
target_network.load_state_dict(q_network.state_dict())
optimizer = optim.Adam(q_network.parameters(), lr=LEARNING_RATE)

# Replay Buffer
memory = deque(maxlen=MEMORY_SIZE)

# Helper Functions
def select_action(state, epsilon):
    if random.random() < epsilon:
        return env.action_space.sample()
    with torch.no_grad():
        state = torch.FloatTensor(state).unsqueeze(0)
        q_values = q_network(state)
        return q_values.argmax().item()

def store_transition(state, action, reward, next_state, done):
    memory.append((state, action, reward, next_state, done))

def sample_batch():
    batch = random.sample(memory, BATCH_SIZE)
    states, actions, rewards, next_states, dones = zip(*batch)
    return (
        torch.FloatTensor(states),
        torch.LongTensor(actions),
        torch.FloatTensor(rewards),
        torch.FloatTensor(next_states),
        torch.FloatTensor(dones)
    )

# Training Loop
epsilon = EPSILON_START
for episode in range(500):
    state, _ = env.reset()
    total_reward = 0

    while True:
        action = select_action(state, epsilon)
        next_state, reward, done, _, _ = env.step(action)
        total_reward += reward

        store_transition(state, action, reward, next_state, done)

        state = next_state

        if len(memory) >= BATCH_SIZE:
            states, actions, rewards, next_states, dones = sample_batch()

            q_values = q_network(states).gather(1, actions.unsqueeze(1)).squeeze(1)
            next_q_values = target_network(next_states).max(1)[0]
            targets = rewards + (1 - dones) * GAMMA * next_q_values

            loss = nn.MSELoss()(q_values, targets.detach())

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        if done:
            print(f"Episode {episode + 1}, Total Reward: {total_reward}, Epsilon: {epsilon:.3f}")
            break

    # Decay epsilon
    epsilon = max(EPSILON_END, epsilon * EPSILON_DECAY)

    # Update target network
    if (episode + 1) % TARGET_UPDATE_FREQ == 0:
        target_network.load_state_dict(q_network.state_dict())

env.close()
