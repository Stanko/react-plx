import React, {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BezierEasing from "bezier-easing";
// @ts-ignore
import ScrollManager from "window-scroll-manager";

// ------------ Constants

// Regex that checks for numbers in string
// formatted as "{number}{unit}" where unit is "px", "vh", "%" or none
const START_END_DURATION_REGEX = /^-?\d+(\.\d+)?(px|vh|%)?$/;

const DEFAULT_UNIT = "px";
const DEFAULT_ANGLE_UNIT = "deg";
const ANGLE_PROPERTIES = ["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY", "skewZ", "hueRotate"];

const EASINGS = {
  ease: [0.25, 0.1, 0.25, 1.0],
  easeIn: [0.42, 0.0, 1.0, 1.0],
  easeOut: [0.0, 0.0, 0.58, 1.0],
  easeInOut: [0.42, 0.0, 0.58, 1.0],
  easeInSine: [0.47, 0, 0.745, 0.715],
  easeOutSine: [0.39, 0.575, 0.565, 1],
  easeInOutSine: [0.445, 0.05, 0.55, 0.95],
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInQuart: [0.895, 0.03, 0.685, 0.22],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInQuint: [0.755, 0.05, 0.855, 0.06],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
  easeInExpo: [0.95, 0.05, 0.795, 0.035],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeInOutExpo: [1, 0, 0, 1],
  easeInCirc: [0.6, 0.04, 0.98, 0.335],
  easeOutCirc: [0.075, 0.82, 0.165, 1],
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
};

// Color regex

// 0 - 199 | 200 - 249 | 250 - 255
const REGEX_0_255 = "(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])";
// 0.0 - 1.9999...
const REGEX_0_1 = "([01](\\.\\d+)?)";
// 00 - FF
const REGEX_TWO_HEX_DIGITS = "([a-f\\d]{2})";

const HEX_REGEX = new RegExp(`^#${REGEX_TWO_HEX_DIGITS}${REGEX_TWO_HEX_DIGITS}${REGEX_TWO_HEX_DIGITS}$`, "i");
const RGB_REGEX = new RegExp(`^rgb\\(${REGEX_0_255},${REGEX_0_255},${REGEX_0_255}\\)$`, "i");
const RGBA_REGEX = new RegExp(`^rgba\\(${REGEX_0_255},${REGEX_0_255},${REGEX_0_255},${REGEX_0_1}\\)$`, "i");

const SCROLL_OFFSET = 50;

const RESIZE_DEBOUNCE_TIMEOUT = 150;

type TransformOrFilterMethod = (value: number | string, unit?: string) => string;

// CSS transform map
const TRANSFORM_MAP: { [name: string]: TransformOrFilterMethod | undefined } = {
  rotate: (value: number | string, unit = DEFAULT_ANGLE_UNIT) => `rotate(${value}${unit})`,
  rotateX: (value: number | string, unit = DEFAULT_ANGLE_UNIT) => `rotateX(${value}${unit})`,
  rotateY: (value: number | string, unit = DEFAULT_ANGLE_UNIT) => `rotateY(${value}${unit})`,
  rotateZ: (value: number | string, unit = DEFAULT_ANGLE_UNIT) => `rotateZ(${value}${unit})`,
  scale: (value: number | string) => `scale(${value})`,
  scaleX: (value: number | string) => `scaleX(${value})`,
  scaleY: (value: number | string) => `scaleY(${value})`,
  scaleZ: (value: number | string) => `scaleZ(${value})`,
  skew: (value: number | string, unit = DEFAULT_UNIT) => `skew(${value}${unit})`,
  skewX: (value: number | string, unit = DEFAULT_UNIT) => `skewX(${value}${unit})`,
  skewY: (value: number | string, unit = DEFAULT_UNIT) => `skewY(${value}${unit})`,
  skewZ: (value: number | string, unit = DEFAULT_UNIT) => `skewZ(${value}${unit})`,
  translateX: (value: number | string, unit = DEFAULT_UNIT) => `translateX(${value}${unit})`,
  translateY: (value: number | string, unit = DEFAULT_UNIT) => `translateY(${value}${unit})`,
  translateZ: (value: number | string, unit = DEFAULT_UNIT) => `translateZ(${value}${unit})`,
};

// Order of CSS transforms matters
const ORDER_OF_TRANSFORMS = [
  "translateX",
  "translateY",
  "translateZ",
  "skew",
  "skewX",
  "skewY",
  "skewZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
];

// CSS properties that use color values
const COLOR_PROPERTIES = [
  "backgroundColor",
  "borderBottomColor",
  "borderColor",
  "borderLeftColor",
  "borderRightColor",
  "borderTopColor",
  "color",
  "fill",
  "stroke",
];

// CSS filter map
// blur()
// brightness()
// contrast()
// grayscale()
// hue-rotate()
// invert()
// opacity() // use opacityFilter
// saturate()
// sepia()

// Not supported
// drop-shadow()
// url()

const FILTER_MAP: { [name: string]: TransformOrFilterMethod | undefined } = {
  blur: (value: number | string, unit = DEFAULT_UNIT) => `blur(${value}${unit})`,
  brightness: (value: number | string) => `brightness(${value})`,
  contrast: (value: number | string) => `contrast(${value})`,
  grayscale: (value: number | string) => `grayscale(${value})`,
  hueRotate: (value: number | string, unit = DEFAULT_ANGLE_UNIT) => `hue-rotate(${value}${unit})`,
  invert: (value: number | string) => `invert(${value})`,
  opacityFilter: (value: number | string) => `opacity(${value})`,
  saturate: (value: number | string) => `saturate(${value})`,
  sepia: (value: number | string) => `sepia(${value})`,
};

const FILTER_PROPERTIES = [
  "blur",
  "brightness",
  "contrast",
  "grayscale",
  "hueRotate",
  "invert",
  "opacityFilter",
  "saturate",
  "sepia",
];

// ------------ Types

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type PlxProperty = {
  startValue: string | number;
  endValue: string | number;
  property: string;
  unit?: string;
};

type EasingNames =
  | "ease"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc";

type Easing = EasingNames | [number, number, number, number] | ((t: number) => number);

type StartEnd = `{number}px` | `{number}%` | `{number}vh` | "self" | string | number | HTMLElement;

type Duration = `{number}px` | `{number}%` | `{number}vh` | string | number | HTMLElement;

export type PlxItem = {
  start: StartEnd;
  startOffset?: string | number;
  duration?: Duration;
  end?: StartEnd;
  endOffset?: string | number;
  properties: PlxProperty[];
  easing?: Easing;
  name?: string;
};

export interface PlxProps extends React.HTMLAttributes<HTMLDivElement> {
  animateWhenNotInViewport?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  freeze?: boolean;
  parallaxData: PlxItem[];
  style?: CSSProperties;
  onPlxStart?: () => void;
  onPlxEnd?: () => void;
}

type Segment = {
  easing?: Easing;
  durationInPx: number;
  properties: PlxProperty[];
  startInPx: number;
};

type GenericObject = { [name: string]: number | string };
type GenericStringObject = { [name: string]: string };

// ------------ Helpers

// Get element's top offset
function getElementTop(el: HTMLElement) {
  let top = 0;
  let element: HTMLElement | null = el;

  do {
    top += element.offsetTop || 0;
    element = element.offsetParent as HTMLElement;
  } while (element);

  return top;
}

// Returns CSS unit
function getUnit(property: string, unit?: string) {
  let propertyUnit = unit || DEFAULT_UNIT;

  if (ANGLE_PROPERTIES.indexOf(property) >= 0) {
    propertyUnit = unit || DEFAULT_ANGLE_UNIT;
  }

  return propertyUnit;
}

// Takes string value (in px/vh/%) and returns number
function getValueInPx(value: string, maxScroll: number): number {
  const floatValue = parseFloat(value);
  const unit = value.match(START_END_DURATION_REGEX)?.[2] || null;
  const vh = window.innerHeight / 100;

  let valueInPx: number;

  switch (unit) {
    case "vh":
      valueInPx = vh * floatValue;
      break;
    case "%":
      valueInPx = (maxScroll * floatValue) / 100;
      break;
    default:
      valueInPx = floatValue;
  }

  return valueInPx;
}

// Takes start/end/duration props
// and return number (in pixels) based on prop type (number, string, dom element)
function convertPropToPixels(propName: string, propValue: any, maxScroll: number, offset: string | number = 0) {
  let propValueInPx = propValue;
  const isElement = propValue instanceof HTMLElement;
  const keyCodes = {
    ZERO: 48,
    NINE: 57,
  };

  if (typeof propValue === "number") {
    propValueInPx = propValue;
  } else if (START_END_DURATION_REGEX.test(propValue)) {
    propValueInPx = getValueInPx(propValue, maxScroll);
  } else if (
    isElement ||
    (typeof propValue === "string" &&
      (propValue.charCodeAt(0) < keyCodes.ZERO || propValue.charCodeAt(0) > keyCodes.NINE))
  ) {
    const element = isElement ? propValue : (document.querySelector(propValue) as HTMLElement);

    if (!element) {
      console.warn(`Plx, ERROR: ${propName} selector matches no elements: "${propValue}"`);
      return null;
    }

    if (propName === "start" || propName === "end") {
      // START or END
      // Element enters the viewport
      propValueInPx = getElementTop(element) - window.innerHeight;
    } else if (propName === "duration") {
      // DURATION
      // Height of the element
      propValueInPx = element.offsetHeight;
    }
  } else {
    console.warn(`Plx, ERROR: "${propValue}" is not a valid ${propName} value, check documentation`);
    return null;
  }

  // Transform offset to px
  let offsetInPx = 0;

  if (typeof offset === "number") {
    offsetInPx = offset;
  } else if (START_END_DURATION_REGEX.test(offset)) {
    offsetInPx = getValueInPx(offset, maxScroll);
  }
  // Add offset
  propValueInPx += offsetInPx;

  if (propValueInPx < 0) {
    propValueInPx = 0;
  }

  return propValueInPx;
}

// Converts color in hex format into object { r, g, b, a }
function hexToObject(hex: string) {
  // Convert #abc to #aabbcc
  const color = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const result = HEX_REGEX.exec(color);

  // Safety check, if color is in the wrong format
  if (!result) {
    console.warn(`Plx, ERROR: hex color is not in the right format: "${hex}"`);
    return null;
  }

  // All color functions are returning { r, g, b, a } object
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1,
  };
}

