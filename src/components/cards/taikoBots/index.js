import { connect, Component } from 'component';

import Components from 'components';

const mapStateToProps = () => { };

const mapDispatchToProps = () => { };

class componentsCardsTaikoBots extends Component {

  render() {

    return (
      <div className="components_cards_taikoBots">
        <Components.tabs defaultTab="bots">
          <Components.tab name="bots" label="bots" iconClassName="mdi-cash-multiple" isValidTab>
            <Components.tables.taikoBots tableKey={'taikoBots'} />
          </Components.tab>
          <Components.tab name="workers" label="workers" iconClassName="mdi-robot" isValidTab>
            <Components.tables.botWorkers tableKey={'botWorkers'} />
          </Components.tab>
        </Components.tabs>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsCardsTaikoBots);
