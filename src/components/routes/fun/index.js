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

class components_routes_fun extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    // if (!Object.keys(this.props.adminAccounts).length) return <Components.spinner />;
    return (
      <Components.cardsroute>
        <div className="components_routes_fun">
          Hi!
        </div>
      </Components.cardsroute>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_fun);


