import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import random
from backend.rl.two_agent_environment import TwoAgentEnv

# Define Q-Network for each agent
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

# Training Setup for Two Agents
env = TwoAgentEnv()
state_dim = env.observation_space[0].shape[0]
n_actions = env.action_space[0].n

# Initialize networks, optimizers, and replay buffers for each agent
agents = [
    {"network": QNetwork(state_dim, n_actions), "target_network": QNetwork(state_dim, n_actions), 
     "optimizer": optim.Adam(params=QNetwork(state_dim, n_actions).parameters(), lr=1e-3), 
     "memory": deque(maxlen=10000), "epsilon": 1.0},
    {"network": QNetwork(state_dim, n_actions), "target_network": QNetwork(state_dim, n_actions), 
     "optimizer": optim.Adam(params=QNetwork(state_dim, n_actions).parameters(), lr=1e-3), 
     "memory": deque(maxlen=10000), "epsilon": 1.0}
]

GAMMA = 0.99
EPSILON_END = 0.01
EPSILON_DECAY = 0.995
BATCH_SIZE = 64
TARGET_UPDATE_FREQ = 10

def select_action(agent, state):
    if random.random() < agent["epsilon"]:
        return env.action_space[0].sample()
    with torch.no_grad():
        state = torch.FloatTensor(state).unsqueeze(0)
        q_values = agent["network"](state)
        return q_values.argmax().item()

def store_transition(agent, state, action, reward, next_state, done):
    agent["memory"].append((state, action, reward, next_state, done))

def sample_batch(agent):
    batch = random.sample(agent["memory"], BATCH_SIZE)
    states, actions, rewards, next_states, dones = zip(*batch)
    return (
        torch.FloatTensor(states),
        torch.LongTensor(actions),
        torch.FloatTensor(rewards),
        torch.FloatTensor(next_states),
        torch.FloatTensor(dones)
    )

# Training loop
for episode in range(500):
    states, _ = env.reset()
    total_rewards = [0, 0]

    while True:
        actions = [select_action(agents[0], states[0]), select_action(agents[1], states[1])]
        next_states, rewards, dones, _, _ = env.step(actions)

        for i, agent in enumerate(agents):
            store_transition(agent, states[i], actions[i], rewards[i], next_states[i], dones[i])
            total_rewards[i] += rewards[i]
            
            # Training each agent
            if len(agent["memory"]) >= BATCH_SIZE:
                states, actions, rewards, next_states, dones = sample_batch(agent)
                
                q_values = agent["network"](states).gather(1, actions.unsqueeze(1)).squeeze(1)
                next_q_values = agent["target_network"](next_states).max(1)[0]
                targets = rewards + (1 - dones) * GAMMA * next_q_values
                
                loss = nn.MSELoss()(q_values, targets.detach())
                agent["optimizer"].zero_grad()
                loss.backward()
                agent["optimizer"].step()

            if dones[i]:
                agent["epsilon"] = max(EPSILON_END, agent["epsilon"] * EPSILON_DECAY)

        states = next_states

        if all(dones):
            print(f"Episode {episode + 1}, Rewards: {total_rewards}")
            break

    # Update target networks
    if (episode + 1) % TARGET_UPDATE_FREQ == 0:
        for agent in agents:
            agent["target_network"].load_state_dict(agent["network"].state_dict())

env.close()
