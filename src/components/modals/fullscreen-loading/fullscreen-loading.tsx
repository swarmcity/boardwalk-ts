import cn from 'classnames'

// Types
import type { ComponentChildren } from 'preact'

// Style
import classes from './fullscreen-loading.module.css'

export type FullscreenLoadingProps = {
	children?: ComponentChildren
}

export const FullscreenLoading = ({ children }: FullscreenLoadingProps) => {
	return (
		<div class={cn(classes.fullscreenLoading, 'bg-info')}>
			<div class="container">
				<main class="flex-space">
					<header>
						{children || <h1 style={{ color: '#fafafa' }}>Loading...</h1>}
					</header>
					<div class={classes.loading}>
						<div />
						<div />
						<div />
					</div>
				</main>
			</div>
		</div>
	)
}
