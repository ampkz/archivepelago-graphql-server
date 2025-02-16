export default /* GraphQL */`
type Correspondence {
    correspondenceID: ID!
    fromID: [ID]
    toID: [ID]
    correspondenceDate: String
    correspondenceType: String
}

type Query {
    correspondence(correspondenceID: ID!): Correspondence
}

type Mutation {
    createCorrespondence(input: CreateCorrespondenceInput!): Correspondence
    deleteCorrespondence(correspondenceID: ID!): Correspondence
    updateCorrespondence(input: UpdateCorrespondenceInput!): Correspondence
}

input CreateCorrespondenceInput {
    fromID: [ID]
    toID: [ID]
    correspondenceDate: String
    correspondenceType: String
}

input UpdateCorrespondenceInput {
    correspondenceID: ID!
    updatedFromID: [ID]
    updatedToID: [ID]
    updatedCorrespondenceDate: String
    updatedCorrespondenceType: String
}
`