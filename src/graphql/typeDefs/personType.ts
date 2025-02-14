export default /* GraphQL */`
type Person {
    id: ID!
    firstName: String
    lastName: String
    secondName: String
    birthDate: String
    deathDate: String
    labels: [Label]
}

type Query {
    person(id: ID!): Person
}

type Mutation {
    createPerson(input: CreatePersonInput!): Person
    updatePerson(input: UpdatePersonInput!): Person
    deletePerson(id: ID!): Person
    createLabelRelationship(personID: ID!, labelName: ID!): Person
    deleteLabelRelationship(personID: ID!, labelName: ID!): Person
}

input CreatePersonInput {
    firstName: String
    lastName: String
    secondName: String
    birthDate: String
    deathDate: String
}

input UpdatePersonInput {
    id: ID!
    updatedFirstName: String
    updatedLastName: String
    updatedSecondName: String
    updatedBirthDate: String
    updatedDeathDate: String
}
`