// Converts color in rgb format into object { r, g, b, a }
function rgbToObject(rgb: string): Color | null {
  const isRgba = rgb.toLowerCase().indexOf("rgba") === 0;
  const color = rgb.replace(/ /g, "");
  const result = isRgba ? RGBA_REGEX.exec(color) : RGB_REGEX.exec(color);

  // Safety check, if color is in the wrong format
  if (!result) {
    console.warn(`Plx, ERROR: rgb or rgba color is not in the right format: "${rgb}"`);
    return null;
  }

  // All color functions are returning { r, g, b, a } object
  return {
    r: parseInt(result[1], 10),
    g: parseInt(result[2], 10),
    b: parseInt(result[3], 10),
    a: isRgba ? parseFloat(result[4]) : 1,
  };
}

// Calculates the current value for parallax-ing property
function parallax(
  scrollPosition: number,
  start: number,
  duration: number | string,
  startValue: number | string,
  endValue: number | string,
  easing?: Easing
): number {
  // Safety check, if "startValue" is in the wrong format
  if (typeof startValue !== "number") {
    console.warn(`Plx, ERROR: startValue is not a number (type: "${typeof endValue}", value: "${endValue}")`);
    return 0;
  }

  // Safety check, if "endValue" is in the wrong format
  if (typeof endValue !== "number") {
    console.warn(`Plx, ERROR: endValue is not a number (type: "${typeof endValue}", value: "${endValue}")`);
    return 0;
  }

  // Safety check, if "duration" is in the wrong format
  if (typeof duration !== "number" || duration === 0) {
    console.warn(`Plx, ERROR: duration is zero or not a number (type: "${typeof duration}", value: "${duration}")`);
    return 0;
  }

  let min = startValue;
  let max = endValue;
  const invert = startValue > endValue;

  if (invert) {
    min = endValue;
    max = startValue;
  }

  let percentage = (scrollPosition - start) / duration;

  if (percentage > 1) {
    percentage = 1;
  } else if (percentage < 0) {
    percentage = 0;
  }

  // Apply easing
  if (easing) {
    if (Array.isArray(easing) && easing.length === 4) {
      percentage = BezierEasing(easing[0], easing[1], easing[2], easing[3])(percentage);
    } else if (typeof easing === "string" && EASINGS[easing]) {
      percentage = BezierEasing(
        EASINGS[easing][0],
        EASINGS[easing][1],
        EASINGS[easing][2],
        EASINGS[easing][3]
      )(percentage);
    } else if (typeof easing === "function") {
      percentage = easing(percentage);
    }
  }

  let value = percentage * (max - min);

  if (invert) {
    value = max - value;
  } else {
    value += min;
  }

  // Rounding to 4 decimals (.toFixed(4) returns a string)
  return Math.floor(value * 10000) / 10000;
}

