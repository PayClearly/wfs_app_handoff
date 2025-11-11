import { connect, Component } from 'component';
import { Children, cloneElement } from 'react';
import { Popover, PopoverBody } from 'reactstrap';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});


// eslint-disable-next-line camelcase
class components_tables_components_updateableTable extends Component {

  state = {
    currentlyInScope: {},
    editedItems: {},
    editingItems: false,
    showPopover: false,
  };

  componentWillReceiveProps(nextProps) {
    // placeholder until i can find a better way of un setting what items are selected
    const data = _try(() => Children.only(this.props.children).props.data.items);
    const nextData = _try(() => Children.only(nextProps.children).props.data.items);
    const mapToActiveStatus = (tableData) => Object.values(tableData).filter((item) => item.status !== 'active');
    if (mapToActiveStatus(data).length !== mapToActiveStatus(nextData).length) {
      this.setState({ editedItems: {} });
    }
  }

  /* a function that gets passed to the collapseable table so I can keep track of what items
  are currently rendered in the table and need to be checked */
  setItemsInScope = (ids) => {
    if (JSON.stringify(this.state.currentlyInScope) !== JSON.stringify(ids)) {
      this.setState({ currentlyInScope: ids });
    }
  };

  _toggleAllEditedItems = (e) => {
    let items;
    if (e.currentTarget.checked === true) {
      items = Object.keys(this.state.currentlyInScope || {})
        .reduce((acc, cur) => {
          acc[cur] = true;
          return acc;
        }, {});
    } else {
      items = {};
    }
    this.setState({ editedItems: items });
  };

  _toggleSingleEditedItem = (e) => {
    const { id } = e.currentTarget;

    const items = { ...this.state.editedItems };
    if (items[id]) { delete items[id]; } else { items[id] = true; }
    this.setState({ editedItems: items });
  };

  _toggleEditingItems = () => {
    this.setState((state) => ({
      editingItems: !state.editingItems,
      editedItems: {},
    }));
  };

  render() {
    const { updateActions } = this.props;
    let { columns } = this.props;

    if (this.state.editingItems) {
      columns = [
        {
          label: () => (
            <>
              <input
                style={{ margin: '.8rem' }}
                type="checkbox"
                checked={_try(() => Object.keys(this.state.editedItems || {}).length
                  && JSON.stringify(this.state.currentlyInScope) === JSON.stringify(this.state.editedItems))}
                onClick={this._toggleAllEditedItems}
              />
              <i
                id={'updateableTable-popover-actions'}
                className={'mdi mdi-dots-vertical'}
                role={'tooltip'}
                onClick={() => { this.setState((state) => ({ showPopover: !state.showPopover })); }}
              />
              <Popover
                placement={'right'}
                isOpen={this.state.showPopover}
                target={'updateableTable-popover-actions'}
                toggle={() => { this.setState((state) => ({ showPopover: !state.showPopover })); }}
                trigger="legacy"
                className="action-popover"
              >
                <PopoverBody>
                  {
                    (_try(() => updateActions) || []).map((item, i) => {
                      const {
                        title,
                      } = item;
                      const disabled = !Object.keys(this.state.editedItems || {}).length;

                      return (
                        <>
                          {i > 0 && <hr className="my-1" />}
                          <p
                            className={'m-0 action-item px-1'}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!disabled && item.onClick) {
                                if (typeof item.onClick === 'function') {
                                  item.onClick(Object.keys(this.state.editedItems));
                                }
                                this.setState({ showPopover: false });
                              }
                            }}
                          >
                            {title}
                          </p>
                        </>
                      );
                    })
                  }
                </PopoverBody>
              </Popover>
            </>
          ),
          dataKey: 'id',
          cellRenderer: (data, rowId) => (
            <input
              style={{ margin: '.8rem' }}
              type="checkbox"
              id={rowId}
              checked={_try(() => this.state.editedItems[rowId])}
              onClick={this._toggleSingleEditedItem}
            />
          ),
        },
        ...columns,
      ];
    }
    return (
      <div className="components_tables_components_updateableTable">
        <Components.button
          buttonText={`${this.state.editingItems ? 'Cancel Update' : this.props.updateLabel || 'Update Items'}`}
          className={`mt-3 mt-md-0 btn btn-${this.state.editingItems ? 'secondary' : 'primary'}`}
          icon={'mdi mdi-edit'}
          onClick={this._toggleEditingItems}
        />
        {cloneElement(this.props.children, {
          columns,
          doNotExpand: this.state.editingItems,
          updateActive: this.state.editingItems,
          setItemScopeForUpdate: this.setItemsInScope,
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_updateableTable);
