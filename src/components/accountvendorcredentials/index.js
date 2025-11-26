import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_accountvendorcredentials extends Component {

  renderFields = () => {
    return Object.values((this.props.credentialSchema && this.props.credentialSchema.fields) || {})
      .map((field) => {
        return this.renderField(field);
      });
  }

  renderField = (field) => {
    const empty = '-';
    return (
      <div className="col-md-4 col-xs-6">
        <strong>{_try(() => this.props.standardCredentialFields[field.key].name, field.key)}</strong>
        <br />
        {this.props.actual[field.key] &&
          <p className="text-muted">
            {this.props.actual[field.key]}
          </p>
        }
        {!this.props.actual[field.key] && field.required &&
          <p className="text-muted">
            <i className="mdi mdi-alert-circle-outline text-danger" />
          </p>
        }
        {!this.props.actual[field.key] && !field.required &&
          <p className="text-muted">
            {empty}
          </p>
        }
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        <h4 className="mb-3">{this.props.credentialSchema.name}</h4>
        <div className="row mt-3">
          {this.renderFields()}
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_accountvendorcredentials);

