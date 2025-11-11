import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...
import axios from 'axios';
import { Popover, PopoverBody } from 'reactstrap';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  loaded: _try(() => Selectors.globalTaggedItems(state).allTagsLoaded && state.account.paymentUploads.status.fetched && state.account.achAccountDetails.status.fetched && state.account.accountVendors.status.fetched && (Selectors.integrations(state).cardsIntegration.status.fetched || Selectors.integrations(state).achIntegration.status.fetched || Selectors.integrations(state).checksIntegration.status.fetched), false),
  cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration),
  checksIntegration: _try(() => Selectors.integrations(state).checksIntegration),
  achIntegration: _try(() => Selectors.integrations(state).achIntegration),
  template: _try(() => Selectors.paymentUploadTemplate(state)),

  derivedForms: _try(() => Selectors.paymentforms()(state), {}),
  status: _try(() => state.account.paymentStatuses.status, {}),
  instantTransfer: _try(() => Selectors.funding(state).instantTransfer, {}),
  paymentCustomFields: state.account.paymentCustomFields.data.item,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,

  instantFundingCreateDisabled: _try(() => Selectors.funding(state).instantTransfer.enabled) && (_try(() => Selectors.funding(state).earmarkEnforced) ? (!state.account.paymentStatuses.status.fetched && !state.account.achTransfers.status.fetched) : !state.account.accountBalances.status.fetched),

  paymentUploads: _try(() => state.account.paymentUploads.data.items),
  ftpPayment: _try(() => state.account.ftpPayment.data.item),
  routeParams: state.router.route.params,

  clients: state.account.clients?.data?.items,
  accountVendors: state.account.accountVendors?.data?.items,
});

const mapDispatchToProps = (dispatch, props) => ({
  create: (data, instantTransfer, acceptedFile) => {
    dispatch(Store.account.createPayments(data, instantTransfer, acceptedFile));
  },
  clearStatusErrors: () => {
    dispatch(Store.account.clearErrorsPayments());
  },
  navigateToHistory: (routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
  },
  changeFormValue: (data) => {
    dispatch(Store.forms.change(data.formName, data.formKey, data.fields));
  },
  openSchedulerModal: (onSubmit) => {
    dispatch(Store.router.openModal('Components.modals.scheduler', { onSubmit }));
  },
  removeQueryParams: (params = []) => {
    dispatch(Store.router.removeQueryParams(params));
  },
  fetchPayment: (data) => {
    dispatch(Store.account.fetchFtpPayment(data));
  },
  clearFtpPayment: () => {
    dispatch(Store.account.clearFtpPayment());
  },
});

class components_uploaders_payment extends Component {

  state = {
    uploaded: {},
    uploaderKey: '',
    initialUploaded: {},
    showCreatedNotification: false,
    sessionPaymentCount: 0,
    tooLargeFile: false,
    uploadingError: '',
    popoverOpen: false,
    maximumPayments: 700,
    ftpPaymentId: null,
    blurAll: false,
  };

  componentDidMount() {
    const { paymentUploads, routeParams = {} } = this.props;
    const { ftpItem, forSFTP } = routeParams;
    if (ftpItem && paymentUploads && _try(() => paymentUploads[ftpItem])) {
      this.fetchAndLoadPayments({ ...paymentUploads[ftpItem], forSFTP, forFTP: !forSFTP });
    }
  }

  // temporary pre-wrapper way to determine onCreated
  componentWillReceiveProps(nextProps = {}) {
    if (this.props.status && this.props.status.creating && (!nextProps.status.creating && !nextProps.status.creatingError)) {
      if (typeof this.onCreate === 'function') {
        this.onCreate();
        this.setState({ showCreatedNotification: true, disabledClick: false });
      }
    }
    if (nextProps.routeParams.ftpItem && nextProps.ftpPayment.preview && !this.props.ftpPayment.preview) {
      return this.onDrop([nextProps.ftpPayment]);
    }
  }

