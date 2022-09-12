export type Colors =
	| 'blue'
	| 'green'
	| 'green-text'
	| 'grey1'
	| 'grey2'
	| 'grey2-lines'
	| 'grey2-light-text'
	| 'grey3'
	| 'grey4'
	| 'grey5'
	| 'red'
	| 'red-text'
	| 'white'
	| 'yellow'

export function getColor(color?: Colors) {
	switch (color) {
		case 'blue':
			return '#24B1FF'
		case 'green':
			return '#6AD792'
		case 'green-text':
			return '#23B460'
		case 'grey1':
			return '#F2F2F2'
		case 'grey2':
			return '#ACACAC'
		case 'grey2-lines':
			return '#DFDFDF'
		case 'grey2-light-text':
			return '#ACACAC'
		case 'grey3':
			return '#666666'
		case 'grey4':
			return '#333333'
		case 'grey5':
			return '#191919'
		case 'red':
			return '#F55858'
		case 'red-text':
			return '#D0021B'
		case 'white':
			return '#FAFAFA'
		case 'yellow':
			return '#EFD96F'
		default:
			return 'inherit'
	}
}
