export default /* GraphQL */`
type Correspondence {
    correspondenceID: ID!
    correspondenceDate: String
    correspondenceStartDate: String
    correspondenceType: CorrespondenceType
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
    createCorrespondence(input: CreateICorrespondencenput!): Correspondence
    deleteCorrespondence(correspondenceID: ID!): Correspondence
    updateCorrespondence(input: UpdateICorrespondencenput!): Correspondence
    addReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
    removeReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
    addSent(correspondenceID: ID!, sentID: ID!): Correspondence
    removeSent(correspondenceID: ID!, sentID: ID!): Correspondence
}

input CreateICorrespondencenput {
    correspondenceType: CorrespondenceType!
    correspondenceDate: String
    correspondenceStartDate: String
}

input UpdateICorrespondencenput {
    correspondenceID: ID!
    updatedCorrespondenceDate: String
    updatedCorrespondenceStartDate: String
    updatedCorrespondenceType: CorrespondenceType
}

enum CorrespondenceType {
    LETTER
}
`