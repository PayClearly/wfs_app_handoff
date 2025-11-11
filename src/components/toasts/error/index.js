import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_toasts_error extends Component {

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
    return (
      <div className="components_toasts_error">
        <i className="mdi mdi-alert-circle" />
        Error! Please try again.
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_toasts_error);


