# Changelog

### v2.1.1 and 2.1.2

27.04.2023.

**Fixed**

- Fixed types [#95](https://github.com/Stanko/react-plx/pull/95)

---

### v2.1.0

05.04.2023.

**Added**

- Added `tagName` prop back.

---

### v2.0.1

19.06.2022.

**Changed**

- Swapped ESM module target from `esnext` to `ES2015` (aka `es6`).

---

### v2.0.0

17.06.2022.

**Improved**

- 30-50% performance improvements
- Rewritten to TypeScript and hooks.
- TypeScript types provides.
- ESM and CJS modules available.
- Reduced the number of dev dependencies.

**Changed**

- `tagName` prop was removed
- `px` units are not assumed and need to be provided manually

---

### v1.3.17

22.03.2020.

**Improved**

- Performance improvements suggested in [#79](https://github.com/Stanko/react-plx/pull/79).

---

### v1.3.16

29.09.2020.

**Fixed**

- Fixed [#60](https://github.com/Stanko/react-plx/pull/60).

**Changed**

- Minor code cleanup.

---

### v1.3.15

20.01.2020.

**Changed**

- Performance improvements [#59](https://github.com/Stanko/react-plx/pull/59).
- Better development setup using Parcel.

---

### v1.3.14

01.09.2019.

**Fixed**

- Made sure `ScrollManager`'s event listeners are removed.

---

### v1.3.13

28.03.2019.

**Fixed**

- Fixed SVG stroke color property name (from `strokeColor` to `color`)

---

### v1.3.12

12.02.2019.

**Fixed**

- Fixed default params in transform methods.

---

### v1.3.11

17.12.2018.

**Added**

- Added `onPlxStart` and `onPlxEnd` [callbacks](https://github.com/Stanko/react-plx/pull/48)

---

### v1.3.10

13.12.2018.

**Changed**

- Updated `window-scroll-manager` dependency.

---

### v1.3.8 and v1.3.9

02.09.2018.

**Changed**

- Breaking change - corrected typo `bellow` -> `below`.

**Updated**

- Updated readme.

---

### v1.3.6 and v1.3.7

14.07.2018.

**Fixed**

- Fixed `setState` getting called with `null` as a param

---

### v1.3.2, v1.3.3, v1.3.4 and v1.3.5 (it was a hard day)

12.07.2018.

**Updated**

- Updated [window-scroll-manager](https://github.com/Stanko/window-scroll-manager) version.
- Added version git tags

---

### v1.3.0 and v1.3.1

10.06.2018.

**Changed**

- Refactored a little bit, moved update logic outside of the component. Updated dependencies.
- Moved 'animated-scroll-to' to dev dependencies

---

- Moved main update method outside of the component class. Updated dependencies.

### v1.2.2

09.06.2018.

**Added**

- Added `fill` and `strokeColor` to the list of the color properties that can be animated.

---

### v1.2.0

26.05.2018.

**Changed**

- Replaced `componentWillReceiveProps` with `componentDidUpdate` to address changes introduced with React v16.3

---

### v1.1.3

26.05.2018.

**Added**

- This changelog.

**Fixed**

- Added a check if element is rendered before doing animation, related [issue](https://github.com/Stanko/react-plx/issues/17).

---

For changes prior version 1.1.3 please check the [commit list](https://github.com/Stanko/react-plx/commits/master).
