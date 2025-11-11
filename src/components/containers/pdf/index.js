import { connect, Component } from 'component';

// Third Party Imports ...
import PDF from 'react-pdf-js';
import ReactPaginate from 'react-paginate';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  files: state.global.attachments.data.items,
});

const mapDispatchToProps = (dispatch, props) => ({
  fetchAttachment: (attachmentMetadata) => dispatch(Store.global.fetchAttachment(attachmentMetadata)),
});

// eslint-disable-next-line camelcase
class components_containers_pdf extends Component {
  state = {
    page: 0,
  };

  componentDidMount() {
    if (this.props.file) {
      return this.setState({ file: this.props.file.preview ? this.props.file.preview : this.props.file });
    }

    const { md5Hash } = this.props.pdf;
    const file = this.props.files[md5Hash];

    if (file) {
      return this.setState({ file });
    }

    return this.props.fetchAttachment(this.props.pdf);
  }

  onDocumentComplete = (pages) => {
    this.setState({ page: 1, pages });
  };

  handleSpecificPage = ({ selected }) => {
    this.setState({ page: selected + 1 });
  };

  render() {
    const pdf = (this.props.pdf && this.props.pdf.md5Hash) || '';
    const file = this.props.files[pdf];

    if (!this.state.file && !file) {
      return (
        <div className={'components_containers_pdf h-100'}>
          <div className="row justify-content-center p-3">
            <Components.spinner />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`components_containers_pdf${this.props.fillHeight ? ' filled-to-height' : ''}`}
        style={{ overflow: 'hidden' }}
      >
        <PDF
          file={this.state.file || file}
          onDocumentComplete={this.onDocumentComplete}
          page={this.state.page}
        />
        {(this.state.pages > 1) && !this.props.hidePagination && (
          <div className="d-flex justify-content-center pagination">
            <ReactPaginate
              previousLabel="Previous"
              previousClassName="paginate_page previous"
              previousLinkClassName="paginate_button"
              nextLabel="Next"
              nextClassName="paginate_page next"
              nextLinkClassName="paginate_button"
              breakLabel={<span className="ellipsis">...</span>}
              breakClassName="paginate_page"
              pageLinkClassName="paginate_button"
              pageClassName="paginate_page"
              pageCount={this.state.pages}
              marginPagesDisplayed={1}
              pageRangeDisplayed={15}
              onPageChange={this.handleSpecificPage}
              containerClassName="paginatedTable_paginate p-0"
              activeClassName="current"
              forcePage={this.state.page - 1}
            />
          </div>
        )}
        {(this.state.pages > 1) && this.props.hidePagination
          && <div className="text-center mb-2 page-count">Page Count: {this.state.pages}</div>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_containers_pdf);
