import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import Components from 'components';
import logo from 'assets/logos/logo.png';
import Store from 'store';

import './index.scss';

function ForgotPasswordForm(props) {
  const [state, setState] = useState({
    formKey: 'forgotpassworduser',
    formEnabled: false,
    showOverlay: true,
    resetEmailSent: false,
  });

  const dispatch = useDispatch();
  const forms = useSelector((formsState) => formsState.forms);
  const access = useSelector((accessState) => accessState.user.access);

  useEffect(() => {
    setState((prevState) => ({ ...prevState, showOverlay: false }));

    // Clean up any errors when the component unmounts
    return () => {
      dispatch(Store.user.clearAccessErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    const form = (forms['Components.forms.useremail'] && forms['Components.forms.useremail'][state.formKey]) || {};
    const formEnabled = form._allValid && !access.status.updating;
    setState((prevState) => ({ ...prevState, formEnabled }));
  }, [forms, access.status.updating, state.formKey]);

  const handleFormSubmit = async () => {
    if (!state.formEnabled) {
      return;
    }
    const form = forms['Components.forms.useremail'][state.formKey];
    await dispatch(Store.user.resetPasswordRequest(form.email.value));
    setState({ ...state, resetEmailSent: true });
  };

  return (
    <div className="h-100 w-100 components_forgotpassword flex-center-column">
      <CSSTransition
        classNames="forgot-password-transitioner"
        timeout={600}
        in={!state.showOverlay}
      >
        <div style={{ top: '-5%', width: '300px' }} className="mx-auto align-self-center position-relative">
          <div className={classNames('text-center', 'pb-5')}>
            <img alt="logo" src={logo} height="70px" />
          </div>

          {state.resetEmailSent && !access.status.updatingError
            ? (
              /* Success Message */
              <div>
                <h4>We emailed the directions to reset your password!</h4>
                <p>
                  Simply follow the directions in your email. Did not receive the email yet?
                  Make sure to check your spam folder.
                </p>
                <button type="button" className="btn btn-primary" onClick={props.handleForgotPasswordCancel}>
                  Done
                </button>
              </div>
            )
            : (
              /* Forgot Password Form */
              <div>
                <h4>Forgot your password?</h4>
                <p>
                  Simply enter your email address below. Directions for resetting your password
                  will be emailed to the address on file.
                </p>
                <Components.forms.useremail formKey={state.formKey} />

                {/* Error Message from Reponsse */}
                {access.status.updatingError && (
                  <div className={classNames('alert', 'alert-danger')} role="alert">
                    {access.status.updatingError}
                  </div>
                )}

                <Components.button
                  disabled={!state.formEnabled}
                  onClick={handleFormSubmit}
                  buttonText="Submit"
                  updating={access.status.updating}
                />
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={props.handleForgotPasswordCancel}
                >
                  Cancel
                </button>
              </div>
            )}
        </div>
      </CSSTransition>
    </div>
  );
}

export default ForgotPasswordForm;
