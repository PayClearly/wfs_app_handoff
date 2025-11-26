import { connect, Component, Fragment } from 'component';
import classNames from 'classnames';
import { Popover, PopoverBody } from 'reactstrap';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class components_tables_components_actionWrapper extends Component {

  state = {
    disabledClickCount: 0,
  };

  render() {
    const {
      actionContent,
      actionIconClass,
      itemId,
      openPopoverId,
      paddingColumnPosition,
      popoverClassName,
      popoverIdentifier,
      toggleOpenPopover,
    } = this.props;

    const uniqueId = `options-${popoverIdentifier}-${itemId}`;

    return (
      <th
        id={uniqueId}
        role="button"
        className={
          classNames(
            'components_tables_components_actionWrapper',
            'fixedWidth',
            'wpx-50',
            'text-center',
            'popover-cell',
            { disabled: !_try(() => actionContent.length) }
          )
        }
        onClick={(e) => {
          e.stopPropagation();
          if (!_try(() => actionContent.length)) {
            return;
          }
          toggleOpenPopover(itemId);
        }}
      >
        <i className={
          (actionIconClass && classNames('mdi', actionIconClass))
          || classNames('mdi', paddingColumnPosition && 'mdi-dots-vertical', !paddingColumnPosition
            && 'mdi-dots-horizontal')
        }
        />
        <Popover
          placement={paddingColumnPosition ? 'right' : 'left'}
          isOpen={openPopoverId === itemId}
          target={uniqueId}
          trigger="legacy"
          toggle={() => { this.props.toggleOpenPopover(itemId); }}
          className={`${popoverClassName} action-popover`}
        >
          <PopoverBody>
            {
              (_try(() => actionContent) || []).map((item, i) => {
                const {
                  title,
                  disabled,
                  onDisabledClick,
                  onDisabledDoubleClick,
                } = item;

                return (
                  <Fragment>
                    {i > 0 && <hr className="my-1" />}
                    <p
                      className={`m-0 action-item px-1${disabled ? ' disabled' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (disabled && onDisabledClick) {
                          if (typeof onDisabledClick === 'function') {
                            onDisabledClick();
                          }
                        }
                        if (disabled && onDisabledDoubleClick) {
                          if (this.state.disabledClickCount) {
                            if (typeof onDisabledDoubleClick === 'function') {
                              onDisabledDoubleClick();
                            }
                          } else {
                            this.setState({ disabledClickCount: 1 });
                            setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
                          }
                        }
                        if (!disabled && item.onClick) {
                          if (typeof item.onClick === 'function') {
                            item.onClick();
                          }
                        }
                      }}
                    >
                      {title}
                    </p>
                  </Fragment>
                );
              })
            }
          </PopoverBody>
        </Popover>
      </th>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_actionWrapper);
