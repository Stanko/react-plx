import React from "react";
import Plx from "../src/index";

const linksData = [
  {
    start: 0,
    end: ".Footer",
    properties: [
      {
        startValue: 0,
        endValue: 720,
        property: "rotate",
      },
    ],
  },
  {
    start: 0,
    end: "50%",
    properties: [
      {
        startValue: 1,
        endValue: 2,
        property: "scale",
      },
      {
        startValue: 1,
        endValue: 2,
        property: "scale",
      },
    ],
  },
  {
    start: "50%",
    end: ".Footer",
    properties: [
      {
        startValue: 2,
        endValue: 1,
        property: "scale",
      },
    ],
  },
];

const Links = (props) => {
  return (
    <div className="Links">
      <Plx {...props} className="Links-plx" parallaxData={linksData}>
        <div className="Links-circle" />
        <div className="Links-circle" />
        <div className="Links-circle" />
      </Plx>
      <div className="Links-content">
        <a href="https://www.npmjs.com/package/react-plx">npm</a>
        <a href="https://github.com/Stanko/react-plx">GitHub</a>
        <a href="https://muffinman.io">My blog</a>
      </div>
    </div>
  );
};

export default Links;
