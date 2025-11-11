import { connect, Component } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
});

// eslint-disable-next-line camelcase
class components_entities_entitywrapper extends Component {
  state = {
    editing: false,
  };

  componentWillReceiveProps(nextProps = {}) {
    if ((this.props.updating && this.state.editing) && (!nextProps.updating && !nextProps.error)) {
      if (typeof this.props.onUpdate === 'function') {
        this.props.onUpdate();
      }

      this.setState({
        editing: false,
      });
    }

    if ((this.props.orgId && this.props.orgId !== nextProps.orgId)
      || (this.props.accountId && (this.props.accountId !== nextProps.accountId))) {
      this.setState({
        editing: false,
      });
    }
  }

  componentWillUnmount() {
    if (typeof this.props.clearStatusErrors === 'function' && this.props.error) {
      this.props.clearStatusErrors();
    }

    if (typeof this.props.onUnmount !== 'function') { return; }
    this.props.onUnmount();
  }

  _handleEditBtnClick = () => {
    if (this.props.onEditClick && (typeof this.props.onEditClick === 'function')) {
      this.props.onEditClick();
    }
    this.setState({ editing: true });
  };

  _handleDeleteClick = () => {
    this.props.openAreYouSureModal({
      title: `Delete ${Utils.capitalize(_try(() => this.props.includeDelete.item))}`,
      // eslint-disable-next-line max-len
      content: `You are about to delete this ${_try(() => this.props.includeDelete.item)}, this action will remove this item from your records.`,
      noText: 'No',
      yesText: 'Yes',
      checkForSuccess: _try(() => this.props.includeDelete.checkForSuccess),
      onYes: _try(() => this.props.includeDelete.onYes),
    });
  };

  _handleCancelBtnClick = () => {
    this.setState({ editing: false });
    if (typeof this.props.clearStatusErrors === 'function' && this.props.error) {
      this.props.clearStatusErrors();
    }

    if (typeof this.props.onCancel !== 'function') { return; }
    this.props.onCancel();
  };

  _handleSubmit = () => {
    if (typeof this.props.onSubmit !== 'function') { return; }

    this.props.onSubmit();
  };

  _handleOnDisabledUpdateClick = () => {
    if (typeof this.props.onDisabledClick !== 'function') { return; }

    this.props.onDisabledClick();
  };

  _handleOnDisabledEditClick = () => {
    if (typeof this.props.onDisabledEditClick !== 'function') { return; }

    this.props.onDisabledEditClick();
  };

  render() {
    if (!this.props.canRead) { return null; }
    const { isReadyForUpdate = true } = this.props;

    const overviewComponent = this.props.children.length === 2
      ? (
        <>
          {this.props.children[0]}
          {this.props.canUpdate && isReadyForUpdate && (
            <div className="row mt-3">
              <div className="col-md-12">
                <Components.button
                  onClick={this._handleEditBtnClick}
                  onDisabledClick={this._handleOnDisabledEditClick}
                  className={classNames('btn btn-primary', this.props.editButtonClasses)}
                  disabled={this.props.editDisabled}
                  buttonText={this.props.editBtnText || 'Edit'}
                />
                {this.props.includeDelete
                  && <Components.button
                    onClick={this._handleDeleteClick}
                    // onDisabledClick={this._handleOnDisabledDeleteClick}
                    className={classNames('btn btn-outline-primary ms-2', this.props.deleteButtonClasses)}
                    disabled={this.props.editDisabled}
                    buttonText={this.props.deleteBtnText || 'Delete'}
                  />}
                {this.props.additionalButtons}
              </div>
            </div>
          )}
        </>
      ) : <div>Incorrect number of children (expecting 2 child components)</div>;

    const formComponent = this.props.children.length === 2
      ? this.props.canUpdate && (
        <>
          {this.props.children[1]}
          {this.props.error && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {this.props.error}
            </div>
          )}
          <Components.button
            onClick={this._handleSubmit}
            updating={this.props.updating}
            disabled={this.props.updateDisabled}
            onDisabledClick={this._handleOnDisabledUpdateClick}
            buttonText={this.props.updateButtonText || 'Update'}
            className={classNames('btn btn-primary', this.props.optionalFormButtonClasses)}
          />
          <Components.button
            onClick={this._handleCancelBtnClick}
            className={classNames('btn btn-secondary ms-2', this.props.optionalFormButtonClasses)}
            buttonText="Cancel"
          />
        </>
      ) : <div>Incorrect number of children (expecting 2 child components)</div>;

    return (
      <div className={this.props.wrapperClasses || ''}>
        {!this.state.editing ? overviewComponent : formComponent}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_entitywrapper);