// Calculates current value for color parallax
function colorParallax(
  scrollPosition: number,
  start: number,
  duration: number,
  startValue: number | string,
  endValue: number | string,
  easing?: Easing
): string {
  let startObject: Color | null = null;
  let endObject: Color | null = null;

  if (typeof startValue === "string") {
    if (startValue[0].toLowerCase() === "r") {
      startObject = rgbToObject(startValue);
    } else {
      startObject = hexToObject(startValue);
    }
  }

  if (typeof endValue === "string") {
    if (endValue[0].toLowerCase() === "r") {
      endObject = rgbToObject(endValue);
    } else {
      endObject = hexToObject(endValue);
    }
  }

  if (startObject && endObject) {
    const r = parallax(scrollPosition, start, duration, startObject.r, endObject.r, easing);
    const g = parallax(scrollPosition, start, duration, startObject.g, endObject.g, easing);
    const b = parallax(scrollPosition, start, duration, startObject.b, endObject.b, easing);
    const a = parallax(scrollPosition, start, duration, startObject.a, endObject.a, easing);

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  }

  return "";
}

// Applies property parallax to the style object
function applyPropertyToStyle(
  scrollPosition: number,
  propertyData: PlxProperty,
  startPosition: number,
  duration: number,
  style: GenericObject,
  transforms: GenericObject,
  filters: GenericObject,
  easing?: Easing
): void {
  const { startValue, endValue, property, unit } = propertyData;

  // If property is one of the color properties
  // Use it's parallax method
  const isColor = COLOR_PROPERTIES.indexOf(property) > -1;
  const parallaxMethod = isColor ? colorParallax : parallax;

  // Get new CSS value
  const value = parallaxMethod(scrollPosition, startPosition, duration, startValue, endValue, easing);

  // Get transform function
  const transformMethod = TRANSFORM_MAP[property];
  const filterMethod = FILTER_MAP[property];
  const newStyle = style;

  if (transformMethod) {
    // Get CSS unit
    const propertyUnit = getUnit(property, unit);
    // Transforms, apply value to transform function
    transforms[property] = transformMethod(value, propertyUnit);
  } else if (filterMethod) {
    // Get CSS unit
    const propertyUnit = getUnit(property, unit);
    // Filters, apply value to filter function
    filters[property] = filterMethod(value, propertyUnit);
  } else {
    // All other properties
    newStyle[property] = value;

    // Add unit if it is passed
    if (unit) {
      newStyle[property] += unit;
    }
  }
}

