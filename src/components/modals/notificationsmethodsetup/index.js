import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    smsRegistered: _try(() => state.user.preferences.data.item.notificationPhone),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    enrollNotificationDevice: (data) => {
      return dispatch(Store.account.enrollNotificationDevice(data));
    },
    clearErrors: () => {
      return dispatch(Store.account.clearNotificationErrors());
    },
  });
};

class components_modals_notificationsmethodsetup extends Component {

  state = {
    forms: {},
  };



  componentWillReceiveProps(nextProps) {
    const { forms } = nextProps;
    this.setState({ forms });
    if (nextProps.smsRegistered) {
      this.props.close();
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  handleNext = (step) => {
    if (step === 1) {
      this.props.enrollNotificationDevice(this.props.forms['Components.forms.enrollnotificationdevice'].default._values);
    }

    if (step === 2) {
      this.props.close();
    }
  };

  render() {
    let step = 1;
    const form = this.state.forms['Components.forms.enrollnotificationdevice'] &&
      this.state.forms['Components.forms.enrollnotificationdevice'].default;

    return (
      <div className="modal-dialog components_modals_notificationsmethodsetup">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">Device Setup</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body px-3">
            <div className="col-md" >
              <Components.forms.enrollnotificationdevice />
              {/* <Components.cards.wizard>
                <Components.step
                  first
                  description={'Register'}
                  label={'step 1'}
                  done={step > 1}
                  current={step === 1}
                  disabled={step < 1}
                >
                </Components.step> */}
              {/* <Components.step
                  description={'Confirm'}
                  label={'step 2'}
                  done={step > 2}
                  current={step === 2}
                  disabled={step < 2}
                  last
                >
                  <Components.containers.verifytwofactordevice />
                </Components.step> */}
              {/* </Components.cards.wizard> */}
            </div>
            <div className="modal-footer mt-4">
              <div className="row float-end">
                <Components.button
                  buttonText={'Cancel Setup'}
                  onClick={() => {
                    this.props.close();
                  }}
                  ariaLabel="Cancel Setup"
                  className="btn btn-secondary me-4"
                />
                <Components.button
                  buttonText={'Next'}
                  onClick={() => this.handleNext(step)}
                  ariaLabel="Next"
                  className="btn btn-primary waves-effect z-depth-5dp float-end"
                  disabled={!form || !form._allValid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_notificationsmethodsetup);


