import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'rmwc/Icon';
import { Fab } from 'rmwc/Fab';
import { Tree } from '../tree';

import './home.styles.css';

export const Home = () => (
  <div className="home">
    <Tree className="home__tree" />
    <div>
      <h1 className="home__title">Redux StateBranch</h1>
      <h2 className="home__subtitle">A redux wrapper for sane people.</h2>

      <code className="home__npm-install">npm install redux-state-branch</code>

      <ul>
        <li>
          <Icon icon="check" /> Zero Dependencies
        </li>
        <li>
          <Icon icon="check" /> &lt; 5 KB
        </li>
        <li>
          <Icon icon="check" /> Typescript + Flow Support
        </li>
      </ul>

      <Fab
        tag={Link}
        {...{ to: '/getting-started' }}
        label="Get Started"
        icon="keyboard_arrow_right"
      />
    </div>
  </div>
);
