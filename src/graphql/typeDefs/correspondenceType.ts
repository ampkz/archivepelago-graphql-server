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
}

input CreateCorrespondenceInput {
    fromID: ID
    toID: ID
    correspondenceDate: String
    correspondenceType: String
}
`