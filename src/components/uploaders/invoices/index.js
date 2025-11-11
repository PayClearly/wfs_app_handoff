import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoicesStatus: _try(() => state.account.invoices.status, {}),
    routeParams: state.router.route.params,
    created: state.account.invoices.data.created,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    uploadInvoices: (data) => {
      return dispatch(Store.account.uploadInvoices(data));
    },
    goToInvoiceTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('invoices', routeParams, routeOptions));
    },
  });
};

class components_uploaders_invoices extends Component {

  state = {
    invoices: [],
    initialUploaded: {},
    showCreatedNotification: false,
  }

  componentDidMount() {}
  // temporary pre-wrapper way to determine onCreated
  componentWillReceiveProps(nextProps = {}) {
    if (this.props.invoicesStatus && this.props.invoicesStatus.creating && (!nextProps.invoicesStatus.creating && !nextProps.invoicesStatus.creatingError)) {
      this.on.create();
      this.setState({ showCreatedNotification: true, disabledClick: false });
    }
  }
  componentWillUnmount() {}

  on = {
    create: () => {
      this.setState({
        invoices: [],
      });
    },
    drop: (acceptedFiles) => {
      this.setState({ showCreatedNotification: false, invoices: acceptedFiles });
    },
    submit: () => {
      this.props.uploadInvoices(this.state.invoices);
    },
    navigationClick: () => {
      this.props.goToInvoiceTable();
    },
  }

  render() {

    const { creating: uploading, creatingError: error } = this.props.invoicesStatus;
    return (
      <div className="components_uploaders_invoices">
        
        <Components.dropzone
          onDrop={this.on.drop}
          accept="image/jpeg, image/png, application/pdf"
          // fullSizeImagePreviews
          title="Upload an Invoice"
          instructions={<h5>Click to upload or drag and drop a supported <b>PDF</b>, <b>JPEG</b>, or <b>PNG</b> file </h5>}
          acceptedFiles={this.state.invoices}
        />
        
        { this.state.showCreatedNotification &&
          <div className="alert alert-primary" role="alert">
            <div className="row align-items-center">
              <div className="col-xs-12 col-md-8 mt-1 mb-1">
                Invoice(s) successfully uploaded!
              </div>
              <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                <Components.button
                  buttonText="View Invoice"
                  onClick={this.on.navigationClick}
                />
              </div>
            </div>
          </div>
        }
        {
          error &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {error}
          </div>
        }
        <Components.button
          className="btn btn-primary"
          buttonText="Upload"
          onClick={this.on.submit}
          onDisabledClick={() => this.setState({ showError: true })}
          ariaLabel="Submit"
          updating={uploading}
          disabled={uploading || !this.state.invoices.length}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_invoices);

// Internal Helper Functions ... 
// function _parseDroppedFileData(acceptedFile, idKey) {
//   const items = [];
//   return new Promise((resolve, reject) => {
//     return axios.get(acceptedFile.preview)
//   })
// }
// GENERATOR_TYPE='component';
