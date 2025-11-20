import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';



const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_overviews_vendorRemittanceFields extends Component {





  render() {
    if (!this.props) { return <div />; }

    const fields = this.props.fields || {};
    const notSetTag = (<i>Not set</i>);
    return (
      <div className="row">
        {fields && Object.values(fields).map((field) => (
          <div style={{ height: 'fit-content' }}>
            <strong>{field.name}</strong>
            <br />
            <p
              className="text-muted text-wrap"
              style={{ overflow: 'hidden', overflowY: 'auto', height: this.props.heightOverride || '15vh' }}
            >
              {this.props.initialData[field.key] || notSetTag}
            </p>
          </div>
        ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_vendorRemittanceFields);


