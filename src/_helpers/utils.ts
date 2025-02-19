export function removedValues(original: string[], updated: string[]): string[] {
	const removedValues: string[] = [];

	original.map((value: string) => {
		if (!updated.includes(value)) removedValues.push(value);
	});

	return removedValues;
}

export function addedValues(original: string[], updated: string[]): string[] {
	const addedValues: string[] = [];

	updated.map((value: string) => {
		if (!original.includes(value)) addedValues.push(value);
	});

	return addedValues;
}
