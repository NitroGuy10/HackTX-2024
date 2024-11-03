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
        "x": [0, 0, 0, 0, 0],
        "y": [0, 0, 0, 0, 0]
    }
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
  console.log(game.player1);

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

let server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
server.keepAliveTimeout = 30000; 
server.headersTimeout = 31000;
