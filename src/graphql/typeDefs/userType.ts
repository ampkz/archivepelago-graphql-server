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
`