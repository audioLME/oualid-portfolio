const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Svg,
  Mouse,
  MouseConstraint
} = Matter;

// REQUIRED for concave SVGs
Matter.Common.setDecomp(window.decomp);

// ENGINE
const engine = Engine.create();
engine.gravity.y = 0.45;

// CANVAS
const canvas = document.getElementById("world");
const w = canvas.parentElement.clientWidth;
const h = canvas.parentElement.clientHeight;

const render = Render.create({
  canvas,
  engine,
  options: {
    width: w,
    height: h,
    background: "transparent",
    wireframes: false
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// FLOOR
Composite.add(engine.world,
  Bodies.rectangle(w / 2, h + 80, w * 1.2, 160, {
    isStatic: true,
    render: { visible: false }
  })
);

// LETTERS
const paths = document.querySelectorAll("#letters path");
const spacing = 130;
const startX = 200;

paths.forEach((path, i) => {
  const vertices = Svg.pathToVertices(path, 20);

const body = Bodies.fromVertices(
  startX + i * spacing,
  -200,
  vertices,
  {
    restitution: 0.05,
    friction: 0.9,
    frictionAir: 0.08,
    density: 0.002,
    render: {
      fillStyle: "#111",
      strokeStyle: "#111",
      lineWidth: 1
    }
  },
  true
);

  Composite.add(engine.world, body);
});

// MOUSE
const mouse = Mouse.create(render.canvas);
Composite.add(engine.world,
  MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.08,
      damping: 0.2,
      render: { visible: false }
    }
  })
);
