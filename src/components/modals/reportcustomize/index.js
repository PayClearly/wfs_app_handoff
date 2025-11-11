import { connect, Component } from 'component';

// Third Party Imports ...
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import resolvePath from 'object-resolve-path';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import {
  cannedFields,
  paymentPipelinePreferencesFields,
} from 'components/forms/components/customreportfield/reportFields';
import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  paymentStatuses: state.account.paymentStatuses.data.items,
  transactionDetails: state.transactionDetails.data.items,
  paymentCardCustomFields: state.account.paymentCardCustomFields.data.item,
  paymentCustomFields: state.account.paymentCustomFields.data.item,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  fetchTransactions: (startDate, endDate, fields, customFields) => dispatch(
    Store.transactionDetails.fetch(startDate, endDate, fields, customFields)
  ),
});

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: 8,
  margin: '0 0 8px 0',
  'border-radius': '.25rem',
  background: 'white',
  border: isDragging ? '1px solid #54667a' : 'none',
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? '#05AEDD' : '#dee2e6',
  padding: 8,
  'border-radius': '.25rem',
  height: '100%',
});

// eslint-disable-next-line camelcase
class components_modals_reportcustomize extends Component {

  state = {
    selected: this.props.selected,
    includeLineItems: false,
  };

  componentDidMount() {
    const adaptedCannedFields = cannedFields.filter(
      (option) => !this.state.selected.find((column) => column.dataField === option.name)
    )
      .map(({ name, type, isCustomField }) => ({
        dataField: name, text: name, type, isCustomField,
      }));

    const paymentFields = this.props.transactionDetails.reduce((acc, curr) => {
      const paymentStatus = this.props.paymentStatuses[curr['Payment ID'] || ''] || {};
      if (resolvePath(paymentStatus, 'created.paymentFields')) {
        Object.keys(paymentStatus.created.paymentFields).forEach((customField) => {
          if (!acc.map((f) => f.dataField).includes(customField)) {
            acc.push({
              dataField: customField,
              text: customField,
              type: 'Char',
              isCustomField: true,
              customFieldType: 'payment',
            });
          }
        });
      }
      return acc;
    }, []);

    const paymentCardCustomFields = Object.keys(this.props.paymentCardCustomFields).map((field) => ({
      dataField: field,
      text: field,
      type: 'Char',
      isCustomField: true,
      customFieldType: 'paymentCard',
    }));

    const virtualCardCustomFields = Object.keys(this.props.paymentCustomFields).map((field) => ({
      dataField: field,
      text: field,
      type: 'Char',
      isCustomField: true,
      customFieldType: 'virtualCard',
    }));

    let available = adaptedCannedFields
      .concat(paymentFields)
      .concat(paymentCardCustomFields)
      .concat(virtualCardCustomFields);

    const preferences = this.props.paymentPipelinePreferences || {};

    if (preferences.requireConfirmationNumber) {
      available = available.concat(paymentPipelinePreferencesFields.requireConfirmationNumber.fields);
    }

    if (preferences.showInterchangeDataOnTransactionsReport) {
      available = available.concat(paymentPipelinePreferencesFields.showInterchangeDataOnTransactionsReport.fields);
    }

    this.setState({
      available: this.removeDuplicateFields(available),
      filteredAvailable: this.removeDuplicateFields(available),
    });
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const sourceClone = Array.from(this.state[source.droppableId]);

    // dragging something from available to "nowhere"
    if (source.droppableId === 'available' && (!destination || destination.droppableId === 'available')) { return; }

    // dragging something from selected to "nowhere"
    if (source.droppableId === 'selected' && (!destination || destination.droppableId === 'available')) {
      const [removed] = sourceClone.splice(source.index, 1);
      const destClone = Array.from(this.state.available);
      destClone.push(removed);
      return this.setState({
        available: this.removeDuplicateFields(destClone),
        selected: sourceClone,
      });
    }

    // dragging something from selected to selected column
    if (source.droppableId === 'selected' && destination.droppableId === 'selected') {
      const [removed] = sourceClone.splice(source.index, 1);
      sourceClone.splice(destination.index, 0, removed);
      return this.setState({
        [source.droppableId]: sourceClone,
      });
    }

    // dragging something from available to selected column
    const availableIndex = this.state.available
      .findIndex((field) => field.dataField === this.state.filteredAvailable[source.index].dataField);
    const [removed] = sourceClone.splice(availableIndex, 1);
    const destClone = Array.from(this.state[destination.droppableId]);
    destClone.splice(destination.index, 0, removed);

    const filteredClone = Array.from(this.state.filteredAvailable);
    filteredClone.splice(source.index, 1);

    return this.setState({
      available: this.removeDuplicateFields(sourceClone),
      selected: destClone,
      filteredAvailable: this.removeDuplicateFields(filteredClone),
    });
  };

