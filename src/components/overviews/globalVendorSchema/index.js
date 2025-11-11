import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    schemas: state.global.schemas.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_globalVendorSchema extends Component {




  renderRow = (customFields) => {
    return Object.values(customFields).map((customField) => {
      return (
        <tr className="collapsableRow">
          <td>{customField.name || ''}</td>
          <td>{customField.fieldType || ''}</td>
          <td>{customField.required ? 'yes' : 'no'}</td>
          <td>{customField.options || ''}</td>
          <td>{customField.length || ''}</td>
        </tr>
      );
    });
  };

  render() {
    const { id, schemas } = this.props;
    const schema = schemas[id] || {};
    const notSetTag = (<i>Not set</i>);
    const name = schema.name || notSetTag;

    return (
      <div className="components_overviews_globalVendorSchema">
        <div className="row">
          <div className="col-md-3 col-xs-6">
            <h3>Schema Name</h3>
            <p className="text-muted ps-3">{name}</p>
          </div>
        </div>
        {
          Object.keys(schema.customFields || {}).length > 0 &&
          <div className="row mb-4">
            <div className="col-12">
              <h3>Custom Fields</h3>
              <div className="table-scroll-container">
                <table className="table responsive">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Options</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.renderRow(schema.customFields)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorSchema);


