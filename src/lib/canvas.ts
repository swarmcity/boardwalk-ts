import type { Area } from 'react-easy-crop'

export const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image()
		image.addEventListener('load', () => resolve(image))
		image.addEventListener('error', (error) => reject(error))
		image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
		image.src = url
	})

export function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180
}

export function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation)

	return {
		width:
			Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height:
			Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	}
}

export async function getCroppedImage(
	imageSrc: string,
	pixelCrop: Area,
	rotation = 0,
	flip = { horizontal: false, vertical: false }
): Promise<string> {
	const image = await createImage(imageSrc)
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	if (!ctx) {
		throw new Error()
	}

	const rotRad = getRadianAngle(rotation)
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
		image.width,
		image.height,
		rotation
	)

	canvas.width = bBoxWidth
	canvas.height = bBoxHeight

	ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
	ctx.rotate(rotRad)
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
	ctx.translate(-image.width / 2, -image.height / 2)
	ctx.drawImage(image, 0, 0)

	const data = ctx.getImageData(
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height
	)

	canvas.width = pixelCrop.width
	canvas.height = pixelCrop.height

	ctx.putImageData(data, 0, 0)

	return canvas.toDataURL()
}

export async function getRotatedImage(
	imageSrc: string,
	rotation = 0
): Promise<string> {
	const image = await createImage(imageSrc)
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	if (!ctx) {
		throw new Error()
	}

	const orientationChanged =
		rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270
	if (orientationChanged) {
		canvas.width = image.height
		canvas.height = image.width
	} else {
		canvas.width = image.width
		canvas.height = image.height
	}

	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.rotate((rotation * Math.PI) / 180)
	ctx.drawImage(image, -image.width / 2, -image.height / 2)

	return canvas.toDataURL()
}

export function blobToDataURL(blob: Blob): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.addEventListener(
			'load',
			() => resolve(reader.result as string),
			false
		)
		reader.readAsDataURL(blob)
	})
}
