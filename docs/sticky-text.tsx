import React from "react";
import Plx from "../src/index";

const textData = [
  {
    start: ".StickyText-trigger",
    duration: "30vh",
    properties: [
      {
        startValue: 0,
        endValue: -50,
        unit: "vh",
        property: "translateY",
      },
      {
        startValue: 0,
        endValue: 1,
        property: "opacity",
      },
    ],
  },
  {
    start: ".StickyText-trigger",
    startOffset: "60vh",
    duration: "30vh",
    properties: [
      {
        startValue: -50,
        endValue: -100,
        unit: "vh",
        property: "translateY",
      },
      {
        startValue: 1,
        endValue: 0,
        property: "opacity",
      },
    ],
  },
];

const StickyText = (props) => {
  return (
    <Plx {...props} className="StickyText" parallaxData={textData}>
      <h2>Make elements fly in and stick for some time before they fly out</h2>
    </Plx>
  );
};

export default StickyText;
