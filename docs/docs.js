import React from 'react';
import ReactDOM from 'react-dom';
import Plx from '../source/index';
import keenImage from './keen.png';
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
                  start: 50,
                  duration: 300,
                  name: 'first',
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
                  start: 400,
                  duration: 300,
                  name: 'second',
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
                  start: '90%',
                  duration: '9%',
                  name: 'third',
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
              <img alt='' src={ keenImage } />
            </Plx>
          </div>
        </div>
        <ol>
          <li>50 - 350px: it will rotate for 360deg, scale to 50% and fade to 0.2 opacity</li>
          <li>400 - 700px: it will fade in to 1, scale to 150% and tranlsate to left 100%</li>
          <li>
            90%-99% of the total page scroll: it will translate to the right 100%,
            rotate from 360 to 0deg and scale back to 100%
          </li>
        </ol>
        <p>
          You can also see in which state animation is, and this is updated via CSS
          using Plx&apos;s animation state classes.
          (In this case <code>::after</code> element is used.)
        </p>
        <hr className='margin-y-50' />
        <div className=''>
          <p>
            Manipulate Background Position
          </p>
        </div>
        <Plx
          className='bgDemo'
          style={ {
            backgroundImage: `url(${ keenImage })`,
            height: 150,
          } }
          parallaxData={ [
            {
              start: '.title',
              duration: 'height',
              name: 'bgdemo',
              properties: [{
                startValue: 0,
                endValue: 300,
                property: 'backgroundPositionX',
              }],
            },
          ] }
        />
        <hr className='margin-y-50' />
        <div className=''>
          <p>
            Three blocks translating and scaling at different speeds.
            Offset is set to <code>-200</code>, so animation starts when
            elements get at 200 pixels from viewport edge.
          </p>
          <p>
            Custom cubic bezier easing is applied <code>(0.25, 0.1, 0.53, 3)</code>
          </p>

          <div className='HorizontalDemo'>
            <Plx
              className='HorizontalDemo-item HorizontalDemo-item--one'
              parallaxData={ [
                {
                  start: 'top',
                  offset: -200,
                  duration: 'height',
                  easing: [0.25, 0.1, 0.53, 3],
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
                  easing: [0.25, 0.1, 0.53, 3],
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
                  easing: [0.25, 0.1, 0.53, 3],
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
