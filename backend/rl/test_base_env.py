import gymnasium as gym
import base_env
from stable_baselines3 import PPO, A2C  # Import PPO or A2C instead of DQN
from stable_baselines3.common.vec_env import DummyVecEnv, VecTransposeImage, VecMonitor
import torch
import time

# Initialize your custom environment
env = base_env.SnekEnv()

# Vectorize the environment
vec_env = DummyVecEnv([lambda: env])
vec_env = VecTransposeImage(vec_env)
vec_env = VecMonitor(vec_env)

# Define the model
policy_type = 'MultiInputPolicy'

# Choose either PPO or A2C and initialize the model
model = PPO(
    policy=policy_type,
    env=vec_env,
    verbose=0,
    tensorboard_log="./huh/",
    learning_rate=1e-4, 
    n_steps=2048,  # Number of steps per update (larger values for PPO)
    batch_size=64,  # PPO typically uses a larger batch size
    gamma=0.99, 
    gae_lambda=0.95,  # GAE parameter (specific to PPO/A2C)
    clip_range=0.2,   # PPO-specific clipping range
    ent_coef=0.01,    # Entropy coefficient for exploration
    vf_coef=0.5,      # Value function coefficient
    max_grad_norm=0.5,
    device='cuda'
)

# Train the model
model.learn(total_timesteps=500000, log_interval=10, progress_bar=True)

# Save the model
model.save("ppo_snek")
print("Model saved!")

vec_env.close()

# Load and evaluate the trained model
model_path = "ppo_snek.zip" 
num_episodes = 5 
render = True 

env = base_env.SnekEnv()
vec_env = DummyVecEnv([lambda: env])
vec_env = VecTransposeImage(vec_env)
vec_env = VecMonitor(vec_env)

try:
    model = PPO.load(model_path, env=vec_env)
    print(f"Successfully loaded model from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")

# Evaluation loop
for episode in range(1, num_episodes + 1):
    obs = vec_env.reset()
    done = False
    truncated = False
    episode_reward = 0
    steps = 0

    while not done and not truncated:
        if render:
            env.render()
            time.sleep(0.05)

        action, _states = model.predict(obs, deterministic=False)
        obs, reward, done, info = vec_env.step(action)
        episode_reward += reward
        steps += 1

    print(f"Episode {episode}: Total Reward = {episode_reward}, Steps = {steps}")

# Close environment after evaluation
vec_env.close()
env.close()
print("Evaluation completed and environment closed.")
