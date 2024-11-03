import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
import pygame

class SnekEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    def __init__(self, num_food=25, repeat_threshold=6, repeat_penalty=-0.5):
        super(SnekEnv, self).__init__()
        self.food_picked_up = 0
        self.repeat_threshold = repeat_threshold
        self.repeat_penalty = repeat_penalty
        self.last_action = None
        self.repeat_count = 0
        self.current_step = 0

        # Canvas and grid configuration
        self.canvas_size = 600
        self.grid_size = 20
        self.num_food = num_food

        # Define action and observation space
        self.action_space = spaces.Discrete(3)  # 0 = turn left, 1 = turn right, 2 = go straight
        
        # Observation space includes agent position, nearest food coordinates, and x/y distances to food
        self.observation_space = spaces.Dict({
            "agent_info": spaces.Box(low=0, high=self.canvas_size, shape=(2,), dtype=np.float32),  # x, y
            "nearest_food": spaces.Box(low=0, high=self.canvas_size, shape=(2,), dtype=np.float32),  # food_x, food_y
            "food_distance": spaces.Box(low=-self.canvas_size, high=self.canvas_size, shape=(2,), dtype=np.float32)  # dx, dy
        })

        # Initialize player and food
        self.player = {"x": self.canvas_size // 2, "y": self.canvas_size // 2}
        self.food_positions = []
        self.direction = 0  # Initial direction facing right (0 degrees)
        self.speed = 5
        self.reset()

        pygame.init()
        self.screen = pygame.display.set_mode((self.canvas_size, self.canvas_size))
        pygame.display.set_caption("Snek Environment")

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.food_picked_up = 0
        self.last_action = None
        self.repeat_count = 0
        self.current_step = 0
        self.player["x"], self.player["y"] = self.canvas_size // 2, self.canvas_size // 2
        self.direction = 0  # Start facing right

        self.generate_food()
        return self.get_observation(), {}

    def generate_food(self):
        self.food_positions = [
            {"x": random.randint(20, self.canvas_size - 20), "y": random.randint(20, self.canvas_size - 20)}
            for _ in range(self.num_food)
        ]

    def get_nearest_food(self):
        distances = [((food["x"] - self.player["x"]) ** 2 + (food["y"] - self.player["y"]) ** 2, food) 
                     for food in self.food_positions]
        return min(distances, key=lambda x: x[0])[1] if distances else None

    def get_observation(self):
        nearest_food = self.get_nearest_food()
        if nearest_food:
            food_x, food_y = nearest_food["x"], nearest_food["y"]
            dx = food_x - self.player["x"]
            dy = food_y - self.player["y"]
        else:
            food_x, food_y = 0, 0
            dx, dy = 0, 0

        agent_info = np.array([self.player["x"], self.player["y"]], dtype=np.float32)
        nearest_food = np.array([food_x, food_y], dtype=np.float32)
        food_distance = np.array([dx, dy], dtype=np.float32)

        return {"agent_info": agent_info, "nearest_food": nearest_food, "food_distance": food_distance}

    def step(self, action):
        self.current_step += 1

        if action == self.last_action:
            self.repeat_count += 1
        else:
            self.repeat_count = 1
        self.last_action = action

        reward = 0

        if self.repeat_count > self.repeat_threshold:
            reward += self.repeat_penalty

        # Calculate distance to the nearest food before moving
        previous_distance = self.get_distance_to_nearest_food()

        # Actions
        if action == 0:  # Turn left
            self.direction = (self.direction + 90) % 360
        elif action == 1:  # Turn right
            self.direction = (self.direction - 90) % 360
        elif action == 2:  # Go straight
            pass

        # Update position based on direction
        if self.direction == 0:  # Right
            self.player["x"] = min(self.player["x"] + self.speed, self.canvas_size - 1)
        elif self.direction == 90:  # Up
            self.player["y"] = max(self.player["y"] - self.speed, 0)
        elif self.direction == 180:  # Left
            self.player["x"] = max(self.player["x"] - self.speed, 0)
        elif self.direction == 270:  # Down
            self.player["y"] = min(self.player["y"] + self.speed, self.canvas_size - 1)

        # Calculate distance to the nearest food after moving
        current_distance = self.get_distance_to_nearest_food()

        # Drastically reduced reward for getting closer to the nearest food
        if current_distance < previous_distance:
            reward += 0.1  # Small positive reward for moving closer to food
        elif current_distance > previous_distance:
            reward -= 0.2  # Small penalty for moving away from the food

        # Check if the agent picks up food
        for i, food in enumerate(self.food_positions):
            if abs(self.player["x"] - food["x"]) < 10 and abs(self.player["y"] - food["y"]) < 10:
                reward += 50
                self.food_positions[i] = {
                    "x": random.randint(20, self.canvas_size - 20),
                    "y": random.randint(20, self.canvas_size - 20)
                }
                self.food_picked_up += 1

        # End condition if agent hits wall
        done = (
            self.player["x"] <= 0 or self.player["x"] >= self.canvas_size - 1 or
            self.player["y"] <= 0 or self.player["y"] >= self.canvas_size - 1
        )
        if done:
            reward = -50

        # Check if the maximum step count has been reached
        truncated = self.current_step >= 1000
        return self.get_observation(), reward, done, truncated, {}



    def get_distance_to_nearest_food(self):
        nearest_food = self.get_nearest_food()
        if nearest_food:
            dx = nearest_food["x"] - self.player["x"]
            dy = nearest_food["y"] - self.player["y"]
            return np.sqrt(dx ** 2 + dy ** 2)
        else:
            return float('inf')  # Return a very large distance if no food is found

    def render(self, mode="human"):
        if mode == "human":
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit()

            self.screen.fill((0, 0, 0))
            for food in self.food_positions:
                pygame.draw.rect(self.screen, (0, 255, 0), pygame.Rect(food["x"] - 5, food["y"] - 5, 10, 10))
            pygame.draw.rect(self.screen, (255, 0, 0), pygame.Rect(self.player["x"] - 5, self.player["y"] - 5, 10, 10))
            pygame.display.flip()

    def close(self):
        pygame.quit()
