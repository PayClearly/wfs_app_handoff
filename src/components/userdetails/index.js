import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import resolvePath from 'object-resolve-path';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_userdetails extends Component {




  render() {
    const { profile, className } = this.props;
    const notSetTag = (<i>Not set</i>);
    const firstName = resolvePath(profile, 'data.item.firstName') || notSetTag;
    const lastName = resolvePath(profile, 'data.item.lastName') || notSetTag;
    const email = resolvePath(profile, 'data.item.email') || notSetTag;

    return (
      <div className={className}>
        <div className="col-md-3 col-xs-12">
          <strong>First Name</strong>
          <br />
          <p className="text-muted">{firstName}</p>
        </div>
        <div className="col-md-3 col-xs-12">
          <strong>Last Name</strong>
          <br />
          <p className="text-muted">{lastName}</p>
        </div>
        <div className="col-md-6 col-xs-12">
          <strong>Email</strong>
          <br />
          <p className="text-muted">{email}</p>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_userdetails);