  componentWillUnmount() {
    if (_try(() => this.props.routeParams.ftpItem)) {
      this.props.removeQueryParams(['ftpItem']);
      this.props.clearFtpPayment();
    }
  }


  onNavigateTo = (e) => {
    e.preventDefault();
    const params = {};
    this.props.navigateToHistory(params);
  };

  onCreate = () => {
    this.setState({
      uploaded: {},
      uploaderKey: '',
      sessionPaymentCount: 0,
      initialUploaded: {},
    });
  };

  onDrop = (acceptedFiles) => {
    const { clients = {}, accountVendors = {} } = this.props;
    const uploaderKey = Date.now();

    this.setState({ uploadingError: '' });

    const template = {
      ...this.props.template,
      fields: {
        ...this.props.template.fields,
        ...this.props.paymentCustomFields,
      },
    };

    return _parseDroppedFileData(
      acceptedFiles[0],
      this.rowAdapter,
      template,
      'id',
      uploaderKey,
      this.props.paymentPipelinePreferences.paymentUploadFileType
    )
      .then((data = []) => {
        if (Object.keys(data || {}).length > this.state.maximumPayments) {
          this.setState({ tooLargeFile: true });
          return;
        }

        const keys = Object.keys(data || {});

        keys.forEach((key) => {
          data[key] = replaceWithNormalizedNames(data[key], clients, accountVendors);
        });

        this.setState({
          uploaderKey,
          uploaded: data,
          sessionPaymentCount: Object.keys(data).length,
          initialUploaded: data,
          showCreatedNotification: false,
          tooLargeFile: false,
          acceptedFile: acceptedFiles[0] || null,
        });
      })
      .catch((err) => {
        this.setState({ uploadingError: err });
      });
  };

  onSubmit = () => {
    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    if (this.state.ftpPaymentId) { aggregateFormState.adapted = aggregateFormState.adapted.map((item) => ({ ...item, ftpPaymentId: this.state.ftpPaymentId })); }
    return this.props.create(aggregateFormState.adapted, this.props.instantTransfer, this.state.acceptedFile);
  };

  onDisabledClick = () => {
    if (this.props.instantFundingCreateDisabled) {
      this.setState({ disabledClick: true });
    }
    this.setState({ blurAll: true });
  };


  fetchAndLoadPayments = ({
    _id, attachment, forFTP, forSFTP,
  }) => {
    // on reset, clear this out
    this.setState({ ftpPaymentId: _id });
    return this.props.fetchPayment({ ...attachment, forFTP, forSFTP });
  };

  rowAdapter = (row, index, uploaderKey, isCommission) => {
    const rowData = Object.keys(row)
      .reduce(
        (acc, columnName) => {
          const { fieldArrays } = this.props.template;

          const value = typeof row[columnName] === 'string' ? row[columnName].trim() : row[columnName];

          const keys = columnName === 'lineItems' ? ['lineItems'] : (fieldArrays[columnName] || [columnName]);

          keys.forEach((key) => {
            if (key) {
              acc[key] = value;

              acc.fields = {
                ...acc.fields,
                [key]: value,
              };
            } else {
              acc.fields = {
                ...acc.fields,
                [columnName]: value,
              };
            }

            if ((key === 'additionalEmails') && value) {
              acc.repEmails = acc.repEmails ? `${acc.repEmails},${value}` : value;
            }
            if ((key === 'method') && value) {
              acc.method = { Card: 'vCard', ACH: 'ACH', Check: 'check' }[value];
            }
          });

          return acc;
        },
        { fields: {}, id: `${uploaderKey}_paymentsUploader_${index}`, isCommission }
      );

    if (!rowData.amount && rowData.lineItems) {
      rowData.amount = _sumAmount(rowData);
    }

    return rowData;
  };

  addPayment = (isCommission) => {
    const newPayment = this.rowAdapter({}, this.state.sessionPaymentCount, this.state.uploaderKey, isCommission);

    this.setState((prevState) => {
      const newUploaded = { ...prevState.uploaded };
      newUploaded[newPayment.id] = newPayment;

      return {
        uploaded: newUploaded,
        sessionPaymentCount: prevState.sessionPaymentCount + 1,
      };
    });
    return newPayment.id;
  };

