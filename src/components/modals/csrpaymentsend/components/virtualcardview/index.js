// Third Party Import...
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Store from 'store';

import Selectors from 'selectors';
import Components from 'components';
import { api } from 'api/_util/payclearlyapi';

// Component Specific Imports
import {
  GlobalVendorMetadata,
  LoadingScreen,
  ModalHeader,
  ModalFooter,
  PaymentInfoHeader,
} from './components/BasicComponents';
import SectionPSOP from './components/SectionPSOP';
import SectionPaymentInfo from './components/SectionPaymentInfo';
import SectionCardsCollection from './components/SectionCardsCollection';
import SectionPullAch from './components/SectionPullAch';
import SectionPayerInfo from './components/SectionPayerInfo';
import SectionVendorRemittance from './components/SectionVendorRemittance';
import SectionPaymentForm from './components/SectionPaymentForm';

import './index.scss';

function VirtualCardView({
  accountId,
  accounts,
  attachPaymentForm,
  cardsIntegrationStatus,
  clearPrivateCard,
  clientsCollections,
  clientsData,
  clientsStatus,
  close,
  csrGlobalItems,
  downloadAttachment,
  globalVendorMetadatas,
  globalVendors,
  id,
  isOps,
  markPaymentAsSent,
  openAreYouSureModal,
  organizationId,
  paymentPipelinePreferences,
  paymentPipelineStatus,
  paymentStatus,
  privateCredentials,
  privateCredentialsStatus,
  privateVirtualCard,
  removeAttachedPaymentForm,
  standardCredentialFields,
  standardCredentialFieldsStatus,
  setPrivateCards,
  setPrivateCredentials,
  syncClients,
  updateVendorRemittanceFields,
  users,
}) {
  const [receipts, setReceipts] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [vendorCredentials, setVendorCredentials] = useState({});

  // Form Builder State
  const [attachedPaymentForms, setAttachedPaymentForms] = useState([]);
  const [hideFormBuilder, setHideFormBuilder] = useState(false);
  const [paymentFormLoading, setPaymentFormLoading] = useState(false);

  const fetchVendorCredentials = (paymentId) => api().get(
    `/accountvendorcredentials/${organizationId}/${accountId}/${paymentId}`
  ).then((response) => {
    setVendorCredentials(response.data);
  });

  const paymentCreatedData = paymentStatus?.created || {};
  const { globalVendorId, globalVendorTagId: tagId, method = {} } = paymentCreatedData;
  const globalVendor = globalVendors[globalVendorId] || {};
  const globalVendorMetadata = globalVendorMetadatas?.data?.items[globalVendorId] || {};
  const PSOPData = csrGlobalItems.vendorTagToPSOP[globalVendorId]?.[tagId]?.[method] || {};
  const paymentProcedure = PSOPData?.procedure || {};
  const account = accounts?.data?.items[accountId];

  const disableButtonsState = {
    disableSend: paymentPipelineStatus.updating,
    disableClose: paymentPipelineStatus.updating,
  };

  // Handlers for Form Builder (SectionPaymentForm component)
  // Sets the first attached payment form to the loader
  const onLoadDirectlyIntoLoader = (file) => {
    setAttachedPaymentForms({ attachedPaymentForms: file });
    setPaymentFormLoading(true);
    attachPaymentForm(id, { attachedPaymentForm: file });
  };

  // Many forms can be attached
  const onPaymentFormDrop = (files) => {
    setAttachedPaymentForms({ attachedPaymentForms: files });
    setPaymentFormLoading(true);
    attachPaymentForm(id, { attachedPaymentForm: files[0] });
  };

  const handleMarkPaymentAsSent = (params) => {
    const { confirmationNumberDefault } = paymentPipelinePreferences;
    const vendorRemittanceFields = paymentStatus?.sent?.vendorRemittanceFields;
    const confirmationNumber = vendorRemittanceFields?.['Confirmation Number'];

    if (!globalVendorId) {
      return openAreYouSureModal({
        title: 'Submit Payment Without Linked Global Vendor',
        content: 'You are about to submit this payment without a linked global vendor. '
          + 'Please be sure a linked global vendor is not required before marking the payment as sent.',
        noText: 'Cancel',
        yesText: 'Proceed without a linked Global Vendor',
        onYes: () => markPaymentAsSent(id, params),
      });

    }

    if (
      paymentPipelinePreferences.requireConfirmationNumber
      && (confirmationNumber === confirmationNumberDefault || !confirmationNumber)
    ) {
      return openAreYouSureModal({
        title: 'Submit Payment Without Confirmation Number',
        content: 'You are about to submit this payment without a confirmation number. '
          + `The default value '${confirmationNumberDefault}' will be used.`,
        noText: 'Cancel',
        yesText: 'I understand, proceed',
        onYes: () => {
          updateVendorRemittanceFields(id, { 'Confirmation Number': confirmationNumberDefault });
          markPaymentAsSent(id, params);
        },
      });
    }

    return markPaymentAsSent(id, params);
  };

  // Lifecycle-like behavior using useEffect
  useEffect(() => {
    const paymentStatusFundedData = paymentStatus?.funded || {};
    const vCardIds = paymentStatusFundedData.vCards ? paymentStatusFundedData.vCards.map((card) => card.id) : [];

    if (vCardIds.length) {
      setPrivateCards(vCardIds);
    }

    // Get Private Credentials: 1Password
    if (paymentPipelinePreferences?.passwordManager === '1PASSWORD'
      && paymentStatus?.created?.paymentFields?.vaultUUID
      && paymentStatus?.created?.paymentFields?.itemUUID
    ) {
      setPrivateCredentials({
        vaultId: paymentStatus.created.paymentFields.vaultUUID,
        itemId: paymentStatus.created.paymentFields.itemUUID,
      });
    }

    // Get Private Credentials: Advantix
    if (paymentPipelinePreferences?.passwordManager === 'ADVANTIX'
      && paymentStatus?.created?.paymentFields?.['Account ID']
    ) {
      setPrivateCredentials({
        vaultId: 'advantix',
        itemId: paymentStatus.created.paymentFields['Account ID'],
      });
    }

    // Get Vendor Credentials
    fetchVendorCredentials(paymentStatus._id);

    // Ops App Only
    if (isOps) {
      syncClients(paymentStatus._id);
    }

    // Cleanup when component unmounts
    return () => {
      clearPrivateCard();
    };
  }, [paymentStatus?.funded]);

  const isLoading = csrGlobalItems.notFetched
    || !globalVendorMetadatas?.status?.fetched
    || !standardCredentialFieldsStatus?.fetched
    || cardsIntegrationStatus.fetching;

  if (isLoading) {
    return LoadingScreen(close);
  }


  return (
    <div className="h-100 w-100 components_modals_csrpaymentsend_components_virtualcardview" role="document">
      <div className="modal-content h-100 w-100">
        <ModalHeader paymentStatus={paymentStatus} close={close} />

        {/* BEGIN MODAL BODY */}
        <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
          <PaymentInfoHeader
            paymentCreatedData={paymentCreatedData}
            account={account}
            globalVendor={globalVendor}
            PSOPData={PSOPData}
            paymentStatusFundedData={paymentStatus?.funded}
          />

          <div className="row mb-3">
            <div className="col-xs-12 col-md-6">
              <SectionPSOP
                globalVendorId={globalVendorId}
                paymentProcedure={paymentProcedure}
                paymentStatus={paymentStatus}
              />
            </div>
            <div className="col-xs-12 col-md-6">
              {paymentStatus.verified?.achDeliveryMethod === 'pullAch'
                && (
                  <SectionPullAch
                    paymentStatus={paymentStatus}
                    achNotes={paymentProcedure.achNotes}
                    organizationId={organizationId}
                    accountId={accountId}
                    markedAsSent={paymentStatus.sent?.markedAsReadyToSendOrSent}
                  />
                )}
              {paymentStatus.created.method === 'vCard'
                && (
                  <SectionCardsCollection
                    accountId={accountId}
                    paymentStatus={paymentStatus}
                    privateVirtualCard={privateVirtualCard}
                    accounts={accounts}
                    users={users}
                    currentCard={currentCard}
                    setCurrentCard={setCurrentCard}
                  />
                )}
              <SectionPayerInfo account={account} />
            </div>
          </div>

          <SectionPaymentInfo
            paymentCreatedData={paymentCreatedData}
            clientsStatus={clientsStatus}
            clientsData={clientsData}
            clientsCollections={clientsCollections}
            paymentPipelinePreferences={paymentPipelinePreferences}
            privateCredentials={privateCredentials}
            privateCredentialsStatus={privateCredentialsStatus}
            vendorCredentials={vendorCredentials}
            standardCredentialFields={standardCredentialFields}
          />

          <GlobalVendorMetadata globalVendorId={globalVendorId} />

          {/* SECTION PAYMENT FORM WITH FORM BUILDER */}
          {
            (paymentProcedure.vCardPaymentForm || paymentProcedure.attachments)
            && paymentProcedure.vCardDeliveryMethod !== 'manual' && (
              <SectionPaymentForm
                account={account}
                attachedPaymentForms={attachedPaymentForms}
                downloadAttachment={downloadAttachment}
                globalVendorMetadata={globalVendorMetadata}
                hideFormBuilder={hideFormBuilder}
                id={id}
                onLoadDirectlyIntoLoader={onLoadDirectlyIntoLoader}
                onPaymentFormDrop={onPaymentFormDrop}
                paymentFormLoading={paymentFormLoading}
                paymentStatus={paymentStatus}
                privateVirtualCard={privateVirtualCard}
                removeAttachedPaymentForm={(formId) => {
                  removeAttachedPaymentForm(formId);
                  setPaymentFormLoading(false);
                }}
                setAttachedPaymentForms={setAttachedPaymentForms}
                setHideFormBuilder={setHideFormBuilder}
                standardCredentialFields={standardCredentialFields}
                vCardPaymentForm={paymentProcedure.vCardPaymentForm}
                vendorCredentials={vendorCredentials}
              />
            )
          }

          {/* Payment Line Items */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card w-100">
                <div className="card-header default-bg">Payment Line Items</div>
                <div className="card-body">
                  <Components.tables.lineItems tableKey={id} />
                </div>
              </div>
            </div>
          </div>

          <SectionVendorRemittance
            requireConfirmationNumber={paymentPipelinePreferences?.requireConfirmationNumber}
            onDrop={setReceipts}
            receipts={receipts}
            id={id}
          />
        </div>
        {/* END MODAL BODY */}

        <ModalFooter
          close={close}
          disableSend={disableButtonsState.disableSend}
          disableClose={disableButtonsState.disableClose}
          markPaymentAsSent={() => handleMarkPaymentAsSent({ receipts })}
          submitText={'Send Payment'}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state, props) => ({
  accountId: state.account.data.id,
  accounts: state.accounts,
  cardsIntegrationStatus: state.account.cardsIntegration.status,
  clientsCollections: _resolve(state, 'account.clients.collections', {}),
  clientsData: _resolve(state, 'account.clients.data.items', {}),
  clientsStatus: _resolve(state, 'account.clients.status'),
  csrGlobalItems: Selectors.csrGlobalItems(state),
  globalVendorMetadatas: state.global.metadata,
  globalVendors: state.global.vendors.data.items,
  isOps: state.appConfig.data.metadata.name === 'ops',
  organizationId: state.organization.data.id,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  paymentPipelineStatus: state.account.paymentStatuses.status,
  paymentStatus: state.account.paymentStatuses.data.items[props.id],
  privateCredentials: state.account.passwords.data.items,
  privateCredentialsStatus: state.account.passwords.status,
  privateVirtualCard: state.account.privateVirtualCard,
  standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  standardCredentialFieldsStatus: _resolve(state, 'global.standardCredentialFields.status', {}),
  userId: state.user.access.data.uid,
  users: state.users.data.items,
  vCards: state.account?.cardsIntegration?.data?.resources?.vCards,
});

const mapDispatchToProps = (dispatch) => ({
  attachPaymentForm: (id, params) => dispatch(Store.account.updatePaymentPipelines([id], 'attachPaymentForm', params)),
  clearPrivateCard: () => dispatch(Store.account.clearPrivateVirtualCard()),
  clearPrivateCredentials: () => dispatch(Store.account.clearPrivateCredentials()),
  downloadAttachment: (attachmentMetadata) => dispatch(Store.global.downloadAttachment(attachmentMetadata)),
  markPaymentAsSent: (id, params) => dispatch(Store.account.updatePaymentPipelines([id], 'markAsSent', params)),
  openAreYouSureModal: (data) => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
  removeAttachedPaymentForm: (id) => dispatch(Store.account.updatePaymentPipelines([id], 'removePaymentForm')),
  sendPaymentForm: (id) => dispatch(Store.account.updatePaymentPipelines([id], 'sendPaymentForm')),
  setPrivateCards: (ids) => dispatch(Store.account.fetchPrivateVirtualCards(ids)),
  setPrivateCredentials: (vaultId, itemId) => dispatch(Store.account.fetchPrivateCredentials(vaultId, itemId)),
  syncClients: (id) => dispatch(Store.account.syncClients(id)),
  updateVendorRemittanceFields: (id, params) => dispatch(
    Store.account.updatePaymentPipelines(
      [id],
      'updateVendorRemittanceFields',
      params
    )
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(VirtualCardView);
