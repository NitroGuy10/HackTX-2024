import { Sketch, SketchProps } from "@p5-wrapper/react";
import React, { useEffect, useState, useRef } from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { canvasSize } from "@/pages";

type ComponentProps = {
  canvasSize: number;
  player: string;
  playing: boolean;
  mouseDown: boolean;
};

type CoordLists = {
  x: number[],
  y: number[]
}

type Coord = {
  x: number,
  y: number
}




type MySketchProps = SketchProps & ComponentProps & {
  segments: CoordLists;
  otherSegments: CoordLists;
  aiSegments: CoordLists;
  food: CoordLists;
  mousePosition: Coord;
  mouseMove: boolean;
  dead: boolean;
  setDead: (deadness: boolean) => void;
};

const sketch: Sketch<MySketchProps> = p5 => {
  let firstX = Math.round(Math.random() * p5.width - 100) + 50;
  let firstY = Math.round(Math.random() * p5.height - 100) + 50;

  const segments: CoordLists = { x: [firstX, firstX, firstX, firstX, firstX], y: [firstY, firstY, firstY, firstY, firstY] };
  const otherSegments: CoordLists = { x: [0, 0, 0, 0, 0], y: [0, 0, 0, 0, 0] };
  const aiSegments: CoordLists = { x: [0, 0, 0, 0, 0], y: [0, 0, 0, 0, 0] };
  const food: CoordLists = { x: [], y: [] };
  let mousePosition: Coord = { x: 0, y: 0 };
  let mouseDown = false;
  let mouseMove = false;
  let dead = false;
  let player = "player1";
  let lastUnitX = 0;
  let lastUnitY = 0;
  let eatCooldown = 0;
  let speedupCounter = 0;
  let setDead = (deadness: boolean) => { };

  p5.setup = () => {
    p5.createCanvas(canvasSize, canvasSize, p5.WEBGL);
    p5.frameRate(20);

    p5.textFont("Arial");
  };

  p5.updateWithProps = props => {
    if (props.mousePosition) {
      mousePosition = props.mousePosition;
    }
    if (props.mouseDown !== undefined) {
      mouseDown = props.mouseDown;
    }
    if (props.mouseMove !== undefined) {
      mouseMove = props.mouseMove;
    }
    if (props.player) {
      player = props.player;
    }
    if (props.setDead) {
      setDead = props.setDead;
    }
  };

  p5.draw = () => {
    // fetch updates
    fetch("http://localhost:4000/get-segments?player=" + player)
      .then(response => response.json())
      .then(data => {
        otherSegments.x = data.player.x;
        otherSegments.y = data.player.y;
        aiSegments.x = data.ai.x;
        aiSegments.y = data.ai.y;
        food.x = data.food.x;
        food.y = data.food.y;
      });



    if (!dead) {

      let distance = 10;
      if (mouseDown) {
        distance = 20;
        speedupCounter++;
      }
      eatCooldown = Math.max(0, eatCooldown - 1);

      if (speedupCounter > 8) {
        speedupCounter = 0;
        segments.x.pop();
        segments.y.pop();


      }

      if (segments.x.length > 0) {
        // Calculate the direction vector from (x1, y1) to (x2, y2)
        const dx = mousePosition.x - (segments.x[0] || 0);
        const dy = mousePosition.y - (segments.y[0] || (player === "player1" ? 50 : 250));

        // Calculate the length of the vector (distance between points)
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalize the direction vector to have a length of 1
        let unitX = dx / length;
        let unitY = dy / length;
        if (!mouseMove) {
          unitX = lastUnitX;
          unitY = lastUnitY;
        }
        lastUnitX = unitX;
        lastUnitY = unitY;

        // Scale the direction vector to the desired distance
        const newX = (segments.x[0] || 0) + unitX * distance;
        const newY = (segments.y[0] || (player === "player1" ? 50 : 250)) + unitY * distance;

        console.log(dx, dy, length)

        segments.x.unshift(newX);
        segments.x.pop();
        segments.y.unshift(newY);
        segments.y.pop();
        console.log(segments.x, segments.y);
      }
    }



    mouseMove = false;

    //console.log(segments.x[0], segments.y[0]);

    fetch("http://localhost:4000/report-segments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player: player,
        x: segments.x,
        y: segments.y
      })
    });

    // Check if player is dead
    const boundary = 30;
    if (!dead) {
      if (eatCooldown == 0) {
        for (let i = 0; i < food.x.length; i++) {
          if ((food.x[i] - boundary < segments.x[0] && segments.x[0] < food.x[i] + boundary) &&
            (food.y[i] - boundary < segments.y[0] && segments.y[0] < food.y[i] + boundary)) {
            food.x.splice(i, 1);
            food.y.splice(i, 1);
            segments.x.push(segments.x[segments.x.length - 1]);
            segments.y.push(segments.y[segments.y.length - 1]);

            eatCooldown = 10;
            fetch("http://localhost:4000/eat-food", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                foodIdx: i
              })
            });
            break;
          }
        }
      }


      for (let i = 0; i < otherSegments.x.length; i++) {
        if (segments.x.length == 0 || ((otherSegments.x[i] - boundary < segments.x[0] && segments.x[0] < otherSegments.x[i] + boundary) &&
          (otherSegments.y[i] - boundary < segments.y[0] && segments.y[0] < otherSegments.y[i] + boundary))
          || segments.x[0] < 0 || segments.x[0] > p5.width || segments.y[0] < 0 || segments.y[0] > p5.height) {
          dead = true;
          setDead(true);
          console.log("You died!");
          fetch("http://localhost:4000/report-death?player=" + player);

          // Reset player
          const initialX = Math.round(Math.random() * p5.width - 100) + 50;
          const initialY = Math.round(Math.random() * p5.height - 100) + 50;
          segments.x = [initialX, initialX, initialX, initialX, initialX];
          segments.y = [initialY, initialY, initialY, initialY, initialY];
          fetch("http://localhost:4000/report-segments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              player: player,
              x: segments.x,
              y: segments.y
            })
          });
          setTimeout(function () {
            dead = false;
            setDead(false);
          }, 3000);
          break;
        }
      }
    }






    ////////////// draw stuff

    p5.background(0, 0);
    p5.translate(-p5.width / 2, -p5.height / 2);

    if (mouseDown) {
      p5.background(20);
    }

    // p5.fill(255);
    // p5.circle(mousePosition.x, mousePosition.y, 10);

    p5.fill(100, 100, 255)
    for (let i = 0; i < segments.x.length; i++) {
      p5.circle(segments.x[i], segments.y[i], 10);
    }
    p5.fill(255, 100, 100)
    for (let i = 0; i < otherSegments.x.length; i++) {
      p5.circle(otherSegments.x[i], otherSegments.y[i], 10);
    }
    p5.fill(100, 255, 100)
    for (let i = 0; i < aiSegments.x.length; i++) {

    }
    p5.fill(255, 255, 100)
    for (let i = 0; i < food.x.length; i++) {
      p5.circle(food.x[i], food.y[i], 10);
    }

    // if (dead) {
    //   p5.fill(255, 0, 0);
    //   p5.textSize(32);

    //   p5.text("You died!", 10, 30);
    // }
  };
};

