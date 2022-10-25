export const generateKey = async () => {
	return await crypto.subtle.generateKey(
		{
			name: 'ECDH',
			namedCurve: 'P-256',
		},
		true,
		['deriveKey', 'deriveBits']
	)
}

export const deriveKey = async (
	privateKey: CryptoKey,
	publicKey: CryptoKey
) => {
	return await crypto.subtle.deriveKey(
		{
			name: 'ECDH',
			public: publicKey,
		},
		privateKey,
		{
			name: 'AES-CBC',
			length: 128,
		},
		true,
		['encrypt', 'decrypt']
	)
}

export const importKey = async (key: JsonWebKey) => {
	return await crypto.subtle.importKey(
		'jwk',
		key,
		{ name: 'ECDH', namedCurve: 'P-256' },
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
