import { NodeType } from '../../_helpers/nodes';
import { Correspondence, ICorrespondence, IUpdatedCorrespondence } from '../../archive/correspondence';
import { createNode, deleteNode, getNode, getNodes, removeProperties, updateNode } from '../utils/crud';

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | null> {
	const matchedNode = await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });
	return matchedNode;
}

export async function createCorrespondence(correspondence: ICorrespondence): Promise<Correspondence | null> {
	const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence);

	return createdCorrespondence;
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | null> {
	const deletedCorrespondence = await deleteNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });

	return deletedCorrespondence;
}

export async function updateCorrespondence(updatedCorrespondence: IUpdatedCorrespondence): Promise<Correspondence | null> {
	const anythingToUpdate = updatedCorrespondenceToProps(updatedCorrespondence);
	let matchedCorrespondence;

	if (anythingToUpdate.length > 0) {
		matchedCorrespondence = await updateNode(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', anythingToUpdate, updatedCorrespondence);
	}

	const removedProps = updatedCorrespondenceRemovedProps(updatedCorrespondence);
	if (removedProps.length > 0) {
		matchedCorrespondence = await removeProperties(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', removedProps, {
			correspondenceID: updatedCorrespondence.correspondenceID,
		});
	}

	return matchedCorrespondence;
}

export async function getCorrespondences(): Promise<Correspondence[]> {
	const correspondences: Correspondence[] = [];

	const matchedCorrespondences = await getNodes(NodeType.CORRESPONDENCE);

	matchedCorrespondences.map((rawCorrespondence: any) => {
		correspondences.push(new Correspondence(rawCorrespondence));
	});

	return correspondences;
}

function prepCorrespondenceProps(correspondence: ICorrespondence): string[] {
	const props: string[] = [`correspondenceID:apoc.create.uuid()`];

	props.push('correspondenceType: $correspondenceType');

	if (correspondence.correspondenceDate) props.push('correspondenceDate: $correspondenceDate');
	if (correspondence.correspondenceEndDate) props.push('correspondenceEndDate: $correspondenceEndDate');

	return props;
}

function updatedCorrespondenceToProps(updatedCorrespondence: IUpdatedCorrespondence): string[] {
	const props: string[] = [];

	if (updatedCorrespondence.updatedCorrespondenceDate !== null && updatedCorrespondence.updatedCorrespondenceDate !== null)
		props.push('c.correspondenceDate = $updatedCorrespondenceDate');
	if (updatedCorrespondence.updatedCorrespondenceEndDate !== null && updatedCorrespondence.updatedCorrespondenceEndDate !== null)
		props.push('c.correspondenceEndDate = $updatedCorrespondenceEndDate');
	if (updatedCorrespondence.updatedCorrespondenceType !== null) props.push('c.correspondenceType = $updatedCorrespondenceType');

	return props;
}

function updatedCorrespondenceRemovedProps(updatedCorrespondence: IUpdatedCorrespondence): string[] {
	const removedProps: string[] = [];

	if (updatedCorrespondence.updatedCorrespondenceDate === null) removedProps.push('c.correspondenceDate');
	if (updatedCorrespondence.updatedCorrespondenceEndDate === null) removedProps.push('c.correspondenceEndDate');

	return removedProps;
}
