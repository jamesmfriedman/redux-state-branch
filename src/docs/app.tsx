import React, { useState, useEffect } from 'react';
import { Switch, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './home';

import { Drawer, DrawerContent, DrawerAppContent } from '@rmwc/drawer';

import { Fab } from '@rmwc/fab';
import {
  SimpleTopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarActionItem
} from '@rmwc/top-app-bar';
import { IconButton } from '@rmwc/icon-button';

import { List, SimpleListItem } from '@rmwc/list';

// Markdown
import GettingStarted from './docs-getting-started.md';
import SetupRedux from './docs-setup-redux.md';
import Branches from './docs-branches.md';
import Actions from './docs-actions.md';
import Selectors from './docs-selectors.md';
import SampleTodo from './docs-sample-todo.md';
import { Button } from '@rmwc/button';
import { ApiReference } from './api-reference';

const ROUTES = [
  {
    title: 'Getting Started',
    icon: 'flag',
    path: '/getting-started',
    component: GettingStarted
  },
  {
    title: 'Setup Redux',
    icon: 'build',
    path: '/setup-redux',
    component: SetupRedux
  },
  {
    title: 'Branches',
    icon: 'call_split',
    path: '/branches',
    component: Branches
  },
  {
    title: 'Actions',
    icon: 'touch_app',
    path: '/actions',
    component: Actions
  },
  {
    title: 'Selectors',
    icon: 'how_to_vote',
    path: '/selectors',
    component: Selectors
  },
  {
    title: 'Sample Todo App',
    icon: 'check_circle',
    path: '/sample-todo-app',
    component: SampleTodo
  },
  {
    title: 'API Reference',
    icon: 'code',
    path: '/api-reference',
    component: ApiReference
  }
];

const scrollToTop = () => window.scrollTo(0, 0);

const Logo = () => (
  <div className="app__logo">
    <svg viewBox="0 0 24 24">
      <path
        fill="transparent"
        stroke="currentColor"
        d="M10,21V18H3L8,13H5L10,8H7L12,3L17,8H14L19,13H16L21,18H14V21H10Z"
      />
    </svg>
  </div>
);

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(
    !window.matchMedia('(min-width: 769px)').matches
  );

  const location = useLocation();

  useEffect(() => {
    window.addEventListener('resize', () =>
      setIsMobile(!window.matchMedia('(min-width: 769px)').matches)
    );
  }, []);

  const open = isMobile ? isOpen : true;

  return (
    <>
      <SimpleTopAppBar
        className="nav"
        // @ts-ignore
        title={
          <Link to="/" className="app__link">
            <Logo /> Redux StateBranch
          </Link>
        }
        fixed
        endContent={
          <>
            <Button
              className="nav__get-started"
              tag={Link}
              {...{ to: '/getting-started' }}
              label="Get Started"
              outlined
            />
            <TopAppBarActionItem
              icon={
                <div>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                    />
                  </svg>
                </div>
              }
              tag="a"
              {...{
                href: 'https://github.com/jamesmfriedman/redux-state-branch'
              }}
              className="github-btn"
            ></TopAppBarActionItem>
          </>
        }
      />

      <TopAppBarFixedAdjust />
      <Drawer
        className="nav__drawer"
        dismissible={!isMobile}
        modal={isMobile}
        open={open}
        onClose={() => setIsOpen(false)}
      >
        <DrawerContent style={{ display: 'flex', flexDirection: 'column' }}>
          <List>
            {ROUTES.map(r => (
              <SimpleListItem
                onClick={scrollToTop}
                activated={location.pathname.includes(r.path)}
                key={r.path}
                graphic={r.icon}
                text={r.title}
                tag={Link}
                {...{ to: r.path }}
              />
            ))}
          </List>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function App() {
  const location = useLocation();
  const pageClass = location.pathname.split('/').pop() || 'home';

  return (
    <>
      <Nav />
      <DrawerAppContent className={`app__content ${pageClass}`}>
        <Switch>
          {ROUTES.map((r, i) => {
            const nextRoute = ROUTES[i + 1] || {
              title: 'Visit Github',
              path: 'https://github.com/jamesmfriedman/redux-state-branch'
            };
            const prevRoute = ROUTES[i - 1];
            return (
              <Route
                key={r.path}
                path={r.path}
                render={() => (
                  <div>
                    <r.component />
                    <div className="footer">
                      {!!prevRoute && (
                        <Fab
                          onClick={scrollToTop}
                          tag={Link}
                          {...{ to: prevRoute.path }}
                          mini
                          icon="keyboard_arrow_left"
                        />
                      )}
                      <div style={{ flex: 1 }} />
                      {!!nextRoute && (
                        <Fab
                          onClick={scrollToTop}
                          tag={Link}
                          {...{ to: nextRoute.path }}
                          label={nextRoute.title}
                          trailingIcon="keyboard_arrow_right"
                        />
                      )}
                    </div>
                  </div>
                )}
              />
            );
          })}
          <Route path="/" component={Home} />
        </Switch>
      </DrawerAppContent>
    </>
  );
}
