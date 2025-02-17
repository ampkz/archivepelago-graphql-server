export default /* GraphQL */`
type Correspondence {
    correspondenceID: ID!
    correspondenceDate: String
    correspondenceType: String
    from: [Person]
    to: [Person]
}

type Query {
    correspondence(correspondenceID: ID!): Correspondence
    from: [Person]
    to: [Person]
}

type Mutation {
    createCorrespondence(input: CreateCorrespondenceInput!): Correspondence
    deleteCorrespondence(correspondenceID: ID!): Correspondence
    updateCorrespondence(input: UpdateCorrespondenceInput!): Correspondence
    addReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
    removeReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
    addSent(correspondenceID: ID!, sentID: ID!): Correspondence
    removeSent(correspondenceID: ID!, sentID: ID!): Correspondence
}

input CreateCorrespondenceInput {
    correspondenceDate: String
    correspondenceType: String
}

input UpdateCorrespondenceInput {
    correspondenceID: ID!
    updatedCorrespondenceDate: String
    updatedCorrespondenceType: String
}
`