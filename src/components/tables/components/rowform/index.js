import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_components_rowform extends Component {




  render() {
    const { onChange, options, className, selected } = this.props;
    if (!onChange || options.length < 1) return null;
    return (
      <div className={className}>
        <h6>Rows to Display</h6>
        <select className="form-control small" defaultValue={selected} onChange={onChange}>
          {options.map((rowQty) => {
            return <option selected={rowQty === parseInt(selected, 10)} value={rowQty}>{rowQty}</option>;
          })}
        </select>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_rowform);


