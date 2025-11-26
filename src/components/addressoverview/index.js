import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_addressoverview extends Component {

  render() {
    if (!this.props) return <div />;

    const address = this.props.address || {};
    return (
      <div className="row">
        <div className="col-12 mb-0">
          <p className="mb-0">{address.streetAddress || ''} {address.unit && `unit ${address.unit}`}</p>
        </div>
        <div className="col-12">
          <p>{address.city || ''}, {address.state || ''} {address.zipCode || ''}</p>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_addressoverview);

