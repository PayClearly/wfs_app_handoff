import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// Store.router.setQueryParams
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_profile extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_routes_profile">

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_profile);


