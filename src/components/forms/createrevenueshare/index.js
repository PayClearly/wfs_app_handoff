import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

// import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  revenueShares: state.revenueShares.data.items,
  organizations: state.organizations.data.items,
  accounts: state.admin.accounts.data.item,
  status: state.revenueShares.status,
  types: state.validations.data.item,
  organizationsByName: Selectors.organizationsByName(state),
  accountsByName: Selectors.accountsByName(state),
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_createrevenueshare extends Component {

  state = {
    name: 'Components.forms.createrevenueshare',
    key: 'default',
    scheduleOptions: {
      monthly: {
        display: 'Monthly',
      },
      quarterly: {
        display: 'Quarterly',
      },
      annually: {
        display: 'Annually',
      },
    },
    statusOptions: {
      active: {
        display: 'Active',
      },
      inactive: {
        display: 'Inactive',
      },
    },
    fileTypeOptions: {
      pdf: {
        display: 'PDF',
      },
      xlsx: {
        display: 'XLSX',
      },
    },
    tiers: {
      ghost: [],
      plastic: [],
      virtual: [],
    },
    virtualTiers: false,
    plasticTiers: false,
    ghostTiers: false,
  };

  componentDidMount() {
    const { initialize, validate } = this.props;

    initialize(this.state.name, 'default', {
      account: '',
      organization: '',
      applyDate: new Date(),
      schedule: 'monthly',
      level3LTI: '.54',

      plastic: false,
      ghost: false,
      virtual: false,

      ghostBaseRate: '',
      plasticBaseRate: '',
      virtualBaseRate: '',

      ghostTiered: false,
      plasticTiered: false,
      virtualTiered: false,

      status: 'active',
      fileType: '',
    });

    validate(this.state.name, 'default', this.validate);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      if (field === 'organization') {
        this.props[action](this.state.name, this.state.key, 'account', '');
      }

      if (!this.state.binTypesTouched && (field === 'plastic' || field === 'ghost' || field === 'virtual')) {
        this.setState({ binTypesTouched: true });
      }

      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);

    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (fields) => {
    const errors = {};

    const dataIsMissing = (fieldName) => !fields[fieldName] || fields[fieldName] === '';

    if (dataIsMissing('organization')) {
      errors.organizationId = 'Organization required';
    }

    if (dataIsMissing('level3LTI')) {
      errors.level3LTI = 'Level 3/LTI rate required';
    }

    if (dataIsMissing('fileType')) {
      errors.fileType = 'File Type is required';
    }

    if (!/^(1|(0?(\.\d+)?))$/.test(fields.level3LTI)) {
      errors.level3LTI = 'Expected number between 0.01 and 1';
    }

    if (!fields.ghost && !fields.virtual && !fields.plastic) {
      errors.ghost = 'At least one Bin Type required';
      errors.virtual = 'At least one Bin Type required';
      errors.plastic = 'At least one Bin Type required';
    }

    const binDataExists = (tier) => !fields[tier] || fields[`${tier}BaseRate`];

    ['ghost', 'virtual', 'plastic'].forEach((binType) => {
      if (!binDataExists(binType)) {
        errors[`${binType}BaseRate`] = 'Base Rate Required';
      }
    });

    const isValidPercentage = (field) => /^[0-9][0-9]?(\.[0-9]{1,5}?)?$/.test(String(field));

    ['ghostBaseRate', 'virtualBaseRate', 'plasticBaseRate'].forEach((fieldData) => {
      if (fields[fieldData] && !isValidPercentage(fields[fieldData].replace('%', '').trim())) {
        errors[fieldData] = 'Invalid value';
      }
    });

    return errors;
  };

  addTier(type) {
    const tiers = this.state.tiers[type];
    if (tiers.length === 7) { return; }

    const id = Date.now();
    this.setState({
      tiers: {
        ...this.state.tiers,
        [type]: [...this.state.tiers[type], id],
      },
    });
  }

  removeTier(type, key) {
    const tiers = this.state.tiers[type];
    const index = tiers.indexOf(parseInt(key, 10));

    const newTiers = [
      ...tiers.slice(0, index),
      ...tiers.slice(index + 1, tiers.length),
    ];

    this.props.destroy(this.state.name, key);
    this.setState({
      tiers: {
        ...this.state.tiers,
        [type]: newTiers,
      },
    });
  }

  renderBinForms() {
    return ['ghost', 'plastic', 'virtual'].filter((e) => this.state.form[e].value).map((binType) => (
      <div className="row pb-3">
        <div className="col-8">
          <div className="card">
            <div className="card-header default-bg">
              {binType === 'ghost' && 'Ghost Card'}
              {binType === 'virtual' && 'Virtual Card'}
              {binType === 'plastic' && 'Plastic'}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <Components.forms.components.maskedinput
                    form={this.state.form}
                    maskPlaceholder=""
                    type="text"
                    field={`${binType}BaseRate`}
                    action={this.standardFormAction}
                    label="Base Rate"
                    useNumberMask
                    decimalLimit={5}
                    noPrefix
                    suffix=" %"
                    disabled={this.props.creating}
                    hideError={!this.state.form[`${binType}BaseRate`].touched}
                    required
                  />
                </div>

                <div className="col-5 pt-2 ps-5">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`${binType}tiers`}
                    onChange={(e) => {
                      this.setState({ [`${binType}Tiers`]: !this.state[`${binType}Tiers`] });
                    }}
                    value={this.state[`${binType}Tiers`]}
                    checked={this.state[`${binType}Tiers`]}
                  />
                  <label className="form-check-label" aria-label="checkbox" htmlFor={`${binType}tiers`}>Use Tiers</label>
                </div>

              </div>
              {this.state[`${binType}Tiers`] && this.renderTierForms(binType)}
            </div>
          </div>
        </div>
      </div>
    ));
  }

  renderTierForms(type) {
    return (
      <Fragment>
        {this.state.tiers[type].map((id) => (
          <Components.forms.components.bintier
            key={id}
            formKey={id}
            remove={(key) => this.removeTier(type, key)}
          />
        ))}
        <Components.forms.components.button
          onClick={() => this.addTier(type)}
          className={'btn btn-outline-primary'}
          type="button"
          aria-label="button"
          disabled={false}
          buttonText={'Add Tier'}
        />
      </Fragment>
    );
  }

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    const {
      submit, status, organizationsByName, accountsByName,
    } = this.props;

    if (!organizationsByName || !accountsByName) { return null; }

    const { creating } = status;
    const allTiersValid = Object.keys(this.props.forms['Components.forms.createrevenueshare']).every((key) => key === 'default' || this.props.forms['Components.forms.createrevenueshare'][key]._allValid);

    const organizationOptions = Object.values(this.props.organizations)
      .filter((organization) => organization.active)
      .sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      });

    const accountOptions = (organizationsByName[form.organization.value])
      ? Object.values(accountsByName[organizationsByName[form.organization.value || ''] || ''] || [])
        .reduce((activeAccounts, accountId) => {
          if (this.props.accounts[organizationsByName[form.organization.value]][accountId].active) {
            activeAccounts.push(this.props.accounts[organizationsByName[form.organization.value]][accountId]);
          }
          return activeAccounts;
        }, [])
      : [];

    const createDisabled = creating || form._allInitial || !form._allValid || !allTiersValid;
    const error = status.creatingError;

    return (
      <div className="floating-labels mt-5">
        <div className="row">
          <div className="col-6">
            <Components.forms.components.typeahead
              form={form}
              field="organization"
              action={this.standardFormAction}
              label="Select Organization"
              options={organizationOptions}
              labelKey="name"
              hideError={!form.schedule.touched}
              disabled={creating}
            />
          </div>
          <div className="col-6">
            <Components.forms.components.typeahead
              form={form}
              field="account"
              action={this.standardFormAction}
              label="Select Account"
              options={accountOptions}
              labelKey="name"
              hideError={!form.schedule.touched}
              noItemsText="No Accounts Available"
              disabled={creating}
            />
          </div>
        </div>

        <Collapse isOpened={form.organization.value && form.account.value}>
          <div className="row pt-3">
            <div className="col-2">
              <Components.forms.components.daypicker
                form={form}
                type="number"
                field="applyDate"
                action={this.standardFormAction}
                label="Apply Date"
                disabled={creating}
                hideError={!form.applyDate.touched}
                required
              />
            </div>
            <div className="col-2">
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="schedule"
                action={this.standardFormAction}
                label="Rebate Frequency"
                options={this.state.scheduleOptions}
                disabled={creating}
                hideError={!form.schedule.touched}
                required
              />
            </div>
            <div className="col-2">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="level3LTI"
                action={this.standardFormAction}
                label="Level 3/LTI"
                disabled={creating}
                hideError={!form.level3LTI.touched}
                required
              />
            </div>
            <div className="col-2">
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="status"
                action={this.standardFormAction}
                label="Status"
                options={this.state.statusOptions}
                disabled={creating}
                hideError={!form.status.touched}
                required
              />
            </div>
            <div className="col-2">
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="fileType"
                action={this.standardFormAction}
                label="File Type"
                options={this.state.fileTypeOptions}
                disabled={creating}
                hideError={!form.fileType.touched}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-3">
              <Components.forms.components.checkbox
                form={form}
                field="virtual"
                action={this.standardFormAction}
                label="Virtual Card"
                disabled={creating}
                hideError={!this.state.binTypesTouched}
              />
            </div>
            <div className="col-3">
              <Components.forms.components.checkbox
                form={form}
                field="ghost"
                action={this.standardFormAction}
                label="Ghost Card"
                disabled={creating}
                hideError={!this.state.binTypesTouched}
              />
            </div>
            <div className="col-3">
              <Components.forms.components.checkbox
                form={form}
                field="plastic"
                action={this.standardFormAction}
                label="Plastic"
                disabled={creating}
                hideError={!this.state.binTypesTouched}
              />
            </div>
          </div>

          {this.renderBinForms()}
        </Collapse>

        {error
          && <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {error}
          </div>}
        {this.props.showCreatedNotification
          && <div className="alert alert-primary" role="alert">
            Revenue share successfully created! View and edit Revenue Share terms below, or create another Revenue Share Agreement.
          </div>}
        <Components.forms.components.button
          disabled={createDisabled}
          onClick={() => {
            const tierPayload = { ...this.state.tiers };
            const callback = () => {
              this.setState({
                binTypesTouched: false,
                tiers: {
                  ghost: [],
                  plastic: [],
                  virtual: [],
                },
              });
            };
            submit(tierPayload, callback);
          }}
          onDisabledClick={this.props.onDisabledClick}
          buttonText="Create"
          updating={creating}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createrevenueshare);


