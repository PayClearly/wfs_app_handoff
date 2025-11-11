import { connect, Component } from 'component';
import Store from 'store';
import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  deleteStatus: state.users.status,
});

const mapDispatchToProps = (dispatch) => ({
  removeRoles: (id) => {
    dispatch(Store.users.deactivateUser(id));
  },
});

// eslint-disable-next-line camelcase
class components_modals_removeroles extends Component {

  state = {
    rolesRemoved: false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.deleteStatus.deleting && !nextProps.deleteStatus.deleting) {
      this.rolesUpdated();
    }
  }

  onYes() {
    this.props.removeRoles(this.props.id);
  }

  onNo() {
    this.props.close();
  }

  rolesUpdated() {
    this.setState({
      rolesRemoved: true,
    });
    setTimeout(this.props.close, 2000);
  }

  render() {
    return (
      <div className="modal-dialog components_modals_removeroles" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Remove Roles</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4">
                <h3> Are you sure you want to do this? </h3>
                <p>You are about to remove all roles that you can from {this.props.email}.</p>
                <br />

                {this.state.rolesRemoved && (
                  <div className="alert alert-primary" role="alert">
                    All roles have been remove from {`${this.props.email}`}
                  </div>
                )}

                <div className="row float-end mt-4 mb-4">
                  <button
                    onClick={() => { this.onYes(); }}
                    className="btn btn-danger me-3"
                    type="button"
                    aria-label="deactivate user button"
                    disabled={false}
                  >Remove Roles
                  </button>
                  <button
                    onClick={() => { this.onNo(); }}
                    className="btn btn-secondary me-4"
                    type="button"
                    aria-label="reset password button"
                    disabled={false}
                  >{'Don\'t remove roles'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_removeroles);
