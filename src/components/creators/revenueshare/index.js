import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    revenueShareCreatePolicy: state.user.policies.data.item['revenueShares_*_*_create'],
    revenueShares: state.revenueShares || {},
    organizationsByName: Selectors.organizationsByName(state),
    accountsByName: Selectors.accountsByName(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createRevenueShare: (organizationId, accountId, data, callback) => {
      dispatch(Store.revenueshares.create(organizationId, accountId, data))
      .then(() => {
        callback();
      });
    },
    resetForm: (name, key, values) => {
      dispatch(Store.forms.reset(name, key, values));
    },
    clearStatusErrors: () => {
      dispatch(Store.revenueshares.clearErrors());
    },
    destroyForm: (name, key) => {
      dispatch(Store.forms.destroy(name, key));
    },
  });
};

class components_creators_revenueshare extends Component {

  state = {
    createFormActive: true,
    showRevenueShareCreatedNotification: false,
  };

  componentDidMount() {}
  componentWillUnmount() {}

  onCreate = () => {
    this.props.resetForm('Components.forms.createrevenueshare', 'default', this.props.forms['Components.forms.createrevenueshare'].default._values);

    Object.keys(this.props.forms['Components.forms.createrevenueshare']).forEach((formKey) => {
      if (formKey !== 'default') {
        this.props.destroyForm('Components.forms.createrevenueshare', formKey);
      }
    });

    this.setState({ showRevenueShareCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  submit = (binTiers, callback) => {
    const values = this.props.forms['Components.forms.createrevenueshare'].default._values;

    const { applyDate, account, organization, status, schedule, level3LTI, fileType } = values;

    const binTypes = {};

    ['ghost', 'plastic', 'virtual'].forEach((type) => {
      if (values[type]) {
        let binType;
        switch (type) {
          case 'ghost': {
            binType = 'MCGC';
            break;
          }
          case 'virtual': {
            binType = 'MCVC';
            break;
          }
          case 'plastic': {
            binType = 'MCP';
            break;
          }
          default:
        }

        binTiers[type].forEach((id) => {
          const tierForm = this.props.forms['Components.forms.createrevenueshare'][id]._values;
          if (tierForm.min) {
            // ignore any cent values
            const minimum = tierForm.min.split('.')[0];
            binTypes[binType] = { ...binTypes[binType], [minimum]: _percentToDecimal(tierForm.rate.replace('%', '').trim()) };
          }
        });

        binTypes[binType] = {
          ...binTypes[binType],
          0: _percentToDecimal(values[`${type}BaseRate`].replace('%', '').trim()),
        };
      }
    });
    // hella hard coded selectFields... TODO add form to create revshare
    const selectFields = [{
      dataField: 'Process Date',
      customName: '',
    }, {
      dataField: 'Card Last 4',
      customName: '',
    }, {
      dataField: 'Card CTS',
      customName: '',
    }, {
      dataField: 'Card BIN Type',
      customName: '',
    }, {
      dataField: 'Transaction Date',
      customName: '',
    }, {
      dataField: 'Cleared Amount',
      customName: '',
    }, {
      dataField: 'Customer Billed Amount',
      customName: '',
    }, {
      dataField: 'Transaction Currency',
      customName: '',
    }, {
      dataField: 'Clearing Reference Number',
      customName: '',
    }, {
      dataField: 'Merchant ID',
      customName: '',
    }, {
      dataField: 'Merchant DBA',
      customName: '',
    }, {
      dataField: 'Merchant City',
      customName: '',
    }, {
      dataField: 'Merchant State',
      customName: '',
    }, {
      dataField: 'Merchant Zip/Postal Code',
      customName: '',
    }, {
      dataField: 'Country Code',
      customName: '',
    }];

    const revenueShare = {
      applyDate: applyDate.getTime(),
      level3LTI: numeral(level3LTI).format('1.000000000000000'),
      status,
      schedule,
      binTypes,
      selectFields,
      fileType,
    };

    const organizationId = this.props.organizationsByName[organization];
    const accountId = this.props.accountsByName[organizationId][account];

    this.props.createRevenueShare(organizationId, accountId, revenueShare, callback);
    this.setState({ showRevenueShareCreatedNotification: false });
  };

  render() {
    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.revenueShareCreatePolicy}
        createFormActive={this.state.createFormActive}
        status={this.props.revenueShares.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="card mb-5">
          <div className="card-body">
            <h5 className="card-title mb-3">Create a Revenue Share</h5>

            <Components.forms.createrevenueshare
              submit={(binTiers, callback) => this.submit(binTiers, callback)}
              showCreatedNotification={this.state.showRevenueShareCreatedNotification}
              blurAll={this.state.blurAll}
              onDisabledClick={this.onDisabledClick}
            />
          </div>
        </div>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_revenueshare);

// Internal Helper Functions ...
function _percentToDecimal(percent) { return `.${String(numeral(percent).divide(100).value()).split('.')[1]}`; }

