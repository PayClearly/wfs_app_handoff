import { connect, Component } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class components_routes_csrdashboard extends Component {

  render() {
    return (
      <div className="components_routes_taikoBots">
        <div className="row mb-4">
          <div className="col-12 col-md-12 col-xl-12 order-1 order-md-2 mb-3 mb-md-0">
            <Components.cards.taikoBots />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_csrdashboard);
