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

class components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_verifyMicroDeposits extends Component {




  render() {
    return (
      <div className="components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_verifyMicroDeposits">
        <Components.forms.verifymicrodeposits blurAll={this.props.blurAll} disabled={this.props.disabled} formKey={this.props.formKey} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_verifyMicroDeposits);