// Returns CSS classes based on animation state
function getClasses(lastSegmentScrolledBy: null | number, isInSegment: boolean, parallaxData: PlxItem[]): string {
  let cssClasses: string = "";

  if (lastSegmentScrolledBy === null) {
    cssClasses = "Plx--above";
  } else if (lastSegmentScrolledBy === parallaxData.length - 1 && !isInSegment) {
    cssClasses = "Plx--below";
  } else if (lastSegmentScrolledBy !== null && isInSegment) {
    const segmentName = parallaxData[lastSegmentScrolledBy].name || lastSegmentScrolledBy;

    cssClasses = `Plx--active Plx--in Plx--in-${segmentName}`;
  } else if (lastSegmentScrolledBy !== null && !isInSegment) {
    const segmentName = parallaxData[lastSegmentScrolledBy].name || lastSegmentScrolledBy;
    const nextSegmentName = parallaxData[lastSegmentScrolledBy + 1].name || lastSegmentScrolledBy + 1;

    cssClasses = `Plx--active Plx--between Plx--between-${segmentName}-and-${nextSegmentName}`;
  }

  return cssClasses;
}

// Checks if class contains 'active'
function checkIsActive(classes: string): boolean {
  return classes.indexOf("Plx--active") > -1;
}

// Main update function
// Returns new state object based on props and scroll position
function updateDOM(
  scrollPosition: number,
  props: PlxProps,
  showElement: boolean,
  propsUsedInParallax: string[],
  plxStyleRef: MutableRefObject<GenericObject>,
  plxStateClassesRef: MutableRefObject<string>,
  elementRef: RefObject<HTMLDivElement>
): void {
  const { animateWhenNotInViewport, disabled, freeze, parallaxData, className, onPlxEnd, onPlxStart, style } = props;

  const plxStyle = plxStyleRef.current;
  const plxStateClasses = plxStateClassesRef.current;
  const element = elementRef.current as HTMLDivElement;

  // Do nothing if animation is disabled, frozen
  // or if element is not rendered yet
  if ((freeze && showElement) || !element || disabled) {
    return;
  }

  // Check if element is in viewport
  // Small offset is added to prevent page jumping
  if (!animateWhenNotInViewport) {
    const rect = element.getBoundingClientRect();

    const isTopAboveBottomEdge = rect.top < window.innerHeight + SCROLL_OFFSET;
    const isBottomBelowTopEdge = rect.top + rect.height > -SCROLL_OFFSET;

    if (!isTopAboveBottomEdge || !isBottomBelowTopEdge) {
      return;
    }
  }

  // Style to be applied to our element
  let newStyle: GenericObject = {};
  const transforms: GenericStringObject = {};
  const filters: GenericStringObject = {};

  const appliedProperties: string[] = [];
  const segments: Segment[] = [];

  let isInSegment = false;
  let lastSegmentScrolledBy: number | null = null;

  const bodyHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const maxScroll = bodyHeight - window.innerHeight;

  for (let i = 0; i < parallaxData.length; i++) {
    const { duration, easing, endOffset, properties, startOffset } = parallaxData[i];

    const start = parallaxData[i].start === "self" ? element : parallaxData[i].start;
    const end = parallaxData[i].end === "self" ? element : parallaxData[i].end;

    const startInPx = convertPropToPixels("start", start, maxScroll, startOffset);
    let durationInPx: number;
    let endInPx: number;

    // End has higher priority than duration
    if (typeof end !== "undefined") {
      endInPx = convertPropToPixels("end", end, maxScroll, endOffset);
      durationInPx = endInPx - startInPx;
    } else {
      durationInPx = convertPropToPixels("duration", duration, maxScroll);
      endInPx = startInPx + durationInPx;
    }

    // If segment is below scroll position skip it
    if (scrollPosition < startInPx) {
      break;
    }

    const isScrolledByStart = scrollPosition >= startInPx;

    if (isScrolledByStart) {
      lastSegmentScrolledBy = i;
    }

    // If active segment exists, apply his properties
    if (scrollPosition >= startInPx && scrollPosition <= endInPx) {
      isInSegment = true;

      properties.forEach((propertyData) => {
        const { property } = propertyData;

        // Save which properties are applied to the active segment
        // So they are not re-applied for other segments
        appliedProperties.push(property);

        // Apply property style
        applyPropertyToStyle(
          scrollPosition,
          propertyData,
          startInPx,
          durationInPx,
          newStyle,
          transforms,
          filters,
          easing
        );
      });
    } else {
      // Push non active segments above the scroll position to separate array
      // This way "durationInPx" and "startInPx" are not calculated again
      // and segments below scroll position are skipped in the next step
      segments.push({
        easing,
        durationInPx,
        properties,
        startInPx,
      });
    }
  }

  // These are only segments that are completely above scroll position
  segments.forEach((data) => {
    const { easing, durationInPx, properties, startInPx } = data;

    properties.forEach((propertyData) => {
      const { property } = propertyData;

      // Skip property that was changed for active segment
      if (appliedProperties.indexOf(property) > -1) {
        return;
      }

      // These styles that are the ones changed by segments
      // that are above active segment
      applyPropertyToStyle(
        scrollPosition,
        propertyData,
        startInPx,
        durationInPx,
        newStyle,
        transforms,
        filters,
        easing
      );
    });
  });

  // Sort transforms by ORDER_OF_TRANSFORMS
  // as order of CSS transforms matters
  const transformsOrdered: string[] = [];

  ORDER_OF_TRANSFORMS.forEach((transformKey) => {
    if (transforms[transformKey]) {
      transformsOrdered.push(transforms[transformKey]);
    }
  });

  // Concat transforms and add webkit prefix
  newStyle.transform = transformsOrdered.join(" ");
  newStyle.webkitTransform = newStyle.transform;

  const filtersArray: string[] = [];
  FILTER_PROPERTIES.forEach((filterKey) => {
    if (filters[filterKey]) {
      filtersArray.push(filters[filterKey]);
    }
  });

  // Concat filters and add webkit prefix
  newStyle.filter = filtersArray.join(" ");
  newStyle.webkitFilter = newStyle.filter;

  // "Stupid" check if style should be updated
  if (JSON.stringify(plxStyle) !== JSON.stringify(newStyle)) {
    // Set styles
    requestAnimationFrame(() => {
      // Add user styles
      for (const property in style) {
        // @ts-ignore
        element.style[property] = style[property];
      }

      // Add parallax styles
      propsUsedInParallax.forEach((property) => {
        // @ts-ignore
        element.style[property] = typeof newStyle[property] === "undefined" ? "" : newStyle[property];
      });
    });

    plxStyleRef.current = newStyle;
  }

  // Adding state classes
  const newPlxStateClasses = getClasses(lastSegmentScrolledBy, isInSegment, parallaxData);

  if (newPlxStateClasses !== plxStateClasses) {
    const newClassName = `${className} Plx ${newPlxStateClasses}`;

    if (newClassName !== element.className) {
      const wasActive = checkIsActive(element.className);
      const isActive = checkIsActive(newClassName);

      element.className = newClassName;

      // Callbacks
      if (!wasActive && isActive) {
        onPlxStart?.();
      } else if (wasActive && !isActive) {
        onPlxEnd?.();
      }
    }

    // Cache plx classes
    plxStateClassesRef.current = newPlxStateClasses;
  }
}

