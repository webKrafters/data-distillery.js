import type { PropertyInfo } from '@webkrafters/get-property';

import get from '@webkrafters/get-property';

export type Transform = <T>(property : PropertyInfo) => T;

const BRACKET_EXP = /\[([0-9]+)\]/g;
const BRACKET_OPEN = /\.?\[/g;
const BRACKET_CLOSE = /^\.|\]/g;
const DOT_EXP = /\./;
const DOT_PREFIX_EXP = /^\./;

/**
 * Curates the most inclusive propertyPaths from a list of property paths.
 * @example
 * arrangePropertyPaths(["a.b.c.d", "a.b", "a.b.z[4].w", "s.t"]) => ["a.b", "s.t"].
 * "a.b" is inclusive of "a.b.c.d": "a.b.c.d" is a subset of "a.b." but not vice versa.
 * "a.b" is inclusive of "a.b.z[4].w": "a.b.z[4].w" is a subset of "a.b." but not vice versa.
 */
export function arrangePropertyPaths( propertyPaths : Array<string> ) : Array<string> {
	const superPathTokensMap : {[propertyPath: string]: Array<string>} = {};
	for( const path of propertyPaths ) {
		const pathTokens = path
			.replace( BRACKET_EXP, '.$1' )
			.replace( DOT_PREFIX_EXP, '' )
			.split( DOT_EXP );
		L2: {
			const replacedSuperPaths = [];
			for( const superPath in superPathTokensMap ) {
				const superPathTokens = superPathTokensMap[ superPath ];
				// self/subset check
				if( superPathTokens.length <= pathTokens.length ) {
					if( superPathTokens.every(( p, i ) => p === pathTokens[ i ]) ) {
						break L2;
					}
					continue;
				}
				// superset check
				pathTokens.every(( p, i ) => p === superPathTokens[ i ]) &&
				replacedSuperPaths.push( superPath );
			}
			superPathTokensMap[ path ] = pathTokens;
			for( const path of replacedSuperPaths ) {
				delete superPathTokensMap[ path ];
			}
		}
	}
	return Object.keys( superPathTokensMap );
};

const defaultFormatValue = <T>({ value } : PropertyInfo) : T => value;

/** converts brackets to dot segments */
function stringToDotPath( path : string ) : string {
    return path
		.replace( BRACKET_OPEN, '.' )
		.replace( BRACKET_CLOSE, '' );
}

/**
 * Pulls propertyPath values from state and
 * compiles them into a partial state object.
 */
export function mapPathsToObject<T>(
	source : T,
	propertyPaths : Array<string>,
	transform : Transform = defaultFormatValue
) : Partial<T> {
	const paths = [];
	for( const path of propertyPaths ) { paths.push( stringToDotPath( path ) ) }
	const dest = {};
	let object = dest;
	for( const path of arrangePropertyPaths( paths ) ) {
		const property = get( source, path );
		if( !property.exists ) { continue }
		for(
			let tokens = path.split( '.' ), tLen = tokens.length, t = 0;
			t < tLen;
			t++
		) {
			const token = tokens[ t ];
			if( t + 1 === tLen ) {
				object[ token ] = transform( property );
				object = dest;
				break;
			}
			if( !( token in object ) ) { object[ token ] = {} }
			object = object[ token ];
		}
	}
	return dest;
}

export default mapPathsToObject;