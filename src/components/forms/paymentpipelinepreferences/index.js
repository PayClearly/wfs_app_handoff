import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import Utils from 'utils';


const mapStateToProps = (state) => ({
  forms: state.forms,
  postageOptions: Selectors.postageOptions(),
  globalVendorTagOptions: Selectors.globalVendorTagOptions(state),
  cardRegionOptions: Selectors.cardRegionOptions(),
  fileTypeOptions: Selectors.fileTypeOptions(),
  provider: state.account && state.account.cardsIntegration && state.account.cardsIntegration.data && state.account.cardsIntegration.data.details && state.account.cardsIntegration.data.details.provider,
});

const mapDispatchToProps = { ...Store.forms };

class componentsFormsPaymentpipelinepreferences extends Component {

  state = {
    name: 'Components.forms.paymentpipelinepreferences',
  };

  componentDidMount() {
    const {
      initialize, validate, initialFormData = {}, id = 'default', provider,
    } = this.props;
    initialize(this.state.name, this.props.id, {
      automaticallyMarkACHPaymentsAsSent: initialFormData.automaticallyMarkACHPaymentsAsSent || false,
      automaticallyMarkCheckPaymentsAsSent: initialFormData.automaticallyMarkCheckPaymentsAsSent || false,
      automaticallyMarkVCardPaymentsAsSent: initialFormData.automaticallyMarkVCardPaymentsAsSent || false,
      emailRepsOnCreation: initialFormData.emailRepsOnCreation || false,
      emailRepsOnDone: initialFormData.emailRepsOnDone || false,
      postageCode: initialFormData.postageCode || '1',
      requireBatchFunding: initialFormData.requireBatchFunding || false,
      requireVendorLinkToERP: initialFormData.requireVendorLinkToERP || false,
      globalVendorTagIds: initialFormData.globalVendorTagIds || [],
      globalVendorTagIdsText: '',
      defalutGlobalVendorTagId: initialFormData.defalutGlobalVendorTagId,
      showAccountNameOnCards: initialFormData.showAccountNameOnCards || false,
      defaultCardRegion: initialFormData.defaultCardRegion || 'USA',
      disableVCardExactMatchDefault: initialFormData.disableVCardExactMatchDefault || false,
      defaultValidThroughPeriod: initialFormData.defaultValidThroughPeriod || null,
      enableCommissions: initialFormData.enableCommissions || false,
      allowBatchERPOverride: initialFormData.allowBatchERPOverride || false,
      defaultCommissionRate: initialFormData.defaultCommissionRate || '',
      commissionOffsetPercentage: initialFormData.commissionOffsetPercentage || '',
      paymentUploadFileType: initialFormData.paymentUploadFileType || 'csv',
      passwordManager: initialFormData.passwordManager || '',
      passwordManagerUrl: initialFormData.passwordManagerUrl || '',
      passwordManagerToken: initialFormData.passwordManagerToken || '',
      paymentHistoryVendorPaymentNotes: initialFormData.paymentHistoryVendorPaymentNotes || false,
      requiresApproval: initialFormData.requiresApproval || false,
      numberOfApprovers: initialFormData.numberOfApprovers || '1',
      requireConfirmationNumber: initialFormData.requireConfirmationNumber || false,
      confirmationNumberDefault: initialFormData.confirmationNumberDefault || 'No Confirmation',
      autoAcceptsFees: initialFormData.autoAcceptsFees || false,
      showInterchangeDataOnTransactionsReport: initialFormData.showInterchangeDataOnTransactionsReport || false,
      vCardDefaultMaxUses: (provider === 'EFS' || provider === 'STUB') ? (initialFormData.vCardDefaultMaxUses || 1) : null,
      galileoVCardDefaultMaxUses: (provider === 'GALILEO' || provider === 'GALILEOSTUB') ? (initialFormData.galileoVCardDefaultMaxUses || 5) : null,
      galileoPaymentCardBin: initialFormData.galileoPaymentCardBin || '',
      galileoPurchaseCardBin: initialFormData.galileoPurchaseCardBin || '',

    });
    validate(this.state.name, id, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    this.setState((prevState) => ({
      form: nextProps.forms[prevState.name] && nextProps.forms[prevState.name][nextProps.id || 'default'],
    }));
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.props.id || 'default');
  }

