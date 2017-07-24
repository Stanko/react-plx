import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScrollManager from './scroll-manager';

const RESIZE_DELAY = 250;
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

export default class Plx extends Component {
  constructor(props) {
    super(props);

    const {
      interval,
    } = props;

    this.scrollManager = new ScrollManager(interval);
    this.handleScrollChange = this.handleScrollChange.bind(this);
    this.handleResizeChange = this.handleResizeChange.bind(this);
    this.debounceWindowResize = this.debounceWindowResize.bind(this);

    this.state = {
      hasReceivedScrollEvent: false,
      plxStyle: {},
    };
  }

  componentWillMount() {
    window.addEventListener('plx-scroll', this.handleScrollChange);
    window.addEventListener('resize', this.debounceWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    this.update(this.scrollManager.getWindowScrollTop(), nextProps);
  }

  componentWillUnmount() {
    window.removeEventListener('plx-scroll', this.handleScrollChange);
    window.removeEventListener('resize', this.debounceWindowResize);
    clearTimeout(this.timeoutID);
    this.timeoutID = null;

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

  debounceWindowResize() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(this.handleResizeChange, RESIZE_DELAY);
  }

  parallax(scrollPosition, start, duration, startValue, endValue) {
    let min = startValue;
    let max = endValue;
    const invert = startValue > endValue;

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

  handleResizeChange() {
    this.update(this.scrollManager.getWindowScrollTop(), this.props);
  }

  handleScrollChange(e) {
    this.update(e.detail.scrollPosition, this.props);
  }

  update(scrollPosition, props) {
    const {
      parallaxData,
    } = props;
    const {
      hasReceivedScrollEvent,
      plxStyle,
    } = this.state;

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

      if (scrollPosition < startPosition) {
        break;
      }

      if (scrollPosition >= startPosition && scrollPosition <= endPosition) {
        properties.forEach((propertyData) => {
          const {
            startValue,
            endValue,
            property,
            unit,
          } = propertyData;
          appliedProperties.push(property);

          const propertyUnit = this.getUnit(property, unit);
          const value = this.parallax(
            scrollPosition,
            startPosition,
            parallaxDuration,
            startValue,
            endValue
          );
          const transformMethod = TRANSFORM_MAP[property];

          if (transformMethod) {
            // Transforms
            newStyle.transform[property] = transformMethod(value, propertyUnit);
          } else {
            // All other properties
            newStyle[property] = value;
          }
        });
      } else {
        segments.push({
          parallaxDuration,
          properties,
          startPosition,
        });
      }
    }

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

        const propertyUnit = this.getUnit(property, unit);
        const value = this.parallax(
          scrollPosition,
          startPosition,
          parallaxDuration,
          startValue,
          endValue
        );
        const transformMethod = TRANSFORM_MAP[property];

        if (transformMethod) {
          // Transforms
          newStyle.transform[property] = transformMethod(value, propertyUnit);
        } else {
          // All other properties
          newStyle[property] = value;
        }
      });
    });

    const transformsOrdered = [];

    ORDER_OF_TRANSFORMS.forEach(transformKey => {
      if (newStyle.transform[transformKey]) {
        transformsOrdered.push(newStyle.transform[transformKey]);
      }
    });

    newStyle.transform = transformsOrdered.join(' ');
    newStyle.WebkitTransform = newStyle.transform;
    newStyle.MozTransform = newStyle.transform;
    newStyle.OTransform = newStyle.transform;
    newStyle.msTransform = newStyle.transform;

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
  startValue: PropTypes.number.isRequired,
  endValue: PropTypes.number.isRequired,
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
