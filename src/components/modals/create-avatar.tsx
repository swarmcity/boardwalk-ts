// Store
import { useRef, useState } from 'react'
import { setStore } from '../../store'
import cancel from '../../assets/imgs/cancel.svg?url'
import checkMarkBlue from '../../assets/imgs/checkMarkBlue.svg?url'
import iconRotate from '../../assets/imgs/iconRotate.svg?url'
import { blobToDataURL } from '../../lib/canvas'
import { Cropper, CropperRef } from '../cropper'

// Types
import type { ChangeEvent } from 'react'

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
				height: '100vh',
				zIndex: 100,
				position: 'fixed',
				paddingTop: 137,
				left: 0,
				top: 0,
			}}
		>
			<div className="container">
				<main className="flex-space">
					<header>
						<div className="canvas">
							<Cropper ref={cropperRef} wrapperClass="mb-8" image={avatar} />
							<a
								role="button"
								onClick={() => cropperRef.current?.rotateCW()}
								className="rotate"
							>
								<img src={iconRotate} />
							</a>
						</div>
						<p>Scroll to zoom - drag to move</p>
					</header>
					<div className="btns">
						<a
							className="close"
							onClick={(e) => {
								e.stopPropagation()
								setAvatar('')
								setShown(false)
							}}
						>
							<img src={cancel} />
						</a>
						<a
							className="btn-icon"
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
						>
							<img src={checkMarkBlue} />
						</a>
					</div>
				</main>
				<div className="bottomlink">
					<label
						className="link"
						style={{
							color: '#229FFF',
							textDecoration: '2px underline dotted #979797',
							fontWeight: 'bold',
						}}
					>
						<input
							type="file"
							onChange={onFileChange}
							accept="image/*"
							hidden
						/>
						choose another file
					</label>
				</div>
			</div>
		</div>
	)
}
