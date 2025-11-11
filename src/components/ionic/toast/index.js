import { connect, Component } from 'component';
import { IonToast } from '@ionic/react';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';
import Store from '../../../store';

const mapStateToProps = (state, props) => {
  return ({
    toast: state.device.toast.data,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    dismiss: () => {
      return dispatch(Store.device.dismissToast());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({

  });
};

class components_ionic_toast extends Component {




  render() {
    return (
      <IonToast
        isOpen={this.props.toast.isOpen}
        message={this.props.toast.message}
        position={'bottom'}
        duration={this.props.toast.duration}
        onDidDismiss={this.props.toast.dismiss ? () => { this.props.dismiss(); this.props.toast.dismiss(); } : this.props.dismiss}
        color={this.props.toast.color}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_toast);


