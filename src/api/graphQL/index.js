import axios from 'axios';

const GraphQL = (auth, options = {}) => {
  const { headers, baseURL } = options;
  headers.Authorization = `Bearer ${auth}`;
  headers['content-type'] = options.contentType || 'application/json';
  const client = axios.create({
    baseURL,
    headers,
  });

  return {
    query: _query(client),
  };
};

const _query = (client) => {
  return (query, variables) => {
    return client.post('', JSON.stringify({ query, variables }));
  };
};

export default GraphQL;
