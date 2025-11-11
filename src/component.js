import React, { Component as ReactComponent, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import uuid from 'uuid';
import Store from 'store';

window.React = React;
export { Fragment };
window.renderLog = {};

export class Component extends ReactComponent {

  constructor(_props) {
    super(_props);

    const render = this.render.bind(this);
    this.render = () => render();

    const componentDidMount = (this.componentDidMount || (() => { })).bind(this);
    this.componentDidMount = () => {
      this._resourceComponentId = uuid();
      componentDidMount();
      return this.componentWillReceiveProps(this.props);
    };

    const componentWillUnmount = (this.componentWillUnmount || (() => { })).bind(this);
    this.componentWillUnmount = (...props) => {
      this.props._unsyncResources(this._resourceComponentId);
      return componentWillUnmount(...props);
    };

    const componentWillReceiveProps = (this.componentWillReceiveProps || (() => { })).bind(this);
    this.componentWillReceiveProps = (...props) => {
      this.props._syncResources(this._resourceComponentId);
      return componentWillReceiveProps(...props);
    };

  }

}

export function connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps) {
  return (Comp) => {

    let mappedResourcePaths;
    const _mapStateToProps = (state, props) => {
      const mappedState = mapStateToProps(state, props);
      mappedResourcePaths = _try(() => mapResourcesToProps(state, { ...props, ...mappedState }), {});

      return ({
        ...mappedState,
        ...Object.keys(mappedResourcePaths || {})
          .reduce((acc, curr) => {
            acc[curr] = _try(() => state.resources.resources[`${mappedResourcePaths[curr]}`]);
            return acc;
          }, {}),
      });
    };

    const _mapDispatchToProps = (dispatch, props, other) => {
      const current = typeof mapDispatchToProps === 'function' ? mapDispatchToProps(dispatch, props) : bindActionCreators(mapDispatchToProps, dispatch);
      return ({
        ...current,
        _syncResources: (compId) => {
          Object.keys(mappedResourcePaths)
            .forEach((key) => dispatch(Store.resources.sync(compId, mappedResourcePaths[key])));
        },
        _unsyncResources: (compId) => {
          Object.keys(mappedResourcePaths)
            .forEach((key) => dispatch(Store.resources.unsync(compId, mappedResourcePaths[key])));
        },
      });
    };

    return reduxConnect(_mapStateToProps, _mapDispatchToProps)(Comp);
  };
}

export { bindActionCreators };
