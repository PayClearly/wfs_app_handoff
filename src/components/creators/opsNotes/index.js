import { connect, Component } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    status: state.account.opsNotes.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createOpsNotes: (data) => {
      dispatch(Store.account.createOpsNotes({
        resource: props.resourceType,
        resourceId: props.resourceId,
      }, data));
    },
    resetForm: (name, key) => {
      dispatch(Store.forms.reset(name, key, {
        message: '',
        type: 'general',
      }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_creators_opsNotes extends Component {

  state = {
    formKey: 'createOpsNote',
    createFormActive: true,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.props.resetForm('Components.forms.opsNotes', this.state.formKey, Object.keys(this.props.forms['Components.forms.opsNotes'][this.state.formKey]._values).reduce((acc, cur) => { acc[cur] = undefined; return acc; }, {}));
    // for modal only
    if (this.props.close && typeof this.props.close === 'function') this.props.close();
  }

  handleSubmit = () => {
    const values = this.props.forms['Components.forms.opsNotes'][this.state.formKey]._values;
    this.props.createOpsNotes(values);
  }

  render() {
    const { status, resourceType } = this.props;
    const error = status.creatingError;
    const form = _try(() => this.props.forms['Components.forms.opsNotes'][this.state.formKey], {});

    return (
      <Components.creators.creatorwrapper
        canCreate
        createFormActive={this.state.createFormActive}
        status={status}
        onCreateNotification="Note successfully created!"
        createDisabled={!form._allValid || form._allInitial || status.creating}
        // clearStatusErrors={this.props.clearStatusErrors}
        onCreate={this.onCreate}
      >
        <div style={{ display: 'flex' }}>
          <Components.forms.opsNotes
            resourceType={resourceType}
            formKey={this.state.formKey}
            blurAll={this.props.blurAll}
          />
          <div>
            <Components.button
              updating={status.creating}
              buttonText="Send"
              onClick={this.handleSubmit}
              ariaLabel="Add note"
              className="btn btn-primary btn-small"
            />
          </div>
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
        </div>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_creators_opsNotes);


