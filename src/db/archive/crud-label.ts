import { NodeType } from '../../_helpers/nodes';
import { Label } from '../../archive/label';
import { Label as GglLabel, UpdateLabelInput as IUpdatedLabel, LabelType } from '../../generated/graphql';
import { createNode, deleteNode, getNode, getNodes, updateNode } from '../utils/crud';

export async function getLabel(name: string): Promise<Label | null> {
	const matchedNode: object | null = await getNode(NodeType.LABEL, ['name: $name'], { name });

	return matchedNode as Label;
}

export async function createLabel(label: GglLabel): Promise<Label | null> {
	const createdLabel: object | null = await createNode(NodeType.LABEL, ['name: $name', 'type: $type'], label);

	return createdLabel as Label;
}

export async function deleteLabel(name: string): Promise<Label | null> {
	const deletedLabel: object | null = await deleteNode(NodeType.LABEL, ['name: $name'], { name });

	return deletedLabel as Label;
}

export async function updateLabel(updatedLabel: IUpdatedLabel): Promise<Label | null> {
	const matchedLabel: object | null = await updateNode(NodeType.LABEL, 'l', ['name: $name'], updatedLabelToProps(updatedLabel), updatedLabel);

	return matchedLabel as Label;
}

export async function getLabels(): Promise<Label[]> {
	const labels: Label[] = [];

	const matchedLabels = await getNodes(NodeType.LABEL);

	matchedLabels.map(label => {
		labels.push(new Label(label));
	});

	return labels;
}

function updatedLabelToProps(updatedLabel: IUpdatedLabel): string[] {
	const props: string[] = [];

	if (updatedLabel.updatedName) props.push('l.name = $updatedName');
	if (updatedLabel.updatedType) props.push('l.type = $updatedType');

	return props;
}
