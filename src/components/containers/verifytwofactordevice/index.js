import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    privateMetadata: state.user.privateMetadata.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchQrCode: () => {
      return dispatch(Store.user.fetchTwoFactorAuthQrCode());
    },
    requestSMS: () => {
      return dispatch(Store.user.requestSMS());
    },
  });
};

class components_containers_verifytwofactordevice extends Component {

  componentDidMount() {
    if (this.props.privateMetadata.twoFactorAuthType === 'sms') {
      this.props.requestSMS();
    }
  }

  render() {
    const metadata = this.props.privateMetadata;
    if (!metadata.twoFactorAuthType) return null;

    if (metadata.twoFactorAuthType === 'sms') {
      return (
        <Fragment>
          <div className={'row mb-3'}>
            <div className={'col-12'}>
              <p className={'text-center'}>A six digit code has been sent to {metadata.twoFactorSmsNumber}. <br /> Did not receive a code? Click <a onClick={this.props.requestSMS} href="#">here</a> to resend.</p>
            </div>
          </div>
          <Components.forms.verifytwofactordevice
            hideRememberMe={this.props.hideRememberMe}
            onSubmit={this.props.onSubmit}
          />
        </Fragment>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_containers_verifytwofactordevice);

