import { connect, Component } from 'component';

// Third Party Imports ...
import { Typeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import classNames from 'classnames';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

class components_forms_components_typeahead extends Component {

  state = {
    inputFocused: false,
    value: '',
  };

  componentDidMount() {
    if (this.props.form && !this.props.allowNew) {
      this._typeahead.instanceRef._updateText(this.props.form._values[this.props.field]);
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.defaultInputValue && nextProps.defaultInputValue === '') { this._typeahead.getInstance().clear(); }

    const { form } = this.props;
    const field = form[this.props.field];

    if (field && field.value !== nextProps.form._values[nextProps.field]) {
      const instance = this._typeahead.instanceRef;
      if (!this.props.allowNew && instance.state.selected.length) {
        instance.clear();
      }

      if (!nextProps.dontupdate) {
        instance._updateText(nextProps.form._values[nextProps.field]);
      } else if (nextProps.form._values[nextProps.field].indexOf(',') > -1) {
        instance.clear();
      }
    }
  }

  onBlur = (value, fieldName) => {
    setTimeout(() => {
      if (this.state.blockBlur === true) {
        return;
      }
      if (value.length) {
        this.props.action('blur', fieldName, value);
        return this.setState({
          inputFocused: true,
        });
      }
      this.props.action('blur', fieldName, value);
      return this.setState({
        inputFocused: false,
      });
    }, 300);
  };

  onFocus = (value, fieldName) => {
    this.props.action('focus', fieldName, value);

    return this.setState({
      inputFocused: true,
    });
  };

  onChange = (options, fieldName) => {
    if (this.props.onTypeAheadChange) {
      this.props.onTypeAheadChange(options, fieldName);
    }
  };

  // TODO renderMenu should probably be passed as a prop from parent component than trying to overload it here....
  renderMenu = (results, menuProps) => {
    if (!results.length) {
      return (
        <Menu {...menuProps}>
          <a
            className={classNames('dropdown-item', this.props.noItemsClicked && 'pointer ps-3 text-center')}
            role="button"
            tabIndex="-1"
            onClick={(e) => {
              this.setState({
                blockBlur: true,
              });
              setTimeout(() => {
                this.setState({
                  blockBlur: false,
                });
              }, 400);
              if (this.props.noItemsClicked) {
                this.props.noItemsClicked(e, this.props.form._values[this.props.field]);
              }
            }}
          >
            {this.props.noItemsText || 'No Matches Found'}
          </a>
        </Menu>
      );
    }

    const menuItems = results.map((result, index) => {
      const labelKey = this.props.labelKey || 'label';
      return (
        <MenuItem option={result} position={index}>
          {result[labelKey] || `${(this.props.addNewLabel && this.props.addNewLabel) || ''}${result}`}
        </MenuItem>
      );
    });

    return (
      <Menu {...menuProps}>
        {menuItems}
        {this.props.alwaysShowNoItemsOption && !(results.length === 1 && (results[0].name === this.state.value))
          && <a
            className={classNames('dropdown-item', this.props.noItemsClicked && 'pointer ps-3 text-center')}
            role="button"
            tabIndex="-1"
            onClick={(e) => {
              this.setState({
                blockBlur: true,
              });
              setTimeout(() => {
                this.setState({
                  blockBlur: false,
                });
              }, 400);
              if (this.props.noItemsClicked) {
                this.props.noItemsClicked(e, this.props.form._values[this.props.field]);
              }
            }}
          >
            {this.props.noItemsText || 'No Matches Found'}
          </a>}
      </Menu>
    );
  };

  renderClearAllButton() {
    return (
      <div className="clear-all">
        <Components.tooltip>
          <i
            className="mdi text-danger mdi-close-circle"
            role="button"
            tabIndex="-1"
            onClick={() => this._typeahead.instanceRef.clear()}
            aria-label="Clear All"
          />
          <span>Clear All</span>
        </Components.tooltip>
      </div>
    );
  }

  render() {
    const { form } = this.props;
    const fieldName = this.props.field;
    const field = form[this.props.field];

    if (!field) { return null; }

    const id = `${form._name}-${form._key}-input-${fieldName}`;
    const selected = this.props.selected && this.props.selected.every((item) => !!item)
      ? this.props.selected
      : '';

    return (
      <div className={`form-group components_forms_components_typeahead ${this.props.hasClearAll && 'pt-1 pe-2'}`}>
        {this.props.hasClearAll && this.renderClearAllButton()}
        <Typeahead
          id={id}
          ref={(ref) => { this._typeahead = ref; }}
          labelKey={this.props.labelKey || 'label'}
          defaultInputValue={this.props.defaultInputValue || ''}
          options={this.props.options}
          selected={selected}
          renderMenu={this.props.renderMenu || this.renderMenu}
          maxResults={this.props.maxResults || 5}
          className={classNames(
            { 'focus expanded': field.focused },
            { expanded: field.value && field.value.length > 0 },
            { 'has-error': (field.error && !this.props.hideError) }
          )}
          onBlur={() => this.onBlur(this.props.form._values[this.props.field], fieldName)}
          onFocus={() => this.onFocus(this.props.form._values[this.props.field], fieldName)}
          onInputChange={(input) => {
            let value = input;
            if (Array.isArray(input) && !input.length) { value = ''; }
            this.props.action('change', fieldName, value);
            this.setState({ value });
          }}
          onMenuHide={() => { this.onBlur(this.props.form._values[this.props.field], fieldName); }}
          disabled={this.props.disabled || false}
          placeholder={this.props.placeholder || false}
          allowNew={this.props.allowNew || false}
          multiple={this.props.multiple || false}
          minLength={this.props.minLength || 0}
          onChange={(options) => this.onChange(options, fieldName)}
          required
          highlightOnlyResult={this.props.highlightOnlyResult || false}
          filterBy={this.props.filterBy}
        />
        <span className="bar" />
        {this.props.label && <label htmlFor={id} className={classNames({ required: this.props.required, isFloating: Boolean(field.value), typeaheadFloat: this.props.floatLabel })}> {this.props.label}</label>}
        <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
        <small className="fieldOverride text-muted">{(this.props.overRidden) ? `This will be overridden with: ${this.props.overRidden}` : '\u00A0'}</small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_typeahead);
