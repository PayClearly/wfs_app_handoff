import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    storedUsers: Selectors.storedUsers(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    syncUsers: (ids) => {
      dispatch(Store.users.sync(ids));
    },
  });
};

class components_userswatcher extends Component {


  componentWillReceiveProps(nextProps) {
    this.props.syncUsers(nextProps.storedUsers);
  }


  render() {
    return (
      <div className="components_userswatcher" />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_userswatcher);


