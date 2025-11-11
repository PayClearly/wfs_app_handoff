import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import md5 from 'md5';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_unlinkedvendor extends Component {

  state = {
    name: 'Components.forms.unlinkedvendor',
  }

  componentDidMount() {
    const { initialize, formKey, accountVendorName, forms, exactGlobalMatch, globalVendor } = this.props;
    if (!forms[this.state.name] || !forms[this.state.name][formKey]) {
      initialize(this.state.name, formKey, {
        globalSelection: (exactGlobalMatch && md5(exactGlobalMatch.name)) || null,
        globalVendor,
        name: accountVendorName,
      });
    }

    const form = forms[this.state.name] && forms[this.state.name][formKey];
    this.setState({ form, key: formKey });
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = nextProps.formKey;
    const form = nextProps.forms[this.state.name][key];

    this.setState({ form });
  }


  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
    } else if (action === 'reset') {
      this.props.change(this.state.name, this.state.key, field, null);
    }
  };

  render() {
    const { form } = this.state;
    if (!form || !Object.keys(form).length) return null;

    const hasGlobalSuggestions = this.props.suggestions && (!!this.props.suggestions.global && Object.keys(this.props.suggestions.global).length > 0);
    const hasMadeGlobalSelection = !!form.globalSelection.value;

    const columnStyle = 'col-md-5';

    return (
      <form className="floating-labels mb-4">
        <div className="row mt-3" style={{ justifyContent: 'space-between' }} >

          <div className={`col-xs-12 ${columnStyle}`}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              label="Vendor"
              disabled
            />
          </div>

          {!this.props.hideGlobalVendors && <div className={`col-xs-12 ${columnStyle}`}>
            {this.props.globalVendor
              ?
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="globalVendor"
                label={`${this.props.providerDisplayName} Vendor`}
                disabled
              />
              :
              <Components.forms.components.selectinput
                form={form}
                field="globalSelection"
                label={hasGlobalSuggestions ? `${this.props.providerDisplayName} Vendor` : null}
                action={this.standardFormAction}
                options={this.props.suggestions && this.props.suggestions.global}
                placeholder={hasGlobalSuggestions ? 'Choose a Suggested Vendor' : 'No Suggestions Available'}
                disabled={!hasGlobalSuggestions}
              />}
          </div>}

          <div className="col-xs-12 col-md-2">
            <Components.button
              onClick={() => {
                this.standardFormAction('reset', 'globalSelection');
              }}
              type="button"
              aria-label="button"
              buttonText={'Clear Selection'}
              disabled={!(hasMadeGlobalSelection)}
            />
          </div>

        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_unlinkedvendor);


