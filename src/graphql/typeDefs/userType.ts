export default /* GraphQL */`
type User {
    email: String!
    firstName: String!
    lastName: String!
    secondName: String
    auth: String!
}

type Query { 
    user(email: String!): User
}

type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(input: UpdateUserInput!): User
    deleteUser(email: String!): User
}

input CreateUserInput {
    email: String!
    auth: String!
    firstName: String!
    lastName: String!
    password: String!
    secondName: String
}

input UpdateUserInput {
    existingEmail: String
    updatedEmail: String
    auth: String
    firstName: String
    lastName: String
    password: String
    secondName: String
}
`