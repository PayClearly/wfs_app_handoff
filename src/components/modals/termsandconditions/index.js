import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    acceptedDate: state.user.privateMetadata.data.item.lastTAndCAccept,
    latestTermsDate: state.termsAndConditions.data.items._latest,
    hasAccepted: Selectors.termsAccepted(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    acceptTermsAndConditions: () => {
      const timestamp = Date.now();
      dispatch(Store.user.acceptTermsAndConditions({ timestamp }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({
    termsHTML: _try(() => `/termsAndConditions/${state.termsAndConditions.data.items._latest}`, ''),
  });
};

class components_modals_termsandconditions extends Component {

  state = {
    accepting: false,
    agreed: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasAccepted && !nextProps.static) {
      this.props.close();
    }
  }

  onAccept = () => {
    if (!this.props.termsHTML || this.state.accepting) return;
    this.setState({
      accepting: true,
    });
    this.props.acceptTermsAndConditions();
  }

  onDecline = () => {
    if (this.props.decline && !this.state.accepting) {
      this.props.decline();
    }
    if (!this.state.accepting) {
      this.props.close();
    }
  }

  modalTitle() {
    return (this.props.acceptedDate)
      ? 'We have updated our Terms and Conditions'
      : 'Terms and Conditions';
  }

  render() {
    return (
      <div className="modal-dialog components_modals_termsandconditions terms-modal wide-modal wide-90" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{this.modalTitle()}</h2>
            <button type="button" className="close" onClick={() => { return this.onDecline(); }} data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {this.props.termsHTML &&
              <Fragment>
                <h5>Effective as of {new Date(this.props.latestTermsDate).toLocaleString()}</h5>
                <div dangerouslySetInnerHTML={{ __html: this.props.termsHTML }} />
              </Fragment>
            }
            {!this.props.termsHTML &&
              <div style={{ height: '200px' }}>
                <Components.spinner />
              </div>
            }
          </div>
          {this.props.static &&
            <div className="modal-footer">
              <button disabled={this.state.accepting} style={{ width: '6rem' }} type="button" className="btn btn-primary" onClick={() => { return this.props.close(); }}>
                Close
              </button>
            </div>
          }
          {!this.props.static &&
            <div className="modal-footer">
              <div className="checkbox-primary float-start">
                <input
                  style={{ cursor: 'pointer' }}
                  type="checkbox"
                  className="form-check-input"
                  onClick={() => {
                    this.setState({ agreed: !this.state.agreed });
                  }}
                  checked={this.state.agreed}
                />
                <label className="form-check-label">By checking this box you agree to Our Terms of Service and Privacy Policy.</label>
              </div>
              <button disabled={this.state.accepting} style={{ width: '6rem' }} type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { return this.onDecline(); }}>Decline</button>
              <button disabled={this.state.accepting || !this.state.agreed} style={{ width: '6rem' }} type="button" className="btn btn-primary" onClick={() => { return this.onAccept(); }}>{
                (this.state.accepting)
                  ? <Components.spinner white height="20px" />
                  : 'Accept'}
              </button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_termsandconditions);

