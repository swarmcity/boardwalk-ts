import { useCallback, useImperativeHandle, useState } from 'preact/hooks'
import { forwardRef } from 'preact/compat'
import Crop from 'react-easy-crop'
import cn from 'classnames'

// Lib
import { getCroppedImage } from '../lib/canvas'

// Types
import type { Point, Area } from 'react-easy-crop/types'
import type { CropperProps as CropProps } from 'react-easy-crop'
import type { Ref } from 'preact'

type CropperProps = Pick<CropProps, 'image'> & {
	wrapperClass: string | undefined
}

export type CropperRef = {
	getImage: () => Promise<string>
	rotateCW: () => void
}

const CropperInner = (
	{ wrapperClass, image, ...props }: CropperProps,
	ref: Ref<CropperRef>
) => {
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()

	const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels)
	}, [])

	useImperativeHandle(ref, () => ({
		getImage: async () => {
			if (!image || !croppedAreaPixels) {
				throw new Error()
			}

			return await getCroppedImage(image, croppedAreaPixels, rotation)
		},
		rotateCW: () => setRotation(rotation + 90),
	}))

	return (
		<div class={cn('relative', wrapperClass)} style={{ height: '200px' }}>
			<Crop
				{...props}
				image={image}
				crop={crop}
				rotation={rotation}
				zoom={zoom}
				cropShape="round"
				aspect={1}
				onCropChange={setCrop}
				onCropComplete={onCropComplete}
				onZoomChange={setZoom}
				onRotationChange={setRotation}
			/>
		</div>
	)
}

export const Cropper = forwardRef<CropperRef, CropperProps>(CropperInner)
