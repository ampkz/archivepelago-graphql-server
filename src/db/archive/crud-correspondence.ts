import { NodeType } from '../../_helpers/nodes';
import { Correspondence } from '../../archive/correspondence';
import { convertArchiveDateToDateString, convertDateStringToArchiveDate } from '../../archive/date';
import { Correspondence as GqlCorrespondence, UpdateCorrespondenceInput, CreateCorrespondenceInput } from '../../generated/graphql';
import { createNode, deleteNode, getNode, getNodes, removeProperties, updateNode } from '../utils/crud';

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | null> {
	const matchedNode = await getNode(NodeType.CORRESPONDENCE, ['correspondenceID: $correspondenceID'], { correspondenceID });

	if (!!matchedNode) {
		if (!!matchedNode.correspondenceDate) matchedNode.correspondenceDate = convertDateStringToArchiveDate(matchedNode.correspondenceDate);
		if (!!matchedNode.correspondenceEndDate)
			matchedNode.correspondenceEndDate = convertDateStringToArchiveDate(matchedNode.correspondenceEndDate);
	}

	return matchedNode;
}

export async function createCorrespondence(correspondence: CreateCorrespondenceInput): Promise<Correspondence | null> {
	const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), {
		...correspondence,
		correspondenceDate: convertArchiveDateToDateString(correspondence.correspondenceDate),
		correspondenceEndDate: convertArchiveDateToDateString(correspondence.correspondenceEndDate),
	});

	if (!!createdCorrespondence) {
		if (!!createdCorrespondence.correspondenceDate)
			createdCorrespondence.correspondenceDate = convertDateStringToArchiveDate(createdCorrespondence.correspondenceDate);
		if (!!createdCorrespondence.correspondenceEndDate)
			createdCorrespondence.correspondenceEndDate = convertDateStringToArchiveDate(createdCorrespondence.correspondenceEndDate);
	}

	return createdCorrespondence;
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | null> {
	const deletedCorrespondence = await deleteNode(NodeType.CORRESPONDENCE, ['correspondenceID: $correspondenceID'], { correspondenceID });

	if (!!deletedCorrespondence) {
		if (!!deletedCorrespondence.correspondenceDate)
			deletedCorrespondence.correspondenceDate = convertDateStringToArchiveDate(deletedCorrespondence.correspondenceDate);
		if (!!deletedCorrespondence.correspondenceEndDate)
			deletedCorrespondence.correspondenceEndDate = convertDateStringToArchiveDate(deletedCorrespondence.correspondenceEndDate);
	}

	return deletedCorrespondence;
}

export async function updateCorrespondence(updatedCorrespondence: UpdateCorrespondenceInput): Promise<Correspondence | null> {
	const anythingToUpdate = updatedCorrespondenceToProps(updatedCorrespondence);
	let matchedCorrespondence;

	if (anythingToUpdate.length > 0) {
		matchedCorrespondence = await updateNode(NodeType.CORRESPONDENCE, 'c', ['correspondenceID: $correspondenceID'], anythingToUpdate, {
			...updatedCorrespondence,
			updatedCorrespondenceDate: convertArchiveDateToDateString(updatedCorrespondence.updatedCorrespondenceDate),
			updatedCorrespondenceEndDate: convertArchiveDateToDateString(updatedCorrespondence.updatedCorrespondenceEndDate),
		});
	}

	const removedProps = updatedCorrespondenceRemovedProps(updatedCorrespondence);
	if (removedProps.length > 0) {
		matchedCorrespondence = await removeProperties(NodeType.CORRESPONDENCE, 'c', ['correspondenceID: $correspondenceID'], removedProps, {
			correspondenceID: updatedCorrespondence.correspondenceID,
		});
	}

	if (!!matchedCorrespondence) {
		if (!!matchedCorrespondence.correspondenceDate)
			matchedCorrespondence.correspondenceDate = convertDateStringToArchiveDate(matchedCorrespondence?.correspondenceDate);
		if (!!matchedCorrespondence.correspondenceEndDate)
			matchedCorrespondence.correspondenceEndDate = convertDateStringToArchiveDate(matchedCorrespondence?.correspondenceEndDate);
	}

	return matchedCorrespondence;
}

export async function getCorrespondences(): Promise<Correspondence[]> {
	const correspondences: Correspondence[] = [];

	const matchedCorrespondences = await getNodes(NodeType.CORRESPONDENCE);

	matchedCorrespondences.map((rawCorrespondence: any) => {
		if (!!rawCorrespondence.correspondenceDate)
			rawCorrespondence.correspondenceDate = convertDateStringToArchiveDate(rawCorrespondence.correspondenceDate);
		if (!!rawCorrespondence.correspondenceEndDate)
			rawCorrespondence.correspondenceEndDate = convertDateStringToArchiveDate(rawCorrespondence.correspondenceEndDate);

		correspondences.push(new Correspondence(rawCorrespondence));
	});

	return correspondences;
}

function prepCorrespondenceProps(correspondence: CreateCorrespondenceInput): string[] {
	const props: string[] = [`correspondenceID:apoc.create.uuid()`];

	props.push('correspondenceType: $correspondenceType');

	if (correspondence.correspondenceDate) props.push('correspondenceDate: $correspondenceDate');
	if (correspondence.correspondenceEndDate) props.push('correspondenceEndDate: $correspondenceEndDate');

	return props;
}

function updatedCorrespondenceToProps(updatedCorrespondence: UpdateCorrespondenceInput): string[] {
	const props: string[] = [];

	if (!!updatedCorrespondence.updatedCorrespondenceDate) props.push('c.correspondenceDate = $updatedCorrespondenceDate');
	if (!!updatedCorrespondence.updatedCorrespondenceEndDate) props.push('c.correspondenceEndDate = $updatedCorrespondenceEndDate');
	if (!!updatedCorrespondence.updatedCorrespondenceType) props.push('c.correspondenceType = $updatedCorrespondenceType');

	return props;
}

function updatedCorrespondenceRemovedProps(updatedCorrespondence: UpdateCorrespondenceInput): string[] {
	const removedProps: string[] = [];

	if (!updatedCorrespondence.updatedCorrespondenceDate) removedProps.push('c.correspondenceDate');
	if (!updatedCorrespondence.updatedCorrespondenceEndDate) removedProps.push('c.correspondenceEndDate');

	return removedProps;
}
