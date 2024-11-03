import gym
from gym import spaces
import numpy as np

class TwoAgentEnv(gym.Env):
    """
    Custom Environment with support for two agents.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self):
        super(TwoAgentEnv, self).__init__()

        # Define action and observation spaces for each agent
        self.action_space = [spaces.Discrete(2), spaces.Discrete(2)]
        self.observation_space = [spaces.Box(low=-1.0, high=1.0, shape=(3,), dtype=np.float32),
                                  spaces.Box(low=-1.0, high=1.0, shape=(3,), dtype=np.float32)]

        # Initialize states for two agents
        self.state = [np.zeros(3), np.zeros(3)]
        self.steps_taken = 0
        self.max_steps = 100

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)

        # Reset states and steps
        self.state = [np.random.uniform(-1.0, 1.0, (3,)), np.random.uniform(-1.0, 1.0, (3,))]
        self.steps_taken = 0
        
        return self.state, {}

    def step(self, actions):
        """
        Execute one time step for both agents.
        
        Args:
            actions: List of actions [action_agent1, action_agent2]
        """
        self.steps_taken += 1
        done = self.steps_taken >= self.max_steps
        
        # Sample transitions for each agent
        next_state_agent1 = np.random.uniform(-1.0, 1.0, (3,))
        next_state_agent2 = np.random.uniform(-1.0, 1.0, (3,))
        reward_agent1 = 1.0 if actions[0] == 0 else -1.0
        reward_agent2 = 1.0 if actions[1] == 0 else -1.0

        self.state = [next_state_agent1, next_state_agent2]
        rewards = [reward_agent1, reward_agent2]
        info = {"steps_taken": self.steps_taken}
        
        return self.state, rewards, [done, done], [False, False], info

    def render(self, mode="human"):
        print(f"Agent 1 State: {self.state[0]}, Agent 2 State: {self.state[1]}, Steps Taken: {self.steps_taken}")

    def close(self):
        pass
