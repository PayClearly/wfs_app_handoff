import { connect, Component } from 'component';
import { CSSTransition } from 'react-transition-group';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_cardsroute extends Component {
  state = {
    showOverlay: true,
  };

  componentDidMount() {
    this.setState({
      showOverlay: false,
    });
  }

  render() {
    return (
      <div className="components_cardsroute">
        <CSSTransition
          timeout={600}
          classNames="cards-route-transitioner"
          in={!this.state.showOverlay}
        >
          <div className="pt-4 px-2 px-md-3 px-lg-5 yscroll noxscroll h-100 ms-0 me-0">
            <div className="h-100" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              {this.props.children}
            </div>
          </div>
        </CSSTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cardsroute);
