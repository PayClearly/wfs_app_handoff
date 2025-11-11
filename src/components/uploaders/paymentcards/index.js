import {
  connect, Component, Fragment,
} from 'component';

// Third Party imports...
import axios from 'axios';
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  loaded: _try(() => Selectors.globalTaggedItems(state).allTagsLoaded
    && state.account.achAccountDetails.status.fetched
    && state.account.accountVendors.status.fetched
    && (Selectors.integrations(state).cardsIntegration.status.fetched
      || Selectors.integrations(state).achIntegration.status.fetched
      || Selectors.integrations(state).checksIntegration.status.fetched), false),
  cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration),
  checksIntegration: _try(() => Selectors.integrations(state).checksIntegration),
  achIntegration: _try(() => Selectors.integrations(state).achIntegration),

  derivedForms: _try(() => Selectors.paymentcardforms()(state), {}),
  status: _try(() => state.account.paymentCards.status, {}),
  uploadedFileNames: _try(() => state.account.paymentCards.data.uploadedFileNames, []),
  paymentCardCustomFields: state.account.paymentCardCustomFields.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  create: (data, fileName) => {
    dispatch(Store.account.createPaymentCard(data, fileName));
  },
  clearStatusErrors: () => {
    dispatch(Store.account.clearErrorsPaymentCards());
  },
  navigateToHistory: (routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
  },
  openModal: () => {
    dispatch(Store.router.openModal('Components.modals.uploadingWait', { itemsDisplay: 'Purchase Cards' }));
  },
  closeModal: () => {
    dispatch(Store.router.closeModal());
  },
});


// map our fields to sanitizing functions that attempt to match user input with data options
const sanitizerMap = {
  name: (v) => v.trim(),
  amount: (v) => v,
  bin: (v) => v,
  maxUses: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.MAX_USES_OPTIONS, v) || 99999;
  },
  validThrough: (v) => (v ? new Date(v) : Utils.dates.plusThreeYearsMinusOneDay(Date.now())),
  region: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.REGION_OPTIONS, v) || v;
  },
  triggerType: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.TRIGGER_OPTIONS, v, true);
  },
  triggerMin: (v) => (isNaN(Number(v)) ? '' : v),
  triggerMax: (v) => (isNaN(Number(v)) ? '' : v),
  triggerFrequency: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.TRIGGER_OPTIONS, v, true);
  },
  specificDate: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.DAY_OF_WEEK_OPTIONS, v) || _findOption(optionObjects.MONTH_OPTIONS, v) || v || '';
  },
};

// maps upload csv fields to fields we use in our system when creating cards
const templateMap = {
  // Every Card Needs
  'Card Name': 'name',
  Amount: 'amount',
  'Max Uses': 'maxUses',
  'Valid Through': 'validThrough',
  Bin: 'bin',

  // Media Specific fields that were added for the Political media vertical
  Region: 'region',

  // Every Payment Card Can
  'Trigger Type': 'triggerType',
  'Trigger Min': 'triggerMin',
  'Trigger Max': 'triggerMax',
  'Trigger Frequency': 'triggerFrequency',
  'Specific Date': 'specificDate',
};

const rowAdapter = (row, index, uploaderKey) => Object.keys(row)
  .reduce((acc, columnName) => {
    const key = templateMap[columnName];
    const value = sanitizerMap[key] ? sanitizerMap[key](row[columnName]) : row[columnName];

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

    return acc;
  }, { fields: {}, id: `${uploaderKey}_paymentcardsUploader_${index}` });
class components_uploaders_paymentcards extends Component {

  state = {
    fileName: null,
    uploaded: {},
    uploaderKey: '',
    initialUploaded: {},
    showCreatedNotification: false,
    sessionPaymentCount: 0,
    tooLargeFile: false,
    uploadingError: '',
  };

  componentDidMount() { }

  componentWillReceiveProps(nextProps = {}) {
    // this is what i think this will probably look like to close the mdoal on error
    if (this.props.status && !this.props.status.creatingError && nextProps.status.creatingError) {
      this.onCreate();
      this.props.closeModal();
    }
    if (this.props.status && this.props.status.creating && (!nextProps.status.creating && !nextProps.status.creatingError)) {
      if (typeof this.onCreate === 'function') {
        this.onCreate();
        this.setState({ showCreatedNotification: true, disabledClick: false });
        this.props.closeModal();
      }
    }
  }

