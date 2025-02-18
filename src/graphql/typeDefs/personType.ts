export default /* GraphQL */`
type Person {
    id: ID!
    firstName: String
    lastName: String
    secondName: String
    birthDate: String
    deathDate: String
    labels: [Label]
    sentCorrespondences: [Correspondence]
    receivedCorrespondences: [Correspondence]
}

type Query {
    person(id: ID!): Person
    persons: [Person]
}

type Mutation {
    createPerson(input: CreateIPersonnput!): Person
    updatePerson(input: UpdateIPersonnput!): Person
    deletePerson(id: ID!): Person
    createLabelRelationship(personID: ID!, labelName: ID!): Person
    deleteLabelRelationship(personID: ID!, labelName: ID!): Person
}

input CreateIPersonnput {
    firstName: String
    lastName: String
    secondName: String
    birthDate: String
    deathDate: String
}

input UpdateIPersonnput {
    id: ID!
    updatedFirstName: String
    updatedLastName: String
    updatedSecondName: String
    updatedBirthDate: String
    updatedDeathDate: String
}
`