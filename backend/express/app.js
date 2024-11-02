const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.disable('etag');
const PORT = 4000;

let game = {
  player1: {
    "segments": {
        "x": [0, 0, 0, 0, 0],
        "y": [0, 0, 0, 0, 0]
    }
  },
  
  player2: {
    "segments": {
        "x": [0, 0, 0, 0, 0],
        "y": [100, 100, 100, 100, 100]
    }
  },
  
  ai: {
    "segments": {
        "x": [0, 0, 0, 0, 0],
        "y": [0, 0, 0, 0, 0]
    }
  },

  food: {
    "x": [600, 600, 600, 600, 600],
    "y": [600, 600, 600, 600, 600]
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
  } else if (data.player === 'player2') {
    game.player2.segments.x = data.x;
    game.player2.segments.y = data.y;
  }
  console.log(game.player1);

  res.send('OK');
});

// GET route to retrieve segments
app.get('/get-segments', (req, res) => {
  const player = req.query.player;
  const returnData = {
    ai: game.ai.segments,
  };

  if (player === 'player1') {
    returnData.player = game.player2.segments;
  } else if (player === 'player2') {
    returnData.player = game.player1.segments;
  }

  // console.log(returnData);
  res.json(returnData);
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