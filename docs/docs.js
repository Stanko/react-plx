import React from 'react';
import ReactDOM from 'react-dom';
import Plx from '../source/index';
import keenImage from './keen.png';
import './docs.scss';

const Example = class extends React.Component {
  render() {
    return (
      <div>
        <div style={ { height: 5000, position: 'relative' } }>
          <Plx
            className='DemoOne'
            parallaxData={ [
              {
                start: 200,
                end: 400,
                properties: [
                  {
                    startValue: 230,
                    endValue: 0,
                    property: 'translateY',
                  },
                ],
              },
              {
                start: 400,
                end: '.Footer',
                properties: [
                  {
                    startValue: 0,
                    endValue: 360,
                    property: 'rotate',
                  },
                  // {
                  //   startValue: 'rgba(255, 255, 255, 0)',
                  //   endValue: 'rgba(255, 0, 255, 1)',
                  //   property: 'backgroundColor',
                  // },
                ],
              },
            ] }
          >
            <img src='//images.contentful.com/udx5f2jyw09i/2GcxvHO8mkg48Q2QQWsCOe/438fc6923b9215901c35873ffb2122ce/fab-text-en.svg' />
          </Plx>
          <div className='Content'>
            <h1>Hello!</h1>
          </div>
        </div>
        <div style={ { height: 1000, border: '1px solid blue' } } className='Footer'>
          FOOTER
        </div>
      </div>
    );
  }
};


ReactDOM.render(<Example />, document.getElementById('demo'));
