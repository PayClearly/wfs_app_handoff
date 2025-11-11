import { connect, Component, bindActionCreators, Fragment } from 'component';

//Third Party imports...
import csvtojson from 'csvtojson';
import axios from 'axios';
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    loaded: state.account.achAccountDetails.status.fetched
      && Selectors.integrations(state).cardsIntegration.status.fetched,
    cardsIntegration: Selectors.integrations(state).cardsIntegration,
    derivedForms: Selectors.plasticCardForms()(state),
    status: state.account.cardsIntegration.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data) => {
      dispatch(Store.account.createCardsIntegrationPCard(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
    navigateToHistory: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
    openModal: () => {
      dispatch(Store.router.openModal('Components.modals.uploadingWait', { itemsDisplay: 'Plastic Cards' }));
    },
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
  });
};


// map our fields to sanitizing functions that attempt to match user input with data options
const sanitizerMap = {
  cardHolderName: v => v.trim(),
  cardMemo: v => v.trim(),
  cardType: v => isNaN(Number(v)) ? '' : v,
  region: (v) => {
    const optionObjects = Utils.getPaymentCardFieldOptions();
    return _findOption(optionObjects.REGION_OPTIONS, v) || '';
  },
  // TODO add more santization to make user uploads match more fields
};

// maps upload csv fields to fields we use in our system when creating cards
const templateMap = {
  // Details
  'Card Holder Name': 'cardHolderName',
  'Card Type': 'cardType',
  'Region': 'region',
  'Card Memo': 'cardMemo',
  'Card Group': 'cardGroup',
  'Assigned To': 'assignedTo',

  // Limits
  'Daily Transaction Count Limit': 'dailyTransactionCountLimit',
  'Daily Transaction Amount Limit': 'dailyTransactionAmountLimit',
  'Transaction Limit': 'transactionLimit',
  'Cycle Indicator': 'cycleIndicator',
  'Cycle Refresh Day': 'cycleRefreshDay',
  'Cycle Transaction Amount Limit': 'cycleTransactionAmountLimit',
  'Cycle Transaction Count Limit': 'cycleTransactionCountLimit',

  // Delivery
  // 'Use Default Address': 'useDefaultAddress',
  'Rush Order': 'rushOrder',
  'Contact Name': 'contactName',
  'Address Line': 'addressLine',
  'City': 'city',
  'State/Prov': 'stateProv',
  'Postal Code': 'postalCode',
  'Country': 'country',
  'Phone Number': 'phoneNumber',
};


const rowAdapter = (row, index, uploaderKey) => {
  return Object.keys(row).reduce((acc, columnName) => {
    const key = templateMap[columnName];
    const value = sanitizerMap[key] ? sanitizerMap[key](row[columnName]) : row[columnName];

    if (key) {
      acc[key] = value;
      acc.fields[key] = value;
    } else {
      acc.fields[columnName] = value;
    }

    return acc;
  }, { fields: {}, id: `${uploaderKey}_plasticCardsUploader_${index}` });
};

class components_uploaders_plasticCards extends Component {

  state = {
    fileName: null,
    uploaded: {},
    uploaderKey: '',
    initialUploaded: {},
    showCreatedNotification: false,
    sessionCardCount: 0,
    tooLargeFile: false,
    uploadingError: '',
  }


