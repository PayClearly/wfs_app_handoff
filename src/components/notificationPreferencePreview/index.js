import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_notificationPreferencePreview extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { email, sms } = _try(() => this.props.data, { email: false, sms: false });
    return (
      <div className="components_notificationPreferencePreview">
        <span>{`${this.props.event.name}: `}</span>
        <i className={`mdi mdi-email-outline ${email ? 'active' : ''}`} />
        <i className={`mdi mdi-phone ${sms ? 'active' : ''}`} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_notificationPreferencePreview);


