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

class components_routes_accounts extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <Fragment>
        <Components.creators.account />
        <div className="card">
          <div className="card-body">
            <h2 className="card-title mb-3">Accounts</h2>
            <Components.tables.accounts />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_accounts);


