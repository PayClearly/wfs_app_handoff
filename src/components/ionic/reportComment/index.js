import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonGrid, IonRow, IonCol, IonChip } from '@ionic/react';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenseReportComments: state.account.expenseReportComments.data.items,
    currentUser: state.user.access.data.uid,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({
    userProfile: Resources.userProfile(state, { id: _try(() => props.comment.createdBy) }),
  });
};

class components_ionic_reportComment extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { comment, userProfile, currentUser } = this.props;

    let userName = '';
    if (_try(() => userProfile.firstName)) {
      userName = userProfile.firstName;
      if (_try(() => userProfile.lastName)) userName = `${userName} ${userProfile.lastName}`;
    } else if (_try(() => userProfile.lastName)) {
      userName = userProfile.lastName;
    } else {
      userName = _try(() => userProfile.username, '');
    }
    return (
      <div className={`components_ionic_reportComment${currentUser === comment.createdBy ? ' from-user' : ' to-user'}`}>
        <p className="user-name">{userName}</p>
        <div className={`report-comment${currentUser === comment.createdBy ? ' from-user' : ' to-user'}`}>
          <div>
            {comment.memo}
          </div>
        </div>
        <small className="comment-date">{Utils.dates.dateToDay(comment._createdAt)}</small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_reportComment);


