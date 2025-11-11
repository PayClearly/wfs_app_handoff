import React, { Component } from 'react';
import { connect } from 'react-redux';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transfers: Selectors.tableData.csrtransfers(state)[props.achTransfer], 
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_opsNotes extends Component {

  state = {}

  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}
  componentWillUnmount() {}

  onNo() {
    this.props.close();
  }
  
  render() {
    const { transfers } = this.props;
    return (
      <div className="modal-dialog components_modals_opsNotes wide-modal wide-70" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Ops Transfer Notes</h5>
            <button onClick={() => this.onNo()} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.overviews.opsNotes resource={transfers} resourceType="achTransfers" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_opsNotes);
