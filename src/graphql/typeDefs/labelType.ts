export default /* GraphQL */`
type Label {
    name: ID!
}

type Query {
    label(name: ID!): Label
}

type Mutation {
    createLabel(input: CreateLabelInput!): Label
    updateLabel(input: UpdateLabelInput!): Label
    deleteLabel(name: ID!): Label
}

input CreateLabelInput {
    name: ID!
}

input UpdateLabelInput {
    name: ID!
    updatedName: ID!
}
`