import React from 'react';
import Plx from '../source/index';

const phoneData = [
  {
    start: 'self',
    startOffset: 300,
    duration: 500,
    easing: [0.25, 0.1, 0.6, 1.5],
    properties: [
      {
        startValue: 90,
        endValue: 0,
        property: 'rotate',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'scale',
      },
    ],
  },
];

const contentData = [
  {
    start: '.Phone',
    startOffset: 400,
    duration: 150,
    properties: [
      {
        startValue: 0,
        endValue: -200,
        unit: '%',
        property: 'translateY',
      },
    ],
  },
];

export default class Phone extends React.Component {
  render() {
    return (
      <Plx
        className='Phone'
        parallaxData={ phoneData }
      >
        <svg width='221px' height='464px' viewBox='0 0 221 464' className='Phone-svg'>
          <path
            d='M3,164 L0,164 L0,147 L3,147 L3,126 L0,126 L0,109 L3,109 L3,87 L0,87 L0,66 L3,66 L3,34.0058827
            C3,16.3333538 17.3228613,2 34.9910061,2 L149,2 L149,0 L185,0 L185,2 L189.008994,2 C206.675354,2
            221,16.3295218 221,34.0058827 L221,431.994117 C221,449.666646 206.677139,464 189.008994,464
            L34.9910061,464 C17.3246455,464 3,449.670478 3,431.994117 L3,164 Z M94.0088498,40 C93.4516774,40
            93,40.4433532 93,41.0093689 L93,42.9906311 C93,43.5480902 93.4508527,44 93.9996148,44 L116.404905,44
            L128.992078,44 C129.548738,44 130,43.5566468 130,42.9906311 L130,41.0093689 C130,40.4519098 129.558697,40
            128.99115,40 L94.0088498,40 Z M111.5,29 C113.985281,29 116,26.9852815 116,24.5 C116,22.0147185 113.985281,20
            111.5,20 C109.014719,20 107,22.0147185 107,24.5 C107,26.9852815 109.014719,29 111.5,29 Z M17.9944647,66
            C16.8929523,66 16,66.9024743 16,68.0096543 L16,398.990346 C16,400.100247 16.8987528,401 17.9944647,401
            L206.005535,401 C207.107048,401 208,400.097526 208,398.990346 L208,68.0096543 C208,66.8997529 207.101247,66
            206.005535,66 L17.9944647,66 Z M112,450 C122.493411,450 131,441.493411 131,431 C131,420.506589
            122.493411,412 112,412 C101.506589,412 93,420.506589 93,431 C93,441.493411 101.506589,450 112,450 Z M81,45
            C82.6568543,45 84,43.6568543 84,42 C84,40.3431457 82.6568543,39 81,39 C79.3431457,39 78,40.3431457 78,42
            C78,43.6568543 79.3431457,45 81,45 Z M112,448 C121.388841,448 129,440.388841 129,431 C129,421.611159
            121.388841,414 112,414 C102.611159,414 95,421.611159 95,431 C95,440.388841 102.611159,448 112,448 Z'
            fill='#000000'
          />
        </svg>
        <div className='Phone-content'>
          <Plx
            className='Phone-contentPlx'
            parallaxData={ contentData }
          >
            <div className='Phone-contentSection'>Plx</div>
            <div className='Phone-contentSection'>says</div>
            <div className='Phone-contentSection'>Hello!</div>
          </Plx>
        </div>
      </Plx>
    );
  }
}
