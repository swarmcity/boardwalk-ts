// Store
import { useRef, useState } from 'preact/hooks'
import { useStore } from '../../store'
import cancel from '../../assets/imgs/cancel.svg?url'
import checkMarkBlue from '../../assets/imgs/checkMarkBlue.svg?url'
import iconRotate from '../../assets/imgs/iconRotate.svg?url'
import { blobToDataURL } from '../../lib/canvas'
import { Cropper, CropperRef } from '../cropper'
import { JSXInternal } from 'preact/src/jsx'

interface Props {
	children: JSX.Element | JSX.Element[]
}

export const CreateAvatar = ({ children }: Props) => {
	const [avatar, setAvatar] = useState<string>('')
	const cropperRef = useRef<CropperRef>(null)

	const [shown, setShown] = useState<boolean>()

	const [profile, setProfile] = useStore.profile()

	const onFileChange = async (
		event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
	) => {
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
			class="bg-gray-lt set-avatar"
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
			<div class="container">
				<main class="flex-space">
					<header>
						<div class="canvas">
							<Cropper ref={cropperRef} wrapperClass="mb-8" image={avatar} />
							<a
								role="button"
								onClick={() => cropperRef.current?.rotateCW()}
								class="rotate"
							>
								<img src={iconRotate} />
							</a>
						</div>
						<p>Scroll to zoom - drag to move</p>
					</header>
					<div class="btns">
						<a
							class="close"
							onClick={(e) => {
								e.stopPropagation()
								setAvatar('')
								setShown(false)
							}}
						>
							<img src={cancel} />
						</a>
						<a
							class="btn-icon"
							onClick={(e) => {
								e.stopPropagation()
								updateAvatar().then((newAvatar) =>
									setProfile({ ...profile, avatar: newAvatar })
								)
								setShown(false)
							}}
						>
							<img src={checkMarkBlue} />
						</a>
					</div>
				</main>
				<div class="bottomlink">
					<label
						class="link"
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
