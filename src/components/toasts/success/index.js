import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_toasts_success extends Component {

  state = {
    toastTimer: null,
  }

  componentDidMount() {
    const toastTimer = setTimeout(() => {
      this.props.close();
    }, 4000);
    this.setState({ toastTimer });
  }
  componentWillUnmount() {
    clearTimeout(this.state.toastTimer);
  }

  render() {
    const message = _try(() => this.props.message, 'Success!');
    return (
      <div className="components_toasts_success">
        <i className="mdi mdi-check" />
        {message}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_toasts_success);


