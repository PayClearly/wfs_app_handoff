import createSelector from 'selector';
import moment from 'moment';

import Selectors from 'selectors';

const selectors_paymentDownloadTemplate = createSelector(

  (state) => Selectors.integrations(state).erpIntegration.provider,
  (state) => state.account.paymentPipelinePreferences.data.item.downloadTemplate,
  (state) => state.account.accountVendors.data.items,
  (state) => Selectors.opsNotesDenormalized(state),
  (state) => Selectors.context(state),

  (erpProvider = {}, downloadTemplate, accountVendors = {}, opsNotesDenorm, context) => {
    if (downloadTemplate) {
      return (payment, canRead = false) => {
        // Since we do not store a Cancelled payment with status 'Cancelled',
        // we need to derive from the payment info (._status)
        // Using .status rather than ._status to make it more reader friendly
        let status = payment.status || 'Scheduled';
        if (payment._status === 'cancelled') {
          status = 'Cancelled';
        }

        const sentAt = (
          payment.sent
          && payment.sent._at
          && _try(() => moment(payment.sent._at).format('MM/DD/YYYY'), '')
        )
          || '';

        const templateMap = {
          amount: _try(() => payment.created.amount),
          vendorName: _try(
            () => accountVendors[payment.created.vendorId].displayName || accountVendors[payment.created.vendorId].name
          ),
          customerVendorId: _try(() => accountVendors[payment.created.vendorId].name),
          sentAt,
          vendorId: payment.created.vendorId,
          method: payment.created.method,
          status,
          clientName: _try(() => payment.created.paymentFields.Client),
        };

        const template = {};

        if (canRead && status === 'Cancelled') {
          const { organizationId, accountId } = context;
          const opsNotes = opsNotesDenorm[`paymentStatuses/${organizationId}/${accountId}/${payment._id}`] || [];
          const exceptionNotes = opsNotes
            .filter((opsNote) => opsNote.type === 'exception')
            .sort((a, b) => a._createdAt - b._createdAt)
            .reverse();
          const latestExceptionNote = exceptionNotes.length > 0 ? exceptionNotes[0].message : '';
          template.Notes = latestExceptionNote;
        }

        return downloadTemplate.reduce((acc, {
          fieldName, pcField, format, lineItemField,
        }) => {
          acc[fieldName] = _try(() => templateMap[pcField]
            || payment.created.customFields[pcField]
            || payment.sent.vendorRemittanceFields[pcField], '') || '';
          return acc;
        }, template);
      };
    }

    if (erpProvider === 'ADVANTAGE') {
      return (payment) => ({
        'Check Number': _try(() => payment.created.paymentFields.paymentNumber),
        'Check Amount': _try(() => payment.created.amount),
        'Vendor Name': _try(
          () => accountVendors[payment.created.vendorId].displayName || accountVendors[payment.created.vendorId].name
        ),
        'Cleared Check Date': _try(() => moment(payment.sent._at).format('MM/DD/YYYY')),
      });
    }
  }
  // amount, sentDate, Vendor Name, Vendor ID, ...customFields
);

export default selectors_paymentDownloadTemplate;

