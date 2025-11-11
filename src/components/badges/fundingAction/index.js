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

class components_badges_fundingAction extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const inboundTransfer = this.props.inbound;

    return (
      <div className="components_badges_fundingAction">
        <i className={`mdi mdi-inbox-arrow-${inboundTransfer ? 'down' : 'up'} mdi-36px text-${inboundTransfer ? 'primary' : 'secondary'} funding-history-icon`} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_fundingAction);


