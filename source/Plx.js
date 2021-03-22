import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BezierEasing from 'bezier-easing';
import ScrollManager from 'window-scroll-manager';

// Check if code is running in the browser (important for universal rendering)
const WINDOW_EXISTS = typeof window !== 'undefined';

// Regex that checks for numbers in string
// formatted as "{number}{unit}" where unit is "px", "vh", "%" or none
const START_END_DURATION_REGEX = /^-?\d+(\.\d+)?(px|vh|%)?$/;

const DEFAULT_UNIT = 'px';
const DEFAULT_ANGLE_UNIT = 'deg';
const ANGLE_PROPERTIES = [
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skew',
  'skewX',
  'skewY',
  'skewZ',
  'hueRotate',
];

const EASINGS = {
  ease: [0.25, 0.1, 0.25, 1.0],
  easeIn: [0.42, 0.0, 1.00, 1.0],
  easeOut: [0.00, 0.0, 0.58, 1.0],
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

// Color regexes

// 0 - 199 | 200 - 249 | 250 - 255
const REGEX_0_255 = '(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])';
// 0.0 - 1.9999...
const REGEX_0_1 = '([01](\\.\\d+)?)';
// 00 - FF
const REGEX_TWO_HEX_DIGITS = '([a-f\\d]{2})';

const HEX_REGEX = new RegExp(`^#${ REGEX_TWO_HEX_DIGITS }${ REGEX_TWO_HEX_DIGITS }${ REGEX_TWO_HEX_DIGITS }$`, 'i');
const RGB_REGEX = new RegExp(`^rgb\\(${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_255 }\\)$`, 'i');
const RGBA_REGEX = new RegExp(`^rgba\\(${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_1 }\\)$`, 'i');

const SCROLL_OFFSET = 50;

const RESIZE_DEBOUNCE_TIMEOUT = 150;

// CSS transform map
const TRANSFORM_MAP = {
  rotate: (value, unit = DEFAULT_ANGLE_UNIT) => `rotate(${ value }${ unit })`,
  rotateX: (value, unit = DEFAULT_ANGLE_UNIT) => `rotateX(${ value }${ unit })`,
  rotateY: (value, unit = DEFAULT_ANGLE_UNIT) => `rotateY(${ value }${ unit })`,
  rotateZ: (value, unit = DEFAULT_ANGLE_UNIT) => `rotateZ(${ value }${ unit })`,
  scale: value => `scale(${ value })`,
  scaleX: value => `scaleX(${ value })`,
  scaleY: value => `scaleY(${ value })`,
  scaleZ: value => `scaleZ(${ value })`,
  skew: (value, unit = DEFAULT_UNIT) => `skew(${ value }${ unit })`,
  skewX: (value, unit = DEFAULT_UNIT) => `skewX(${ value }${ unit })`,
  skewY: (value, unit = DEFAULT_UNIT) => `skewY(${ value }${ unit })`,
  skewZ: (value, unit = DEFAULT_UNIT) => `skewZ(${ value }${ unit })`,
  translateX: (value, unit = DEFAULT_UNIT) => `translateX(${ value }${ unit })`,
  translateY: (value, unit = DEFAULT_UNIT) => `translateY(${ value }${ unit })`,
  translateZ: (value, unit = DEFAULT_UNIT) => `translateZ(${ value }${ unit })`,
};

// Order of CSS transforms matters
const ORDER_OF_TRANSFORMS = [
  'translateX',
  'translateY',
  'translateZ',
  'skew',
  'skewX',
  'skewY',
  'skewZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
];

// CSS properties that use color values
const COLOR_PROPERTIES = [
  'backgroundColor',
  'borderBottomColor',
  'borderColor',
  'borderLeftColor',
  'borderRightColor',
  'borderTopColor',
  'color',
  'fill',
  'stroke',
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
const FILTER_MAP = {
  blur: (value, unit = DEFAULT_UNIT) => `blur(${ value }${ unit })`,
  brightness: value => `brightness(${ value })`,
  contrast: value => `contrast(${ value })`,
  grayscale: value => `grayscale(${ value })`,
  hueRotate: (value, unit = DEFAULT_ANGLE_UNIT) => `hue-rotate(${ value }${ unit })`,
  invert: value => `invert(${ value })`,
  opacityFilter: value => `opacity(${ value })`,
  saturate: value => `saturate(${ value })`,
  sepia: value => `sepia(${ value })`,
};

const FILTER_PROPERTIES = [
  'blur',
  'brightness',
  'contrast',
  'grayscale',
  'hueRotate',
  'invert',
  'opacityFilter',
  'saturate',
  'sepia',
];

// Props to be removed from passing directly to the component element
const PROPS_TO_OMIT = [
  'animateWhenNotInViewport',
  'children',
  'className',
  'freeze',
  'parallaxData',
  'style',
  'tagName',
  'onPlxStart',
  'onPlxEnd',
];

// Get element's top offset
function getElementTop(el) {
  let top = 0;
  let element = el;

  do {
    top += element.offsetTop || 0;
    element = element.offsetParent;
  } while (element);

  return top;
}

// Returns CSS unit
function getUnit(property, unit) {
  let propertyUnit = unit || DEFAULT_UNIT;

  if (ANGLE_PROPERTIES.indexOf(property) >= 0) {
    propertyUnit = unit || DEFAULT_ANGLE_UNIT;
  }

  return propertyUnit;
}

// Takes string value (in px/vh/%) and returns number
function getValueInPx(value, maxScroll) {
  const floatValue = parseFloat(value);
  const unit = value.match(START_END_DURATION_REGEX)[2] || null;
  const vh = window.innerHeight / 100;
  let valueInPx = value;

  switch (unit) {
    case 'vh':
      valueInPx = vh * floatValue;
      break;
    case '%':
      valueInPx = maxScroll * floatValue / 100;
      break;
    default:
      valueInPx = floatValue;
  }

  return valueInPx;
}

// Takes start/end/duration props
// and return number (in pixels) based on prop type (number, string, dom element)
function convertPropToPixels(propName, propValue, maxScroll, offset = 0) {
  let propValueInPx = propValue;
  const isElement = propValue instanceof HTMLElement;
  const keyCodes = {
    ZERO: 48,
    NINE: 57,
  };

  if (typeof propValue === 'number') {
    propValueInPx = propValue;
  } else if (START_END_DURATION_REGEX.test(propValue)) {
    propValueInPx = getValueInPx(propValue, maxScroll);
  } else if (
    isElement ||
    typeof propValue === 'string' &&
    (propValue.charCodeAt(0) < keyCodes.ZERO || propValue.charCodeAt(0) > keyCodes.NINE)
  ) {
    const element = isElement ? propValue : document.querySelector(propValue);

    if (!element) {
      console.warn(`Plx, ERROR: ${ propName } selector matches no elements: "${ propValue }"`); // eslint-disable-line
      return null;
    }

    if (propName === 'start' || propName === 'end') {
      // START or END
      // Element enters the viewport
      propValueInPx = getElementTop(element) - window.innerHeight;
    } else if (propName === 'duration') {
      // DURATION
      // Height of the element
      propValueInPx = element.offsetHeight;
    }
  } else {
    console.warn(`Plx, ERROR: "${ propValue }" is not a valid ${ propName } value, check documenation`); // eslint-disable-line
    return null;
  }

  // Transform offset to px
  let offsetInPx = 0;

  if (typeof offset === 'number') {
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

// Convers color in hex format into object { r, g, b, a }
function hexToObject(hex) {
  // Convert #abc to #aabbcc
  const color = hex.length === 4 ? `#${ hex[1] }${ hex[1] }${ hex[2] }${ hex[2] }${ hex[3] }${ hex[3] }` : hex;
  const result = HEX_REGEX.exec(color);

  // Safety check, if color is in the wrong format
  if (!result) {
    console.warn(`Plx, ERROR: hex color is not in the right format: "${ hex }"`); // eslint-disable-line no-console
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

// Convers color in rgb format into object { r, g, b, a }
function rgbToObject(rgb) {
  const isRgba = rgb.toLowerCase().indexOf('rgba') === 0;
  const color = rgb.replace(/ /g, '');
  const result = isRgba ? RGBA_REGEX.exec(color) : RGB_REGEX.exec(color);

  // Safety check, if color is in the wrong format
  if (!result) {
    console.warn(`Plx, ERROR: rgb or rgba color is not in the right format: "${ rgb }"`); // eslint-disable-line
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

// Calculates the current value for parallaxing property
function parallax(scrollPosition, start, duration, startValue, endValue, easing) {
  let min = startValue;
  let max = endValue;
  const invert = startValue > endValue;


  // Safety check, if "startValue" is in the wrong format
  if (typeof startValue !== 'number') {
    console.warn(`Plx, ERROR: startValue is not a number (type: "${ typeof endValue }", value: "${ endValue }")`); // eslint-disable-line
    return null;
  }

  // Safety check, if "endValue" is in the wrong format
  if (typeof endValue !== 'number') {
    console.warn(`Plx, ERROR: endValue is not a number (type: "${ typeof endValue }", value: "${ endValue }")`); // eslint-disable-line
    return null;
  }

  // Safety check, if "duration" is in the wrong format
  if (typeof duration !== 'number' || duration === 0) {
    console.warn(`Plx, ERROR: duration is zero or not a number (type: "${ typeof duration }", value: "${ duration }")`); // eslint-disable-line
    return null;
  }

  if (invert) {
    min = endValue;
    max = startValue;
  }

  let percentage = ((scrollPosition - start) / duration);

  if (percentage > 1) {
    percentage = 1;
  } else if (percentage < 0) {
    percentage = 0;
  }

  // Apply easing
  if (easing) {
    const easingPropType = typeof easing;
    if (easingPropType === 'object' && easing.length === 4) {
      percentage = BezierEasing(
        easing[0],
        easing[1],
        easing[2],
        easing[3]
      )(percentage);
    } else if (easingPropType === 'string' && EASINGS[easing]) {
      percentage = BezierEasing(
        EASINGS[easing][0],
        EASINGS[easing][1],
        EASINGS[easing][2],
        EASINGS[easing][3]
      )(percentage);
    } else if (easingPropType === 'function') {
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
function colorParallax(scrollPosition, start, duration, startValue, endValue, easing) {
  let startObject = null;
  let endObject = null;

  if (startValue[0].toLowerCase() === 'r') {
    startObject = rgbToObject(startValue);
  } else {
    startObject = hexToObject(startValue);
  }

  if (endValue[0].toLowerCase() === 'r') {
    endObject = rgbToObject(endValue);
  } else {
    endObject = hexToObject(endValue);
  }

  if (startObject && endObject) {
    const r = parallax(scrollPosition, start, duration, startObject.r, endObject.r, easing);
    const g = parallax(scrollPosition, start, duration, startObject.g, endObject.g, easing);
    const b = parallax(scrollPosition, start, duration, startObject.b, endObject.b, easing);
    const a = parallax(scrollPosition, start, duration, startObject.a, endObject.a, easing);

    return `rgba(${ parseInt(r, 10) }, ${ parseInt(g, 10) }, ${ parseInt(b, 10) }, ${ a })`;
  }

  return null;
}

// Applies property parallax to the style object
function applyProperty(scrollPosition, propertyData, startPosition, duration, style, easing) {
  const {
    startValue,
    endValue,
    property,
    unit,
  } = propertyData;

  // If property is one of the color properties
  // Use it's parallax method
  const isColor = COLOR_PROPERTIES.indexOf(property) > -1;
  const parallaxMethod = isColor ? colorParallax : parallax;

  // Get new CSS value
  const value = parallaxMethod(
    scrollPosition,
    startPosition,
    duration,
    startValue,
    endValue,
    easing
  );

  // Get transform function
  const transformMethod = TRANSFORM_MAP[property];
  const filterMethod = FILTER_MAP[property];
  const newStyle = style;

  if (transformMethod) {
    // Get CSS unit
    const propertyUnit = getUnit(property, unit);
    // Transforms, apply value to transform function
    newStyle.transform[property] = transformMethod(value, propertyUnit);

    if (!newStyle.willChange.includes('transform')) {
      newStyle.willChange.push('transform');
    }
  } else if (filterMethod) {
    // Get CSS unit
    const propertyUnit = getUnit(property, unit);
    // Filters, apply value to filter function
    newStyle.filter[property] = filterMethod(value, propertyUnit);

    if (!newStyle.willChange.includes('filter')) {
      newStyle.willChange.push('filter');
    }
  } else {
    // All other properties
    newStyle[property] = value;

    if (!newStyle.willChange.includes(property)) {
      newStyle.willChange.push(property);
    }

    // Add unit if it is passed
    if (unit) {
      newStyle[property] += unit;
    }
  }

  return newStyle;
}

// Returns CSS classes based on animation state
function getClasses(lastSegmentScrolledBy, isInSegment, parallaxData) {
  let cssClasses = null;

  if (lastSegmentScrolledBy === null) {
    cssClasses = 'Plx--above';
  } else if (lastSegmentScrolledBy === parallaxData.length - 1 && !isInSegment) {
    cssClasses = 'Plx--below';
  } else if (lastSegmentScrolledBy !== null && isInSegment) {
    const segmentName = parallaxData[lastSegmentScrolledBy].name || lastSegmentScrolledBy;

    cssClasses = `Plx--active Plx--in Plx--in-${ segmentName }`;
  } else if (lastSegmentScrolledBy !== null && !isInSegment) {
    const segmentName = parallaxData[lastSegmentScrolledBy].name || lastSegmentScrolledBy;
    const nextSegmentName = parallaxData[lastSegmentScrolledBy + 1].name || lastSegmentScrolledBy + 1;

    cssClasses = `Plx--active Plx--between Plx--between-${ segmentName }-and-${ nextSegmentName }`;
  }

  return cssClasses;
}

// Checks if class contains 'active'
function checkIfActive(classes) {
  return classes.indexOf('Plx--active') > -1;
}


// Omits "keysToOmit" from "object"
function omit(object, keysToOmit) {
  const result = {};

  Object.keys(object).forEach(key => {
    if (keysToOmit.indexOf(key) === -1) {
      result[key] = object[key];
    }
  });

  return result;
}

// Main update function
// Returns new state object based on props and scroll position
function getNewState(scrollPosition, props, state, element) {
  const {
    animateWhenNotInViewport,
    disabled,
    freeze,
    parallaxData,
  } = props;
  const {
    showElement,
    plxStyle,
    plxStateClasses,
  } = state;

  // Do nothing if animation is disabled, frozen
  // or if element is not rendered yet
  if ((freeze && showElement) || !element || disabled) {
    return null;
  }

  // Check if element is in viewport
  // Small offset is added to prevent page jumping
  if (!animateWhenNotInViewport) {
    const rect = element.getBoundingClientRect();
    const isTopAboveBottomEdge = rect.top < window.innerHeight + SCROLL_OFFSET;
    const isBottomBelowTopEdge = rect.top + rect.height > -SCROLL_OFFSET;

    if (!isTopAboveBottomEdge || !isBottomBelowTopEdge) {
      return null;
    }
  }

  const newState = {};

  // Style to be applied to our element
  let newStyle = {
    willChange: [],
    transform: {},
    filter: {},
  };

  // This means "componentDidMount" did happen and that we should show our element
  if (!showElement) {
    newState.showElement = true;
  }

  const appliedProperties = [];
  const segments = [];
  let isInSegment = false;
  let lastSegmentScrolledBy = null;
  const bodyHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const maxScroll = bodyHeight - window.innerHeight;

  for (let i = 0; i < parallaxData.length; i++) {
    const {
      duration,
      easing,
      endOffset,
      properties,
      startOffset,
    } = parallaxData[i];

    const start = parallaxData[i].start === 'self' ? element : parallaxData[i].start;
    const end = parallaxData[i].end === 'self' ? element : parallaxData[i].end;

    const startInPx = convertPropToPixels('start', start, maxScroll, startOffset);
    let durationInPx = null;
    let endInPx = null;

    // End has higher priority than duration
    if (typeof end !== 'undefined') {
      endInPx = convertPropToPixels('end', end, maxScroll, endOffset);
      durationInPx = endInPx - startInPx;
    } else {
      durationInPx = convertPropToPixels('duration', duration, maxScroll);
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

      properties.forEach(propertyData => { // eslint-disable-line no-loop-func
        const { property } = propertyData;

        // Save which properties are applied to the active segment
        // So they are not re-applied for other segments
        appliedProperties.push(property);

        // Apply property style
        newStyle = applyProperty(
          scrollPosition,
          propertyData,
          startInPx,
          durationInPx,
          newStyle,
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

  // These are only segments that are completly above scroll position
  segments.forEach(data => {
    const {
      easing,
      durationInPx,
      properties,
      startInPx,
    } = data;

    properties.forEach((propertyData) => {
      const { property } = propertyData;

      // Skip propery that was changed for active segment
      if (appliedProperties.indexOf(property) > -1) {
        return;
      }

      // These styles that are the ones changed by segments
      // that are above active segment
      newStyle = applyProperty(
        scrollPosition,
        propertyData,
        startInPx,
        durationInPx,
        newStyle,
        easing
      );
    });
  });

  // Sort transforms by ORDER_OF_TRANSFORMS
  // as order of CSS transforms matters
  const transformsOrdered = [];

  ORDER_OF_TRANSFORMS.forEach(transformKey => {
    if (newStyle.transform[transformKey]) {
      transformsOrdered.push(newStyle.transform[transformKey]);
    }
  });

  // Concat transforms and add webkit prefix
  newStyle.transform = transformsOrdered.join(' ');
  newStyle.WebkitTransform = newStyle.transform;

  const filtersArray = [];
  FILTER_PROPERTIES.forEach(filterKey => {
    if (newStyle.filter[filterKey]) {
      filtersArray.push(newStyle.filter[filterKey]);
    }
  });

  // Concat filters and add webkit prefix
  newStyle.filter = filtersArray.join(' ');
  newStyle.WebkitFilter = newStyle.filter;

  // "Stupid" check if style should be updated
  if (JSON.stringify(plxStyle) !== JSON.stringify(newStyle)) {
    newState.plxStyle = newStyle;
  }

  // Adding state class
  const newPlxStateClasses = getClasses(lastSegmentScrolledBy, isInSegment, parallaxData);

  if (newPlxStateClasses !== plxStateClasses) {
    newState.plxStateClasses = newPlxStateClasses;
  }

  if (Object.keys(newState).length) {
    return newState;
  }

  return null;
}

export default class Plx extends Component {
  constructor(props) {
    super();

    // Binding handlers
    this.handleScrollChange = this.handleScrollChange.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.state = {
      element: null,
      showElement: false,
      plxStateClasses: '',
      plxStyle: {},
    };

    // Skipping type checking as PropTypes will give a warning if the props aren't functions
    this.plxStartEnabled = props.onPlxStart !== null;
    this.plxEndEnabled = props.onPlxEnd !== null;
  }

  componentDidMount() {
    // Get scroll manager singleton
    this.scrollManager = new ScrollManager();

    // Add listeners
    window.addEventListener('window-scroll', this.handleScrollChange);
    window.addEventListener('resize', this.handleResize);

    this.update();
  }

  componentDidUpdate(prevProps, prevState) {
    const wasActive = checkIfActive(prevState.plxStateClasses);
    const isActive = checkIfActive(this.state.plxStateClasses);

    // Update only if props changed
    if (prevProps !== this.props) {
      this.update();
    }

    // Callbacks
    if ((this.plxStartEnabled || this.plxEndEnabled) && prevState.plxStateClasses !== this.state.plxStateClasses) {
      if (this.plxStartEnabled && !wasActive && isActive) {
        this.props.onPlxStart();
      } else if (this.plxEndEnabled && wasActive && !isActive) {
        this.props.onPlxEnd();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('window-scroll', this.handleScrollChange);
    window.removeEventListener('resize', this.handleResize);

    clearTimeout(this.resizeDebounceTimeoutID);
    this.resizeDebounceTimeoutID = null;

    if (this.scrollManager) {
      this.scrollManager.removeListener();
    }
  }

  update(scrollPosition = null) {
    const currentScrollPosition = scrollPosition === null ?
      this.scrollManager.getScrollPosition().scrollPositionY : scrollPosition;

    const newState = getNewState(
      currentScrollPosition,
      this.props,
      this.state,
      this.element
    );

    if (newState) {
      this.setState(newState);
    }
  }

  handleResize() {
    clearTimeout(this.resizeDebounceTimeoutID);
    this.resizeDebounceTimeoutID = setTimeout(() => {
      this.update();
    }, RESIZE_DEBOUNCE_TIMEOUT);
  }

  handleScrollChange(e) {
    this.update(e.detail.scrollPositionY);
  }

  render() {
    const {
      children,
      className,
      disabled,
      style,
      tagName,
    } = this.props;
    const {
      showElement,
      plxStyle,
      plxStateClasses,
    } = this.state;

    const Tag = tagName;

    let elementStyle = style;

    if (!disabled) {
      elementStyle = {
        ...style,
        ...plxStyle,
        // Hide element before until it is rendered
        // This prevents jumps if page is scrolled and then refreshed
        visibility: showElement ? null : 'hidden',
      };
    }

    return (
      <Tag
        { ...omit(this.props, PROPS_TO_OMIT) }
        className={ `Plx ${ plxStateClasses } ${ className }` }
        style={ elementStyle }
        ref={ el => this.element = el }
      >
        { children }
      </Tag>
    );
  }
}

const propertiesItemType = PropTypes.shape({
  startValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  endValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  property: PropTypes.string.isRequired,
  unit: PropTypes.string,
});

// Check for the universal rendering
// HTMLElement in the proptypes breaks on server
// https://github.com/Stanko/react-plx/issues/25
const SafeHTMLElement = WINDOW_EXISTS ? window.HTMLElement : {};

const parallaxDataType = PropTypes.shape({
  start: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(SafeHTMLElement),
  ]).isRequired,
  startOffset: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  duration: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(SafeHTMLElement),
  ]),
  end: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(SafeHTMLElement),
  ]),
  endOffset: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  properties: PropTypes.arrayOf(propertiesItemType).isRequired,
  easing: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.func,
  ]),
  name: PropTypes.string,
});


Plx.propTypes = {
  animateWhenNotInViewport: PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  freeze: PropTypes.bool,
  parallaxData: PropTypes.arrayOf(parallaxDataType),
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
  tagName: PropTypes.string,
  onPlxStart: PropTypes.func,
  onPlxEnd: PropTypes.func,
};

Plx.defaultProps = {
  animateWhenNotInViewport: false,
  children: null,
  className: '',
  disabled: false,
  freeze: false,
  parallaxData: [],
  style: {},
  tagName: 'div',
  onPlxStart: null,
  onPlxEnd: null,
};
