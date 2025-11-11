import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenseReportComments: state.account.expenseReportComments.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_expenseCommentsList extends Component {




  _sortComments = (commentAId, commentBId) => {
    const commentADate = _try(() => this.props.expenseReportComments[commentAId]._createdAt);
    const commentBDate = _try(() => this.props.expenseReportComments[commentBId]._createdAt);

    if (commentADate < commentBDate) return -1;
    if (commentBDate < commentADate) return 1;
    return 0;
  };

  render() {
    const { commentIds } = this.props;
    if (!commentIds.length) return null;
    return (
      <div className="components_expenseCommentsList">
        <ul className="list-unstyled">
          {commentIds.sort(this._sortComments).map((commentId, index) => {
            if (!_try(() => this.props.expenseReportComments[commentId].memo)) return null;
            return <Components.expenseComment key={commentId} commentId={commentId} notFirst={index !== 0} />;
          })}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_expenseCommentsList);


