import * as React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Home } from './home';

import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
  DrawerAppContent
} from 'rmwc/Drawer';

import { Fab } from 'rmwc/Fab';

import { List, SimpleListItem } from 'rmwc/List';

// Markdown
import GettingStarted from './docs-getting-started.md';
import SetupRedux from './docs-setup-redux.md';
import Branches from './docs-branches.md';
import Actions from './docs-actions.md';
import Selectors from './docs-selectors.md';
import ConnectComponents from './docs-connect-components.md';
import SampleTodo from './docs-sample-todo.md';

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
    title: 'Connect Components',
    icon: 'power',
    path: '/connect-components',
    component: ConnectComponents
  },
  {
    title: 'Sample Todo App',
    icon: 'done_all',
    path: '/sample-todo-app',
    component: SampleTodo
  }
];

const scrollToTop = () => window.scrollTo(0, 0);

const Logo = () => (
  <div className="app__logo">
    <svg viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10,21V18H3L8,13H5L10,8H7L12,3L17,8H14L19,13H16L21,18H14V21H10Z"
      />
    </svg>
  </div>
);

const Nav = () => (
  <Drawer dismissible open>
    <DrawerHeader tag={Link} to="/">
      <Logo />
      <DrawerTitle>Redux StateBranch</DrawerTitle>
      <DrawerSubtitle>A redux wrapper for sane people.</DrawerSubtitle>
    </DrawerHeader>
    <DrawerContent>
      <List>
        {ROUTES.map(r => (
          <SimpleListItem
            onClick={scrollToTop}
            activated={window.location.pathname.includes(r.path)}
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
);

export class App extends React.Component<{}> {
  render() {
    return (
      <React.Fragment>
        <Nav />
        <DrawerAppContent className="app__content">
          <Switch>
            <Route path="/" exact component={Home} />
            {ROUTES.map((r, i) => {
              const nextRoute = ROUTES[i + 1];
              const prevRoute = ROUTES[i - 1];
              return (
                <Route
                  key={r.path}
                  path={r.path}
                  render={() => (
                    <div>
                      <r.component />
                      <div style={{ display: 'flex' }}>
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
                            icon="keyboard_arrow_right"
                          />
                        )}
                      </div>
                    </div>
                  )}
                />
              );
            })}
          </Switch>
        </DrawerAppContent>
      </React.Fragment>
    );
  }
}
