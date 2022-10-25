export const generateKey = async () => {
	return await crypto.subtle.generateKey(
		{
			name: 'ECDSA',
			namedCurve: 'P-256',
		},
		true,
		['sign']
	)
}

export const importKey = async (key: JsonWebKey) => {
	return await crypto.subtle.importKey(
		'jwk',
		key,
		{ name: 'ECDSA', namedCurve: 'P-256' },
		false,
		[]
	)
}

export const exportRawKey = async (key: CryptoKey) => {
	return new Uint8Array(await crypto.subtle.exportKey('raw', key))
}

export const jsonToRaw = async (key: JsonWebKey) => {
	const imported = await importKey(key)
	return exportRawKey(imported)
}
