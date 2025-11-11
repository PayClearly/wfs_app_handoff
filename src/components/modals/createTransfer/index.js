import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transfersPolicies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    policiesStatus: state.user.policies.status,
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_createTransfer extends Component {

  componentDidMount() {
    if (this.props.policiesStatus.fetched && !this.props.transfersPolicies.canCreate) {
      this.props.close();
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (nextProps.policiesStatus.fetched && !nextProps.transfersPolicies.canCreate) {
      nextProps.close();
    }
  }


  render() {
    const title = this.props.title || 'Deposit Funds Manually';
    const message = this.props.message || `You may elect to manually deposit additional funds into your ${this.props.providerDisplayName} account. Please be aware that this is not recommended as our systems already monitor the status of your account and will notify you regarding funding if needed. If you have any questions about funding, please reach out to the ${this.props.providerDisplayName} support team.`;


    return (
      <div className="modal-dialog wide-modal wide-70" role="document">
        <div className="modal-content h-100 w-100 components_modals_createTransfer">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {title}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <Fragment>
              <p>{message}</p>
              <div className="row">
                <div className="col-12">
                  <Components.creators.fundingtransfer noAccordion withdrawal={this.props.withdrawal} />
                </div>
              </div>
            </Fragment>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_createTransfer);


