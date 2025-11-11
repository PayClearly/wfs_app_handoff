import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.tables, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_components_filterChip extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  removeFilter = (e) => {
    e.preventDefault();
    this.props.removeFilter(this.props.tableName, this.props.tableKey, this.props.filterId);
  }

  editFilter = (e) => {
    e.preventDefault();
    if (typeof this.props.handleEdit === 'function') {
      this.props.handleEdit(this.props.tableName, this.props.tableKey, this.props.filterId);
    } else {
      this.props.removeFilter(this.props.tableName, this.props.tableKey, this.props.filterId);
    }
  }

  renderContent = () => {
    const { filter = {}, filterConfig = {} } = this.props;
    const type = _try(() => filterConfig[filter.key].type);

    const key = _try(() => filterConfig[filter.key].display);
    let comparator;
    let value;
    switch (type) {
      case 'string':
        comparator = filter.comparator;
        value = filter.value;
        break;
      case 'number':
        if (filter.comparator === 'equals') comparator = '=';
        if (filter.comparator === 'greaterThan') comparator = '>';
        if (filter.comparator === 'lessThan') comparator = '<';
        value = filter.value;
        break;
      case 'bool':
        comparator = filter.comparator;
        if (_try(() => filterConfig[filter.key].valueDisplay)) {
          const valueIsTrue = Boolean(filter.value);
          value = valueIsTrue ? _try(() => filterConfig[filter.key].valueDisplay) : `Not ${_try(() => filterConfig[filter.key].valueDisplay)}`;
        } else {
          value = Utils.capitalize(_try(() => filter.value.toString()));
        }
        break;
      case 'option':
        comparator = filter.comparator;
        if (filter.comparator === 'isNot') comparator = 'is not';
        value = _try(() => filterConfig[filter.key].options[filter.value].display);
        break;
      case 'date':
        if (filter.comparator === 'isBefore') comparator = 'is before';
        if (filter.comparator === 'isAfter') comparator = 'is after';
        value = Utils.dates.dateToDay(filter.value, 'dateFormatUS');
        break;
      default:
        comparator = filter.comparator;
        value = filter.value;
        break;
    }

    return <span className="me-1 content">{key}&nbsp;<small>{comparator}</small>&nbsp;{value}</span>;
  }

  renderMultiFilterContent = () => {
    const { filter = {}, filterConfig = {}, filterId } = this.props;
    const type = _try(() => filterConfig[filterId].type);

    let value;
    switch (type) {
      case 'string':
        value = filter.value;
        break;
      case 'number':
        value = filter.value;
        break;
      case 'bool':
        if (_try(() => filterConfig[filterId].valueDisplay)) {
          const valueIsTrue = Boolean(filter.value);
          value = valueIsTrue ? _try(() => filterConfig[filterId].valueDisplay) : `Not ${_try(() => filterConfig[filterId].valueDisplay)}`;
        } else {
          value = Utils.capitalize(_try(() => filter.value.toString()));
        }
        break;
      case 'option':
        value = _try(() => filterConfig[filterId].options[filter.value].display);
        break;
      case 'date':
        value = Utils.dates.dateToDay(filter.value, 'dateFormatUS');
        break;
      default:
        value = filter.value;
        break;
    }

    return (
      <span className="me-1 content multi-filter">{value}</span>
    );
  }

  render() {
    return (
      <div className={`components_tables_components_filterChip ${this.props.className}`}>
        <div className="d-flex justify-content-between align-items-center">
          <div
            className={`content-container d-flex justify-content-between align-items-center ${this.props.includeEdit && 'editable'}`}
            role={this.props.includeEdit && 'button'}
            onClick={(e) => { this.props.includeEdit && this.editFilter(e); }}
          >
            {this.props.multiFilterView && this.renderMultiFilterContent()}
            {!this.props.multiFilterView && this.renderContent()}
            {this.props.includeEdit &&
              <span className="edit-pencil">
                <i className="mdi mdi-pencil" />
              </span>
            }
          </div>
          <div>
            <button
              className="remove-button"
              onClick={this.removeFilter}
            >
              <i className="mdi mdi-close" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_filterChip);