export default function Game(props: ComponentProps) {

  const [dead, setDead] = useState(false);
  const [mouseMove, setMouseMove] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 } as Coord);
  const [componentPosition, setComponentPosition] = useState({ x: 0, y: 0 } as Coord);
  const gameRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // goofy ahh interval cuz the canvas is initially tiny
    const interval = setInterval(() => {
      if (gameRef.current) {
        const { x, y } = gameRef.current.getBoundingClientRect();
        setComponentPosition({ x, y });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameRef]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    const mousePosX = Math.round(clientX - componentPosition.x);
    const mousePosY = Math.round(clientY - componentPosition.y);

    if (mousePosX < mousePosition.x - 5 || mousePosX > mousePosition.x + 5 || mousePosY < mousePosition.y - 5 || mousePosY > mousePosition.y + 5) {
      setMouseMove(true);
    }

    setMousePosition({
      x: mousePosX,
      y: mousePosY
    });
  }


  return <div onMouseMove={handleMouseMove} ref={gameRef} className="w-fit border border-dashed z-40 -mt-20">
    {/* <p className="text-white">{mousePosition.x}, {mousePosition.y}</p>
    <p className="text-white">{props.mouseDown ? "Mouse Down" : "Mouse Up"}</p> */}
    <NextReactP5Wrapper sketch={sketch} canvasSize={props.canvasSize} player={props.player} playing={props.playing} mousePosition={mousePosition} mouseDown={props.mouseDown} mouseMove={mouseMove} setDead={setDead} />;
    <p className="text-red-500 font-bold text-2xl">{dead && "Dead!!!!"}</p>
  </div>;
}
