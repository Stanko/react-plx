import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import animateScroll from "animated-scroll-to";
import Explosion from "./explosion";
import Phone from "./phone";
import Links from "./links";
import StickyText from "./sticky-text";
import Plx from "../src/index";

import type { PlxItem } from "../src/index";

const titleData: PlxItem[] = [
  {
    start: 5,
    duration: 220,
    startOffset: "100vh",
    properties: [
      {
        startValue: 1,
        endValue: -360,
        property: "rotate",
      },
      {
        startValue: "#e34e47",
        endValue: "#995eb2",
        property: "color",
      },
    ],
  },
];

const Example = () => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useState(false);
  useEffect(() => {
    const button = document.querySelector(".ScrollToTop");
    const handler = () => {
      animateScroll(0, { minDuration: 3000 });
    };
    button?.addEventListener("click", handler);

    return () => {
      button?.removeEventListener("click", handler);
    };
  });

  return (
    <div className="Demo">
      <Links freeze={isFrozen} disabled={isDisabled} />
      <div className="Content">
        <Plx
          tagName="h2"
          className="ExamplesTitle"
          parallaxData={titleData}
          onPlxStart={() => console.log("Plx - onPlxStart callback ")}
          onPlxEnd={() => console.log("Plx - onPlxEnd callback")}
          freeze={isFrozen}
          disabled={isDisabled}
        >
          Examples
        </Plx>
        <h3>Make things explode</h3>
        <Explosion freeze={isFrozen} disabled={isDisabled} />
        <h3>Animate nested elements</h3>
        <Phone freeze={isFrozen} disabled={isDisabled} />
        <div className="StickyText-trigger" />
        <StickyText freeze={isFrozen} disabled={isDisabled} />
      </div>

      <div className="Controls">
        <button onClick={() => setIsFrozen(!isFrozen)}>{isFrozen ? "Unfreeze" : "Freeze"}</button>
        <button onClick={() => setIsDisabled(!isDisabled)}>{isDisabled ? "Enable" : "Disable"}</button>
      </div>
    </div>
  );
};

const container = document.getElementById("demo");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <Example />
  </StrictMode>
);
