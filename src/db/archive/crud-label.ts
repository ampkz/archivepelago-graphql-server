import { NodeType } from "../../_helpers/nodes";
import { Label, ILabel, IUpdatedLabel } from "../../archive/label";
import { createNode, deleteNode, getNode, getNodes, updateNode } from "../utils/crud";

export async function getLabel(name: string): Promise<Label | undefined> {
    const matchedNode: object | undefined = await getNode(NodeType.LABEL, 'name: $name', { name });

    return matchedNode as Label;
}

export async function createLabel(label: ILabel): Promise<Label | undefined> {
    const createdLabel: object | undefined = await createNode(NodeType.LABEL, ['name: $name', 'type: $type'], label);

    return createdLabel as Label;
}

export async function deleteLabel(name: string): Promise<Label | undefined> {
    const deletedLabel: object | undefined = await deleteNode(NodeType.LABEL, 'name: $name', { name });

    return deletedLabel as Label;
}

export async function updateLabel(name: string, updatedLabel: IUpdatedLabel): Promise<Label | undefined> {
    const matchedLabel: object | undefined = await updateNode(NodeType.LABEL, 'l', 'name', updatedLabelToProps(updatedLabel), {name, ...updatedLabel});

    return matchedLabel as Label;
}

export async function getLabels(): Promise<Label[]>{
    const labels: Label[] = [];

    const matchedLabels = await getNodes(NodeType.LABEL);

    matchedLabels.map((label) => {
        labels.push(new Label(label));
    })

    return labels;
}

function updatedLabelToProps(updatedLabel: IUpdatedLabel): string[] {
    const props: string[] = [];

    if(updatedLabel.updatedName) props.push('l.name = $updatedName');
    if(updatedLabel.updatedType) props.push('l.type = $updatedType');

    return props;
}
