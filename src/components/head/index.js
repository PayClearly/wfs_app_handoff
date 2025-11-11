import { connect, Component } from 'component';

// Third Party Imports ...
import Helmet from 'react-helmet';
import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state) => ({
  head: Selectors.head(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_head extends Component {

  render() {
    const { title = null, canonicalLink = null } = this.props;
    return (
      <Helmet
        htmlAttributes={this.props.head.htmlAttributes}
        base={this.props.head.base}
        title={title || this.props.head.title}
        titleTemplate={this.props.head.titleTemplate}
        titleAttributes={this.props.head.titleAttributes}
        defaultTitle={this.props.head.defaultTitle}
        link={canonicalLink || this.props.head.link}
        meta={this.props.head.meta}
        script={this.props.head.script}
        noscript={this.props.head.noscript}
        style={this.props.head.style}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_head);


