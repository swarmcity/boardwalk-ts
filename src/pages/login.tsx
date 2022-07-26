import { Link, RouteComponentProps } from '@reach/router'
import { ButtonClose } from '../components/ButtonClose'
import { ACCOUNT_RESTORE, CREATE_ACCOUNT, HOME } from '../routes'

type LoginProps = RouteComponentProps

export const Login = (_: LoginProps) => (
	<div class="bg-info create-account">
		<div class="close">
			<ButtonClose to={HOME} variant="light" />
		</div>
		<div class="container">
			<main class=" flex-space">
				<header>
					<h1>Let's create an account.</h1>
					<p>
						No account was found on this device. When you restore or create a
						new account, it is stored locally on your device.
					</p>
				</header>
				<div class="btns">
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
