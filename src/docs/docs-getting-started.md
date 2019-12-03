# Getting Started

Redux StateBranch is a thin wrapper around redux that drastically reduces the boilerplate and complexity of managing and retrieving state in your app.

## Motivation
If you strip away all of the fancy language about stores, reducers, action creators, epics sagas, thunks... Redux is at its heart a form of client side database, and the reducers are similar to tables. It's simple in concept, but can be a pain to setup and maintain. More often then not you'll find yourself doing the same sets of things over and over again which is both annoying and hard to maintain.

`redux-state-branch` is a thin wrapper for redux that makes creating and interfacing with reducers a breeze by providing a unified api to Create, Read, Update, and Delete data. It's a pattern that allows you to quickly iterate, maintain, and scale your state management across your team and project. It can be added to any new or existing project and can live alongside other reducers that are using traditional redux patterns.

While this library was created to alleviate some of the overhead of managing redux state, it is still recommended that you familiarize yourself with the general concepts of Redux.

## Installation
- `npm install redux-state-branch`
 
## Typescript Setup
- This project supports Typescript out of the box, no additional configuration is necessary
