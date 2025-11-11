import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import objectResolvePath from 'object-resolve-path';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    achAccount: state.account.achAccounts.data.items,
    achAccountStatus: state.account.achAccounts.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    clearAchAccountErrors: () => {
      return dispatch(Store.account.clearErrorsAchAccounts());
    },
  });
};

class components_modals_setupachpayments extends Component {

  componentDidMount() { }
  componentWillReceiveProps(nextProps) {
    if (objectResolvePath(nextProps.achAccount, 'beneficialOwner.beneficialOwnershipStatus') === 'certified') {
      this.props.close();
    }
  }
  componentWillUnmount() {
    this.props.clearAchAccountErrors();
  }

  render() {
    const error = this.props.achAccountStatus.creatingError || this.props.achAccountStatus.updatingError ||
      (this.props.achAccount._errors && this.props.achAccount._errors[0].message);

    return (
      <div className="modal-dialog components_modals_setupachpayments" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">ACH Payment Setup</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body px-3">
            <Components.integrationsetups.achintegration.DWOLLA />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_setupachpayments);


