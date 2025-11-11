import { connect, Component } from 'component';
import { Children, cloneElement } from 'react';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

// Internal Helper Functions ...
function _getData(pathToData, state) {
  const origin = pathToData.split('.')[0];
  if (origin === 'state') {
    const pathInState = pathToData.split('state.')[1];
    return Utils.getNestedProperty(pathInState, state);
  } if (origin === 'Selectors') {
    const selector = _try(() => pathToData.split('Selectors.')[1].split('(state)')[0]);
    const additionalPath = _try(() => pathToData.split('Selectors.')[1].split('(state)')[1].substring(1));
    const selectorResponse = _try(() => Utils.getNestedProperty(selector, Selectors)(state));
    return additionalPath ? _try(() => Utils.getNestedProperty(additionalPath, selectorResponse)) : selectorResponse;
  }

  return null;
}

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  items: _try(() => _getData(props.pathToData, state)),
  filteredAndSortedItems: Selectors.tableItems(
    'Components.forms.components.resourceSelector',
    props.tableKey,
    props.pathToData
  )(state),
});

const mapDispatchToProps = (dispatch) => ({
  openResourceSelectorModal: (data) => {
    dispatch(Store.router.openModal('Components.modals.resourceSelector', data));
  },
});


// eslint-disable-next-line camelcase
class components_forms_components_resourceSelector extends Component {
  openResourceSelectorModal = () => {
    const data = {};
    const {
      field: fieldName, formName, formKey, action,
    } = this.props;

    const toRender = Children.map(this.props.children, (child) => {
      const resourceSelectorColumn = {
        label: 'Select',
        sortable: false,
        dataKey: '',
        cellRenderer: (columnData, rowId) => (
          <Components.forms.components.resourceSelector.tableButtons.selectResource
            formName={formName}
            formKey={formKey}
            fieldName={fieldName}
            action={action}
            id={rowId}
          />
        ),
      };
      return cloneElement(child, { resourceSelector: { resourceSelectorColumn }, doNotExpand: true });
    });

    data.toRender = toRender;
    data.form = {
      formName,
      formKey,
      fieldName,
      action,
    };
    data.resourcesName = this.props.resources;
    return this.props.openResourceSelectorModal(data);
  };

  render() {
    const {
      forms, field: fieldName, formName, formKey, action, items, filteredAndSortedItems,
    } = this.props;
    const { form } = this.props;
    const field = form[this.props.field];
    const { hidden } = this.props;

    if (!field || hidden) { return null; }
    const selectedResources = _try(() => Object.keys(forms[formName][formKey][fieldName].value), []);
    const selectedColumns = [...this.props.columns];
    selectedColumns.unshift({
      label: '',
      dataKey: '',
      cellRenderer: (data, rowId) => (
        <Components.forms.components.resourceSelector.tableButtons.remove
          id={rowId}
          formName={formName}
          formKey={formKey}
          fieldName={fieldName}
          action={action}
        />
      ),
    });

    return (
      <div className="components_forms_components_resourceSelector">
        <div className="card mb-3">
          <Components.tables.components.collapsibleTable
            tableName="Components.forms.components.resourceSelector"
            tableKey={this.props.tableKey}
            initialTableStateOverride={this.props.initialTableStateOverride}
            defaultTableState={this.props.defaultTableState}
            data={{
              items: selectedResources.reduce((acc, key) => { acc[key] = items[key]; return acc; }, {}),
              count: _try(() => selectedResources.length, 0),
            }}
            itemOrder={_try(() => (selectedResources.length && filteredAndSortedItems) || [], [])}
            columns={selectedColumns}
            doNotExpand={!this.props.entity}
            rowRenderer={this.props.entity && ((rowId) => <this.props.entity id={rowId} />)}
            noDataText={`No ${this.props.resources} Selected`}
          />
          <table className="table responsive mb-0">
            <tr
              className="fixedHeight actionRow"
            >
              <td
                className="fixedWidth"
                colSpan={this.props.columns.length}
              >
                <div className="d-flex justify-content-around">
                  <div
                    role="tooltip"
                    style={{ width: '100%' }}
                    className="d-flex justify-content-center action-button first no-select"
                    onClick={this.openResourceSelectorModal}
                  >
                    <i className="mdi mdi-plus-circle text-primary me-2" />
                    <span>{`Add ${this.props.resources}`}</span>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_resourceSelector);
