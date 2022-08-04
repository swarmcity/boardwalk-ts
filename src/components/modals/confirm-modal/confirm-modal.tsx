import cn from 'classnames'

// Components
import { ButtonClose } from '../../ButtonClose'
import { ButtonRoundArrow } from '../../ButtonRoundArrow'

// Types
import type { ButtonCloseProps } from '../../ButtonClose'
import type { ButtonRoundArrowProps } from '../../ButtonRoundArrow'
import type { ReactNode } from 'react'

// Style
import classes from './confirm-modal.module.css'

export type ConfirmModalProps = {
	cancel?: ButtonCloseProps
	confirm?: ButtonRoundArrowProps
	color?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'info'
		| 'warning'
		| 'danger'
		| 'light'
		| 'dark'
		| 'black'
		| 'white'
	children: ReactNode
}

export const ConfirmModal = ({
	cancel,
	confirm,
	color,
	children,
}: ConfirmModalProps) => {
	return (
		<div
			className={cn(classes.confirmModal, color ? `bg-${color}` : 'bg-info')}
		>
			<div className="container">
				<main className="flex-space">
					<header>{children}</header>
					<div className="btns btn-icons">
						{cancel && <ButtonClose className="close" {...cancel} />}
						{confirm && (
							<ButtonRoundArrow type="submit" variant="negative" {...confirm} />
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