  onTypeAheadChange = (value) => {
    this.standardFormAction('change', 'globalVendorTagIds', value.map((val) => val.id));
  };

  validate = (values) => {
    const errors = {};

    if (values.defaultValidThroughPeriod) {
      if (values.defaultValidThroughPeriod <= 0) {
        errors.defaultValidThroughPeriod = 'Must be greater than 0';
      } else if (values.defaultValidThroughPeriod > 90) {
        errors.defaultValidThroughPeriod = 'Must be 90 or fewer';
      } else if (values.defaultValidThroughPeriod % 1 !== 0) {
        errors.defaultValidThroughPeriod = 'Must be an integer (no decimals)';
      }
    }
    if (values.galileoVCardDefaultMaxUses) {
      if (Number.isNaN(parseInt(values.galileoVCardDefaultMaxUses, 10))) {
        errors.galileoVCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 5';
      }
      if (parseInt(values.galileoVCardDefaultMaxUses, 10) < 1 || parseInt(values.galileoVCardDefaultMaxUses, 10) > 5) {
        errors.galileoVCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 5';
      }
    }

    // WEX only
    if (values.vCardDefaultMaxUses) {
      if (Number.isNaN(parseInt(values.vCardDefaultMaxUses, 10))) {
        errors.vCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 10';
      }
      if (parseInt(values.vCardDefaultMaxUses, 10) < 1 || parseInt(values.vCardDefaultMaxUses, 10) > 10) {
        errors.vCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 10';
      }
    }

    return errors;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {

      if (field === 'globalVendorTagIds') {
        if (!this.state.form.defalutGlobalVendorTagId.value) {
          this.props.change(this.state.name, this.props.id || 'default', 'defalutGlobalVendorTagId', value[0]);
        } else if (value.indexOf(this.state.form.defalutGlobalVendorTagId.value) < 0) {
          this.props.change(this.state.name, this.props.id || 'default', 'defalutGlobalVendorTagId', null);
        }
      }
      this.props[action](this.state.name, this.props.id || 'default', field, value);
      this.props.validate(this.state.name, this.props.id || 'default', this.validate);
    } else {
      this.props[action](this.state.name, this.props.id || 'default', field);
    }
  };

