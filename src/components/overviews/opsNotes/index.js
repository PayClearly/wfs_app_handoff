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

class components_overviews_opsNotes extends Component {
  state = {
    showAll: false,
  }

  render() {

    const { resource, resourceType } = this.props;

    let resourceId;
    if (resourceType === 'paymentStatuses') resourceId = resource._oldId || resource._id;
    if (resourceType === 'achTransfers') resourceId = resource.id;

    return (
      <Fragment>
        <hr className="m-0" />
        <h2 className="m-0 py-3 d-inline-block">Notes</h2>
        <div className="components_overviews_opsNotes">
          <Components.opsNotesList notes={resource.opsNotes} showAll={this.state.showAll} />
          <hr className="mt-2" />
          <Components.button
            className="btn btn-outline-primary mb-2 btn-sm"
            onClick={() => this.setState((prevState) => {
              return {
                showAll: !prevState.showAll,
              };
            })}
            buttonText={this.state.showAll ? 'Show Less Notes' : 'Show All Notes'}
          />
          <div className="creatorContainer">
            <Components.creators.opsNotes {...{ resourceType, resourceId }} />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_opsNotes);


