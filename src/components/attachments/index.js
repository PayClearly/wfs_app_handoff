import React from 'react';
import { connect } from 'react-redux';
import numeral from 'numeral';
import Components from 'components';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

const AttachmentCard = ({
  attachments,
  cardHeader,
  children,
  hideFileName,
  handleDownload,
  handleRemove,
}) => {
  function renderAttachmentContent(attachment) {
    if (attachment.contentType.includes('image')) {
      return (
        <Components.containers.image
          alt={`attachment ${attachment.originalname}`}
          path={attachment.storagePath}
          hash={attachment.md5Hash}
        />
      );
    }

    if (attachment.contentType.includes('pdf')) {
      return <Components.containers.pdf pdf={attachment} />;
    }

    return <Components.mimeicon contentType={attachment.contentType} />;
  }

  return (
    attachments.map((attachment) => (
      <div key={attachment.md5Hash} className="card components_attachments" style={{ minHeight: '200px' }}>
        {cardHeader && (
          <div className="card-header default-bg">
            {cardHeader}
          </div>
        )}
        {renderAttachmentContent(attachment)}
        {children ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {children}
          </>
        ) : (
          <div className="clearly-card-body">
            {/* hideFileName feels inverted but leaving as-is to not change each implementation */}
            {hideFileName && (
              <>
                <h4 className="mt-0 mb-1 text-truncate">{attachment.originalname}</h4>
                <p>{numeral(attachment.size).format('0.0 b')}</p>
              </>
            )}
            {handleDownload && (
              <Components.button
                buttonText="Download"
                onClick={() => handleDownload(attachment)}
                ariaLabel="Download Current Attachment"
                className="btn btn-primary mt-2 mr-4"
                icon="mdi mdi-cloud-download"
              />
            )}
            {handleRemove && (
              <Components.button
                buttonText="Remove"
                onClick={() => handleRemove(attachment)}
                ariaLabel="Remove Current Attachment"
                className="btn btn-outline-danger mt-2"
                icon="mdi mdi-delete"
              />
            )}
          </div>
        )}
      </div>
    ))
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AttachmentCard);
