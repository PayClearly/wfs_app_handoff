import { connect, Component, bindActionCreators, Fragment } from 'component';


// Third Party Imports ...
import classNames from 'classnames';

import Store from 'store';

import './index.scss';

const context = require.context('../', true, /\.js$/);
const MODALS = _importNestedDirectory(context);

const mapStateToProps = (state, props) => {
  return ({
    modals: state.router.modals,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
  });
};

class components_modals_modalWrapper extends Component {

  state = {
    display: false,
    show: false,
  }

  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (this.props.modals.length && !nextProps.modals.length) {
      this.setState({ show: false });
      setTimeout(() => {
        // check to make sure another modal hasnt opened in this amount of time
        if (!this.props.modals.length) this.setState({ display: false });
      }, 500);
    } else if (!this.props.modals.length && nextProps.modals.length) {
      this.setState({ display: true });
      setTimeout(() => {
        this.setState({ show: true });
      }, 200);
    }
  }
  componentWillUnmount() {}

  render() {
    const { modals = [] } = this.props;
    return (
      <Fragment>
        <div style={{ display: (this.state.display && 'inline') || 'none' }} >
          {modals.map((modal, index) => {
            const modalName = modal.name;
            const modalData = modal.data;
            const Comp = MODALS[modalName];

            const displayModal = this.state.display && index === 0;
            const showModal = this.state.show && index === 0;
            return (
              <div
                className={classNames('modal', 'fade', 'components_modals_modalWrapper', showModal && 'show')}
                style={{ display: (index === 0 && 'inline') || 'none', overflowY: 'scroll' }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="modal"
                aria-hidden={displayModal && true}
                key={modalName}
              >
                <Fragment>
                  { Comp &&
                    <Comp {...modalData} close={() => this.props.closeModal()} />
                  }
                </Fragment>
              </div>
            );
          })}
          <div className={classNames('modal-backdrop', 'fade', this.state.show && 'show')} />
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_modalWrapper);


// Internal Helper Functions ... 
function _getDotNotatedPath(path) { return `Components.modals.${path.slice(2, -9).replace('/', '.')}`; }

function _importNestedDirectory(directory) {
  return directory.keys().reduce(((acc, key) => {
    const name = _getDotNotatedPath(key);
    if (!name || name === '.' || !context(key).default) return acc; // return if does not match structure
    acc[name] = context(key).default;
    return acc;
  }), {});
}

