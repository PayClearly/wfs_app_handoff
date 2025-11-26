import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';

const mapStateToProps = (state, props) => {
  return ({

  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openInAppBrowser: () => {
      dispatch(Store.device.openInAppBrowser('com.wfscorp.mywallet://callback'));
    },
  });
};

class components_routes_authorize extends Component {

  componentDidMount() {
    this.props.openInAppBrowser();
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_authorize);

