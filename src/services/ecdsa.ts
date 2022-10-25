export const algorithm = { name: 'ECDSA', namedCurve: 'P-256' }

export const generateKey = async () => {
	return crypto.subtle.generateKey(algorithm, true, ['sign'])
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

export const sign = async (key: CryptoKey, data: BufferSource) => {
	return new Uint8Array(await crypto.subtle.sign(algorithm, key, data))
}
