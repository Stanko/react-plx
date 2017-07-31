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

It is lightweight, and beside `react`, `react-dom` and `prop-types` ~~has no dependencies~~, now it has small `bezier-easing` package. As listening to scroll event is not performant, this component uses different approach. Interval is set (every 16ms to get 60fps) to check if scroll position is changed, and if it is, it broadcasts custom event. All of the `Plx` components are sharing the scroll manager singleton. Interval is set when the first component is created, and cleared when last one is unmounted. Interval time can be changed through the props, but it is shared across the components.

Elements outside of viewport are not animated. This is done by using `getBoundingClientRect`, but there is a [known bug in iOS](https://openradar.appspot.com/radar?id=6668472289329152) with `getBoundingClientRect` and position `fixed`. If you get into the same problems, you can force rendering by passing `animateWhenNotInViewport={ true }`.

Still you need to avoid common "don't dos" when making a parallax page:

* Avoid `background-size: cover`
* Don’t animate massive images or dramatically resize them
* Avoid animating 100 things at once
* Only use properties that are cheap for browsers to animate - opacity and transform (scale, rotate, skew, scale)

Read this [great article](https://medium.com/@dhg/parallax-done-right-82ced812e61c) to find out more (that is where I got my initial inspiration).

Of course, you can break any of these rules, but test for performance to see if it works for you.

Component is written as ES module, so it will work with webpack and other module bundlers (which is standard for React apps anyway). Tested with `react-create-app` and my boilerplate, [Marvin](https://github.com/workco/marvin).

Read more about how it works in [this blog post](https://stanko.github.io/plx-react-parallax-component/).

## Props

* **className** string

  CSS class name (it will be applied along with `Plx` class name).

* **style** object

  CSS style object, please note that properties used in parallax will be overridden by component.

* **interval** number, default `16`

  Interval in milliseconds, how often should interval check for scroll changes. Default 16 (60fps).

* **animateWhenNotInViewport** bool, default `false`

  If set to true element will be animated even when it is not in the viewport.
  This is helpful with fixed elements in iOS due to [know bug with `getBoundingClientRect` in iOS](https://openradar.appspot.com/radar?id=6668472289329152).

* **parallaxData** array of items (item structure described beneath), *required*

  Main data, describes parallax segments.

Any other props will be passed to the component (for example this is useful for `aria-*` props).

### parallaxData

* **start** number or `top`, *required*

  Scroll position (in pixels) where parallax effect should start.
  If set to `top`, it will start from element's top offset.

  PLEASE NOTE that `parallaxData` should be sorted by `start` value!

* **duration** number or `height`, *required*

  Value (in pixels) how long should effect last (it will finish when scroll position equals `start` + `duration`).
  If set to `height`, element's height will be used instead.

* **offset** number

  Start offset, useful when `duration={ 'height' }` is used

* **easing** string, function or array, default: 'linear'

  Easing function, you can pass the name (string) to choose one of the built-in functions.
  Built-in easing functions are:

  * ease
  * easeIn
  * easeOut
  * easeInOut
  * easeInSine
  * easeOutSine
  * easeInOutSine
  * easeInQuad
  * easeOutQuad
  * easeInOutQuad
  * easeInCubic
  * easeOutCubic
  * easeInOutCubic
  * easeInQuart
  * easeOutQuart
  * easeInOutQuart
  * easeInQuint
  * easeOutQuint
  * easeInOutQuint
  * easeInExpo
  * easeOutExpo
  * easeInOutExpo
  * easeInCirc
  * easeOutCirc
  * easeInOutCirc

  Cubic beziers are supported, pass an array to it with four points of your custom bezier (you can copy CSS beziers).
  ```
  easing: [0.25, 0.1, 0.53, 3]
  ```

  You can even pass custom function which accepts one argument, which will be number from 0 to 1.
  ```
  // Define your custom easing
  const myCustomEasing = (x) => {
    return x * x;
  }

  ...

  // and then pass it to Plx
  easing: myCustomEasing
  ```

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

  Supported colors are:

  * backgroundColor
  * color
  * borderColor
  * borderTopColor
  * borderBottomColor
  * borderLeftColor
  * borderRightColor

  To keep you parallax effects performant, I strongly advice not to use anything but opacity and transforms.

* **startValue** number (or string for color), *required*

  Start value for the effect. Property will have this value when scroll position equals `parallaxData.start`.
  For colors supported formats are: `#123`, `#001122`, `rgb(0,0,255)` and `rgba(0,0,255,0.5)`.

* **endValue** number (or string for color), *required*

  End value for the effect. Property will have this value when scroll position equals `parallaxData.end`.
  For colors supported formats are: `#123`, `#001122`, `rgb(0,0,255)` and `rgba(0,0,255,0.5)`.

  Between `parallaxData.start` and `parallaxData.end` value will transition relative to scroll position.

* **unit** string

  CSS unit (e.g. `%`, `rem`, `em`...) to be applied to property value. By default component is using pixels and degrees for rotation and skew.

## Example of props

These are the exact props used in the demo

```javascript
<Plx
  className='FixedDemo'
  animateWhenNotInViewport={ true } // Because of iOS bug
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
