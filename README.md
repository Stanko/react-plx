# Plx - React Parallax component

Lightweight and powerful React component, for creating on scroll effects aka. parallax.


## Demo

Check the [live demo](https://stanko.github.io/react-plx/).


## Quick start

Get it from npm

```
$ npm install --save react-plx
```

Import and use it in your React app.

```javascript
import React, { Component } from 'react';
import Plx from 'react-plx';

class Example extends Component {
  render() {
    return (
      <Plx
        className='MyAwesomeParallax'
        parallaxData={ ... } // your parallax effects, see beneath
      >
        /* Your content */
      </Plx>
    );
  }
}
```

## Table of contents
* [What is this?](#user-content-what-is-this)
* [Props](#user-content-props)
* [Example of props](#user-content-example-of-props)
* [Browser support](#user-content-browser-support)
* [License](#user-content-license)

## What is this?

This is React component which makes creating on scroll effects (aka parallax) easy. If you are not sure what it does, [demo](https://stanko.github.io/react-plx/) should help.

It is lightweight, and beside `react`, `react-dom` and `prop-types` has no dependencies. As listening to scroll event is not performant, this component uses different approach. Interval is set (every 16ms to get 60fps) to check if scroll position is changed, and if it is, it broadcasts custom event. All of the `Plx` components are sharing the scroll manager singleton. Interval is set when the first component is created, and cleared when last one is unmounted. Interval time can be changed through the props, but it is shared across the components.

Still you need to avoid common "don't dos" when making a parallax page:

* Avoid `background-size: cover`
* Don’t animate massive images or dramatically resize them
* Avoid animating 100 things at once
* Only use properties that are cheap for browsers to animate - opacity and transform (scale, rotate, skew, scale)

Read this [great article](https://medium.com/@dhg/parallax-done-right-82ced812e61c) to find out more (that is where I got my initial inspiration).

Of course, you can break any of these rules, but test for performance to see if it works for you.

Component is written as ES module, so it will work with webpack and other module bundlers (which is standard for React apps anyway). Tested with `react-create-app` and my boilerplate, [Marvin](https://github.com/workco/marvin).

## Props

* **className** string

  CSS class name (it will be applied along with `Plx` class name).

* **style** object

  CSS style object, please note that properties used in parallax will be overridden by component.

* **interval** number

  Interval in milliseconds, how often should interval check for scroll changes. Default 16 (60fps).

* **parallaxData** array of items (item structure described beneath), *required*

  Main data, describes parallax segments.


### parallaxData

* **start** number or `top`, *required*

  Scroll position (in pixels) where parallax effect should start.
  If set to `top`, it will start from element's top offset.

* **duration** number or `height`, *required*

  Value (in pixels) how long should effect last (it will finish when scroll position equals `start` + `duration`).
  If set to `height`, element's height will be used instead.

* **offset** number

  Start offset, useful when `duration={ 'height' }` is used

* **properties** array of items (item structure described beneath), *required*

  List of properties to be animated

### properties

* **property** string, *required*

  CSS property to be animated, works only on properties which accept numerical values (e.g. `opacity`, `height`...).
  For `transform` use functions instead (e.g. `translateX`, `scale`, `rotate`...).
  Supported transform functions are:

  * translateX
  * translateY
  * translateZ
  * skew
  * skewX
  * skewY
  * skewZ
  * rotate
  * rotateX
  * rotateY
  * rotateZ
  * scale
  * scaleX
  * scaleY
  * scaleZ

  To keep you parallax effects performant, I strongly advice not to use anything but opacity and transforms.

* **startValue** number, *required*

  Start value for the effect. Property will have this value when scroll position equals `parallaxData.start`.

* **endValue** number, *required*

  End value for the effect. Property will have this value when scroll position equals `parallaxData.end`.

  Between `parallaxData.start` and `parallaxData.end` value will transition relative to scroll position.

* **unit** string

  CSS unit (e.g. `%`, `rem`, `em`...) to be applied to property value. By default component is using pixels and degrees for rotation and skew.

## Example of props

These are the exact pros used in the demo

```javascript
<Plx
  className='demo-1'
  parallaxData={ [
    {
      start: 0,
      duration: 300,
      properties: [
        {
          startValue: 1,
          endValue: 0.2,
          property: 'opacity',
        },
        {
          startValue: 1,
          endValue: 0.5,
          property: 'scale',
        },
        {
          startValue: 0,
          endValue: 360,
          property: 'rotate',
        },
      ],
    },
    {
      start: 350,
      duration: 300,
      properties: [
        {
          startValue: 0,
          endValue: -100,
          unit: '%',
          property: 'translateX',
        },
        {
          startValue: 0.2,
          endValue: 1,
          property: 'opacity',
        },
        {
          startValue: 0.5,
          endValue: 1.5,
          property: 'scale',
        },
      ],
    },
    {
      start: 700,
      duration: 300,
      properties: [
        {
          startValue: -100,
          endValue: 100,
          unit: '%',
          property: 'translateX',
        },
        {
          startValue: 360,
          endValue: 0,
          property: 'rotate',
        },
        {
          startValue: 1.5,
          endValue: 1,
          property: 'scale',
        },
      ],
    },
  ] }
>
  <img alt='' src='https://stanko.github.io/public/img/s.png' />
</Plx>
```


## Browser support

Modern browsers and IE10+.

IE9 should work if polyfill `requestAnimationFrame`. But I'm not supporting IE9.


## License

Released under [MIT License](LICENSE.md).
