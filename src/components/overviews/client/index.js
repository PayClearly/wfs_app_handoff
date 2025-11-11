import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    clients: _try(() => state.account.clients.data.items, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_overviews_client extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { id, clients } = this.props;
    const client = _try(() => clients[id], {});

    const notSetTag = (<i>Not set</i>);

    const name = client.name || notSetTag;
    const displayName = client.displayName || notSetTag;
    const contactName = client.contactName || notSetTag;
    const contactEmail = client.contactEmail || notSetTag;

    return (
      <div className="components_overviews_client">
        <div className="row">
          <div className="col-md col-12">
            <strong>Name</strong>
            <br />
            <p className="text-muted">{name}</p>
          </div>
          <div className="col-md col-12">
            <strong>Display Name (Optional)</strong>
            <br />
            <p className="text-muted">{displayName}</p>
          </div>
          <div className="col-md col-12">
            <strong>Contact Name</strong>
            <br />
            <p className="text-muted">{contactName}</p>
          </div>
          <div className="col-md col-12">
            <strong>Contact Email</strong>
            <br />
            <p className="text-muted">{contactEmail}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_client);


