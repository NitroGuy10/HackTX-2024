import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
import pygame

class SnekEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    def __init__(self, num_food=50):
        super(SnekEnv, self).__init__()
        self.food_picked_up = 0
        # Canvas size
        self.canvas_size = 600
        self.grid_size = 20  # Size of each grid cell for rendering
        self.num_food = num_food  # Number of food items

        # Define action and observation space
        self.action_space = spaces.Discrete(3)  # Actions: 0 = turn left, 1 = turn right, 2 = boost
        self.observation_space = spaces.Box(
            low=0, high=255, shape=(self.canvas_size, self.canvas_size, 3), dtype=np.uint8
        )

        # Initialize environment-specific variables
        self.player = {"x": 300, "y": 300}  # Start position of the player
        self.food_positions = []  # List of food positions
        self.direction = 0  # Starting direction: 0 = right, 90 = up, 180 = left, 270 = down
        self.speed = 1  # Normal movement speed
        self.boost_speed = 1  # Boost movement speed
        self.reset()

        # Initialize pygame
        pygame.init()
        self.screen = pygame.display.set_mode((self.canvas_size, self.canvas_size))
        pygame.display.set_caption("Snek Environment")

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.food_picked_up = 0
        # Reset player position to the center and direction to right
        self.player["x"], self.player["y"] = 300, 300
        self.direction = 0  # Start facing right

        # Generate initial food locations
        self.generate_food()

        # Create initial canvas
        self.canvas = np.zeros((self.canvas_size, self.canvas_size, 3), dtype=np.uint8)
        self.update_canvas()

        return self.canvas, {}

    def generate_food(self):
        """Generate random food positions on the canvas."""
        self.food_positions = [
            {"x": random.randint(20, self.canvas_size - 20), "y": random.randint(20, self.canvas_size - 20)}
            for _ in range(self.num_food)
        ]

    def update_canvas(self):
        """Update the canvas with player and food positions."""
        self.canvas.fill(0)  # Clear canvas
        # Draw food
        for food in self.food_positions:
            self.canvas[food["y"]-5:food["y"]+5, food["x"]-5:food["x"]+5] = [0, 255, 0]
        # Draw player
        self.canvas[self.player["y"]-5:self.player["y"]+5, self.player["x"]-5:self.player["x"]+5] = [255, 0, 0]

    def step(self, action):
        speed = self.speed  # Default speed
        # Update direction based on action
        if action == 0:  # Turn left
            self.direction = (self.direction + 90) % 360
        elif action == 1:  # Turn right
            self.direction = (self.direction - 90) % 360
        elif action == 2:  # Boost
            speed = self.boost_speed
        else:
            speed = self.speed

        # Calculate the new position based on the direction
        if self.direction == 0:  # Right
            self.player["x"] = min(self.player["x"] + speed, self.canvas_size - 1)
        elif self.direction == 90:  # Up
            self.player["y"] = max(self.player["y"] - speed, 0)
        elif self.direction == 180:  # Left
            self.player["x"] = max(self.player["x"] - speed, 0)
        elif self.direction == 270:  # Down
            self.player["y"] = min(self.player["y"] + speed, self.canvas_size - 1)

        # Reset speed after boost
        speed = self.speed

        # Check if the player has picked up any food
        reward = -1  # Default penalty
        for i, food in enumerate(self.food_positions):
            if abs(self.player["x"] - food["x"]) < 10 and abs(self.player["y"] - food["y"]) < 10:
                # Remove the collected food and generate a new one
                self.food_positions[i] = {
                    "x": random.randint(20, self.canvas_size - 20),
                    "y": random.randint(20, self.canvas_size - 20)
                }
                reward = 10  # Reward for picking up food
                self.food_picked_up += 1
                break

        # Update the canvas
        self.update_canvas()

        # Set `done` and `truncated` flags (we don't end the episode here)
        if self.player["x"] <= 0 or self.player["x"] >= self.canvas_size - 1 or self.player["y"] <= 0 or self.player["y"] >= self.canvas_size - 1:
            done = True
            truncated = True
            print(self.food_picked_up)
        else:
            done = False
            truncated = False
        info = {}
        print(self.food_picked_up)
        # self.render()
        return self.canvas, reward, done, truncated, info

    def render(self, mode="human"):
        if mode == "human":
            # Handle pygame events to allow window closure
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit()

            # Fill background with black
            self.screen.fill((0, 0, 0))

            # Draw each food item as a green square
            for food in self.food_positions:
                pygame.draw.rect(
                    self.screen,
                    (0, 255, 0),
                    pygame.Rect(food["x"] - 5, food["y"] - 5, 10, 10)
                )

            # Draw player as a red square
            pygame.draw.rect(
                self.screen,
                (255, 0, 0),
                pygame.Rect(self.player["x"] - 5, self.player["y"] - 5, 10, 10)
            )

            # Update the display
            pygame.display.flip()

    def close(self):
        pygame.quit()
