import { Sketch, SketchProps } from "@p5-wrapper/react";
import React, { useEffect, useState, useRef } from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { canvasSize } from "@/pages";
import { backendUrl } from "@/pages";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type ComponentProps = {
  canvasSize: number;
  player: string;
  playing: boolean;
  mouseDown: boolean;
  headImg: string;
  bodyImg: string;
  sprite: string;
};

type CoordLists = {
  x: number[],
  y: number[]
}

type Coord = {
  x: number,
  y: number
}

const characters = {
  "Frog": {
    head: "/assets/FROG/recoil_froghead.png",
    body: "/assets/FROG/recoil_frogbody.png",
  },
  "Bird": {
    head: "/assets/BIRD/recoil_birdhead.png",
    body: "/assets/BIRD/recoil_birdbod.png",
  },
  "Fox": {
    head: "/assets/FOX/recoil_foxhead.png",
    body: "/assets/FOX/recoil_foxbody.png",
  },
  "": {
    head: "",
    body: "",
  }
};


type MySketchProps = SketchProps & ComponentProps & {
  mousePosition: Coord;
  mouseMove: boolean;
  dead: boolean;
  setDead: (deadness: boolean) => void;
  setJoyStickDirection: (direction: string) => void;
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
  let headImg: p5.Image;
  let bodyImg: p5.Image;
  let foodImg: p5.Image;
  let sprite = "";
  let otherSprite = "";
  let otherHead: p5.Image;
  let otherBody: p5.Image;
  let setJoystickDirection = (direction: string) => { };

  p5.setup = () => {
    p5.createCanvas(canvasSize, canvasSize, p5.WEBGL);
    p5.frameRate(20);

    p5.textFont("Arial");
    p5.imageMode(p5.CENTER);

    foodImg = p5.loadImage("/assets/heart_sparkle.gif");
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
    if (props.bodyImg && !bodyImg) {
      bodyImg = p5.loadImage(props.bodyImg);
    }
    if (props.headImg && !headImg) {
      headImg = p5.loadImage(props.headImg);
    }
    if (props.sprite && props.sprite !== sprite) {
      sprite = props.sprite;
      headImg = p5.loadImage(characters[sprite].head);
      bodyImg = p5.loadImage(characters[sprite].body);
    }
    if (props.setJoystickDirection) {
      setJoystickDirection = props.setJoystickDirection;
    }
  };

  p5.draw = () => {
    // fetch updates
    fetch(backendUrl + "/get-segments?player=" + player)
      .then(response => response.json())
      .then(data => {
        otherSegments.x = data.player.x;
        otherSegments.y = data.player.y;
        aiSegments.x = data.ai.x;
        aiSegments.y = data.ai.y;
        food.x = data.food.x;
        food.y = data.food.y;

        otherSprite = data.otherSprite;
        otherHead = p5.loadImage(characters[otherSprite].head);
        otherBody = p5.loadImage(characters[otherSprite].body);
      });



    if (!dead) {

      let distance = 10;
      if (mouseDown) {
        distance = 20;
        speedupCounter++;
      }
      eatCooldown = Math.max(0, eatCooldown - 1);

      if (speedupCounter > 3) {
        speedupCounter = 0;
        segments.x.pop();
        segments.y.pop();


      }

      if (segments.x.length > 0) {
        // Calculate the direction vector from (x1, y1) to (x2, y2)
        const dx = mousePosition.x - (segments.x[0] || 0);
        const dy = mousePosition.y - (segments.y[0] || (player === "player1" ? 50 : 250));

        if (dx > 20) {
          setJoystickDirection("right");
        }
        else if (dx < -20) {
          setJoystickDirection("left");
        }
        else {
          setJoystickDirection("center");
        }

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

    fetch(backendUrl + "/report-segments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player: player,
        sprite: sprite,
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

            eatCooldown = 4;
            fetch(backendUrl + "/eat-food", {
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
          fetch(backendUrl + "/report-death?player=" + player);

          // Reset player
          const initialX = Math.round(Math.random() * p5.width - 100) + 50;
          const initialY = Math.round(Math.random() * p5.height - 100) + 50;
          segments.x = [initialX, initialX, initialX, initialX, initialX];
          segments.y = [initialY, initialY, initialY, initialY, initialY];
          fetch(backendUrl + "/report-segments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              player: player,
              sprite: sprite,
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

    // if (mouseDown) {
    //   p5.background(20);
    // }

    // p5.fill(255);
    // p5.circle(mousePosition.x, mousePosition.y, 10);

    p5.fill(100, 100, 255)
    for (let i = 1; i < segments.x.length; i++) {
      // p5.circle(segments.x[i], segments.y[i], 10);
      p5.image(bodyImg, segments.x[i], segments.y[i], 20, 20);
    }
    if (segments.x.length > 0) {
      p5.image(headImg, segments.x[0], segments.y[0], 30, 30);
    }

    if (otherBody && otherHead) {
      for (let i = 1; i < otherSegments.x.length; i++) {
        // p5.circle(segments.x[i], segments.y[i], 10);
        p5.image(otherBody, otherSegments.x[i], otherSegments.y[i], 20, 20);
      }
      if (otherSegments.x.length > 0) {
        p5.image(otherHead, otherSegments.x[0], otherSegments.y[0], 30, 30);
      }
    }

    p5.fill(100, 255, 100)
    for (let i = 0; i < aiSegments.x.length; i++) {

    }
    p5.fill(255, 255, 100)
    for (let i = 0; i < food.x.length; i++) {
      // p5.circle(food.x[i], food.y[i], 10);
      p5.image(foodImg, food.x[i], food.y[i], 50, 50);
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
  const [joystickDirection, setJoystickDirection] = useState("center");


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
    <AnimatePresence>
      {dead && <motion.div
        initial={{ scale: 0, rotate: 360 }}
        animate={{ rotate: 0, scale: 1 }}
        exit={{ scale: 0, rotate: -180 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
      >
        <p className="text-red-400 font-bold font-custom text-5xl">You died!</p>
      </motion.div>}
    </AnimatePresence>

    <Image src={"/assets/joystick_" + joystickDirection + ".png"} alt="joystick" width={200} height={200} className="absolute top-[600px] left-[1100px] " />
    <Image src={"/assets/pinkbutton" + (props.mouseDown ? "_down" : "") + ".png"} alt="button" width={130} height={130} className="absolute top-[670px] left-[300px] " />
    
    <NextReactP5Wrapper sketch={sketch} canvasSize={props.canvasSize} player={props.player} playing={props.playing} mousePosition={mousePosition} mouseDown={props.mouseDown} mouseMove={mouseMove} setDead={setDead} headImg={props.headImg} bodyImg={props.bodyImg} sprite={props.sprite} setJoystickDirection={setJoystickDirection} />;
  </div>;
}
