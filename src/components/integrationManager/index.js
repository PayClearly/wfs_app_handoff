import { connect, Component } from 'component';

import Components from 'components';

import logo from 'assets/logos/logo.png';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    integrationDefinitions: state.integrationDefinitions.data.items,
    integrationDefinitionsStatus: state.integrationDefinitions.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_integrationManager extends Component {
  state = {
    selectedGeneral: null,
    selectedCustom: null,
    searchIntegration: '',
    searchResource: '',
    showContent: false,
  }




  onControlButtonClick = () => {
    this.setState(prevState => ({ ...defaultState, ...{ showContent: !prevState.showContent } }));
  }

  onSearchChange = (value) => {
    if (value && value.includes(':')) {
      const search = value.split(':');

      this.setState({ searchIntegration: search[0], searchResource: search[1] });
    } else {
      this.setState({ searchIntegration: value, searchResource: '' });
    }
  }

  onMenuItemClick = (integrationName, resourceName) => {
    this.setState({
      selectedCustom: null,
      resetCustom: true,
      resetGeneral: false,
      selectedGeneral: {
        integrationName,
        resourceName,
      },
    });
  }

  onMenuItemCustomClick = (integrationName, resourceName) => {
    this.setState({
      selectedGeneral: null,
      resetGeneral: true,
      resetCustom: false,
      selectedCustom: {
        integrationName,
        resourceName,
      },
    });
  }

  generateGeneralMenuItems = (forMobile) => {
    // could put in a filter for canRead/canUpdate resources
    const regexIntegration = new RegExp(this._escapeRegExp(this.state.searchIntegration.toLowerCase()));
    const items = Object.keys(this.props.integrationDefinitions).filter((name) => {
      const matchFound = regexIntegration.test(name.toLowerCase());
      return matchFound;
    }).map((name) => {
      const regexResource = new RegExp(this._escapeRegExp(this.state.searchResource.toLowerCase()));

      return {
        title: name,
        subItems: _try(() => Object.keys(this.props.integrationDefinitions[name].resources), {})
          .filter((resourceName) => {
            const matchFound = regexResource.test(resourceName.toLowerCase());
            return matchFound;
          })
          .map((subItem) => {
            return {
              title: subItem,
              active: subItem === _try(() => this.state.selectedGeneral.resourceName) && name === _try(() => this.state.selectedGeneral.integrationName),
            };
          }),
        active: name === _try(() => this.state.selectedGeneral.integrationName),
      };
    });

    if (forMobile) {
      const selectItems = items.reduce((acc, item) => {
        acc[item.title] = {
          display: item.title,
          subItems: _try(() => item.subItems, []).reduce((bcc, subItem) => {
            bcc[subItem.title] = {
              display: subItem.title,
            };

            return bcc;
          }, {}),
        };

        return acc;
      }, {});

      return selectItems;
    }

    return items;
  }

  generateContent = () => {
    let context;
    if (this.state.selectedCustom) {
      context = 'Payments';
      return 'idk';
    } else if (_try(() => this.state.selectedGeneral.resourceName)) {
      context = this.props.integrationDefinitions;

      const resource = context[this.state.selectedGeneral.integrationName].resources[this.state.selectedGeneral.resourceName];
      const tabs = [];

      tabs.push(
        <Components.tab name="create" label="Create" iconClassName="mdi-plus" tabClassName="overflow-container integration-tab-content" >
          <Components.creators.integrationManager integrationName={this.state.selectedGeneral.integrationName} resourceName={this.state.selectedGeneral.resourceName} />
        </Components.tab>,
        <Components.tab name="update" label="Update" iconClassName="mdi-pencil" tabClassName="overflow-container integration-tab-content no-top-padding" >
          <Components.tables.integrationManager integrationName={this.state.selectedGeneral.integrationName} resourceName={this.state.selectedGeneral.resourceName} />
        </Components.tab>
      );

      tabs.push(
        <Components.tab name="error" label="Error" iconClassName="mdi-exclamation" tabClassName="overflow-container integration-tab-content no-top-padding" >
          <Components.tables.integrationManager integrationName={this.state.selectedGeneral.integrationName} resourceName={this.state.selectedGeneral.resourceName} forError />
        </Components.tab>
      );

      return (
        <Components.tabs key={`${this.state.selectedGeneral.integrationName}-${this.state.selectedGeneral.resourceName}`} noCard defaultTab={tabs[0].props.name} >
          {tabs}
        </Components.tabs>
      );
    }

    return (
      <div className="h-100 p-3 d-flex flex-column align-items-center justify-content-around">
        <img className="splash-logo" alt="logo" src={logo} />
        <h1 className="text-primary m-0"><strong>Integration Mocker</strong></h1>
        <Components.button
          buttonText={'change color'}
          onClick={(e) => {
            e.stopPropagation();
            document.documentElement.style.setProperty('--theme-color', '#FF0000');
          }}
        />
      </div>
    );
  }

  _escapeRegExp = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  render() {
    const { integrationDefinitionsStatus } = this.props;
    if (!integrationDefinitionsStatus.fetched) return null;

    return (
      <div className="components_integrationManager">
        <div className="card">
          <div className="row">
            <div className="col-md-3 col-12 pr-md-0 column">
              <div className="p-2 border-right menu-container h-100 overflow-container mobile-hidden">
                <Components.tables.components.searchform
                  onChange={(e) => { this.onSearchChange(e.target.value); }}
                />
                <Components.menu hasActions menuTitle="General" isFlush items={this.generateGeneralMenuItems()} onClick={this.onMenuItemClick} reset={this.state.resetGeneral} />
              </div>
              <div className="p-2 border-bottom menu-container mobile-shown">
                <span className="menu-small-cap text-uppercase">General</span>
                <select
                  className="form-control small"
                  onChange={(e) => {
                    const selectedOption = _try(() => e.target.selectedOptions[0]);
                    if (!selectedOption) return;

                    const resourceName = selectedOption.value;
                    const integrationName = selectedOption.parentElement.label;

                    this.onMenuItemClick(integrationName, resourceName);
                  }}
                >
                  <option value="" selected={!_try(() => this.state.selectedGeneral.resourceName)} disabled={_try(() => this.state.selectedGeneral.resourceName)} hidden>Select a resource</option>
                  {(() => {
                    const items = this.generateGeneralMenuItems(true);
                    return Object.keys(items)
                      .map((key) => (
                        // if the selected options matches a key from the overall options remove it from the menu to avoid duplication
                        <optgroup label={items[key].display}>
                          {Object.keys(items[key].subItems).map((subKey) => {
                            if (!items[key].subItems[subKey].display) return null;
                            return (
                              <option value={subKey}>{items[key].subItems[subKey].display}</option>
                            );
                          })}
                        </optgroup>
                      ));
                  })()}
                </select>
              </div>
              <div className="col-md-9 col-12 ml-sm-auto pl-md-0 column">
                {this.generateContent()}
              </div>
            </div>
          </div>
        </div>
        <div className="control-button">
          <button className="btn btn-circle btn-info" type="button" onClick={this.onControlButtonClick}><i className="mdi mdi-menu" /></button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationManager);

const defaultState = {
  selectedGeneral: null,
  selectedCustom: null,
  searchIntegration: '',
  searchResource: '',
  showContent: false,
};
