import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    accountId: state.account.data.id,
    orgId: state.organization.data.id,
    customReportFields: state.forms['Components.forms.customreportfields'],
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_customreportfields extends Component {
  state = {
    customFields: {},
  };

  componentDidMount() {
    const { customFields = {} } = this.props;
    const formKey = this.props.formKey || 'default';
    this.setState({
      customFields: Object.values(customFields)
        .reduce((acc, field) => {
          acc[`${formKey}_${field.dataField.replace(/\s/g, '_')}`] = field;
          return acc;
        }, {}),
      formKey,
    });
  }

  handleAddCustomField = () => {
    const customFields = JSON.parse(JSON.stringify(this.state.customFields));
    const now = Date.now();
    customFields[now] = { _id: now };
    this.setState({ customFields });
  };

  renderCustomFields = () => {
    const { customFields } = this.state;
    return Object.keys(customFields).map((key) => {
      const { dataField, text } = customFields[key];
      return (
        <Components.forms.components.customreportfield
          formKey={key}
          fieldName={dataField}
          customName={text}
        />
      );
    });
  };

  render() {

    return (
      <div className="card card-body components_forms_customreportfields mt-5">
        <table className="table">
          <thead>
            <tr className="row px-3">
              <th scope="col" className="col-md-3">Name</th>
              <th scope="col" className="col-md-2">Type</th>
              <th scope="col" className="col-md-2">Length</th>
              <th scope="col" className="col-md-2">Description</th>
              <th scope="col" className="col-md-2">Custom Name</th>
              <th className="col-md-1" />
            </tr>
          </thead>
          <tbody>
            {this.renderCustomFields()}
          </tbody>
        </table>
        <Components.button
          disabled={Object.keys(this.props.customReportFields || {}).length > 20}
          onClick={this.handleAddCustomField}
          buttonText="Add Custom Field"
          className="btn btn-outline-primary w-100 mb-4"
          icon="pe-1 mdi mdi-plus-circle"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_customreportfields);

