const query = `
  query documentFileContents($resourceId: ID!) {
    documentFileContents(resourceId: $resourceId) {
      content,
      fileName,
    }
  }
`;

module.exports = query;