type TimeoutID = ReturnType<typeof setTimeout>;

const Plx: React.FC<PlxProps> = (props) => {
  const {
    animateWhenNotInViewport = false,
    children,
    className = "",
    disabled = false,
    freeze = false,
    parallaxData,
    style = {},
    onPlxStart,
    onPlxEnd,
    ...divProps
  } = props;

  const scrollManager = useRef<any>();
  const resizeTimeout = useRef<TimeoutID>();
  const element = useRef<HTMLDivElement>(null);
  const plxStyle = useRef<GenericObject>({});
  const plxStyleClasses = useRef<string>("");

  const [showElement, setShowElement] = useState<boolean>(false);

  // Get properties that are used in a parallax effect
  const propsUsedInParallax = useMemo(() => {
    const properties: string[] = [];

    parallaxData.forEach((segment) => {
      segment.properties.forEach(({ property }) => {
        const transformMethod = TRANSFORM_MAP[property];
        const filterMethod = FILTER_MAP[property];

        if (transformMethod) {
          if (!properties.includes("transform")) {
            properties.push("transform", "webkitTransform");
          }
        } else if (filterMethod) {
          if (!properties.includes("filter")) {
            properties.push("filter", "webkitFilter");
          }
        } else {
          if (!properties.includes(property)) {
            properties.push(property);
          }
        }
      });
    });

    return properties;
  }, [parallaxData]);

  // Set will-change property
  useEffect(() => {
    if (element.current) {
      element.current.style.willChange = propsUsedInParallax
        .map((str: string) => {
          return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace("webkit", "-webkit");
        })
        .join(",");
    }
  }, [element, propsUsedInParallax]);

  const update = useCallback(
    (scrollPosition: number | null = null) => {
      const currentScrollPosition =
        scrollPosition === null ? scrollManager.current.getScrollPosition().scrollPositionY : scrollPosition;

      updateDOM(currentScrollPosition, props, showElement, propsUsedInParallax, plxStyle, plxStyleClasses, element);
    },
    [props]
  );

  // Window resize
  const handleResize = useCallback(() => {
    clearTimeout(resizeTimeout.current);

    resizeTimeout.current = setTimeout(() => {
      update();
    }, RESIZE_DEBOUNCE_TIMEOUT);
  }, []);

  // Window scroll
  const handleScrollChange = useCallback((e: any) => {
    update(e.detail.scrollPositionY);
  }, []);

  useEffect(() => {
    // Get scroll manager singleton
    scrollManager.current = new ScrollManager();

    // Add listeners
    window.addEventListener("window-scroll", handleScrollChange);
    window.addEventListener("resize", handleResize);

    update();

    setShowElement(true);

    return () => {
      clearTimeout(resizeTimeout.current);

      window.removeEventListener("window-scroll", handleScrollChange);
      window.removeEventListener("resize", handleResize);

      scrollManager.current.removeListener();
    };
  }, []);

  // Update DOM on props change
  useEffect(() => {
    update();
  }, [props]);

  let elementStyle = style;

  if (!disabled) {
    elementStyle = {
      ...style,
      // Hide element before until it is rendered
      // This prevents jumps if page is scrolled and then refreshed
      visibility: showElement ? undefined : "hidden",
    };
  }

  return (
    <div {...divProps} className={`${className} Plx`} style={elementStyle} ref={element}>
      {children}
    </div>
  );
};

export default Plx;
