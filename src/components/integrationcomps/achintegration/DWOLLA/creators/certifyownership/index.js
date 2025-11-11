import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('achIntegration_idOrganization_idAccount')(state),
    status: state.account.achIntegration.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    certifyOwnership: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'certifyOwnership', data }));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_creators_certifyownership extends Component {

  state = {
    formKey: 'create',
  };




  onCreate = () => {

    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });
  }

  submit = () => {
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification'][this.state.formKey]) || {};

    const data = {
      status: _try(() => form._values.acceptsCertification) && 'certified',
    };

    this.props.certifyOwnership(data);
    this.setState({ showCreatedNotification: false });
  }

  render() {
    if (!this.props.status.fetched) return null;

    const { status } = this.props;

    const error = status.creatingError || status.updatingError;
    const creating = status.creating;
    const updating = status.updating;
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification'][this.state.formKey]) || {};
    const disabled = updating || creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <div className="card">
            <div className="card-header">
              <h2 className="text-primary mb-0">Certify Beneficial Ownership</h2>
            </div>
            <div className="card-body">
              <Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification
                formKey={this.state.formKey}
                blurAll={this.state.blurAll}
                disabled={updating}
              />
              {error &&
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Something Went Wrong</h4>
                  Error: {error}
                </div>
              }
              {this.state.showCreatedNotification &&
                <div className="alert alert-primary" role="alert">
                  Ownership successfully certified!
                </div>
              }
              <Components.button
                disabled={disabled}
                onClick={this.submit}
                buttonText="Submit Certification"
                updating={updating}
                onDisabledClick={() => { this.setState({ blurAll: true }); }}
              />
            </div>
          </div>
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_creators_certifyownership);


