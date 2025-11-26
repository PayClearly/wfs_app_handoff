import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_error404 extends Component {

  render() {
    const currentYear = (new Date()).getFullYear();
    const { resourceNotFound } = this.props;

    return (
      <div className="text-center ml-auto mr-auto mt-3 mb-3 container d-flex flex-column justify-content-between">
        <div>
          <div style={{ 'font-size': '10rem' }}>404</div>
          <h1 className="text-uppercase">{resourceNotFound ? 'Resource not found' : 'Page not Found'}</h1>
          {!resourceNotFound && <div><a href="/" className="btn btn-primary">Back to Home</a></div>}
        </div>
        {!resourceNotFound && <footer className="footer text-center mb-4">© {currentYear} CHANGE_ME_COMPANY_NAME</footer>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_error404);

