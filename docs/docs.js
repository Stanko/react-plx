import React from 'react';
import ReactDOM from 'react-dom';
import Plx from '../source/index';
import './docs.scss';

const Example = class extends React.Component {
  render() {
    return (
      <div className='Content'>
        <div className='FixedDemo-spacer'>
          <div className='FixedDemo-wrapper'>
            <Plx
              className='FixedDemo'
              animateWhenNotInViewport={ true }
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
          </div>
        </div>
        <ol>
          <li>0 - 300px: it will rotate for 360deg, scale to 50% and fade to 0.2 opacity</li>
          <li>350 - 650px: it will fade in to 1, scale to 150% and tranlsate to left 100%</li>
          <li>
            700-1000px: it will translate to the right 100%,
            rotate from 360 to 0deg and scale back to 100%
          </li>
        </ol>
        <hr className='margin-y-50' />
        <div className=''>
          <p>
            Three blocks translating and scaling at different speeds.
            Offset is set to <code>-200</code>, so animation starts when
            elements get at 200 pixels from viewport edge.
          </p>

          <div className='HorizontalDemo'>
            <Plx
              className='HorizontalDemo-item HorizontalDemo-item--one'
              parallaxData={ [
                {
                  start: 'top',
                  offset: -200,
                  duration: 'height',
                  properties: [
                    {
                      startValue: 0,
                      endValue: 200,
                      property: 'translateX',
                    },
                    {
                      startValue: 1,
                      endValue: 1.3,
                      property: 'scale',
                    },
                  ],
                },
              ] }
            />
            <Plx
              className='HorizontalDemo-item HorizontalDemo-item--two'
              parallaxData={ [
                {
                  start: 'top',
                  offset: -200,
                  duration: 'height',
                  properties: [
                    {
                      startValue: 0,
                      endValue: 250,
                      property: 'translateX',
                    },
                    {
                      startValue: 1,
                      endValue: 1.2,
                      property: 'scale',
                    },
                  ],
                },
              ] }
            />
            <Plx
              className='HorizontalDemo-item HorizontalDemo-item--three'
              parallaxData={ [
                {
                  start: 'top',
                  offset: -200,
                  duration: 'height',
                  properties: [
                    {
                      startValue: 0,
                      endValue: 300,
                      property: 'translateX',
                    },
                    {
                      startValue: 1,
                      endValue: 1.1,
                      property: 'scale',
                    },
                  ],
                },
              ] }
            />
          </div>
        </div>
        <hr className='margin-y-50' />
        <div className=''>
          <Plx
            className='ColorDemo'
            parallaxData={ [
              {
                start: 'top',
                offset: -500,
                duration: 300,
                properties: [
                  {
                    startValue: 'RGBA(239, 73, 118, 1)',
                    endValue: 'rgb(63, 147, 194)',
                    property: 'borderColor',
                  },
                  {
                    startValue: '#F14675',
                    endValue: '#3A92C4',
                    property: 'color',
                  },
                ],
              },
              {
                start: 'top',
                offset: -200,
                duration: 300,
                properties: [
                  {
                    startValue: 'rgb(63, 147, 194)',
                    endValue: 'RGBA(109, 223, 118, 1)',
                    property: 'borderColor',
                  },
                  {
                    startValue: '#3A92C4',
                    endValue: '#71DD7B',
                    property: 'color',
                  },
                ],
              },
            ] }
          >
            This block will change it&apos;s text and border color.
          </Plx>
        </div>
        <hr className='margin-y-50' />
        <div className='ClockDemo--wrapper'>
          <p>
            Simple clock, with it&apos;s arms moving at relative speeds.
          </p>
          <div className='ClockDemo'>
            <Plx
              className='ClockDemo-arm'
              parallaxData={ [
                {
                  start: 0,
                  duration: 2000,
                  properties: [
                    {
                      startValue: 0,
                      endValue: 1440,
                      property: 'rotate',
                    },
                  ],
                },
              ] }
            />
            <Plx
              className='ClockDemo-arm ClockArm--small'
              parallaxData={ [
                {
                  start: 0,
                  duration: 2000,
                  properties: [
                    {
                      startValue: 30,
                      endValue: 150,
                      property: 'rotate',
                    },
                  ],
                },
              ] }
            />
          </div>
        </div>
      </div>
    );
  }
};


ReactDOM.render(<Example />, document.getElementById('demo'));
