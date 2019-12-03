# Redux StateBranch
https://jamesmfriedman.github.io/redux-state-branch/

## What is this library?
If you strip away all of the fancy language about stores, reducers, action creators, epics sagas, thunks... Redux is at its heart just client side database where the reducers are tables. If you've used it to build any number of apps, you'll find yourself doing some version of Create, Read, Update, and Delete lists of items over and over and over again.

`redux-state-branch` is a thin wrapper for redux that makes creating and interfacing with reducers a breeze by providing a unified api to Create, Read, Update, and Delete data. It's a pattern that allows you to quickly iterate, maintain, and scale your state management across your team and project.

`redux-state-branch` can be added to any new or existing project and can live alongside other reducers that are using traditional redux patterns.

While this library was created to alleviate some of the overhead of managing redux state, it is still recommended that you familiarize yourself with the general concepts of Redux.

## Installation
- `npm install redux-state-branch`
 
```yaml
[libs]
node_modules/redux-state-branch/flow-typed
```

Read the Docs
https://jamesmfriedman.github.io/redux-state-branch/
