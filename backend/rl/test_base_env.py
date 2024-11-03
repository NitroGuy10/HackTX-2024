import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
import numpy as np
from stable_baselines3 import DQN
from stable_baselines3.common.evaluation import evaluate_policy
from stable_baselines3.common.env_checker import check_env
from base_env import SnekEnv
# Assuming SnekEnv is already defined as shown in previous code
env = SnekEnv()

# Check if the environment follows the gym interface
check_env(env)

# Create the DQN model
model = DQN("CnnPolicy", env, verbose=1, buffer_size=50000, learning_starts=1000, batch_size=32, target_update_interval=500, gamma=0.99, exploration_fraction=0.1, exploration_final_eps=0.02, tensorboard_log="./snek_dqn_tensorboard/")

# Train the agent
model.learn(total_timesteps=50000, log_interval=4)

# Save the trained model
model.save("snek_dqn_model")

# # Load the model for evaluation or further training
# model = DQN.load("snek_dqn_model")

# # Evaluate the agent
# mean_reward, std_reward = evaluate_policy(model, env, n_eval_episodes=10)
# print(f"Mean reward: {mean_reward} +/- {std_reward}")

# # Test the trained agent
# obs = env.reset()
# for _ in range(1000):
#     action, _states = model.predict(obs, deterministic=True)
#     obs, reward, done, _, info = env.step(action)
#     env.render()
#     if done:
#         obs = env.reset()

env.close()
