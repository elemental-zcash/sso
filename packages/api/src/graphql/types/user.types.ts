export default `
  scalar Date

  type User {
    id: ID!
    username: String!
    name: String
    joinedOn: Date
    email: String
  }

  type Tokens {
    accessToken: String
    refreshToken: String
  }

  """
  input CreateUserInput {
    id: ID!
    name: String!
  }

  type CreateUserSuccess {
    user: User!
  }
  type CreateUserInputError implements Error {
    message: String!
    code: String
  }
  
  union CreateUserResponse =
    CreateUserSuccess
    | CreateUserInputError
  """

  input SignupInput {
    email: String!
    username: String!
    name: String!
    password: String!
  }

  type SignupSuccess {
    user: User!
    code: String!
  }

  type SignupError implements Error {
    message: String!
    code: String
  }

  union SignupResponse = SignupSuccess | SignupError

  input LoginInput {
    email: String!
    password: String!
  }

  type LoginSuccess {
    user: User!
    code: String!
  }
  type LoginError implements Error {
    message: String!
    code: String
  }

  union LoginResponse = LoginSuccess | LoginError

  type DeleteResponse implements Response {
    success: Boolean!
    message: String!
    code: String
    errorCode: String
  }

  input UpdateUserInput {
    id: ID!
    name: String
  }

  type UpdateUserSuccess {
    user: User!
  }
  type UpdateUserInputError implements Error {
    message: String!
    code: String
  }
  union UpdateUserResponse = UpdateUserSuccess | UpdateUserInputError

  type UserNotFoundError implements Error {
    message: String!
    code: String
  }

  union UserResult = User | UserNotFoundError

  type VerifyUserSuccess {
    success: Boolean
  }
  type VerifyUserError implements Error {
    message: String!
    code: String
  }

  union VerifyUserResponse = VerifyUserSuccess | VerifyUserError

  type ViewerNotFoundError implements Error {
    message: String!
    code: String
  }

  union ViewerResult = User | ViewerNotFoundError

  type Query {
    users: [User]
    user(id: ID!): UserResult
    userByUsername(name: String!): UserResult
    viewer: ViewerResult
  }

  type MockResponse {
    mock: String
  }

  type Mutation {
    """
    createUser(input: CreateUserInput!): CreateUserResponse
    """
    signup(input: SignupInput!): SignupResponse
    login(input: LoginInput!): LoginResponse
    verifyUser(token: String!): VerifyUserResponse
    updateUser(input: UpdateUserInput!): UpdateUserResponse
    deleteUser(id: ID!): DeleteResponse
    verifyEmail(token: String!): MockResponse
    sendVerificationEmail(email: String!): MockResponse
    sendPasswordResetEmail(email: String!): MockResponse

  }
`;
