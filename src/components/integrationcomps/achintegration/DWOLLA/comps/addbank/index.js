import { connect, Component, bindActionCreators, Fragment } from 'component';
import api from 'api/achIntegration';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchIavToken: () => {
      return dispatch(Store.account.fetchDwollaIavToken());
    },
    addFundingSource: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'addFundingSource', data }));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_comps_addbank extends Component {

  state = {
    loading: true,
  };

  componentDidMount() {
    // For Testing Locally
    // You must pass your local stylesheet to the iframe options object, not the production path
    // const stylesheets = ['https://fonts.googleapis.com/css?family=Rubik:300,400,700'];

    // if () {
    //   stylesheets.unshift('http://localhost:5005/index.css');
    // } else {
    //   stylesheets.unshift('https://app.payclearly.com/index.css');
    // }
    const { organizationId, accountId } = this.props;
    api.getGroviderSetupResource(organizationId, accountId, 'iavToken').then((data) => {
      const token = data.data.data.token;
      window.dwolla.configure('prod'); // pass in 'sandbox' to integrate with Dwolla sandbox
      window.dwolla.iav.start(token, {
        container: 'iavContainer',
        stylesheets: [
          // 'http://localhost:5005/index.css',
          'https://app.payclearly.com/index.css',
          'https://fonts.googleapis.com/css?family=Rubik:300,400,700',
        ],
        microDeposits: true,
        fallbackToMicroDeposits: true,
        backButton: true,
        subscriber: ({ currentPage, error }) => {
          this.setState({ loading: false });
          console.log(`currentPage: ${currentPage} error: ${JSON.stringify(error)}`);
        },
      }, (err, res) => {
        if (!err) this.props.addFundingSource({ fundingSourceId: _try(() => res._links['funding-source'].href.split('funding-sources/')[1]) });
        return console.log('error adding funding source', err);
      });
    });
  }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_comps_addbank" id="iavContainer">
        {
          this.state.loading &&
          <div style={{ 'margin-top': '150px' }}><Components.spinner /></div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_comps_addbank);


