export default `
  interface Response {
    success: Boolean!
    message: String!
    code: String
    errorCode: String
  }

  interface Error {
    message: String!
    code: String
  }
`;
