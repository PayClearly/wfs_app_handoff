/* eslint no-useless-escape:0 */

import createSelector from 'selector';

const PostageOptions = createSelector(
  () => {
    return {
      1: {
        display: 'US First Class Mail $0.50',
      },
      2: {
        display: 'USPS Priority Envelope – 2 Day $9.55',
      },
      3: {
        display: 'USPS Priority + Signature Confirmation ($12.00)',
      },
      4: {
        display: 'Two Day Courier Service with FedEx (FedEx Fee + $10.00)',
      },
      5: {
        display: 'One Day Courier Service with FedEx (FedEx Fee + $10.00)',
      },
      6: {
        display: 'USPS Express Envelope – Overnight $31.98',
      },
      7: {
        display: 'Certified Mail – US First Class Tracking $5.80',
      },
    };
  },
);

export default PostageOptions;
