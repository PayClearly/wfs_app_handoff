import React, { useEffect, useState } from 'react';
import Button from '../../../../src/components/button';


export type ModalConfig = {
  title: string;
  content: string;
  yesText?: string;
  noText?: string;
  onContinue: () => void;
  onClose: () => void;
}

const TSModal = ({ config }: { config: ModalConfig }) => {
  const { title, content, yesText, noText, onContinue, onClose } = config;
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '1040',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          opacity: '0.5'
        }}></div>
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '1050',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          outline: '0'
        }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content components_modals_areyousure">
            <div className="modal-header">
              <h3 className="modal-title" id="exampleModalLabel">{title}</h3>
              <button onClick={onClose} type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md mb-4" >
                  <h3>Are you sure you want to do this?</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                onClick={() => onContinue()}
                className='btn btn-danger'
                // updating={this.state.cancelling}
                disabled={false}
                buttonText={yesText || 'Continue'}
              />
              <Button
                onClick={onClose}
                className="btn btn-secondary"
                type="button"
                aria-label="cancel button"
                disabled={false}
                buttonText={noText || 'Cancel'}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TSModal;