import { connect, Component } from 'component';
import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  expenseReportComments: state.account.expenseReportComments.data.items,
});

const mapDispatchToProps = () => ({});

const mapResourcesToProps = (state, props) => ({
  userProfile: Resources.userProfile(state, { id: _try(() => props.expenseReportComments[props.commentId].createdBy) }),
});

// eslint-disable-next-line camelcase
class components_expenseComment extends Component {
  render() {
    const { commentId, expenseReportComments, userProfile } = this.props;
    const expenseReportComment = _try(() => expenseReportComments[commentId], {});

    let userName = '';
    if (_try(() => userProfile.firstName)) {
      userName = userProfile.firstName;
      if (_try(() => userProfile.lastName)) { userName = `${userName} ${userProfile.lastName}`; }
    } else if (_try(() => userProfile.lastName)) {
      userName = userProfile.lastName;
    } else {
      userName = _try(() => userProfile.username, '');
    }

    return (
      <li className={`components_expenseComment media${this.props.notFirst ? ' border-top pt-2 mt-2' : ''}`}>
        <div className="align-self-center me-3">
          <Components.avatar id={expenseReportComment.createdBy} />
        </div>
        <div className="media-body">
          <div className="d-flex justify-content-between align-items-center mt-0 mb-1">
            <h5 className="">{userName}</h5>
            <small>{Utils.dates.dateToDay(expenseReportComment._createdAt)}</small>
          </div>
          {expenseReportComment.memo}
        </div>
      </li>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_expenseComment);
