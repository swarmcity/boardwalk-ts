import { useCallback, useImperativeHandle, useState, forwardRef } from 'react'
import Crop from 'react-easy-crop'
import classes from './cropper.module.css'

// Lib
import { getCroppedImage } from '../lib/canvas'

// Types
import type { Point, Area } from 'react-easy-crop/types'
import type { CropperProps as CropProps } from 'react-easy-crop'
import type { Ref } from 'react'

type CropperProps = Pick<CropProps, 'image'>

export type CropperRef = {
	getImage: () => Promise<string>
	rotateCW: () => void
}

const CropperInner = (
	{ image, ...props }: CropperProps,
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
		<div style={{ width: 250, height: 250, position: 'relative' }}>
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
				classes={{ containerClassName: classes.container }}
			/>
		</div>
	)
}

export const Cropper = forwardRef<CropperRef, CropperProps>(CropperInner)
