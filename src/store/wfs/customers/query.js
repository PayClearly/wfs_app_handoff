const query = `
  query customerAndTails  {
    myCustomers {
      customerName
      customerNumber
      customerStatus
      tails {
        edges {
          node {
            tailNumber
            resourceId     
          }
        }
      }
      sites {
        siteName
        siteNumber
      }
    }
  }
`;

module.exports = query;
