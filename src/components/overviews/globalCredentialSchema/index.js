import { connect, Component, bindActionCreators, Fragment } from 'component';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    credentialSchemas: state.global.credentialSchemas.data.items,
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_overviews_globalCredentialSchema extends Component {




  renderRow = (credentialFields) => {
    const { standardCredentialFields } = this.props;
    return Object.values(credentialFields).map((credentialField) => {
      return (
        <tr className="collapsableRow">
          <td>{standardCredentialFields[credentialField.key].key || ''}</td>
          <td>{standardCredentialFields[credentialField.key].name || ''}</td>
          {/* <td>{credentialField.fieldType || ''}</td> */}
          <td>{credentialField.required ? 'Yes' : 'No'}</td>
          {/* <td>{credentialField.options || ''}</td> */}
          {/* <td>{credentialField.length || ''}</td> */}
        </tr>
      );
    });
  };

  render() {
    const { id, credentialSchemas } = this.props;
    const schema = credentialSchemas[id] || {};
    const notSetTag = (<i>Not set</i>);
    const name = schema.name || notSetTag;

    return (
      <div className="components_overviews_globalCredentialSchema">
        <div className="row">
          <div className="col-md-3 col-xs-6">
            <h3>Schema Name</h3>
            <p className="text-muted ps-3">{name}</p>
          </div>
        </div>
        {
          Object.keys(schema.fields || {}).length > 0 &&
          <div className="row mb-4">
            <div className="col-12">
              <h3>Fields</h3>
              <div className="table-scroll-container">
                <table className="table responsive">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Name</th>
                      {/* <th>Type</th> */}
                      <th>Required</th>
                      {/* <th>Options</th> */}
                      {/* <th>Length</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {this.renderRow(schema.fields)}
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_globalCredentialSchema);


