import { connect, Component, Fragment } from 'component';
import { Children } from 'react';
import { CSSTransition } from 'react-transition-group';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_creators_creatorwrapper extends Component {

  state = {
    showCreatedNotification: false,
  };

  componentDidMount() {}

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.status && this.props.status.creating && (!nextProps.status.creating && !nextProps.status.creatingError)) {
      if (typeof this.props.onCreate === 'function') {
        this.props.onCreate();
        this.setState({ showCreatedNotification: true });
      }
    }
  }

  componentWillUnmount() {
    if (typeof this.props.clearStatusErrors === 'function' && this.props.status && this.props.status.creatingError) {
      this.props.clearStatusErrors();
    }
  }

  onSubmit = () => {
    this.setState({ showCreatedNotification: false });
    this.props.onSubmit();
  };

  render() {
    if (!this.props.canCreate) {
      return null;
    }

    if (Children.count(this.props.children) > 1) {
      return (
        <div className="creator-wrapper">
          Incorrect number of children (expecting 1 child component)
        </div>
      );
    }

    if (this.props.noTransition) {
      return (
        <div className="creator-wrapper">
          {this.props.children}
        </div>
      );
    }

    if (this.props.useAccordion) {
      // use accordionShowLabel and accordionHideLabel props to use this feature
      return (
        <Components.forms.components.accordion
          showLabel={this.props.accordionShowLabel || 'Show'}
          hideLabel={this.props.accordionHideLabel || 'Hide'}
        >
          {this.props.children}
        </Components.forms.components.accordion>
      );
    }

    return (
      <CSSTransition
        classNames="creator-wrapper-transitioner"
        timeout={600}
        in={this.props.createFormActive}
      >
        <div className="creator-wrapper">
          { this.props.createFormActive ? this.props.children : null }
          { this.props.showErrorNotification && this.props.status.creatingError &&
            <div className="alert alert-danger" role="alert">
              {this.props.status.creatingError}
            </div>
          }
          { this.state.showCreatedNotification && this.props.onCreateNotification &&
            <div className="alert alert-primary" role="alert">
              {this.props.onCreateNotification}
            </div>
          }
          { this.props.includeButton &&
            <Components.button
              disabled={this.props.status.creating || this.props.createDisabled}
              updating={this.props.status.creating}
              onClick={this.onSubmit}
              onDisabledClick={this.props.onDisabledClick}
              buttonText="Create"
            />
          }
        </div>
      </CSSTransition>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_creatorwrapper);

