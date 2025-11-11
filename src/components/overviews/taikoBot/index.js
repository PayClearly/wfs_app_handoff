import { connect, Component } from 'component';

import Components from 'components';

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class componentsOverviewsTaikoBot extends Component {

  render() {
    const { bot, showScreenshot = true } = this.props;
    if (!bot) { return null; }

    return (
      <div className="components_overviews_bot">
        <div className="row">
          <div className="col-md-6 col-12">
            <strong>Status</strong>
            <br />
            <p className="text-muted">{bot.status}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Payment ID</strong>
            <br />
            <p className="text-muted">{bot.paymentId}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Total Attempts</strong>
            <br />
            <p className="text-muted">{bot.attempts}</p>
          </div>
          {bot.error && (
            <div className="col-md-6 col-12">
              <strong>Error</strong>
              <br />
              <p className="text-muted">{bot.error}</p>
            </div>
          )}
          {bot.errorScreenshot && showScreenshot && (
            <Components.containers.image
              alt="bot error screenshot"
              path={bot.errorScreenshot.storagePath}
              thumbnail={false}
              hash={bot.errorScreenshot.md5Hash}
            />
          )}

        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(componentsOverviewsTaikoBot);


