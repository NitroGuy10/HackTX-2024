import gymnasium as gym
import rl.base_env as base_env
from stable_baselines3 import PPO, A2C  # Import PPO or A2C instead of DQN
from stable_baselines3.common.vec_env import DummyVecEnv, VecTransposeImage, VecMonitor
import torch
import time

model_path = "ppo_snek.zip" 


env = base_env.SnekEnv()
vec_env = DummyVecEnv([lambda: env])
vec_env = VecTransposeImage(vec_env)
vec_env = VecMonitor(vec_env)

try:
    model = PPO.load(model_path, env=vec_env)
    print(f"Successfully loaded model from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")


def predict(obs):
    action, _states = model.predict(obs, deterministic=False)
    return action
