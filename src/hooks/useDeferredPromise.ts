import { useRef } from 'preact/hooks'

type DeferredPromise<DeferType> = {
	resolve: (value: DeferType) => void
	reject: (value: unknown) => void
	promise: Promise<DeferType>
}

export function useDeferredPromise<DeferType>() {
	const deferRef = useRef<DeferredPromise<DeferType> | null>(null)

	const defer = () => {
		const deferred = {} as DeferredPromise<DeferType>

		const promise = new Promise<DeferType>((resolve, reject) => {
			deferred.resolve = resolve
			deferred.reject = reject
		})

		deferred.promise = promise
		deferRef.current = deferred
		return deferRef.current
	}

	return { defer, deferRef: deferRef.current }
}
