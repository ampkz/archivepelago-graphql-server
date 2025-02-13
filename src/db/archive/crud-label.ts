import { Label, UpdatedLabelI } from "../../archive/label";
import { createNode, deleteNode, getNode, updateNode } from "../utils/crud";

export async function getLabel(name: string): Promise<Label | undefined> {
    const matchedNode: object | undefined = await getNode('Label', 'name: $name', { name });

    return matchedNode as Label;
}

export async function createLabel(name: string): Promise<Label | undefined> {
    const createdLabel: object | undefined = await createNode('Label', ['name: $name'], { name });

    return createdLabel as Label;
}

export async function deleteLabel(name: string): Promise<Label | undefined> {
    const deletedLabel: object | undefined = await deleteNode('Label', 'name: $name', { name });

    return deletedLabel as Label;
}

export async function updateLabel(name: string, updatedLabel: UpdatedLabelI): Promise<Label | undefined> {
    const matchedLabel: object | undefined = await updateNode('Label', 'l', 'name', updatedLabelToProps(), {name, ...updatedLabel});

    return matchedLabel as Label;
}

function updatedLabelToProps(): string[] {
    const props: string[] = [];

    props.push('l.name = $updatedName');

    return props;
}
