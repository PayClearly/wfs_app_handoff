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
    addBeneficialOwner: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'addBeneficialOwner', data }));
    },
    updateBeneficialOwner: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'addBeneficialOwner', data }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_creators_beneficialowner extends Component {

  state = {
    formKey: 'create',
  };




  // TODO implement on create handler for ACH account
  onCreate = () => {
    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });

  }

  // TODO implement create ACH account action
  submit = () => {
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner'][this.state.formKey]) || {};

    const data = this.adaptFormData({ ...form._values });
    if (this.props.retry) {
      this.props.updateBeneficialOwner(data);
    } else {
      this.props.addBeneficialOwner(data);
    }

    this.setState({ showACHAccountCreatedNotification: false });
  }


  adaptFormData(data) {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      ssn: data.ssn,
      address: {
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        stateProvinceRegion: data.stateProvinceRegion,
        country: data.country,
        postalCode: data.postalCode,
      },
    };
  }

  render() {
    const { status } = this.props;

    const error = status.creatingError || status.updatingError;
    const creating = status.creating;
    const updating = status.updating;
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner'][this.state.formKey]) || {};
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
          <Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner
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
          {this.state.showACHAccountCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Beneficial owner application successfully delivered!
            </div>
          }
          <Components.button
            disabled={disabled}
            onClick={this.submit}
            buttonText={this.props.retry ? 'Resubmit Beneficial Owner' : 'Create Beneficial Owner'}
            updating={updating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_creators_beneficialowner);


