import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    adminAccounts: state.admin.accounts.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_exceptions extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    if (!Object.keys(this.props.adminAccounts).length) return <Components.spinner />;
    return (
      <Fragment>
        {/* <div className="row mb-4">
          <div className="col-12">
            <Components.cards.csraccountstatuses />
          </div>
        </div> */}
        <div className="row mb-4">
          <div className="col-12 col-md-12 col-xl-12 order-1 order-md-2 mb-3 mb-md-0">
            <Components.cards.exceptions />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_exceptions);


