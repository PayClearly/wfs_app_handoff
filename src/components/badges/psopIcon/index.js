import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openPSOPModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.psop', data));
    },
  });
};

class components_badges_psopIcon extends Component {




  render() {
    const { method, accepts, groupId } = this.props;
    let icon;
    const textColor = accepts ? 'primary' : 'muted';

    switch (method) {
      case 'vCard':
        icon = 'mdi-credit-card-outline';
        break;

      case 'ACH':
        icon = 'mdi-bank';
        break;

      case 'check':
        icon = 'mdi-email-outline';
        break;

      default:
        icon = 'mdi-help';
        break;
    }

    return (
      <div className={classNames('components_badges_psopIcon', this.props.classNames)}>
        <div>
          <i
            className={`mdi ${icon} text-${textColor}`}
            onClick={(e) => {
              e.stopPropagation();
              this.props.openPSOPModal({ method, groupId });
            }}
            role="tooltip"
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_psopIcon);


