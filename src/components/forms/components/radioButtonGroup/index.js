import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_components_radioButtonGroup extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];

    const id = `${form._name}-${form._key}-radio-button-group-${fieldName}`;

    return (
      <div className="components_forms_components_radioButtonGroup">
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          {this.props.options.map((option, index) => {
            const thisID = `${id}-${index}`;
            const selected = _try(() => field.value === option.value) || false;
            return (
              <label htmlFor={thisID} className={`btn ${selected && 'active'}`}>
                {option.iconClass && <i className={`mdi ${option.iconClass}`} />}
                {!option.iconClass && option.display}
                <input
                  type="radio"
                  className="d-none"
                  id={thisID}
                  onChange={(e) => {
                    this.props.action('change', fieldName, e.target.value);
                  }}
                  onBlur={() => {
                    this.props.action('blur', fieldName);
                  }}
                  onFocus={() => {
                    this.props.action('focus', fieldName);
                  }}
                  checked={selected}
                  value={option.value}
                  disabled={this.props.disabled || false}
                />
              </label>
            );
          })}
          {/* <label class="btn-sm btn-secondary">
            <input type="radio" name="options" id="option2" autocomplete="off"> Radio </input>
          </label>
          <label class="btn-sm btn-secondary">
            <input type="radio" name="options" id="option3" autocomplete="off"> Radio </input>
          </label> */}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_components_radioButtonGroup);


