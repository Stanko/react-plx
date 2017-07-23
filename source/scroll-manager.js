let instance = null;
let instancesCount = 0;

const INTERVAL = 16;

// CustomEvent polyfill
if (typeof window.CustomEvent !== 'function') {
  const CustomEvent = function (event, params = { bubbles: false, cancelable: false, detail: undefined }) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

export default class ScrollManager {
  constructor(interval = INTERVAL) {
    instancesCount++;
    if (instance) {
      return instance;
    }

    instance = this;

    // Bind handlers
    this.handleInterval = this.handleInterval.bind(this);

    this.intervalID = setInterval(this.handleInterval, interval);
  }

  destroy() {
    instancesCount--;

    if (instancesCount === 0) {
      // Clear sinfleton instance
      instance = null;
      // Remove and reset interval/animationFrame
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }

  getWindowScrollTop() {
    // Get scroll position, with IE fallback
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  handleInterval() {
    const newScrollPosition = this.getWindowScrollTop();

    // Fire the event only when scroll position is changed
    if (newScrollPosition !== this.scrollPosition) {
      this.scrollPosition = newScrollPosition;

      const event = new CustomEvent('plx-scroll', {
        detail: {
          scrollPosition: newScrollPosition,
        },
      });

      // Dispatch the event.
      window.dispatchEvent(event);
    }
  }
}
