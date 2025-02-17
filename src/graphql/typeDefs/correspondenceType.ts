export default /* GraphQL */`
type Correspondence {
    correspondenceID: ID!
    correspondenceDate: String
    correspondenceStartDate: String
    correspondenceType: String
    from: [Person]
    to: [Person]
}

type Query {
    correspondence(correspondenceID: ID!): Correspondence
    correspondences: [Correspondence]
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
    correspondenceType: String!
    correspondenceDate: String
    correspondenceStartDate: String
}

input UpdateCorrespondenceInput {
    correspondenceID: ID!
    updatedCorrespondenceDate: String
    updatedCorrespondenceStartDate: String
    updatedCorrespondenceType: String
}
`