  componentWillReceiveProps(nextProps = {}) {
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


  onCreate = () => {
    this.setState({
      uploaded: {},
      uploaderKey: '',
      initialUploaded: {},
      fileName: null,
    });
  }
  onNavigateTo = (e) => {
    e.preventDefault();
    this.props.navigateToHistory({ tab: 'plasticCards' });
  }
  onDrop = (acceptedFiles) => {
    const uploaderKey = Date.now();
    this.setState({ uploadingError: '' });
    return _parseDroppedFileData(acceptedFiles[0], rowAdapter, templateMap, 'id', uploaderKey)
      .then((data = []) => {
        if (Object.keys(data || {}).length > 100) {
          this.setState({ tooLargeFile: true });
          return;
        }
        this.setState({
          fileName: acceptedFiles[0].name,
          uploaderKey,
          uploaded: data,
          sessionCardCount: Object.keys(data).length,
          initialUploaded: data,
          showCreatedNotification: false,
          tooLargeFile: false,
        });
      })
      .catch((err) => {
        this.setState({ uploadingError: err });
      });
  }
  onSubmit = () => {
    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    this.props.create(aggregateFormState.adapted, this.state.fileName);
    this.props.openModal();
  }
  addCard = () => {
    const newCard = rowAdapter({}, this.state.sessionCardCount, this.state.uploaderKey);

    this.setState((prevState) => {
      const newUploaded = { ...prevState.uploaded };
      newUploaded[newCard.id] = newCard;

      return {
        uploaded: newUploaded,
        sessionCardCount: prevState.sessionCardCount + 1,
      };
    });
    return newCard.id;
  }

  render() {
    const { loaded, cardsIntegration } = this.props;

    // Waits until statuses are fetched
    if (!loaded) return <Components.spinner />;

    // Check for integrations
    if (!(cardsIntegration.linked)) {
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
      <div className="components_uploaders_plasticCards">

        {!Object.keys(this.state.uploaded).length ?
          <Components.dropzone
            uploadAndCreate
            add={this.addCard}
            instructions={<h5>Upload a supported <b>csv</b> file or start creating your plastic cards manually</h5>}
            onDrop={this.onDrop}
            dropzoneError={this.state.uploadingError}
            featureName="plastic-card"
            accept="text/csv,.csv"
            csvFields={[[...Object.keys(templateMap), ...Object.keys(this.props.paymentCardCustomFields || {})]]}
          />
          :
          <Fragment>
            <div className="card">
              <Components.tables.plasticCardsPreview
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

            <Components.uploaders.components.plasticCardsAggregation data={aggregateFormState} />
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
                this.setState({ uploaded: {}, disabledClick: false, sessionCardCount: 0, uploaderKey: '', fileName: null });
              }}
              buttonText="Reset"
            />
          </Fragment>
        }
        <Collapse isOpened={!!creatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`There was a problem creating your plastic cards: ${creatingError}. ${name ? `This was cause when the card with name '${name}' failed to create. However, all cards before this were successfully created` : 'Some of your cards may have been successfully created'}. Please adjust your csv and try again.`}
          </div>
        </Collapse>
        <Collapse isOpened={tooLargeFile}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {'File exceeds the maximum limit. Please limit your file to 100 plastic cards and try again.'}
          </div>
        </Collapse>
        {this.state.showCreatedNotification ?
          <div className="alert alert-primary" role="alert">
            <div className="row align-items-center">
              <div className="col-xs-12 col-md-8 mt-1 mb-1">
                Cards successfully created! Your cards are being processed and will be shipped when ready. See details in history, or create another card.
              </div>
              <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                <button className="btn btn-primary" onClick={e => this.onNavigateTo(e)}>View Card History</button>
              </div>
            </div>
          </div>
          : null
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_plasticCards);

// Internal Helper Functions ...
function _parseDroppedFileData(acceptedFile, adapter, template, idKey, uploaderKey) {
  return new Promise((resolve, reject) => {
    return axios.get(acceptedFile.preview)
      .then(({ data }) => {
        return Utils.csvToJson(data, template)
          .then(({ parsedRows }) => {
            resolve(Object.values(parsedRows)
              .map((item, index) => {
                return adapter(item, index, uploaderKey);
              })
              .reduce((acc, curr) => {
                return {
                  ...acc,
                  [curr[idKey]]: curr,
                };
              }, {}));
          });
      })
      .catch(reject);
  });
}

function _aggregateFormData(derivedForms, uploaded) {
  return Object.keys(uploaded || {})
    // .filter(key => !uploaded[key].removed)
    .reduce((acc, formId) => {
      const derived = derivedForms[formId];
      if (!derived) return acc;

      const plasticCard = derived.adapted;

      const category = !derived.valid ? 'notReady' : 'pCard';

      acc.counts.total += 1;
      acc.counts[category] += 1;

      return {
        ...acc,
        valid: acc.valid && derived.valid,
        adapted: [...acc.adapted, ...[derived.adapted]],
      };
    }, {
      valid: true,
      counts: {
        pCard: 0,
        notReady: 0,
        total: 0,
      },
      adapted: [], // the data that can be used to create the plastic cards
    });
}

function _findOption(options, value, returnOriginalValue) {
  const _fuzzyMatch = (val, val2) => (val || '').toLowerCase() === (val2 || '').toLowerCase();

  const optionsKeys = Object.keys(options);
  const optionBasedOnDisplay = optionsKeys.find(key => _fuzzyMatch(value.toLowerCase(), options[key].display.toLowerCase()));
  const optionBasedOnKey = optionsKeys.find(key => _fuzzyMatch(value.toLowerCase(), key.toLowerCase()));

  if (optionBasedOnDisplay) return optionBasedOnDisplay;
  if (optionBasedOnKey) return optionBasedOnKey;
  if (returnOriginalValue) return value;
  return null;
}
