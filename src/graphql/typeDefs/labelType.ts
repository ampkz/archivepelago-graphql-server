export default /* GraphQL */`
type Label {
    name: ID!
    type: String!
    persons: [Person]
}

type Query {
    label(name: ID!): Label
    labels: [Label]
}

type Mutation {
    createLabel(input: CreateLabelInput!): Label
    updateLabel(input: UpdateLabelInput!): Label
    deleteLabel(name: ID!): Label
}

input CreateLabelInput {
    name: ID!
    type: String!
}

input UpdateLabelInput {
    name: ID!
    updatedName: ID!
    updatedType: String
}
`