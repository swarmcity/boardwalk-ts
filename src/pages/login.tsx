import { Link } from 'react-router-dom'
import { ButtonClose } from '../components/button-close'
import { ACCOUNT_RESTORE, CREATE_ACCOUNT, HOME } from '../routes'

export const Login = () => (
	<div className="bg-info create-account">
		<div className="close">
			<ButtonClose to={HOME} variant="light" />
		</div>
		<div className="container">
			<main className="flex-space">
				<header>
					<h1>Let's create an account.</h1>
					<p>
						No account was found on this device. When you restore or create a
						new account, it is stored locally on your device.
					</p>
				</header>
				<div className="btns">
					<Link className="btn btn-info" to={CREATE_ACCOUNT}>
						create account
					</Link>
					<Link className="btn btn-info" to={ACCOUNT_RESTORE}>
						restore account
					</Link>
				</div>
			</main>
		</div>
	</div>
)