  componentWillUnmount() { }

  onCreate = () => {
    this.setState({
      uploaded: {},
      uploaderKey: '',
      sessionPaymentCount: 0,
      initialUploaded: {},
      fileName: null,
    });
  };

  onNavigateTo = (e) => {
    e.preventDefault();
    this.props.navigateToHistory({ tab: 'paymentCards' });
  };

  onDrop = (acceptedFiles) => {
    const uploaderKey = Date.now();
    this.setState({ uploadingError: '' });
    return _parseDroppedFileData(acceptedFiles[0], rowAdapter, { ...templateMap, ...this.props.paymentCardCustomFields || {} }, 'id', uploaderKey)
      .then((data = []) => {
        if (Object.keys(data || {}).length > 100) {
          this.setState({ tooLargeFile: true });
          return;
        }
        this.setState({
          fileName: acceptedFiles[0].name,
          uploaderKey,
          uploaded: data,
          sessionPaymentCount: Object.keys(data).length,
          initialUploaded: data,
          showCreatedNotification: false,
          tooLargeFile: false,
        });
      })
      .catch((err) => {
        this.setState({ uploadingError: err });
      });
  };

  onSubmit = () => {
    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    this.props.create(aggregateFormState.adapted, this.state.fileName);
    this.props.openModal();
  };

  addCard = () => {
    const newCard = rowAdapter({}, this.state.sessionPaymentCount, this.state.uploaderKey);

    this.setState((prevState) => {
      const newUploaded = { ...prevState.uploaded };
      newUploaded[newCard.id] = newCard;

      return {
        uploaded: newUploaded,
        sessionPaymentCount: prevState.sessionPaymentCount + 1,
      };
    });
    return newCard.id;
  };

