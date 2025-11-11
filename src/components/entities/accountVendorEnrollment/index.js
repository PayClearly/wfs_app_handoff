import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    accountVendorEnrollments: Selectors.accountVendorEnrollments(state),
    status: state.account.accountVendorEnrollments.status,
    policies: Selectors.entity('accountVendorEnrollments_idOrganization_idAccount')(state),
    form: _try(() => state.forms['Components.forms.accountVendorEnrollment'][props.id], {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateAccountVendorEnrollment: (id, data) => {
      return dispatch(Store.account.updateAccountVendorEnrollment(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsAccountVendorEnrollments());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({
    accountVendorEnrollmentNote: Resources.accountVendorEnrollmentNote(state, { id: props.id }),
  });
};

class components_entities_accountVendorEnrollment extends Component {
  state = {
    formName: 'Components.forms.accountVendorEnrollment',
    editBtnText: 'Edit Enrollment Details',
  }




  onSubmit = () => {
    const { id, form } = this.props;
    const data = { ...(_try(() => form._values) || {}) };
    this.props.updateAccountVendorEnrollment(id, data);
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { id, accountVendorEnrollments, accountVendorEnrollmentNote, status, policies, clearStatusErrors, form = {} } = this.props;

    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const accountVendorEnrollment = _try(() => accountVendorEnrollments[id], {});
    const initialData = { ...accountVendorEnrollment };
    if (accountVendorEnrollmentNote) {
      initialData.notes = accountVendorEnrollmentNote.notes;
    }

    return (
      <div className="components_entities_accountVendorEnrollment p-3">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          updateButtonText="Update Enrollment Details"
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.accountVendorEnrollment id={id} />
          <Components.forms.accountVendorEnrollment
            formKey={id}
            blurAll={this.state.blurAll}
            initialData={initialData}
            vendorId={id}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_accountVendorEnrollment);


