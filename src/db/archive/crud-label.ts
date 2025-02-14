import { Label, LabelI, UpdatedLabelI } from "../../archive/label";
import { createNode, deleteNode, getNode, getNodes, updateNode } from "../utils/crud";

export async function getLabel(name: string): Promise<Label | undefined> {
    const matchedNode: object | undefined = await getNode('Label', 'name: $name', { name });

    return matchedNode as Label;
}

export async function createLabel(label: LabelI): Promise<Label | undefined> {
    const createdLabel: object | undefined = await createNode('Label', ['name: $name', 'type: $type'], label);

    return createdLabel as Label;
}

export async function deleteLabel(name: string): Promise<Label | undefined> {
    const deletedLabel: object | undefined = await deleteNode('Label', 'name: $name', { name });

    return deletedLabel as Label;
}

export async function updateLabel(name: string, updatedLabel: UpdatedLabelI): Promise<Label | undefined> {
    const matchedLabel: object | undefined = await updateNode('Label', 'l', 'name', updatedLabelToProps(updatedLabel), {name, ...updatedLabel});

    return matchedLabel as Label;
}

export async function getLabels(): Promise<Label[]>{
    const labels: Label[] = [];

    const matchedLabels = await getNodes('Label');

    matchedLabels.map((label) => {
        labels.push(new Label(label));
    })

    return labels;
}

function updatedLabelToProps(updatedLabel: UpdatedLabelI): string[] {
    const props: string[] = [];

    props.push('l.name = $updatedName');
    if(updatedLabel.updatedType) props.push('l.type = $updatedType');

    return props;
}
