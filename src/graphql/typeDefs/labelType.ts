export default /* GraphQL */`
type Label {
    name: ID!
    type: LabelType!
    persons: [Person]
}

type Query {
    label(name: ID!): Label
    labels: [Label]
}

type Mutation {
    createLabel(input: CreateILabelnput!): Label
    updateLabel(input: UpdateILabelnput!): Label
    deleteLabel(name: ID!): Label
}

input CreateILabelnput {
    name: ID!
    type: LabelType!
}

input UpdateILabelnput {
    name: ID!
    updatedName: ID
    updatedType: LabelType
}

enum LabelType {
    SEXUALITY
    NATIONALITY
    PROFESSION
}
`