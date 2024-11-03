const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors')

const app = express();
app.disable('etag');
app.use(cors());
const PORT = 4000;

const canvasSize = 500;

let game = {
  player1: {
    "segments": {
        "x": [0, 0, 0, 0, 0],
        "y": [0, 0, 0, 0, 0]
    },
    "sprite": "Frog"
  },
  
  player2: {
    "segments": {
        "x": [0, 0, 0, 0, 0],
        "y": [canvasSize - 50, canvasSize - 50, canvasSize - 50, canvasSize - 50, canvasSize - 50]
    },
    "sprite": "Frog"
  },
  
  ai: {
    "segments": {
        "x": [canvasSize - 50, canvasSize - 50, canvasSize - 50, canvasSize - 50, canvasSize - 50],
        "y": [0, 0, 0, 0, 0]
    },
    "direction": 2,
  },

  food: {
    "x": [300, 350, 400, 450, 250],
    "y": [300, 350, 400, 450, 250]
  }
}



app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/static')));

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'host.html'));
});

app.get('/player1', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'player.html'));
});

app.get('/player2', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'player.html'));
});

// POST route for reporting player segments
app.post('/report-segments', (req, res) => {
  const data = req.body;
  if (data.player === 'player1') {
    game.player1.segments.x = data.x;
    game.player1.segments.y = data.y;
    game.player1.sprite = data.sprite;
  } else if (data.player === 'player2') {
    game.player2.segments.x = data.x;
    game.player2.segments.y = data.y;
    game.player2.sprite = data.sprite;
  }
  else if (data.player === 'ai') {
    game.ai.segments.x = data.x;
    game.ai.segments.y = data.y;
  }
  console.log(game.player1);

  fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player_x: game.player1.segments.x[0],
      player_y: game.player1.segments.y[0],
      nf_x: game.food.x[0],
      nf_y: game.food.y[0],
    }),
  }).then((response) => {
    return response.json();
  }
  ).then((data) => {
    game.ai.direction = data.action;
  }
  ).catch((error) => {
    console.error("Error:", error);
  });

  res.send('OK');
});

// GET route to retrieve segments
app.get('/get-segments', (req, res) => {
  const player = req.query.player;
  const returnData = {
    ai: game.ai.segments,
    food: game.food
  };

  if (player === 'player1') {
    returnData.player = game.player2.segments;
    returnData.otherSprite = game.player2.sprite;

    returnData.ai_direction = game.ai.direction;
  } else if (player === 'player2') {
    returnData.player = game.player1.segments;
    returnData.otherSprite = game.player1.sprite;
  }

  // console.log(returnData);
  res.json(returnData);
});

app.post("/eat-food", (req, res) => {
  const data = req.body;
  const foodIdx = data.foodIdx;
  game.food.x.splice(foodIdx, 1);
  game.food.y.splice(foodIdx, 1);
  game.food.x.push(Math.floor(Math.random() * (canvasSize - 80) + 40));
  game.food.y.push(Math.floor(Math.random() * (canvasSize - 80) + 40));

  console.log("Food eaten");
  res.send("OK");
});

app.get("/report-death", (req, res) => {
  const player = req.query.player;
  console.log(player + " died");
  res.send("OK");
});

app.get('/', (req, res) => {
  res.send('<p>Hello, World!</p>');
});

// Route that proxies requests to localhost:5000
app.use("/flask/*", async (req, res) => {
  try {
    // Build the URL based on the incoming request path and query
    const url = `http://localhost:5000${req.originalUrl.replace("/flask", "")}`;

    // Forward the request to the backend with the same method and body
    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "localhost:5000", // Override host header for local backend
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
    });

    // Get response data and headers
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying request:", error);
    res.status(500).json({ error: "Failed to fetch from backend" });
  }
});

let server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
server.keepAliveTimeout = 30000; 
server.headersTimeout = 31000;
