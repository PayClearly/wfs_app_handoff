import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import qrcode from 'qrcode';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

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
  });
};

class components_containers_qrcode extends Component {

  state = {
    qrCodeUrl: null,
    secret: null,
  };

  componentDidMount() {
    this.props.fetchQrCode()
      .then((response) => {
        const secret = response.data.split('secret=')[1].split('&')[0];
        qrcode.toDataURL(response.data, (err, url) => {
          this.setState({
            qrCodeUrl: url,
            secret,
          });
        });
      });
  }


  render() {
    if (this.state.qrCodeUrl) {
      return (
        <div className={'row mb-4'}>
          <div className={'col-12'}>
            <img style={{ display: 'block', margin: 'auto', width: '200px' }} src={this.state.qrCodeUrl} />
          </div>
          <div className={'col-12'}>
            <p className={'text-center'} style={{ 'font-size': 'x-small' }}>{this.state.secret}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={'row mb-3'}>
        <div className={'col-12'} style={{ height: '200px' }}>
          <Components.spinner />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_containers_qrcode);


