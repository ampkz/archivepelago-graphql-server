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
    createUser(input: CreateUserInput): User
}

input CreateUserInput {
    email: String!
    firstName: String!
    lastName: String!
    secondName: String
    auth: String!
}
`