  acceptAllFees = (feesNotAccepted = []) => {
    feesNotAccepted.forEach((item) => {
      this.props.changeFormValue({ formName: 'Components.forms.payment', formKey: item.formId, fields: { acceptsVendorFee: true } });
    });
  };

  generateTableActionButtons = () => {
    const tableActionButtons = [
      {
        text: 'Add Payment',
        icon: 'mdi-plus-circle',
        iconColor: 'text-primary',
        action: this.addPayment,
      },
    ];

    if (this.props.paymentPipelinePreferences.enableCommissions) {
      tableActionButtons.push({
        text: 'Add Commission',
        icon: 'mdi-plus-circle',
        iconColor: 'text-primary',
        action: () => this.addPayment(true),
      });
    }

    return tableActionButtons;
  };

  togglePopover = () => {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  };

  render() {
    const {
      loaded,
      cardsIntegration,
      checksIntegration,
      achIntegration,
      paymentPipelinePreferences,
    } = this.props;
    // Waits until statuses are fetched
    if (!loaded) {
      return <Components.spinner />;
    }

    // Check for integrations
    if (!(cardsIntegration.linked || checksIntegration.linked || achIntegration.linked)) {
      return (
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">No Payment Credentials Found</h4>
          You do not have the capability to pay via any payment method. Please go to your account settings to configure.
        </div>
      );
    }
    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    const { tooLargeFile } = this.state;
    const aggregatedNonCommissionPaymentsTotal = _try(() => _aggregateNonCommissionPaymentsTotals(this.props.derivedForms, this.state.uploaded, this.props.paymentPipelinePreferences.enableCommissions)[this.state.uploaderKey], 0) || 0;
    const { creating, creatingError } = this.props.status;

    const vendorsNeedingFeeAcceptance = _try(() => aggregateFormState.feesNotAccepted, [])
      .reduce((acc, item) => {
        if (acc.indexOf(item.vendorName) < 0) { acc.push(item.vendorName); }
        return acc;
      }, [])
      .reduce((acc, item) => {
        if (!acc) {
          return item;
        } if (!item) {
          return acc;
        }
        return `${acc}, ${item}`;
      }, '');

    const csvFields = _try(() => paymentPipelinePreferences.uploadTemplate)
      ? [[...Object.keys(this.props.template.fields || {})]]
      : [[...Object.keys(this.props.template.fields || {}), ...Object.keys(this.props.paymentCustomFields || {})]];

    return (
      <div className="components_uploaders_payment">
        {!Object.keys(this.state.uploaded).length
          ? <Components.dropzone
            uploadAndCreate
            add={() => this.addPayment(false)}
            instructions={<h5>Upload a supported <b>csv</b> file or start creating your payments manually</h5>}
            dropzoneError={this.state.uploadingError}
            onDrop={this.onDrop}
            featureName="payment"
            accept="text/csv,.csv,.txt,.dat"
            csvFields={csvFields}
          />
          : <Fragment>
            <div className="card">
              <Components.tables.paymentspreview
                items={this.state.uploaded}
                remove={(id) => {
                  const uploaded = { ...this.state.uploaded };
                  delete uploaded[id];
                  this.setState({ uploaded });
                }}
                tableActionButtons={this.generateTableActionButtons()}
                checkNumbers={aggregateFormState.checkNumbers}
                aggregatedNonCommissionPaymentsTotal={aggregatedNonCommissionPaymentsTotal}
                blurAll={this.state.blurAll}
                initialUploaded={this.state.initialUploaded}
              />
            </div>
            {paymentPipelinePreferences.allowBatchERPOverride
              ? <Components.uploaders.components.batchOverrideFields fields={'erp'} />
              : null}
            <Components.uploaders.components.paymentsaggregation data={aggregateFormState} />
            <div className="btn-group me-3">

              <Components.button
                buttonText="Submit"
                id="submit-button"
                onClick={this.onSubmit}
                onDisabledClick={this.onDisabledClick}
                ariaLabel="Submit Payments"
                className="btn btn-primary mt-4 submit-button"
                updating={creating}
                disabled={!Object.keys(this.state.uploaded).length || creating || !aggregateFormState.valid || this.props.instantFundingCreateDisabled}
              />
              <Components.button
                buttonText=" "
                className="btn btn-primary dropdown-toggle dropdown-toggle-split mt-4"
                disabled={!Object.keys(this.state.uploaded).length || creating || !aggregateFormState.valid || this.props.instantFundingCreateDisabled}
                onClick={this.togglePopover}
                onDisabledClick={this.onDisabledClick}
              />
              <Popover
                placement="top-start"
                innerClassName="schedule-button"
                hideArrow
                isOpen={this.state.popoverOpen}
                trigger="legacy"
                target="submit-button"
                toggle={this.togglePopover}
              >
                <PopoverBody>
                  <div id="schedule-button" role="button" tabIndex onClick={() => { this.props.openSchedulerModal(this.onSubmit); this.togglePopover(); }}>
                    <i className="mdi mdi-calendar-clock text-primary me-2" />
                    <span>Schedule Payment Submission</span>
                  </div>
                </PopoverBody>
              </Popover>
            </div>
            <Components.button
              className="btn btn-secondary mt-4"
              onClick={() => {
                this.props.clearStatusErrors();
                this.props.clearFtpPayment();
                this.props.removeQueryParams(['ftpItem']);
                this.setState({
                  uploaded: {}, disabledClick: false, sessionPaymentCount: 0, uploaderKey: '',
                });
              }}
              buttonText="Reset"
            />
          </Fragment>}
        {creatingError
          && <div className="alert alert-danger mt-3 mb-0" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {creatingError}
          </div>}
        {tooLargeFile
          && <div className="alert alert-warning mt-3 mb-0" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`File exceeds the maximum limit. Please limit your file to ${this.state.maximumPayments} payments and try again.`}
          </div>}
        {this.state.showCreatedNotification
          && <div className="alert alert-primary mt-3 mb-0" role="alert">
            <div className="row align-items-center">
              <div className="col-xs-12 col-md-8 mt-1 mb-1">
                Payments successfully created! See details in payment history, or create another payment.
              </div>
              <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                <button className="btn btn-primary" onClick={(e) => this.onNavigateTo(e)}>View Payment History</button>
              </div>
            </div>
          </div>}
        {!aggregateFormState.valid && !!_try(() => aggregateFormState.feesNotAccepted.length)
          && <div className="alert alert-warning mt-3 mb-0" role="alert">
            <h4 className="alert-heading">Service Fees Required</h4>
            <div className="row align-items-center">
              <div className="col-xs-12 col-md-8 mt-1 mb-1">
                Payments to ({vendorsNeedingFeeAcceptance}) require service fees. Please indicate that you accept the service fees by either updating the relevant payments individually, or accepting all fees at once.
              </div>
              <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                <button className="btn btn-primary ml-md-3" onClick={() => { this.acceptAllFees(aggregateFormState.feesNotAccepted); }}>Accept All Service Fees</button>
              </div>
            </div>
          </div>}
        {this.props.instantFundingCreateDisabled && this.state.disabledClick && aggregateFormState.valid
          && <div className="alert alert-warning mt-3 mb-0" role="alert">
            We are calculating the necessary funds for your instant transfer. Please try again in a moment once our calculations have completed.
          </div>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_payment);

// Internal Helper Functions ...
async function _parseDroppedFileData(acceptedFile, adapter, template, idKey, uploaderKey, fileType = 'csv') {
  const { data } = await axios.get(acceptedFile.preview);

  const parserMap = {
    csv: Utils.csvToJson,
    rubicon: _rubiconTxtToJSON,
    comdata: _comdataToJSON,
    wexap3: _wexAP3ToJSON,
    bpam: _bpamToJson,
  };

  const parser = parserMap[fileType];

  /**
   * The CSV parser converts a CSV into an array of objects where the
   * properties are the headers of the file or COLUMN_X for a headerless
   * upload template.
   */
  const { parsedRows } = await parser(data, template.fields);

  /**
   * The scrubber for the upload template applies formatting (if specified)
   * to each of the values of the fields.
   */
  const scrubbed = template.scrubber(Object.values(parsedRows));

  /**
   * Finally, the adapter (we currently pass in the rowAdapter method on the component)
   * is responsible for converting the header names to PayClearly-recognized fields
   * (including account custom fields).
   */
  return scrubbed
    .map((item, index) => adapter(item, index, uploaderKey))
    .reduce((acc, curr) => ({
      ...acc,
      [curr[idKey]]: curr,
    }), {});
}

function _aggregateNonCommissionPaymentsTotals(derivedForms, uploaded, enableCommissions) {
  if (!enableCommissions) { return {}; }
  return Object.keys(uploaded || {})
    // .filter(key => !uploaded[key].removed)
    .reduce((acc, formId) => {
      const derived = derivedForms[formId];
      if (!derived) { return acc; }

      // calculate aggregated payment total if new payment uploader key
      const uploaderKey = _try(() => formId.split('_')[0]);
      const aggregatedNonCommissionPaymentsTotal = {};
      if (!acc[uploaderKey]) {
        const grossPaymentAmount = Object.keys(derivedForms)
          .filter((id) => _try(() => id.split('_')[0] === uploaderKey) && !_try(() => uploaded[id].isCommission) && derivedForms[id])
          .reduce((total, id) => {
            const paymentForm = derivedForms[id];
            return Utils.addDollars([total, _try(() => paymentForm.fee.amount, 0)]);
          }, 0);
        aggregatedNonCommissionPaymentsTotal[uploaderKey] = grossPaymentAmount;
      }

      return { ...acc, ...aggregatedNonCommissionPaymentsTotal };
    }, {});

}

function _aggregateFormData(derivedForms, uploaded) {

  return Object.keys(uploaded || {})
    .filter((key) => !uploaded[key].removed)
    .reduce((acc, formId) => {
      const derived = derivedForms[formId];
      if (!derived) { return acc; }

      const payment = derived.adapted;

      // calculate payment totals
      const amount = parseFloat(payment.amount);
      const method = _try(() => payment.method);
      const isCommission = _try(() => uploaded[formId].isCommission);
      let category;
      if (!derived.valid || !acc.amounts[method]) {
        category = 'notReady';
      } else if (isCommission) {
        category = 'commission';
      } else {
        category = method;
      }

      acc.amounts.total = Utils.addDollars([acc.amounts.total, amount]);
      acc.amounts[category].total = Utils.addDollars([acc.amounts[category].total, amount]);

      if (payment.fee) {
        const fee = parseFloat(payment.fee);
        acc.amounts[category].net = Utils.addDollars([acc.amounts[category].net, amount, -fee]);
        acc.amounts[category].fee = Utils.addDollars([acc.amounts[category].fee, fee]);
      } else {
        acc.amounts[category].net = Utils.addDollars([acc.amounts[category].net, amount]);
      }

      acc.counts.total += 1;
      acc.counts[category] += 1;

      // determine if fees have been accepted
      if (_try(() => derived.fee.type) && !_try(() => derived.form._values.acceptsVendorFee)) {
        acc.feesNotAccepted.push({ formId, vendorName: _try(() => derived.selectedVendor.name) || '' });
      }

      // handle check number aggregation for collisions
      const checkNumberCustomFieldKey = _try(() => Object.keys(payment.customFields).find((key) => Utils.sanitizeString(key) === 'checknumber'));
      if (method === 'check' && payment.customFields && checkNumberCustomFieldKey) {
        const checkNumber = payment.customFields[checkNumberCustomFieldKey];
        if (!acc.checkNumbers) { acc.checkNumbers = {}; }
        if (checkNumber) { acc.checkNumbers[checkNumber] = acc.checkNumbers[checkNumber] ? acc.checkNumbers[checkNumber] + 1 : 1; }
      }

      return {
        ...acc,
        valid: acc.valid && derived.valid,
        adapted: [...acc.adapted, ...[derived.adapted]],
      };
    }, {
      valid: true,
      amounts: {
        total: 0,
        vCard: {
          total: 0,
          net: 0,
          fee: 0,
        },
        check: {
          total: 0,
          net: 0,
          fee: 0,
        },
        ACH: {
          total: 0,
          net: 0,
          fee: 0,
        },
        concierge: {
          total: 0,
          net: 0,
          fee: 0,
        },
        notReady: {
          total: 0,
          net: 0,
          fee: 0,
        },
        commission: {
          total: 0,
          net: 0,
          fee: 0,
        },
      },
      counts: {
        vCard: 0,
        check: 0,
        ACH: 0,
        concierge: 0,
        notReady: 0,
        commission: 0,
        total: 0,
      },
      adapted: [], // the data that can be used to create the payments
      feesNotAccepted: [],
      checkNumbers: undefined,
    });
}

const _sumAmount = ({ lineItems }) => Utils.addDollars(lineItems.map((item) => item.amount));

function _bpamToJson(data, template) {
  return new Promise((resolve, reject) => {
    try {
      if (!data || Object.keys(data) < 1) { throw new Error('Must include data rows'); }

      // Regex will skip separator characters that are inside double quotes
      const separatorRegex = new RegExp(',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', 'g');

      const rows = data.split('\n').filter((row) => row).map((row) => row.split(separatorRegex).map((field) => field.replace(/["']/g, '').trim()));

      const uploadedHeaders = [...rows[0], 'Total']; // need a Total header to track each payments totals
      const uploadedRows = rows.slice(1);

      if (!uploadedRows.length) { throw new Error('You forgot to upload data! Please update your csv file and try again.'); }

      const parsedRows = [];

      const uploadedRowsWithCollapsedFees = uploadedRows.map((row) => {
        const transactionAmount = row[18].includes('$') ? row[18].replace('$', '') : row[18];
        const feeAmount = row[19].includes('$') ? row[19].replace('$', '') : row[19];

        const newRow = [...row];
        newRow[18] = Utils.addDollars([transactionAmount, feeAmount]);

        return newRow;
      });

      const referenceToTotals = uploadedRowsWithCollapsedFees.reduce((acc, cur) => {
        const PCViolationNumber = _trimViolationNumber(cur[3]);

        const lineTotal = Number(cur[18]);

        if (acc[PCViolationNumber]) { acc[PCViolationNumber] += lineTotal; } else { acc[PCViolationNumber] = lineTotal; }

        return acc;
      }, {});

      uploadedRowsWithCollapsedFees.forEach((row, rowNumber) => {
        const rowObject = {};
        const PCViolationNumber = _trimViolationNumber(row[3]);
        uploadedHeaders.forEach((header, column) => {
          if (row[column] !== undefined) {
            rowObject[header] = row[column];
          }
          if (header === 'Total') { rowObject[header] = referenceToTotals[PCViolationNumber]; }
        });
        // rows validation
        rowObject.PCViolationNumber = PCViolationNumber;
        parsedRows.push(rowObject);
      });

      resolve({ parsedRows });
    } catch (err) {
      reject(err);
    }
  });
  // Helpers
}

const _trimViolationNumber = (violationNumberWithTag) => {
  const violationNumberArray = violationNumberWithTag.split('-');
  let trimmedViolationNumber;
  if (violationNumberArray.length === 1) {
    trimmedViolationNumber = violationNumberArray[0];
  } else {
    violationNumberArray.pop();
    trimmedViolationNumber = violationNumberArray.join('-');
  }
  return trimmedViolationNumber;
};

const _comdataToJSON = (data, template) => new Promise((resolve, reject) => {
  try {
    if (!data || Object.keys(data) < 1) { throw new Error('Must include data rows'); }
    const uploadedRows = data.split('\n').filter((row) => row).map((row) => row.split('\t').map((field) => field.replace(/["']/g, '').trim())).filter((row) => row.length > 3);
    const uploadedHeaders = uploadedRows[0];

    if (!uploadedRows.length) { throw new Error('You forgot to upload data! Please update your csv file and try again.'); }

    const parsedRows = [];
    const errors = [];

    uploadedRows.forEach((row, rowNumber) => {
      const rowObject = {};
      uploadedHeaders.forEach((header, column) => {
        if (row[column]) { rowObject[`COLUMN_${column + 1}`] = row[column]; }
      });
      parsedRows.push(rowObject);
    });
    if (errors.length > 0) { throw errors; }
    resolve({ parsedRows });
  } catch (err) {
    reject(err);
  }
});

const _rubiconTxtToJSON = (data, template) => new Promise((resolve, reject) => {
  try {
    if (!data || Object.keys(data) < 1) { throw new Error('Must include data rows'); }

    // Regex will skip separator characters that are inside double quotes
    const separatorRegex = new RegExp(',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', 'g');

    const rows = data.split('\n').filter((row) => row).map((row) => row.split(separatorRegex).map((field) => field.replace(/["']/g, '').trim()));
    const uploadedHeaders = Object.keys(template);
    // Removed code that was trimming the final line of the upload
    const uploadedRows = rows.slice(1);

    if (!uploadedRows.length) { throw new Error('You forgot to upload data! Please update your file and try again.'); }

    const parsedRows = [];
    const errors = [];
    uploadedRows.forEach((row, rowNumber) => {
      const rowObject = {};
      uploadedHeaders.forEach((header, column) => {
        if (header === 'Payment No.') { rowObject[header] = row[0]; }
        if (header === 'Payment Date') { rowObject[header] = row[13]; }
        if (header === 'Currency') { rowObject[header] = row[19]; }
        if (header === 'Account No.') { rowObject[header] = _try(() => row[26].split('*')[0], ''); }
        if (header === 'Invoice No.') { rowObject[header] = _try(() => row[26].split('*')[1], ''); }
        if (header === 'Invoice Date') { rowObject[header] = _try(() => row[26].split('*')[3], ''); }
        if (header === 'Payment Amount') { rowObject[header] = row[28]; }
        if (header === 'Vendor Name') { rowObject[header] = row[43]; }
        if (header === 'Vendor Number') { rowObject[header] = _try(() => row[53].split('|')[4], ''); }
        if (header === 'Total Amount') { rowObject[header] = _try(() => row[53].split('|')[5], ''); }
      });
      parsedRows.push(rowObject);

      // adding a log for final line in case we have issues with removing the code that trimmed the final line
      if (rowNumber === uploadedRows.length - 1) { console.log('Rubicon Upload - final line:', rowObject); }
    });

    if (errors.length > 0) { throw errors; }
    resolve({ parsedRows });
  } catch (err) {
    reject(err);
  }
});


const _wexAP3ToJSON = (data, template) => new Promise((resolve, reject) => {
  try {
    if (!data || Object.keys(data) < 1) { throw new Error('Must include data rows'); }
    const dataWithLineFeeds = data.replace(/\r\n|\r/g, '\n');
    const uploadedRows = dataWithLineFeeds.split('\n').filter((row) => row);
    if (!uploadedRows.length) { throw new Error('You forgot to upload data! Please update your csv file and try again.'); }

    const uploadedHeaders = uploadedRows.filter((row) => row[0] === 'P');
    const uploadedInvoices = uploadedRows.filter((row) => row[0] === 'I');

    // we need tosave the header rows at their associated 'Customer Payment Id' value since that is shared between headers/invoices, so we will use this to add the ehader values to the invoices later
    const paymentIdToHeadersMap = uploadedHeaders.reduce((acc, cur) => {
      const paymentId = cur.slice(1, 51).trim();
      acc[paymentId] = _parseRow({ row: cur, parsingMap: fixedWidthMapHeaderRow });
      return acc;
    }, {});

    const parsedInvoiceRows = uploadedInvoices.map((row) => _parseRow({ row, parsingMap: fixedWidthMapInvoiceRow }));
    const parsedRows = parsedInvoiceRows.map((invoiceObj) => ({ ...invoiceObj, ...paymentIdToHeadersMap[invoiceObj['Customer Payment ID']] }));

    resolve({ parsedRows });
  } catch (err) {
    reject(err);
  }
});

const fixedWidthMapHeaderRow = {
  'Customer Payment ID': { length: 50, position: 1 },
  'File Number': { length: 4, position: 51 },
  'Outsource ID': { length: 4, position: 55 },
  'Company Number': { length: 6, position: 59 },
  'Account Number': { length: 10, position: 65 },
  'Vendor Code': { length: 50, position: 75 },
  'Vendor Sub Code': { length: 50, position: 125 },
  'File Date': { length: 8, position: 175 },
  'Total Net Payment Amount': { length: 12, position: 183, parser: (amt) => parseFloat(amt) },
  'Check Number': { length: 10, position: 195 },
  'Payment Date': { length: 8, position: 205 },
  'Payment Type': { length: 1, position: 213 },
  'Payee Name': { length: 40, position: 214 },
  'Payee Address Line 1': { length: 40, position: 254 },
  'Payee Address Line 2': { length: 40, position: 294 },
  'Payee Address Line 3': { length: 40, position: 334 },
  'Payee City': { length: 25, position: 374 },
  'Payee State/Province': { length: 2, position: 399 },
  'Payee Zip Code': { length: 10, position: 401 },
  'Payee Country Code': { length: 3, position: 411 },
  'Payee Currency': { length: 3, position: 414 },
  'Bank Account #': { length: 17, position: 417 },
  'Bank Routing #': { length: 9, position: 434 },
  'Batch ID': { length: 20, position: 443 },
  'Payment Due Date': { length: 8, position: 463 },
};
const fixedWidthMapInvoiceRow = {
  'Customer Payment ID': { length: 50, position: 1 },
  'Invoice Number': { length: 50, position: 51 },
  'Invoice Date': { length: 8, position: 101 },
  'Invoice Gross Amount Sign': { length: 1, position: 109 },
  'Invoice Gross Amount': { length: 12, position: 110 },
  'Invoice Adjustment Amount Sign': { length: 1, position: 122 },
  'Invoice Adjustment Amount': { length: 12, position: 123 },
  'Invoice Net Amount Sign': { length: 1, position: 135 },
  'Invoice Net Amount': { length: 12, position: 136, parser: (amt) => parseFloat(amt) },
  'Reference GL': { length: 30, position: 148 },
  Notes: { length: 50, position: 178 },
  Filler: { length: 215, position: 228 },
};

const _parseRow = ({ row, parsingMap }) => Object.keys(parsingMap).reduce((acc, cur) => {
  const { length, position, parser } = parsingMap[cur];
  acc[cur] = row.slice(position, position + length).trim();
  if (parser) { acc[cur] = parser(acc[cur]); }
  return acc;
}, {});

function replaceWithNormalizedNames(paymentDataItem, clients, accountVendors) {
  const normalizedAccountVendorName = Utils.normalizeVendorOrClientName(paymentDataItem.vendorName);

  /**
   * Not all accounts use "clients".
   */
  if (paymentDataItem.clientName) {
    const normalizedClientName = Utils.normalizeVendorOrClientName(paymentDataItem.clientName);

    if (paymentDataItem.clientName !== normalizedClientName) {
      const clientNames = Object.values(clients || {}).map((client) => client.name);
      if (clientNames.includes(normalizedClientName)) {
        paymentDataItem.clientName = normalizedClientName;
        paymentDataItem.fields.clientName = normalizedClientName;
      }
    }
  }

  if (paymentDataItem.vendorName !== normalizedAccountVendorName) {
    const accountVendorNames = Object.values(accountVendors || {}).map((vendor) => vendor.name);
    if (accountVendorNames.includes(normalizedAccountVendorName)) {
      paymentDataItem.vendorName = normalizedAccountVendorName;
      paymentDataItem.fields.vendorName = normalizedAccountVendorName;
    }
  }

  return paymentDataItem;
}
