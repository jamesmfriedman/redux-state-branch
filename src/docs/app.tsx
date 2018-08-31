import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Home } from './home';

import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
  DrawerAppContent
} from 'rmwc/Drawer';

import { List, ListItem } from 'rmwc/List';

const Nav = () => (
  <Drawer dismissible open>
    <DrawerHeader>
      <DrawerTitle>REDUX_STATE_BRANCH</DrawerTitle>
      <DrawerSubtitle>Subtitle</DrawerSubtitle>
    </DrawerHeader>
    <DrawerContent>
      <List>
        <ListItem>Get Started</ListItem>
        <ListItem>Pizza</ListItem>
        <ListItem>Icecream</ListItem>
      </List>
    </DrawerContent>
  </Drawer>
);

export class App extends React.Component<{}> {
  render() {
    return (
      <React.Fragment>
        <Nav />
        <DrawerAppContent>
          <Switch>
            <Route path="/" exact component={Home} />
          </Switch>
        </DrawerAppContent>
      </React.Fragment>
    );
  }
}