  onSave = (e) => {
    e.preventDefault();
    // const selectedFields = Object.values(this.state.selected).filter(selected => !this.state.customFields.map(f => f.dataField).includes(selected.dataField));
    // const selectedCustomFields = Object.values(this.state.selected).filter(selected => this.state.customFields.map(f => f.dataField).includes(selected.dataField));
    // this.props.fetchTransactions(new Date(startDate).toISOString(), new Date(endDate).toISOString(), selectedFields, selectedCustomFields);
    // this.props.onSave(selectedFields, selectedCustomFields);
    const { forms } = this.props;
    const { startDate, endDate } = forms['Components.forms.reportsearch'].default._values;
    this.props.fetchTransactions(new Date(startDate).toISOString(), new Date(endDate).toISOString(), this.state.selected);
    this.props.onSave(this.state.selected, this.state.includeLineItems);
    this.props.close();
  };

  setIncludeLineItems = () => {
    this.setState({ includeLineItems: !this.state.includeLineItems });
  };

  reset = () => {
    const initialFieldNames = [
      'Process Date',
      'Card CTS',
      'Card BIN Type',
      'Card Last 4',
      'Cleared Amount',
      'Clearing Reference Number',
      'Customer Billed Amount',
    ];
    const fieldDict = cannedFields.reduce(((acc, field) => {
      acc[field.name] = field;
      return acc;
    }), {});

    const selected = initialFieldNames.map((name) => ({
      dataField: name,
      type: fieldDict[name].type,
      text: name,
    }));

    const available = cannedFields
      .filter((option) => !selected.find((column) => column.dataField === option.name))
      .map(({ name, type }) => ({ dataField: name, text: name, type }));
    this.setState({
      available: this.removeDuplicateFields(available),
      filteredAvailable: this.removeDuplicateFields(available),
      selected,
    });
  };

  filter = (e) => {
    const { value } = e.target;
    if (!value) { this.setState({ filteredAvailable: this.state.available }); }

    this.setState({
      filteredAvailable: this.state.available
        .filter((field) => field.dataField.toLowerCase().includes(value.toLowerCase())),
      filterText: value,
    });
  };

  handleDelete = (index) => {
    const selected = [...this.state.selected];
    const [removed] = selected.splice(index, 1);
    const available = [...this.state.available];
    available.push(removed);

    const filteredAvailable = [...this.state.filteredAvailable];
    filteredAvailable.push(removed);

    return this.setState({
      available: this.removeDuplicateFields(available),
      selected,
      filteredAvailable: this.removeDuplicateFields(filteredAvailable),
    });
  };

  handleAddField = (index) => {
    const available = [...this.state.available];
    const availableIndex = available
      .findIndex((field) => field.dataField === this.state.filteredAvailable[index].dataField);
    const [removed] = available.splice(availableIndex, 1);
    const selected = [...this.state.selected];
    selected.push(removed);

    const filteredAvailable = [...this.state.filteredAvailable];
    filteredAvailable.splice(index, 1);

    return this.setState({
      available: this.removeDuplicateFields(available),
      selected,
      filteredAvailable: this.removeDuplicateFields(filteredAvailable),
    });
  };

  selectAll = () => this.setState((prev) => {
    const available = [...prev.available];
    const selected = [...prev.selected];

    prev.filteredAvailable.forEach((field) => {
      const index = available.findIndex((f) => f.dataField === field.dataField);
      const [removed] = available.splice(index, 1);
      selected.push(removed);
    });

    return { available, selected, filteredAvailable: [] };
  });

  deselectAll = () => this.setState((prev) => ({
    available: [...prev.selected, ...prev.available],
    selected: [],
    filteredAvailable: [...prev.selected, ...prev.filteredAvailable],
  }));

