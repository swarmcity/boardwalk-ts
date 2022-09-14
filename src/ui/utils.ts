export function formatName({
	name,
	address,
}: {
	name?: string
	address: string
}) {
	return (
		name ||
		`${address.substring(0, 6)}...${address.substring(address.length - 4)}`
	)
}
