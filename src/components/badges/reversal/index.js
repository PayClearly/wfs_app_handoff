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

class components_badges_reversal extends Component {




  render() {
    const { data } = this.props;
    const hasIssues = _try(() => data.hasIssues);
    if (!hasIssues) return null;
    const hasPendingIssues = data.hasPendingIssues;

    return (
      <span className={`${hasPendingIssues ? 'text-danger' : 'text-secondary'} components_badges_reversal${!hasPendingIssues ? ' resolved-icon' : ''}`}>
        {hasIssues && <i className={`mdi mdi-${hasPendingIssues ? 'alert' : 'check'}-circle-outline`} />}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_reversal);


