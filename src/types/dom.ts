import type { JSXInternal } from 'preact/src/jsx'

export type EventHandler<Target extends EventTarget> =
	JSXInternal.TargetedEvent<Target, Event>

export type HTMLAttributes<Target extends HTMLElement> =
	JSXInternal.HTMLAttributes<Target>
