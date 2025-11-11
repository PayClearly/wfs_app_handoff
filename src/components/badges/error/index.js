import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_badges_error extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { paymentStatus } = this.props;
    let message = '';

    if (!paymentStatus.hasActiveErrors || paymentStatus.hasActiveErrors === 'Unknown') return null;
    // Aggregate all errors, if more than one list the number else list the message
    const errors = [];
    STEPS.forEach((step) => {
      if (!_try(() => paymentStatus[step]._errors.length)) return;
      const stepErrors = paymentStatus[step]._errors;

      stepErrors.forEach((error) => { errors.push(error); });
    });

    if (errors.length > 1) {
      message = `There are ${errors.length} errors`;
    } else {
      message = `Error: ${errors[0].error}`;
    }

    return (
      <Components.tooltip className="float-start text-secondary">
        <div><i className="mdi mdi-alert text-danger" /></div>
        <div>{message}</div>
      </Components.tooltip>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_error);

// Internal Helper Functions ...

const STEPS = ['created', 'verified', 'funded', 'sent', 'tracked'];

// GENERATOR_TYPE='component';
