export default /* GraphQL */ `
	type Correspondence {
		correspondenceID: ID!
		correspondenceDate: ArchiveDate
		correspondenceEndDate: ArchiveDate
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
		createCorrespondence(input: CreateCorrespondenceInput!): Correspondence
		deleteCorrespondence(correspondenceID: ID!): Correspondence
		updateCorrespondence(input: UpdateCorrespondenceInput!): Correspondence
		addReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
		removeReceived(correspondenceID: ID!, receivedID: ID!): Correspondence
		addSent(correspondenceID: ID!, sentID: ID!): Correspondence
		removeSent(correspondenceID: ID!, sentID: ID!): Correspondence
	}

	input CreateCorrespondenceInput {
		correspondenceType: CorrespondenceType!
		correspondenceDate: ArchiveDateInput
		correspondenceEndDate: ArchiveDateInput
	}

	input UpdateCorrespondenceInput {
		correspondenceID: ID!
		updatedCorrespondenceDate: ArchiveDateInput
		updatedCorrespondenceEndDate: ArchiveDateInput
		updatedCorrespondenceType: CorrespondenceType
	}

	enum CorrespondenceType {
		LETTER
	}

	type ArchiveDate {
		year: String!
		month: String
		day: String
	}

	input ArchiveDateInput {
		year: String!
		month: String
		day: String
	}
`;
