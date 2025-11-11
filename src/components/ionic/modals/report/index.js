import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonSpinner, IonChip, IonAvatar, IonLabel, IonImg, IonText, IonCheckbox } from '@ionic/react';
import { close, send, pencil, trashOutline, alertOutline, chevronDownOutline, chevronBackOutline, sendSharp } from 'ionicons/icons';
import { Collapse } from 'react-collapse';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';
import nopic from 'assets/nopic.svg';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    reportsStatus: state.account.expenseReports.status,
    forms: state.forms,
    user: _try(() => state.wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'], {}),
    photo: _resolve(state, 'device.data.base64String', nopic),
    profile: state.user.profile.data.item,
    expenseReportComments: state.account.expenseReportComments.data.items,
    expenseReportCommentsStatus: state.account.expenseReportComments.status,
    reportData: state.account.expenseReports.data.items[props.data.id],
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    createExpenseReport: (data) => {
      dispatch(Store.account.createExpenseReport(data));
    },
    updateExpenseReport: (id, data) => {
      dispatch(Store.account.updateExpenseReport(id, data));
    },
    createExpenseReportComment: (data) => {
      dispatch(Store.account.createExpenseReportComment(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_report extends Component {

  state = {
    forUpdate: false,
    commentsOpen: false,
    noComments: false,
  }

  componentDidMount() {
    this.setState({ forUpdate: !!Object.keys(_resolve(this.props, 'data', {})).length, forView: this.props.reportData && !!this.props.reportData.submitted });
  }

  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => this.props.expenseReportCommentsStatus.creating) && (!_try(() => nextProps.expenseReportCommentsStatus.creating) && !_try(() => nextProps.expenseReportCommentsStatus.creatingError))) {
      const formName = 'Components.forms.expenseReportComment';
      const formKey = this.props.data.id;
      if (_try(() => this.props.forms[formName][formKey])) this.props.resetForm(formName, formKey, Object.keys(this.props.forms[formName][formKey]._values).reduce((acc, cur) => { acc[cur] = undefined; return acc; }, {}));
    }
  }

  componentDidUpdate(prevProps) {
    // successfully created
    if (prevProps.reportsStatus.creating && !this.props.reportsStatus.creating && this.props.reportsStatus.created && !this.props.reportsStatus.creatingError) {
      this.close();
    }
    // successfully updated
    if (prevProps.reportsStatus.updating && !this.props.reportsStatus.updating && this.props.reportsStatus.updated && !this.props.reportsStatus.updatingError) {
      this.close();
    }
  }

  componentWillUnmount() { }

  createExpenseReport = () => {
    const data = this.props.forms['Components.ionic.forms.report'].default._values;
    this.props.createExpenseReport(data);
  }

  updateExpenseReport = () => {
    const data = this.props.forms['Components.ionic.forms.report'].default._values;
    this.props.updateExpenseReport(this.props.data.id, data);
  }

  submitReport = () => {
    const data = this.props.forms['Components.ionic.forms.report'].default._values;
    data.submitted = true;
    return this.state.forUpdate ? this.updateExpenseReport(this.props.data.id, data) : this.createExpenseReport(data);
  }

  deleteReport = () => {
    const data = this.props.forms['Components.ionic.forms.report'].default._values;
    data.deleted = true;
    data.expenseIds = [];
    return this.updateExpenseReport(this.props.data.id, data);
  }

  createExpenseReportComment = () => {
    const { forms } = this.props;
    const memo = _try(() => forms['Components.forms.expenseReportComment'][this.props.data.id].memo.value);
    if (memo !== '') {
      this.props.createExpenseReportComment({ memo, expenseReportId: this.props.data.id });
    }
  }

  close = () => {
    if (this.props.modal.current) this.props.modal.current.dismiss();
    else this.props.closeModal();
  }

  render() {
    const buttonText = this.state.forUpdate ? 'Update' : 'Create';

    const allInitial = _try(() => this.props.forms['Components.ionic.forms.report'].default._allInitial);
    const allValid = _try(() => this.props.forms['Components.ionic.forms.report'].default._allValid);

    const inProgress = this.props.reportsStatus.updating || this.props.reportsStatus.creating;

    let noExpense = false;
    const expenseIds = _try(() => this.props.forms['Components.ionic.forms.report'].default._values.expenseIds);
    if (!expenseIds || Object.keys(expenseIds).length < 1) {
      noExpense = true;
    }
    const disabled = noExpense;

    let commentIds;
    let comments;
    let noComments = true;

    if (this.state.forUpdate) {
      if (this.props.reportData.commentIds) {
        noComments = false;
        commentIds = Object.keys(this.props.reportData.commentIds);
        comments = commentIds.map(id => _try(() => this.props.expenseReportComments[id], {})).filter(comment => comment._id).sort((a, b) => a._createdAt < b._createdAt ? -1 : 1);
      }
    }

    let status = 'OPEN';
    if (this.props.reportData && this.props.reportData.rejected) {
      status = 'REJECTED';
    } else if (this.props.reportData && !!this.props.reportData.submitted) {
      status = 'SUBMITTED';
    }
    let title = 'NEW REPORT';
    if (this.state.forUpdate) title = 'EDIT REPORT';
    if (this.state.forView) title = 'VIEW REPORT';

    return (
      <IonPage className="components_ionic_modals_report">
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="start">{title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.close}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div className="space-between ion-margin">
            <IonChip>
              <IonAvatar>
                <IonImg src={this.props.photo} />
              </IonAvatar>
              <IonLabel>{this.props.user.name}</IonLabel>
            </IonChip>
            <IonChip color="light" outline>{status}</IonChip>
          </div>

          {(this.state.forUpdate && this.props.reportData && this.props.reportData.rejected) || (this.state.forView && this.props.reportData && !noComments) &&
            <div className="ion-margin rejection-comment">
              <IonToolbar className="ion-margin rejection-bar">
                <IonIcon slot="start" className="rejection-alert" color="danger" icon={alertOutline} />
                <IonTitle>
                  Rejection Comments
                </IonTitle>
                <IonIcon slot="end" className="expand-comments" icon={this.state.commentsOpen ? chevronDownOutline : chevronBackOutline} color="light" onClick={() => { this.setState(prevState => ({ commentsOpen: !prevState.commentsOpen })); }} />
              </IonToolbar>
              <Collapse isOpened={this.state.commentsOpen} className="comment-list">
                {!noComments &&
                  <div className="comment-list-content">
                    {comments.map((comment, index) => comment.memo && comment.memo.length !== 0 && <Components.ionic.reportComment comment={comment} notFirst={index !== 0} />)}
                  </div>
                }
                {!this.state.forView &&
                  <div className="add-comment-footer">
                    <Components.forms.expenseReportComment className="comment-input" formKey={this.props.data.id} hideLabel handleEnterPress={this.createExpenseReportComment} />
                    <div className={`add-comment-button${_try(() => this.props.expenseReportCommentsStatus.creating) ? ' disabled' : ''}`} onClick={this.createExpenseReportComment} >
                      {_try(() => this.props.expenseReportCommentsStatus.creating) ? <IonSpinner name="crescent" color="light" /> : <IonIcon icon={sendSharp} color="light" />}
                    </div>
                    {
                      _try(() => this.props.expenseReportCommentsStatus.creatingError) &&
                      <div className="alert alert-danger" role="alert">
                        {this.props.expenseReportCommentsStatus.creatingError}
                      </div>
                    }
                  </div>
                }
              </Collapse>
            </div>
          }

          <Components.ionic.forms.report initialFormData={this.props.reportData} forView={this.state.forView} />
        </IonContent>
        {!this.state.forView &&
          <IonFooter>
            <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
              {this.state.forUpdate &&
                <IonButton
                  className="ion-text-uppercase delete-report"
                  expand="block"
                  fill="outline"
                  onClick={this.deleteReport}
                  disabled={inProgress}
                >
                  {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light">Delete</IonText>}
                </IonButton>
              }
              <IonButton
                className="ion-text-uppercase create-button"
                expand="block"
                fill="outline"
                onClick={this.state.forUpdate ? this.updateExpenseReport : this.createExpenseReport}
                disabled={inProgress || allInitial || !allValid}
              >
                {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light">{buttonText}</IonText>}
              </IonButton>
              {!disabled &&
                <IonButton
                  className="ion-text-uppercase submit-button"
                  expand="block"
                  fill="outline"
                  onClick={this.submitReport}
                  disabled={inProgress}
                >
                  {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light">Submit</IonText>}
                </IonButton>
              }
            </IonToolbar>
          </IonFooter>
        }
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_report);


