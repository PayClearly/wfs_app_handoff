import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fetched: Selectors.privileges(state).fetched,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_invalidpermissions extends Component {




  render() {
    if (!this.props.fetched) return null;

    return (
      <Components.cardsroute>
        <div className="row">
          <div className="col-12">
            <h2 className="text-center pt-5">You do not have permissions to view this page</h2>
          </div>
        </div>
      </Components.cardsroute>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_invalidpermissions);


