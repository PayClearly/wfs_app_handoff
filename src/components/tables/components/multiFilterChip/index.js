import { connect, Component } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

const EDITABLE_TYPES = {
  string: true,
  number: true,
  bool: false,
  date: false,
  options: false,
};

// eslint-disable-next-line camelcase
class components_tables_components_multiFilterChip extends Component {
  render() {
    const {
      filter, filterId, filterConfig, conditionDefinition,
    } = this.props;

    return (
      <div className={`components_tables_components_multiFilterChip ${filter.type}`}>
        <span
          className="set-filter-label"
        >
          {`${filterConfig[filterId].display}${conditionDefinition.displayConditions
            ? ` - ${conditionDefinition.options[filter.comparator].display}`
            : ''}`}
        </span>
        <Components.tables.components.filterChip
          className="bg-primary w-100 set-filter-chip"
          tableName={this.props.tableName}
          tableKey={this.props.tableKey}
          filterId={filterId}
          filter={filter}
          filterConfig={filterConfig}
          multiFilterView
          includeEdit={EDITABLE_TYPES[filter.type]}
          handleEdit={this.props.handleEdit}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_multiFilterChip);