  render() {
    const {
      loaded, cardsIntegration, checksIntegration, achIntegration,
    } = this.props;

    // Waits until statuses are fetched
    if (!loaded) { return <Components.spinner />; }

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
    const { creating } = this.props.status;
    const { tooLargeFile } = this.state;
    const { err: creatingError, name } = _try(() => this.props.status.creatingError, { err: '', name: '' });


    return (
      <div className="components_uploaders_paymentcards">
        <Collapse isOpened={this.props.uploadedFileNames.some((fileName) => fileName === this.state.fileName)}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Warning</h4>
            We see that the file you uploaded has the same name as a previously uploaded file. If you are doing this because you experienced an error on your last upload, <b>be advised that some of your purchase cards from your last upload may already be created.</b> Please double check to make sure you are not reuploading any of the successfully created purchase cards to avoid creating duplicate cards.
          </div>
        </Collapse>
        {!Object.keys(this.state.uploaded).length
          ? <Components.dropzone
            uploadAndCreate
            add={this.addCard}
            instructions={<h5>Upload a supported <b>csv</b> file or start creating your purchase cards manually</h5>}
            onDrop={this.onDrop}
            dropzoneError={this.state.uploadingError}
            featureName="purchase-card"
            accept="text/csv,.csv"
            csvFields={[[...Object.keys(templateMap), ...Object.keys(this.props.paymentCardCustomFields || {})]]}
          />
          : <Fragment>
            <div className="card">
              <Components.tables.paymentcardspreview
                items={this.state.uploaded}
                initialUploaded={this.state.initialUploaded}
                blurAll={this.state.blurAll}
                remove={(id) => {
                  const uploaded = { ...this.state.uploaded };
                  delete uploaded[id];
                  this.setState({ uploaded });
                }}
                tableActionButtons={[{
                  text: 'Add Card',
                  icon: 'mdi-plus-circle',
                  iconColor: 'text-primary',
                  action: this.addCard,
                }]}
              />
            </div>

            <Components.uploaders.components.paymentcardsaggregation data={aggregateFormState} />
            <Components.button
              buttonText="Submit"
              onClick={this.onSubmit}
              ariaLabel="Submit Payments"
              className="btn btn-primary mt-4 me-3 submit-button"
              updating={creating}
              onDisabledClick={() => this.setState({ blurAll: true })}
              disabled={!Object.keys(this.state.uploaded).length || creating || !aggregateFormState.valid /* || this.props.instantFundingCreateDisabled */}
            />
            <Components.button
              className="btn btn-secondary mt-4"
              onClick={() => {
                this.props.clearStatusErrors();
                this.setState({
                  uploaded: {}, disabledClick: false, sessionPaymentCount: 0, uploaderKey: '', fileName: null,
                });
              }}
              buttonText="Reset"
            />
          </Fragment>}
        <Collapse isOpened={!!creatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`There was a problem creating your purchase cards: ${creatingError}. ${name ? `This was cause when the card with name '${name}' failed to create. However, all cards before this were successfully created` : 'Some of your cards may have been successfully created'}. Please adjust your csv and try again.`}
          </div>
        </Collapse>
        <Collapse isOpened={tooLargeFile}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {'File exceeds the maximum limit. Please limit your file to 100 purchase cards and try again.'}
          </div>
        </Collapse>
        {this.state.showCreatedNotification
          ? <div className="alert alert-primary" role="alert">
            <div className="row align-items-center">
              <div className="col-xs-12 col-md-8 mt-1 mb-1">
                Cards successfully created! Yours cards are being initialized, and will be usable in a few mintes. See details in history, or create another card.
              </div>
              <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                <button className="btn btn-primary" onClick={(e) => this.onNavigateTo(e)}>View Card History</button>
              </div>
            </div>
          </div>
          : null}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_paymentcards);

// Internal Helper Functions ...
function _parseDroppedFileData(acceptedFile, adapter, template, idKey, uploaderKey) {
  return new Promise((resolve, reject) => axios.get(acceptedFile.preview)
    .then(({ data }) => Utils.csvToJson(data, template)
      .then(({ parsedRows }) => {
        resolve(Object.values(parsedRows)
          .map((item, index) => adapter(item, index, uploaderKey))
          .reduce((acc, curr) => ({
            ...acc,
            [curr[idKey]]: curr,
          }), {}));
      }))
    .catch(reject));
}

function _aggregateFormData(derivedForms, uploaded) {
  return Object.keys(uploaded || {})
    // .filter(key => !uploaded[key].removed)
    .reduce((acc, formId) => {
      const derived = derivedForms[formId];
      if (!derived) { return acc; }

      const purchaseCard = derived.adapted;

      // calculate purchaseCard totals
      const amount = parseFloat(purchaseCard.virtualCard.amount);
      const method = _try(() => purchaseCard.method);
      // const isCommission = _try(() => uploaded[formId].isCommission);
      let category;
      if (!derived.valid || !acc.amounts[method]) {
        category = 'notReady';
      } else {
        category = method;
      }

      acc.amounts.total = Utils.addDollars([acc.amounts.total, amount]);
      acc.amounts[category].total = Utils.addDollars([acc.amounts[category].total, amount]);

      acc.counts.total += 1;
      acc.counts[category] += 1;

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
        notReady: {
          total: 0,
          net: 0,
        },
      },
      counts: {
        vCard: 0,
        notReady: 0,
        total: 0,
      },
      adapted: [], // the data that can be used to create the paymentcards
    });
}

// GENERATOR_TYPE='component';
function _findOption(options, value, returnOriginalValue) {
  const _fuzzyMatch = (val, val2) => (val || '').toLowerCase() === (val2 || '').toLowerCase();

  const optionsKeys = Object.keys(options);
  const optionBasedOnDisplay = optionsKeys.find((key) => _fuzzyMatch(value.toLowerCase(), options[key].display.toLowerCase()));
  const optionBasedOnKey = optionsKeys.find((key) => _fuzzyMatch(value.toLowerCase(), key.toLowerCase()));

  if (optionBasedOnDisplay) { return optionBasedOnDisplay; }
  if (optionBasedOnKey) { return optionBasedOnKey; }
  if (returnOriginalValue) { return value; }
  return null;
}