  handleMove = (index, direction) => {
    const selected = [...this.state.selected];
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === selected.length - 1)) {
      return;
    }
    if (direction === 'up') {
      [selected[index], selected[index - 1]] = [selected[index - 1], selected[index]];
    }
    if (direction === 'down') {
      [selected[index], selected[index + 1]] = [selected[index + 1], selected[index]];
    }
    return this.setState({ selected });
  };

  removeDuplicateFields(fieldsArr) {
    if (!Array.isArray(fieldsArr)) {
      return [];
    }
    const uniques = {};
    const deduped = fieldsArr.reduce((acc, curr) => {
      if (!uniques[curr.dataField]) {
        uniques[curr.dataField] = true;
        acc.push(curr);
      }
      return acc;
    }, []);
    return deduped;
  }

  render() {
    const { close } = this.props;
    const { available, selected, filteredAvailable } = this.state;

    if (!available) {
      return null;
    }

    return (
      <div style={{ margin: '1.74rem' }} role="document">
        <div className="modal-content components_modals_reportcustomize">
          <div className="modal-header">
            <h2
              className="modal-title pl-4"
              style={{ 'font-weight': '100', 'font-color': '#05AEDD' }}
              id="reportschedule"
            >
              <i className={'mdi mdi-cog'} style={{ 'font-size': '30px', color: '#54667a' }} />Settings
            </h2>
            <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body px-5" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className={'row'}>
              <div className={'col'}>
                <p>
                  Customize the table by dragging / dropping items from the <b>available</b> column to
                  the <b>selected</b> column; You can also select multiple items by <b>ctrl</b> clicking.
                  Table header names can be changed by <b>clicking</b> an item&apos;s field name within
                  the selected column.
                </p>
              </div>
            </div>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <div className={'row'}>
                <div className={'col-6'}>
                  <h2>Available Fields</h2>
                  <p className="card-text">
                    Available database fields with detailed descriptions that can be queried and
                    included in the final transaction report.
                  </p>
                </div>
                <div className={'col-6'}>
                  <h2>Selected Fields</h2>
                  <p className="card-text">Fields that will be queried and included in the final transaction report.</p>
                </div>
              </div>
              <div className={'row pt-3'}>
                <div className={'col-6'}>
                  <div className="row h-100 px-3 justify-content-between">
                    <div className="w-75 h-50">
                      <div className="floating-labels pb-2 pl-0 w-75">
                        <input
                          type={'text'}
                          id={'search-available-fields'}
                          className="input-sm form-control"
                          onChange={this.filter}
                        />
                        <span className="bar" />
                        <label htmlFor={'search-available-fields'}>
                          Search Available Fields
                        </label>
                      </div>
                    </div>
                    <div className="w-25 pl-2 pb-2 d-flex justify-content-center content-container align-items-center">
                      <Components.button
                        buttonText="Select All"
                        onClick={this.selectAll}
                        className="btn btn-primary w-100"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row h-100 px-3 justify-content-between">
                    <div className="w-75 h-50">
                      <div onClick={this.setIncludeLineItems}>
                        <input
                          type={'checkbox'}
                          id={'line-items'}
                          className="input-sm me-1"
                          checked={this.state.includeLineItems}
                        />
                        <label htmlFor={'line-items'}>
                          Include Line Items
                          <Components.tooltip className="d-inline">
                            <i className="mdi mdi-help-circle-outline" />
                            <div>
                              This will include columns to accomodate as many line items as your payments have. Note
                              that this feature can be cumbersome with many line items, and PDF export format is
                              not recommended.
                            </div>
                          </Components.tooltip>
                        </label>
                      </div>
                    </div>
                    <div className="w-25 pl-2 pb-2 d-flex justify-content-center content-container align-items-center">
                      <Components.button
                        buttonText="Deselect All"
                        onClick={this.deselectAll}
                        className="btn btn-primary w-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col-6'}>
                  <Droppable droppableId="available">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                      >
                        {filteredAvailable.map((column, index) => (
                          <Draggable
                            key={`${column.dataField.replace(/\s/g, '')}${column.isCustomField}${column.customFieldType}`}
                            draggableId={column.dataField.replace(/\s/g, '')}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                              >
                                <Components.forms.components.customreportfield
                                  formKey={column.dataField}
                                  fieldName={column.text}
                                  index={index}
                                  handleAddField={this.handleAddField}
                                  disabled
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                <div className={'col-6'}>
                  <Droppable droppableId="selected">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                      >
                        {selected.map((column, index, array) => (
                          <Draggable
                            key={`${column.dataField.replace(/\s/g, '')}${column.isCustomField}${column.customFieldType}`}
                            draggableId={column.dataField.replace(/\s/g, '')}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                              >
                                <Components.forms.components.customreportfield
                                  formKey={column.dataField}
                                  fieldName={column.text}
                                  handleDelete={this.handleDelete}
                                  handleMove={this.handleMove}
                                  index={index}
                                  isLast={index === array.length - 1}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={this.reset}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={close}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-dismiss="modal"
              onClick={(e) => this.onSave(e, this.state)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_reportcustomize);
