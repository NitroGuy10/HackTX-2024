import { Sketch, SketchProps } from "@p5-wrapper/react";
import React, { useEffect, useState } from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

type ComponentProps = {
  rotation: number;
};

type MySketchProps = SketchProps & ComponentProps;

const sketch: Sketch<MySketchProps> = p5 => {
  let rotation = 0;

  p5.setup = () => p5.createCanvas(600, 600, p5.WEBGL);

  p5.updateWithProps = props => {
    if (props.rotation) {
      rotation = (props.rotation * Math.PI) / 180;
    }
  };

  p5.draw = () => {
    p5.background(100);
    p5.normalMaterial();
    p5.noStroke();
    p5.push();
    p5.rotateY(rotation);
    p5.rotateX(rotation * 0.5);
    p5.rotateZ(rotation * 0.25);
    p5.box(100);
    p5.pop();
  };
};

export default function Game() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setRotation(rotation => rotation + 1),
      5
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <NextReactP5Wrapper sketch={sketch} rotation={rotation} />;
}
