// Store
import { useRef, useState } from 'react'
import { setStore } from '../../store'
import { blobToDataURL } from '../../lib/canvas'
import { Cropper, CropperRef } from '../cropper'
import { getColor } from '../../ui/colors'

// Types
import type { ChangeEvent } from 'react'
import { Container } from '../../ui/container'
import { IconButton } from '@swarm-city/ui-library'
import { Typography } from '../../ui/typography'

interface Props {
	children: JSX.Element | JSX.Element[]
}

export const CreateAvatar = ({ children }: Props) => {
	const [avatar, setAvatar] = useState<string>('')
	const [shown, setShown] = useState<boolean>()
	const cropperRef = useRef<CropperRef>(null)

	const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!(event.target instanceof HTMLInputElement)) {
			return
		}

		if (event.target.files?.length) {
			const file = event.target.files[0]
			setAvatar(await blobToDataURL(file))
		}
	}

	const updateAvatar = async (): Promise<string> => {
		if (cropperRef.current) {
			return await cropperRef.current?.getImage()
		}
		throw new Error('cropperRef not set')
	}

	if (!shown) return <div onClick={() => setShown(true)}>{children}</div>

	return (
		<div
			className="bg-gray-lt set-avatar"
			style={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: getColor('grey1'),
				zIndex: 100,
				position: 'fixed',
				paddingTop: 80,
				left: 0,
				top: 0,
			}}
		>
			<Container>
				<main
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<div>
						<Cropper ref={cropperRef} image={avatar} />

						<div style={{ position: 'relative', width: '100%' }}>
							<div style={{ position: 'absolute', right: 0, bottom: 0 }}>
								<IconButton
									variant="rotateImg"
									onClick={() => cropperRef.current?.rotateCW()}
								/>
							</div>
						</div>
					</div>
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginTop: 10 }}
					>
						Scroll to zoom - drag to move
					</Typography>
					<div style={{ marginTop: 55 }}>
						<IconButton
							variant="cancel"
							style={{ marginRight: 10 }}
							onClick={(e) => {
								e.stopPropagation()
								setAvatar('')
								setShown(false)
							}}
						/>

						<IconButton
							variant="confirmAction"
							onClick={(e) => {
								e.stopPropagation()
								updateAvatar().then((newAvatar) => {
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-expect-error
									setStore.profile.avatar(newAvatar)

									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-expect-error
									setStore.profile.lastUpdate(new Date())
								})
								setShown(false)
							}}
						/>
					</div>
					<label style={{ marginTop: 85 }}>
						<input
							type="file"
							onChange={onFileChange}
							accept="image/*"
							hidden
						/>
						<Typography
							variant="small-bold-12"
							color="blue"
							style={{
								cursor: 'pointer',
								borderBottom: `2px dotted ${getColor('blue')}`,
							}}
						>
							choose another file
						</Typography>
					</label>
				</main>
			</Container>
		</div>
	)
}