  render() {
    const { form } = this.state;
    const { updating } = this.props;
    if (!form) { return null; }

    const defalutGlobalVendorTagIdOptions = (form.globalVendorTagIds.value || [])
      .reduce((acc, id) => {
        if (!form.globalVendorTagIds.value.indexOf(id) < 0) { return acc; }
        acc[id] = this.props.globalVendorTagOptions[id];
        return acc;
      }, {});

    return (
      <form className="form material floating-labels mb-5">
        {this.props.show.globalVendorTagIds
          && (
            <div className="row pt-4">
              <div className="col-xs-12 col-md-6" style={{ marginBottom: '-20px' }}>
                <Components.forms.components.typeahead
                  form={form}
                  field="globalVendorTagIdsText"
                  action={() => { }}
                  disabled={false}
                  hideError={!form.globalVendorTagIds.touched}
                  selected={form.globalVendorTagIds.value
                    .map((val) => this.props.globalVendorTagOptions[val])
                    .filter((item) => item)}
                  allowNew={false}
                  multiple
                  options={Object.values(this.props.globalVendorTagOptions || {})}
                  labelKey={'display'}
                  placeholder={'Verticals'}
                  onTypeAheadChange={this.onTypeAheadChange}
                  alwaysShowNoItemsOption
                  dontupdate
                />
              </div>
            </div>
          )}
        {this.props.show.defalutGlobalVendorTagId
          && (
            <div className="row pt-4">
              <div className="col-xs-12 col-md-6" style={{ marginBottom: '-20px' }}>
                <Components.forms.components.selectinput
                  form={form}
                  field="defalutGlobalVendorTagId"
                  action={this.standardFormAction}
                  label={'Default Verticals'}
                  options={defalutGlobalVendorTagIdOptions}
                  placeholder={_try(() => this.props.globalVendorTagOptions[form.defalutGlobalVendorTagId.value].display, '')}
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          )}
        {this.props.show.emailRepsOnCreation
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="emailRepsOnCreation"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.emailRepsOnCreation}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.emailRepsOnDone
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="emailRepsOnDone"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.emailRepsOnDone}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.requireBatchFunding
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="requireBatchFunding"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.requireBatchFunding}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.automaticallyMarkACHPaymentsAsSent
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="automaticallyMarkACHPaymentsAsSent"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.automaticallyMarkACHPaymentsAsSent}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.automaticallyMarkCheckPaymentsAsSent
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="automaticallyMarkCheckPaymentsAsSent"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.automaticallyMarkCheckPaymentsAsSent}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.automaticallyMarkVCardPaymentsAsSent
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="automaticallyMarkVCardPaymentsAsSent"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.automaticallyMarkVCardPaymentsAsSent}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.requireVendorLinkToERP
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="requireVendorLinkToERP"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.requireVendorLinkToERP}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.postageCode
          && (
            <div className="row pt-4">
              <div className="col-sm" style={{ marginBottom: '-40px' }}>
                <Components.forms.components.selectinput
                  form={form}
                  field="postageCode"
                  action={this.standardFormAction}
                  label="Postage Options"
                  options={this.props.postageOptions}
                  placeholder={this.props.postageOptions[form.postageCode.value].display}
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          )}
        {this.props.show.showAccountNameOnCards
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="showAccountNameOnCards"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.showAccountNameOnCards}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.disableVCardExactMatchDefault
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="disableVCardExactMatchDefault"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.disableVCardExactMatchDefault}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.requiresApproval
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="requiresApproval"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.requiresApproval}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {_try(() => form._values.requiresApproval)
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.selectinput
                  form={form}
                  field="numberOfApprovers"
                  options={{
                    1: { display: '1' },
                    2: { display: '2' },
                    3: { display: '3' },
                  }}
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.numberOfApprovers}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {
          this.props.show.requireConfirmationNumber
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="requireConfirmationNumber"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.requireConfirmationNumber}
                  disabled={updating}
                />
              </div>
            </div>
          )
        }
        {
          <div className="row">
            <div className="col-sm">
              <Components.forms.components.checkbox
                form={form}
                field="autoAcceptsFees"
                action={this.standardFormAction}
                label={this.props.fieldsTitles.autoAcceptsFees}
                disabled={updating}
              />
            </div>
          </div>
        }
        {
          form._values && form._values.requireConfirmationNumber
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.textinput
                  form={form}
                  type="string"
                  field="confirmationNumberDefault"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.confirmationNumberDefault}
                  disabled={updating}
                />
              </div>
            </div>
          )
        }
        {this.props.show.defaultValidThroughPeriod
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.textinput
                  form={form}
                  type="number"
                  field="defaultValidThroughPeriod"
                  action={this.standardFormAction}
                  label="Default Valid Through Period for Cards (in days)"
                  disabled={this.props.disabled}
                  hideError={!form.defaultValidThroughPeriod.touched}
                />
              </div>
            </div>
          )}
        {this.props.show.defaultCardRegion
          && (
            <div className="row pt-4">
              <div className="col-sm" style={{ marginBottom: '-40px' }}>
                <Components.forms.components.selectinput
                  form={form}
                  field="defaultCardRegion"
                  action={this.standardFormAction}
                  label="Default Card Region"
                  options={this.props.cardRegionOptions}
                  placeholder={this.props.cardRegionOptions[form.defaultCardRegion.value].display}
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          )}
        {this.props.show.enableCommissions
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="enableCommissions"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.enableCommissions}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {_try(() => form._values.enableCommissions)
          && <Components.forms.components.maskedinput
            form={form}
            maskPlaceholder=""
            type="string"
            field="defaultCommissionRate"
            useNumberMask
            action={this.standardFormAction}
            label="Default Commission Rate"
            disabled={updating}
            suffix="%"
            noPrefix
          />}
        {_try(() => form._values.enableCommissions)
          && <Components.forms.components.maskedinput
            form={form}
            maskPlaceholder=""
            type="string"
            field="commissionOffsetPercentage"
            useNumberMask
            action={this.standardFormAction}
            label="Commission Offset Percentage"
            disabled={updating}
            suffix="%"
            noPrefix
            detailedInformation="Offset = Gross % (i.e. 100%) - Net Payment %"
          />}
        {this.props.show.allowBatchERPOverride
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="allowBatchERPOverride"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.allowBatchERPOverride}
                  disabled={updating}
                />
              </div>
            </div>
          )}
        {this.props.show.paymentUploadFileType
          && <Components.forms.components.selectinput
            form={form}
            field="paymentUploadFileType"
            action={this.standardFormAction}
            label="Payment Upload File Type"
            options={this.props.fileTypeOptions}
            disabled={this.props.disabled}
          />}
        {this.props.show.passwordManager
          && <Components.forms.components.selectinput
            form={form}
            field="passwordManager"
            action={this.standardFormAction}
            label="Password Manager"
            options={{
              '': { display: 'none' },
              '1PASSWORD': { display: '1PASSWORD' },
              ADVANTIX: { display: 'ADVANTIX' },
            }}
            disabled={this.props.disabled}
          />}
        {form._values.passwordManager === '1PASSWORD'
          && (
            <Fragment>
              <div className="row">
                <div className="col-sm">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="passwordManagerUrl"
                    action={this.standardFormAction}
                    label="Password Manager URL"
                    disabled={this.props.disabled}
                    hideError={!form.passwordManagerUrl.touched}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="passwordManagerToken"
                    action={this.standardFormAction}
                    label="Password Manager Token"
                    disabled={this.props.disabled}
                    hideError={!form.passwordManagerToken.touched}
                  />
                </div>
              </div>
            </Fragment>
          )}
        {
          this.props.show.paymentHistoryVendorPaymentNotes
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="paymentHistoryVendorPaymentNotes"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.paymentHistoryVendorPaymentNotes}
                  disabled={updating}
                />
              </div>
            </div>
          )
        }
        {
          this.props.show.showInterchangeDataOnTransactionsReport
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.checkbox
                  form={form}
                  field="showInterchangeDataOnTransactionsReport"
                  action={this.standardFormAction}
                  label={this.props.fieldsTitles.showInterchangeDataOnTransactionsReport}
                  disabled={updating}
                />
              </div>
            </div>
          )
        }
        {
          this.props.show.galileoVCardDefaultMaxUses
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.textinput
                  form={form}
                  type="number"
                  field="galileoVCardDefaultMaxUses"
                  action={this.standardFormAction}
                  label="Galileo Virtual Card Default Max Uses"
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          )
        }
        {
          this.props.show.vCardDefaultMaxUses
          && (
            <div className="row">
              <div className="col-sm">
                <Components.forms.components.textinput
                  form={form}
                  type="number"
                  field="vCardDefaultMaxUses"
                  action={this.standardFormAction}
                  label="Virtual Card Default Max Uses"
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          )
        }
        {
          this.props.show.galileoPaymentCardBin
          && (
            <Components.featureFlagWrapper featureKey="galileoPaymentCardBinToggle">
              <div className="col-12">
                <Components.forms.components.selectinput
                  form={form}
                  field="galileoPaymentCardBin"
                  action={this.standardFormAction}
                  label="Galileo Default Bin for Payment Cards"
                  options={binOptions}
                  placeholder={binOptions[form?.galileoPaymentCardBin?.value]?.display || 'Select Default Payment Card Bin'}
                  includeResetOption
                />
              </div>
            </Components.featureFlagWrapper>
          )
        }
        {
          this.props.show.galileoPurchaseCardBin
          && (
            <Components.featureFlagWrapper featureKey="galileoPurchaseCardBinToggle">
              <div className="col-12">
                <Components.forms.components.selectinput
                  form={form}
                  field="galileoPurchaseCardBin"
                  action={this.standardFormAction}
                  label="Galileo Default Bin for Purchase Cards"
                  options={binOptions}
                  placeholder={binOptions[form?.galileoPurchaseCardBin?.value]?.display || 'Select Default Purchase Card Bin'}
                  includeResetOption
                />
              </div>
            </Components.featureFlagWrapper>
          )
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsFormsPaymentpipelinepreferences);

// Internal Helper Functions ...

const binOptions = Utils.getGalileoBinDropdownOptions();
