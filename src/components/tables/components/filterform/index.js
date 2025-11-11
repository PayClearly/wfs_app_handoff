import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

// import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_components_filterform extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { filterBy, onChange, options, className, selected } = this.props;

    return (
      <div className={className}>
        <h6>Filter by {filterBy}</h6>
        <select className="form-control small" onChange={onChange} >
          {options.map((option) => {
            return <option selected={option.value === selected} value={option.value}>Show {option.text}</option>;
          })}
        </select>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_filterform);


