export default /* GraphQL */`
type Correspondence {
    correspondenceID: ID!
    fromID: ID
    toID: ID
    correspondenceDate: String
    correspondenceType: String
}

type Query {
    correspondence(correspondenceID: ID!): Correspondence
}

type Mutation {
    createCorrespondence(input: CreateCorrespondenceInput!): Correspondence
    deleteCorrespondence(correspondenceID: ID!): Correspondence
}

input CreateCorrespondenceInput {
    fromID: ID
    toID: ID
    correspondenceDate: String
    correspondenceType: String
}
`