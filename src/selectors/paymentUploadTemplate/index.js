import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

/**
 * @typedef {import('../../../src/components/entities/customFileParser/types').TemplateField[]} TemplateFields
 */

const selectors_paymentUploadTemplate = createSelector(

  (state) => Selectors.integrations(state).erpIntegration.provider,
  (state) => state.account.paymentPipelinePreferences.data.item.uploadTemplate,

  (erpProvider, uploadTemplate) => {
    if (uploadTemplate) {
      return {
        fields: _formatFields(uploadTemplate),
        scrubber: _scrubberFactory(uploadTemplate),
        fieldArrays: formatFieldArrays(uploadTemplate),
      };
    }
    if (erpProvider === 'ADVANTAGE') { return advantageTemplateMap; }
    return defaultTemplateMap;
  }

);

export default selectors_paymentUploadTemplate;

// Internal Helper Functions ...
const advantageTemplateMap = {
  fields: {
    'Payment Number': 'paymentNumber', // Custom Filed only will be Check Number field (part of on-boarding to make required)
    'Vendor ID': 'vendorName', // Custom Field only
    'Vendor Name': '', // Ignore
    'Payment Amount': 'amount', // Required
    'Invoice Number': 'invoiceNumber', // Global vendor payment field and custom field - Required for payment, (single or colon separated)
    'Invoice Date': '', // Ignore
    'Invoice Description': 'memo', // Custom Field only / Memo (only if all are the same or just 1)
    'Invoice Amount': '', // Ignore
    'Discount Credits': '', // Ignore
    'Net Invoice Amount': '', // Ignore
  },
  scrubber: (items = []) => {
    const data = (items)
      .map((item) =>
      // make it so that the invoice number of like items are joined together by a ':';
      ({
        ...item,
        'Invoice Number': items
          .filter((otherItem) => item['Payment Number'] === otherItem['Payment Number'])
          .reduce((acc, curr) => (curr['Invoice Number'] ? `${acc}${acc && ':' || ''}${curr['Invoice Number']}` : acc), ''),
      }))
      .filter((item, index) =>
        // We may be able to replace the scrubber by saying "unique" ??
        !item['Payment Number']
        || !items.some((otherItem, otherIndex) => otherItem['Payment Number'] === item['Payment Number'] && otherIndex > index));
    return data;
  },

};

const defaultTemplateMap = {
  fields: {
    // Every Payment Needs
    Amount: 'amount',
    'Vendor Id': 'vendorName',
    'Vendor Name': 'vendorName',
    'Payment Method': 'method',
    'Override Fee Rules': 'overrideFeeRules',
  },
  scrubber: (items) => items,
};

/**
 * @param {TemplateFields} template
 */
const _formatFields = (template = []) => {
  const fields = template.reduce((acc, { fieldName, pcField }) => {
    acc[fieldName] = pcField || '';
    return acc;
  }, {});
  return fields;
};

/**
 * @param {TemplateFields} template
 */
const formatFieldArrays = (template = []) => {
  const fields = template.reduce((acc, { fieldName, pcField }) => {
    if (!acc[fieldName]) {
      acc[fieldName] = [];
    }

    acc[fieldName].push(pcField || '');
    return acc;
  }, {});

  return fields;
};

/**
 *
 * @param {TemplateFields} template
 * @returns
 */
const _scrubberFactory = (template = []) => (items) => {
  /** @type {Record<TemplateFields[number]['fieldName'], TemplateFields[number]>} */
  const templateByFieldName = template.reduce((acc, field) => {
    if (field.fieldName) {
      acc[field.fieldName] = field;
    }
    return acc;
  }, {});

  /** @type {Record<TemplateFields[number]['lineItemField'], TemplateFields[number]>} */
  const templateByLineItemFields = template.reduce((acc, field) => {
    if (field.lineItemField) {
      acc[field.lineItemField] = field;
    }
    return acc;
  }, {});

  const formattedItems = items.map((item) => Object.keys(item).reduce((acc, key) => {
    if (_try(() => templateByFieldName[key].format === 'cents' && item[key])) {
      acc[key] = _formatDollars(item[key]);
    } else if (_try(() => templateByFieldName[key].format === 'caps' && item[key])) {
      acc[key] = item[key].toLowerCase();
    } else if (_try(() => templateByFieldName[key].format === 'negativeParens' && item[key])) {
      acc[key] = _formatNegativeParens(item[key]);
    } else if (templateByFieldName[key] && templateByFieldName[key].alias) {
      const aliasKey = templateByFieldName[key].alias.split('alias-')[1];
      acc[aliasKey] = item[key];
      acc[key] = item[key];
    } else {
      acc[key] = item[key];
    }
    return acc;
  }, {}));

  if (templateByLineItemFields.key) {
    const key = templateByLineItemFields.key.fieldName;
    const data = formattedItems.reduce((acc, item) => {
      const lineItem = Object.keys(templateByLineItemFields).reduce((bcc, lineItemFieldName) => {
        if (lineItemFieldName !== 'key') {
          bcc[lineItemFieldName] = item[templateByLineItemFields[lineItemFieldName].fieldName];
        }

        return bcc;
      }, {});

      if (!acc[item[key]]) {
        acc[item[key]] = { ...item, lineItems: [lineItem] };
      } else { acc[item[key]].lineItems.push(lineItem); }
      return acc;
    }, {});
    return Object.values(data);
  }

  return formattedItems;
};

const _formatNegativeParens = (amount) => {
  if (amount[0] === '(' && amount[amount.length - 1] === ')') { return `-${amount.slice(1, -1)}`; }
  return amount;
};

const _formatDollars = (amount) => {
  const formatted = Utils.addDollars([amount / 100]);
  return formatted;
};

