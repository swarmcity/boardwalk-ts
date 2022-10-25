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
	return crypto.subtle.importKey('jwk', key, algorithm, false, [])
}

export const exportRawKey = async (key: CryptoKey) => {
	return new Uint8Array(await crypto.subtle.exportKey('raw', key))
}

export const jsonToRaw = async (key: JsonWebKey) => {
	return exportRawKey(await importKey(key))
}
