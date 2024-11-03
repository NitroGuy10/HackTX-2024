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
    learning_rate=1e-4,     # Slightly increased learning rate for faster learning
    n_steps=512,             # Reduce for more frequent updates
    batch_size=128,            # Remain at 64; try 128 if performance allows
    gamma=0.98,               # Lower gamma for shorter-term reward focus
    gae_lambda=0.95,
    clip_range=0.2,
    ent_coef=0.01,            # Slightly higher entropy for more exploration
    vf_coef=0.5,
    max_grad_norm=0.5,
    device='cuda'
)


# Train the model
model.learn(total_timesteps=100000, progress_bar=True)

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
        # print(obs)
        episode_reward += reward
        steps += 1

    print(f"Episode {episode}: Total Reward = {episode_reward}, Steps = {steps}")

# Close environment after evaluation
vec_env.close()
env.close()
print("Evaluation completed and environment closed.")
