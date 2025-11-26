/* eslint-disable max-len */
import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state) => ({
  forms: state.forms,
  status: state.transactionDetails.status,
  paymentPipelinePreferences: _try(() => state.account.paymentPipelinePreferences.data.item, {}),
  userPrivileges: state.user.privileges.data.item,
  appName: state.appConfig.data.metadata.name,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
});

const mapDispatchToProps = { ...Store.forms };

class componentsFormsCreatereport extends Component {

  state = {
    name: 'Components.forms.createreport',
    key: 'default',
    defaultReportOptions: {
      transactionDetails: { display: 'Transaction Details' },
      spendByVendor: { display: 'Spend By Merchant' },
      spendByCard: { display: 'Spend By Card' },
      pctrAch: { display: 'PCTR (ACH)' },
      pctrCheck: { display: 'PCTR (Check)' },
      pctrCard: { display: 'PCTR (Card)' },
      checkActivity: { display: 'Check Activity' },
    },
    reportOptions: {},
  };

  componentDidMount() {
    const { name, key } = this.state;
    const { initialize, validate } = this.props;

    if (this.props.appName === 'wfs') {
      if (
        this.props.userPrivileges.accountLevel
        && this.props.userPrivileges.accountLevel[this.props.organizationId]
        && this.props.userPrivileges.accountLevel[this.props.organizationId][this.props.accountId]
        && Object.keys(this.props.userPrivileges.accountLevel[this.props.organizationId][this.props.accountId]).includes('viewAssignedCardTransactions')
      ) {
        this.setState({
          defaultReportOptions: {
            transactionDetails: { display: 'Transaction Details' },
          },
        });
      }
    }

    initialize(this.state.name, 'default', {
      emailContacts: null,
    });

    initialize(name, key, {
      reportType: 'transactionDetails',
    });

    validate(name, key, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    const { name, key } = this.state;
    this.setState({
      form: nextProps.forms[name] && nextProps.forms[name][nextProps.formKey || 'default'],
    });

    if (this.props.paymentPipelinePreferences.paymentUploadFileType !== nextProps.paymentPipelinePreferences.paymentUploadFileType) {
      this.props.initialize(name, key, { reportType: 'transactionDetails', emailContacts: null });
    }

    if (nextProps.paymentPipelinePreferences.paymentUploadFileType === 'wexap3') {
      this.setState((prevState) => ({
        reportOptions: {
          ...prevState.defaultReportOptions,
          vapCleared: { display: 'WEX VAPCleared' },
        },
      }));
    } else {
      this.setState((prevState) => ({
        reportOptions: {
          ...prevState.defaultReportOptions,
        },
      }));
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const { name, key } = this.state;
    if (action === 'change') {
      this.props[action](name, key, field, value);
    } else {
      this.props[action](name, key, field);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  validate = () => {
    const errors = {};
    return errors;
  };

  render() {
    const { form, reportOptions } = this.state;
    const { status } = this.props;
    if (!form) { return null; }
    return (
      <div className="components_forms_createreport">
        <Components.forms.components.selectinput
          form={form}
          type="text"
          field="reportType"
          action={this.standardFormAction}
          label="Select Report Type"
          options={reportOptions}
          disabled={status.fetching}
          required
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsFormsCreatereport);

