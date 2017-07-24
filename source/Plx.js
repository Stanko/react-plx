import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScrollManager from './scroll-manager';

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
];

// Color regexs

// 0 - 199 | 200 - 249 | 250 - 255
const REGEX_0_255 = '(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])';
// 0.0 - 1.9999...
const REGEX_0_1 = '([01](\\.\\d+)?)';
// 00 - FF
const REGEX_TWO_HEX_DIGITS = '([a-f\\d]{2})';

const HEX_REGEX = new RegExp(`^#${ REGEX_TWO_HEX_DIGITS }${ REGEX_TWO_HEX_DIGITS }${ REGEX_TWO_HEX_DIGITS }$`, 'i');
const RGB_REGEX = new RegExp(`^rgb\\(${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_255 }\\)$`, 'i');
const RGBA_REGEX = new RegExp(`^rgba\\(${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_255 },${ REGEX_0_1 }\\)$`, 'i');

// CSS transform map
const TRANSFORM_MAP = {
  rotate: (value, unit: DEFAULT_ANGLE_UNIT) => `rotate(${ value }${ unit })`,
  rotateX: (value, unit: DEFAULT_ANGLE_UNIT) => `rotateX(${ value }${ unit })`,
  rotateY: (value, unit: DEFAULT_ANGLE_UNIT) => `rotateY(${ value }${ unit })`,
  rotateZ: (value, unit: DEFAULT_ANGLE_UNIT) => `rotateZ(${ value }${ unit })`,
  scale: value => `scale(${ value })`,
  scaleX: value => `scaleX(${ value })`,
  scaleY: value => `scaleY(${ value })`,
  scaleZ: value => `scaleZ(${ value })`,
  skew: (value, unit: DEFAULT_UNIT) => `skew(${ value }${ unit })`,
  skewX: (value, unit: DEFAULT_UNIT) => `skewX(${ value }${ unit })`,
  skewY: (value, unit: DEFAULT_UNIT) => `skewY(${ value }${ unit })`,
  skewZ: (value, unit: DEFAULT_UNIT) => `skewZ(${ value }${ unit })`,
  translateX: (value, unit: DEFAULT_UNIT) => `translateX(${ value }${ unit })`,
  translateY: (value, unit: DEFAULT_UNIT) => `translateY(${ value }${ unit })`,
  translateZ: (value, unit: DEFAULT_UNIT) => `translateZ(${ value }${ unit })`,
};

// Order of CSS transforms matter
// so custom order is used
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
  'color',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
];

export default class Plx extends Component {
  constructor(props) {
    super(props);

    const {
      interval,
    } = props;

    this.scrollManager = new ScrollManager(interval);
    this.handleScrollChange = this.handleScrollChange.bind(this);

    this.state = {
      hasReceivedScrollEvent: false,
      plxStyle: {},
    };
  }

  componentWillMount() {
    window.addEventListener('plx-scroll', this.handleScrollChange);
  }

  // TODO
  // componentWillReceiveProps(nextProps) {
  //
  // }

  componentWillUnmount() {
    window.removeEventListener('plx-scroll', this.handleScrollChange);

    this.scrollManager.destroy();
    this.scrollManager = null;

    this.scrollPosition = null;
  }

  getElementTop() {
    let top = 0;
    let element = this.element;

    do {
      top += element.offsetTop || 0;
      element = element.offsetParent;
    } while (element);

    return top;
  }

  getUnit(property, unit) {
    let propertyUnit = unit || DEFAULT_UNIT;

    if (ANGLE_PROPERTIES.indexOf(property) > -1) {
      propertyUnit = unit || DEFAULT_ANGLE_UNIT;
    }

    return propertyUnit;
  }

