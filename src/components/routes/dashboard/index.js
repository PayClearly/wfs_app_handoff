import { connect, Component, bindActionCreators, Fragment } from 'component';

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

class components_routes_dashboard extends Component {


  componentWillReceiveProps(nextProps = {}) { }


  render() {
    return (
      <Components.widgetPanel />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_dashboard);


