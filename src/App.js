import { useEffect, useMemo, useState, useRef } from "react";
import { animated, useSpring } from "react-spring";

import "./styles.css";

const images = [
  "/images/hadesWide.jpg",
  "/images/peglinWide.jpg",
  "/images/gungeonWide.jpg",
  "/images/revitaWide.jpg",
  "/images/rogueLegacy2Wide.jpg",
  "/images/deadCellsWide.jpg",
  "/images/ravenswatch.jpg",
  "/images/hollowKnightWide.jpg",
  "/images/celesteWide.jpg",
  "/images/haveANiceDeathWide.jpg",
  "/images/stiltFellaWide.jpg",
  "/images/domeKeeperWide.jpg",
  "/images/chefsquad.jpg",
  "/images/tinyRogues.jpg"
];

const jokes = [
  "/images/cumingFear.jpg", // everyone
  "/images/deception4Wide.jpg", // me
  "/images/sc2.png", // bally
  "/images/subverse.jpg", // tacocat
  "/images/fairyside.jpg" // vdude
];

const JOKE_CHANCE = 0.02;

const spinSound = new Audio("/audio/pirate song.mp3");
const spinSound2 = new Audio("/audio/spinning.mp3");
const spinSound3 = new Audio("/audio/nya.mp3");
const spinSound4 = new Audio("/audio/stinky.mp3");
const ha1 = new Audio("/audio/ha1.mp3");
const ha2 = new Audio("/audio/ha2.mp3");
const ha3 = new Audio("/audio/ha3.mp3");

function* spinSoundGenerator() {
  while (true) {
    yield spinSound;
    yield spinSound2;
    yield spinSound3;
    yield spinSound4;
  }
}

const getSpinSound = spinSoundGenerator();

function* laughGenerator() {
  while (true) {
    yield ha1.play();
    yield ha2.play();
    yield ha3.play();
  }
}

const laugher = laughGenerator();
// for (let i = 0; i < 18; i++) {
//   setTimeout(() => {
//     laugher.next();
//   }, 275 * i + 5000);
// }

function shuffle(items = []) {
  const pool = [...items];
  const shuffled = [];
  while (pool.length) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    shuffled.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }

  return shuffled;
}

function Clown(props) {
  const springs = useSpring({
    from: {
      x: 275,
      y: 450,
      height: 200,
      zIndex: 0,
      transform: "scale(0)"
    },
    to: {
      x: 100,
      y: 100,
      height: 200,
      zIndex: 3000,
      transform: "scale(1)"
    },
    config: {
      frequency: 1,
      damping: 0.5,
      clamp: true
    },
    loop: true,
    onRest() {
      laugher.next();
    }
  });

  return (
    <animated.div style={{ ...springs }}>
      <img src="/images/haelClown.png" alt="clown" />
    </animated.div>
  );
}

function Reel(props) {
  const { images, isLoaded, children } = props;
  const [numSpins, setNumSpins] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [springs, api] = useSpring(() => ({
    from: {
      y: -(images.length + 1) * 500
    },
    config: {
      frequency: 5,
      damping: 1,
      clamp: true
    }
  }));

  const shuffledImages = useMemo(() => {
    const ordered = shuffle(images);
    const newItems = [];
    if (Math.random() < JOKE_CHANCE && jokes.length) {
      let randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      newItems.push(
        <img className="game-art" alt="game-art" src={randomJoke} key="joke" />
      );
    }

    for (let i = 0; i < 2; i++) {
      newItems.push(
        ...ordered.map((src) => (
          <img
            className="game-art"
            alt="game art"
            src={src}
            key={`${src}${i}`}
          />
        ))
      );
    }
    return newItems;
  }, [images, numSpins]);

  return (
    <div className="reel">
      <img className="frame" src="/images/haelRotate8x.webp" alt="haelRotate" />
      <div className="reel-container">
        <animated.div style={{ ...springs }}>{shuffledImages}</animated.div>
      </div>
      <button
        className="spin-button"
        disabled={!isLoaded || isSpinning}
        onClick={() => {
          setNumSpins(numSpins + 1);
          api.start({
            from: {
              y: -(images.length + 1) * 500
            },
            to: {
              y: 0
            },
            onRest() {
              laugher.next();
              setIsSpinning(false);

              const knockEvent = new CustomEvent("knock", {
                detail: {
                  direction: Math.random() * Math.PI * 2
                }
              });
              document.dispatchEvent(knockEvent);
            },
            config: {
              frequency: 4,
              damping: 0.95,
              clamp: true
            }
          });

          const knockEvent = new CustomEvent("knock", {
            detail: {
              direction: Math.random() * Math.PI * 2
            }
          });
          document.dispatchEvent(knockEvent);

          const nextSpinSound = getSpinSound.next().value;
          nextSpinSound.currentTime = 0;
          nextSpinSound.play();

          setIsSpinning(true);
        }}
      >
        Gargalon Deez Games
      </button>
      {children}
    </div>
  );
}

function GooglyEye(props) {
  // <3 vdude
  const ref = useRef(null);
  const { diameter = 150, x = 0, y = 0 } = props;
  const [springs, api] = useSpring(() => ({
    from: {
      x: diameter / 4,
      y: diameter / 4
    }
  }));

  useEffect(() => {
    function knock(radians) {
      const origin = { x: diameter / 4, y: diameter / 4 };
      const targetX = origin.x + (Math.cos(radians) * diameter) / 8;
      const targetY = origin.y + (Math.sin(radians) * diameter) / 8;

      api.start({
        to: [{ x: targetX, y: targetY }, origin],
        config: {
          mass: 10,
          tension: 250,
          friction: 1,
          clamp: false
        }
      });
    }

    function knockHandler(e) {
      knock(e.detail?.direction);
    }
    document.addEventListener("knock", knockHandler);

    return () => {
      document.removeEventListener("knock", knockHandler);
    };
  }, [api, diameter]);

  const outerStyle = {
    left: x,
    top: y,
    width: diameter,
    height: diameter
  };

  return (
    <div ref={ref} className="googly-eye" style={outerStyle}>
      <animated.div className="iris" style={{ ...springs }}></animated.div>
    </div>
  );
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const preloadContainerRef = useRef(null);

  useEffect(() => {
    Promise.all(
      images.map(
        (src) =>
          new Promise((resolve, reject) => {
            const img = document.createElement("img");
            preloadContainerRef.current.appendChild(img);
            img.onload = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <div className="App">
      {/* <Clown /> */}
      <Reel images={images} isLoaded={isLoaded}>
        <GooglyEye x={270} y={40} />
        <GooglyEye x={490} y={250} />
      </Reel>
      <div ref={preloadContainerRef} className="preload-container"></div>
    </div>
  );
}