  hexToObject(hex) {
    // Convert #abc to #aabbcc
    const color = hex.length === 4 ? `#${ hex[1] }${ hex[1] }${ hex[2] }${ hex[2] }${ hex[3] }${ hex[3] }` : hex;
    const result = HEX_REGEX.exec(color);

    // Safety check, if color is in the wrong format
    if (!result) {
      console.log(`Plx, ERROR: hex color is not in the right format: "${ hex }"`); // eslint-disable-line no-console
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

  rgbToObject(rgb) {
    const isRgba = rgb.toLowerCase().indexOf('rgba') === 0;
    const color = rgb.replace(/ /g, '');
    const result = isRgba ? RGBA_REGEX.exec(color) : RGB_REGEX.exec(color);

    // Safety check, if color is in the wrong format
    if (!result) {
      console.log(`Plx, ERROR: rgb or rgba color is not in the right format: "${ rgb }"`); // eslint-disable-line no-console
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

  colorParallax(scrollPosition, start, duration, startValue, endValue) {
    let startObject = null;
    let endObject = null;

    if (startValue[0].toLowerCase() === 'r') {
      startObject = this.rgbToObject(startValue);
    } else {
      startObject = this.hexToObject(startValue);
    }

    if (endValue[0].toLowerCase() === 'r') {
      endObject = this.rgbToObject(endValue);
    } else {
      endObject = this.hexToObject(endValue);
    }

    if (startObject && endObject) {
      const r = this.parallax(scrollPosition, start, duration, startObject.r, endObject.r);
      const g = this.parallax(scrollPosition, start, duration, startObject.g, endObject.g);
      const b = this.parallax(scrollPosition, start, duration, startObject.b, endObject.b);
      const a = this.parallax(scrollPosition, start, duration, startObject.a, endObject.a);

      return `rgba(${ parseInt(r, 10) }, ${ parseInt(g, 10) }, ${ parseInt(b, 10) }, ${ a })`;
    }

    return null;
  }

  parallax(scrollPosition, start, duration, startValue, endValue) {
    let min = startValue;
    let max = endValue;
    const invert = startValue > endValue;


    // Safety check, if "startValue" is in the wrong format
    if (typeof startValue !== 'number') {
      console.log(`Plx, ERROR: startValue is not a number, but "${ typeof endValue }": "${ endValue }"`); // eslint-disable-line no-console
      return null;
    }

    // Safety check, if "endValue" is in the wrong format
    if (typeof endValue !== 'number') {
      console.log(`Plx, ERROR: endValue is not a number, but "${ typeof endValue }": "${ endValue }"`); // eslint-disable-line no-console
      return null;
    }

    if (invert) {
      min = endValue;
      max = startValue;
    }

    let value = ((scrollPosition - start) / duration) * (max - min);

    if (invert) {
      value = max - value;
    } else {
      value += min;
    }

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    return value.toFixed(2);
  }

  handleScrollChange(e) {
    const {
      parallaxData,
    } = this.props;
    const {
      hasReceivedScrollEvent,
      plxStyle,
    } = this.state;
    const {
      scrollPosition,
    } = e.detail;


    this.scrollPosition = scrollPosition;

    const newState = {};
    const newStyle = {
      transform: {},
    };

    if (!hasReceivedScrollEvent) {
      newState.hasReceivedScrollEvent = true;
    }

    const appliedProperties = [];
    const segments = [];

    for (let i = 0; i < parallaxData.length; i++) {
      const {
        start,
        duration,
        offset,
        properties,
      } = parallaxData[i];

      const scrollOffset = offset || 0;

      const startPosition = (start === 'top' ? this.getElementTop() : start) + scrollOffset;
      const parallaxDuration = duration === 'height' ? this.element.offsetHeight : duration;
      const endPosition = startPosition + parallaxDuration;

      // If segment is bellow scroll position skip it
      if (scrollPosition < startPosition) {
        break;
      }

      // If active segment exists, apply his properties
      if (scrollPosition >= startPosition && scrollPosition <= endPosition) {
        properties.forEach((propertyData) => {
          const {
            startValue,
            endValue,
            property,
            unit,
          } = propertyData;
          appliedProperties.push(property);

          // Get CSS unit
          const propertyUnit = this.getUnit(property, unit);

          // Set default parallax method
          let parallaxMethod = this.parallax.bind(this);

          // If property is one of the color properties
          // Use it's parallax method
          if (COLOR_PROPERTIES.indexOf(property) > -1) {
            parallaxMethod = this.colorParallax.bind(this);
          }

          // Get new CSS value
          const value = parallaxMethod(
            scrollPosition,
            startPosition,
            parallaxDuration,
            startValue,
            endValue
          );

          // Get transform function
          const transformMethod = TRANSFORM_MAP[property];

          if (transformMethod) {
            // Transforms, apply value to transform function
            newStyle.transform[property] = transformMethod(value, propertyUnit);
          } else {
            // All other properties
            newStyle[property] = value;
          }
        });
      } else {
        // Push non active segments above the scroll position to separate array
        // This way "parallaxDuration" and "startPosition" are not calculated again
        // and segments bellow scroll position are skipped in the next step
        segments.push({
          parallaxDuration,
          properties,
          startPosition,
        });
      }
    }

    // These are only segments that are completly above scroll position
    segments.forEach(data => {
      const {
        properties,
        startPosition,
        parallaxDuration,
      } = data;

      properties.forEach((propertyData) => {
        const {
          startValue,
          endValue,
          property,
          unit,
        } = propertyData;

        // Skip propery that was changed for current segment
        if (appliedProperties.indexOf(property) > -1) {
          return;
        }

        // Get CSS unit
        const propertyUnit = this.getUnit(property, unit);

        // Set default parallax method
        let parallaxMethod = this.parallax.bind(this);

        // If property is one of the color properties
        // Use it's parallax method
        if (COLOR_PROPERTIES.indexOf(property) > -1) {
          parallaxMethod = this.colorParallax.bind(this);
        }

        // Get new CSS value
        const value = parallaxMethod(
          scrollPosition,
          startPosition,
          parallaxDuration,
          startValue,
          endValue
        );

        // Get transform function
        const transformMethod = TRANSFORM_MAP[property];

        if (transformMethod) {
          // Transforms, apply value to transform function
          newStyle.transform[property] = transformMethod(value, propertyUnit);
        } else {
          // All other properties
          newStyle[property] = value;
        }
      });
    });

    // Sort transforms by ORDER_OF_TRANSFORMS
    const transformsOrdered = [];

    ORDER_OF_TRANSFORMS.forEach(transformKey => {
      if (newStyle.transform[transformKey]) {
        transformsOrdered.push(newStyle.transform[transformKey]);
      }
    });

    // Concat transforms and add browser prefixes
    newStyle.transform = transformsOrdered.join(' ');
    newStyle.WebkitTransform = newStyle.transform;
    newStyle.MozTransform = newStyle.transform;
    newStyle.OTransform = newStyle.transform;
    newStyle.msTransform = newStyle.transform;

    // "Stupid" check if style should be update
    if (JSON.stringify(plxStyle) !== JSON.stringify(newStyle)) {
      newState.plxStyle = newStyle;
    }

    if (Object.keys(newState).length) {
      requestAnimationFrame(() => {
        this.setState(newState);
      });
    }
  }

  render() {
    const {
      children,
      className,
      style,
    } = this.props;
    const {
      hasReceivedScrollEvent,
      plxStyle,
    } = this.state;

    return (
      <div
        className={ `Plx ${ className }` }
        style={ {
          ...style,
          ...plxStyle,
          // TODO think more about how to solve this
          visibility: hasReceivedScrollEvent ? null : 'hidden',
        } }
        ref={ el => this.element = el }
      >
        { children }
      </div>
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

const parallaxDataType = PropTypes.shape({
  start: PropTypes.oneOfType([
    PropTypes.oneOf(['top']),
    PropTypes.number,
  ]).isRequired,
  duration: PropTypes.oneOfType([
    PropTypes.oneOf(['height']),
    PropTypes.number,
  ]).isRequired,
  offset: PropTypes.number,
  properties: PropTypes.arrayOf(propertiesItemType).isRequired,
});


Plx.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  interval: PropTypes.number,
  parallaxData: PropTypes.arrayOf(parallaxDataType).isRequired,
  style: PropTypes.object,
};

Plx.defaultProps = {
  className: '',
  interval: 16,
};
