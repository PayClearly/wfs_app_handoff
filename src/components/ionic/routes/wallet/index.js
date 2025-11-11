import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_routes_wallet extends Component {




  render() {
    return (
      <div className="components_ionic_routes_wallet">
        <Components.ionic.cardslider />
        <Components.ionic.currenttrip />
        <Components.ionic.recenttransactions />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_routes_wallet);


