import { connect, Component, Fragment } from 'component';

// Third Party Imports ...
import { Popover, PopoverBody } from 'reactstrap';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  organization: state.organization.data.id,
  account: state.account.data.id,
  details: _try(() => state.account[props.integration].data.details, {}),
  context: Selectors.context(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  syncQueues: (queue) => {
    dispatch(Store.account.syncIntegrationQueues(props.integration, queue));
  },
});

function _badgeInfo(type, details, sync) {
  if (!details[`${type}_lastSuccess`]) {
    return {
      color: 'gray',
      icon: 'help',
      text: 'Unavailable',
      contents: <span>Queue has not ran yet</span>,
    };
  }
  if (_try(() => details[`${type}_error`], 0) < details[`${type}_lastSuccess`]) {
    const date = Number((details[`${type}_lastAttempt`] || '').split('.')[0]);
    const formattedDate = (new Date(date)).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    return {
      color: '#55ce63',
      icon: 'check',
      text: 'Healthy',
      contents: (
        <Fragment style={{ position: 'relative' }}>
          <i
            style={{
              position: 'absolute', top: '2px', right: '10px', color: '#05AEDD', fontSize: '1.5rem',
            }}
            onClick={() => sync(type)}
            className={`mdi mdi-sync`}
          />
          <span style={{ display: 'block' }}>{'Queue is looking good'}</span>
          <span style={{ display: 'block' }}>Last Ran: {date}</span>
          <span>{formattedDate}</span>
        </Fragment>
      ),
    };
  }
  return {
    color: '#f62d51',
    icon: 'close',
    text: 'Error',
    contents:
      (
        <Fragment style={{ position: 'relative' }}>
          <span>Queue is in error!</span>
          <i
            style={{
              position: 'absolute', top: '2px', right: '10px', color: '#05AEDD', fontSize: '1.5rem',
            }}
            onClick={() => sync(type)}
            className={`mdi mdi-sync`}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '6rem 7rem', gridTemplateRows: '1fr 1fr' }}>
            <span>{'lastError: '}</span><span>{`${details[`${type}_error`]}`}</span>
            <span>{'lastSuccess: '}</span><span>{`${details[`${type}_lastSuccess`]}`}</span>
          </div>
        </Fragment>
      ),
  };
}

// eslint-disable-next-line camelcase
class components_badges_queuehealth extends Component {

  state = {
    popoverOpen: false,
  };

  togglePopover = () => {
    this.setState((prevstate) => ({ popoverOpen: !prevstate.popoverOpen }));
  };

  render() {
    const { type, details } = this.props;
    const {
      color, icon, text, contents,
    } = _badgeInfo(type, details, this.props.syncQueues);
    const projectDbContext = Utils.getglobalcertinfo();

    const fbLink = `https://console.firebase.google.com/u/0/project/${projectDbContext.dbContext}`
      + `/database/${projectDbContext.projectId}/data/default/state/links/${this.props.integration}/`
      + `${this.props.organization}/${this.props.account}/details`;
    return (
      <div
        className="components_badges_queuehealth"
        id={`${this.props.integration}${type}`}
        onClick={this.togglePopover}
      >
        <i style={{ color, fontSize: '1rem' }} className={`mdi mdi-${icon}`} /><span>{text}</span>
        <Popover
          className="popover-override-zindex"
          placement={'right'}
          isOpen={this.state.popoverOpen}
          toggle={this.togglePopover}
          target={`${this.props.integration}${type}`}
          trigger="legacy"
          style={{ minWidth: '15rem' }}
        >
          <PopoverBody>
            <div className="text">
              <span className="text-muted">{contents}</span>
            </div>
            <Components.button
              ariaLabel="Download Current Attachment"
              buttonText="VIEW IN DATABASE"
              className="btn btn-outline-primary mt-2 me-4 btn-sm"
              icon="mdi mdi-cloud-download"
              onClick={() => window.open(fbLink)}
            />
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_queuehealth);
