const algorithm = {
	name: 'ECDH',
	namedCurve: 'P-256',
}

export const generateKey = async () => {
	return crypto.subtle.generateKey(algorithm, true, ['deriveKey', 'deriveBits'])
}

export const deriveKey = async (
	privateKey: CryptoKey,
	publicKey: CryptoKey
) => {
	return crypto.subtle.deriveKey(
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
	return crypto.subtle.importKey(
		'jwk',
		key,
		algorithm,
		true,
		(key.key_ops || []) as ReadonlyArray<KeyUsage>
	)
}

export const importRawKey = async (key: BufferSource) => {
	return crypto.subtle.importKey('raw', key, algorithm, true, [])
}

export const exportRawKey = async (key: CryptoKey) => {
	return new Uint8Array(await crypto.subtle.exportKey('raw', key))
}

export const rawToJson = async (key: BufferSource) => {
	return await crypto.subtle.exportKey('jwk', await importRawKey(key))
}

export const jsonToRaw = async (key: JsonWebKey) => {
	return exportRawKey(await importKey(key))
}
