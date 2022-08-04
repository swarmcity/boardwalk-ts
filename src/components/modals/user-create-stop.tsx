import { useState } from 'react'
import { Link } from '@reach/router'

// Components
import { ButtonClose } from '../ButtonClose'

// Assets
import checkMarkRed from '../../assets/imgs/checkMarkRed.svg?url'

// Routes and store
import { LOGIN } from '../../routes'
import { useStore } from '../../store'

export const UserCreateStop = () => {
	const [shown, setShown] = useState<boolean>()
	const [, setProfile] = useStore.profile()

	if (!shown) {
		return <ButtonClose onClick={() => setShown(true)} />
	}

	return (
		<div
			className="bg-danger py-60 stop-creating"
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
						<h1 style={{ color: 'white' }}>Stop creating user account?</h1>
					</header>
					<div className="btns">
						<ButtonClose onClick={() => setShown(false)} />
						<Link className="btn-icon" to={LOGIN} onClick={() => setProfile()}>
							<img src={checkMarkRed} />
						</Link>
					</div>
				</main>
			</div>
		</div>
	)
}
