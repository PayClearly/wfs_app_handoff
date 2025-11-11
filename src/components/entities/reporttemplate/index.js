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
    policies: Selectors.entity('reports_idOrganization_idAccount')(state),
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    status: state.account.reportTemplates.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateTemplate: (organizationId, accountId, reportTemplateId, data) => {
      dispatch(Store.account.reporttemplates.update(organizationId, accountId, reportTemplateId, { ...data }));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.reporttemplates.clearErrors());
    },
  });
};

class components_entities_reporttemplate extends Component {

  state = {
    formName: 'Components.forms.editreporttemplate',
  }




  onSubmit = () => {
    const { organizationId, accountId, template, forms } = this.props;
    const values = forms['Components.forms.editreporttemplate'][template._id]._values;
    if (typeof values.exports === 'string') values.exports = [values.exports];
    if (values.schedule === 'weekly') values.schedule = values.dayOfTheWeek;
    values.emailContacts = values.emailContacts ? values.emailContacts.split(',') : null;
    if (values.schedule === 'immediate') values.startDate = values.startDate.toISOString();
    if (values.schedule === 'immediate') values.endDate = values.endDate.toISOString();
    values.orderBy = {
      dataField: values.orderBy,
      direction: values.order,
    };
    delete values.order;
    this.props.updateTemplate(organizationId, accountId, template._id, values);
  }

  render() {
    const { template, status, policies, forms } = this.props;
    if (!template) return null;

    const { canRead, canUpdate, canDelete } = policies;
    const { updatingError: error, updating } = status;
    const editDisabled = false;
    const form = (forms[this.state.formName] && forms[this.state.formName][template._id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;
    const wrapperClasses = this.props.wrapperClasses || 'p-4';

    return (
      <Components.entities.entitywrapper
        accountId={this.props.accountId}
        canRead={canRead}
        canUpdate={canUpdate}
        canDelete={canDelete}
        clearStatusErrors={this.props.clearStatusErrors}
        editBtnText={this.state.editBtnText}
        editDisabled={editDisabled}
        error={error}
        onCancel={this.onCancel}
        onDisabledClick={() => this.setState({ blurAll: true })}
        onSubmit={this.onSubmit}
        orgId={this.props.orgId}
        updateDisabled={updateDisabled}
        updating={updating}
        wrapperClasses={wrapperClasses}
      >
        <Components.overviews.reporttemplate
          className="row mt-3"
          template={template}
        />
        <Components.forms.editreporttemplate template={template} />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_reporttemplate);


