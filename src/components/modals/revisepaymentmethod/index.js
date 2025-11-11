import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { api } from 'api/_util/payclearlyapi';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

const components_modals_revisepaymentmethod = ({
  currentMethod,
  methodOptions = [],
  paymentId,
  organizationId,
  accountId,
  close,
}) => {
  const [revisedMethod, setRevisedMethod] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const handleMethodSelect = (value) => {
    setRevisedMethod(value);
    setError('');
  };

  const handleSave = async () => {
    if (!revisedMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      await api().patch(
        `/paymentstatuses/${organizationId}/${accountId}/${paymentId}/created/method`,
        { revisedPaymentMethod: revisedMethod }
      );

      close();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating payment method.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-dialog">
      <div className="modal-content h-100 w-100 components_modals_revisepaymentmethod">
        <div className="modal-header">
          <h4 className="modal-title">Revise Payment Method</h4>
          <button onClick={close} type="button" className="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-12">
              <p className="mb-3">
                <strong>Current Payment Method:</strong> {currentMethod}
              </p>

              <div className="form-group">
                <strong>New Payment Method:</strong>
                <Dropdown
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                  disabled={isSubmitting}
                  className="w-100"
                >
                  <DropdownToggle
                    caret
                    className={`form-control text-left ${error && !revisedMethod ? 'is-invalid' : ''}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      color: revisedMethod ? 'primary' : '#6c757d',
                    }}
                    disabled={isSubmitting}
                  >
                    {revisedMethod || 'Select a payment method'}
                  </DropdownToggle>
                  <DropdownMenu
                    style={{ width: '100%' }}
                    className="w-100"
                  >
                    {methodOptions.map((option) => (
                      <DropdownItem
                        key={option}
                        onClick={() => handleMethodSelect(option)}
                        active={revisedMethod === option}
                      >
                        {option}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_revisepaymentmethod);
