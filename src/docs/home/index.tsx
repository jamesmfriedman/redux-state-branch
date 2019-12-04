import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@rmwc/icon';
import { Fab } from '@rmwc/fab';
import { Tree } from '../tree';

import './home.styles.css';

export const Home = () => (
  <div className="home">
    <Tree className="home__tree" />
    <div>
      <h1 className="home__title">Redux StateBranch</h1>
      <h2 className="home__subtitle">
        A library for simplified Redux development.
      </h2>

      <code className="home__npm-install">
        npm&nbsp;install
        <wbr /> redux-state-branch
      </code>

      <ul>
        <li>
          <Icon icon="check" /> Zero Dependencies
        </li>
        <li>
          <Icon icon="check" /> &lt; 5 KB
        </li>
        <li>
          <Icon icon="check" /> Typescript Support
        </li>
      </ul>

      <Fab
        tag={Link}
        {...{ to: '/getting-started' }}
        label="Get Started"
        trailingIcon="keyboard_arrow_right"
      />
    </div>
  </div>
);
