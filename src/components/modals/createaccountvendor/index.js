import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_createaccountvendor extends Component {




  render() {
    return (
      <div className="modal-dialog wide-modal wide-70" role="document">
        <div className="modal-content components_modals_createaccountvendor">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Create Vendor</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.creators.accountvendor
              forModal
              close={this.props.close}
              initialData={{ name: this.props.text }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_createaccountvendor);


