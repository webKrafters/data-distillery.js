import type { KeyType, PropertyInfo } from '@webkrafters/get-property';

import get from '@webkrafters/get-property';

export type Transform = <T>(property : PropertyInfo) => T;

export interface Options {
	arrays?: {
		preserve?: boolean;
		sparse?: boolean;
	};
	transform?: Transform;
};

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
 * restores the array properties in destination object to match their source types
 * 
 * Attention: mutates the dest object value
 * */
const restoreDestinationArrays = (() => {
	function restoring(
		source: unknown,
		dest: unknown,
		key: KeyType
	): void {
		// istanbul ignore next
		if( !( key in ( source as {} ) ) ) { return }
		const destVal = dest[ key ];
		if( !Array.isArray[ destVal ] &&
			Array.isArray( source[ key ] )
		) {
			const localArr = [];
			for( const iK in destVal ) { localArr[ +iK ] = destVal[ iK ] }
			dest[ key ] = localArr;
		}
		restore( source[ key ], dest[ key ] );
	}
	const restore = <T>(
		source: T,
		dest: Record<string, unknown>
	) : void => {
		if( Array.isArray( dest ) ) {
			for( let di = 0, len = dest.length; di < len; di++ ) {
				if( di in dest ) { restoring( source, dest, di ) }
			}
		}
		try {
			for( const dk in dest ) { restoring( source, dest, dk ) }
		} catch( e ) {}
	}
	return restore;
})();

function buildOpts( opts : Transform | Options ) {
	const _opts = {
		preserveArrays: false,
		allowSparseArrays: true,
		transform: defaultFormatValue
	};
	if( typeof opts === 'function' ) { return { ..._opts, transform: opts } }
	_opts.transform = opts.transform || _opts.transform;
	if( typeof opts.arrays === 'undefined' || opts.arrays === null ) { return _opts }
	if( typeof opts.arrays.preserve !== 'undefined' && opts.arrays.preserve !== null  ) {
		_opts.preserveArrays = opts.arrays.preserve;
	}
	if( typeof opts.arrays.sparse !== 'undefined' && opts.arrays.sparse !== null  ) {
		_opts.allowSparseArrays = opts.arrays.sparse;
	}
	return _opts;
}



// @todo: condenseArraysIn(...) test cases.
//		  `````````````````````````````````
// const a = [ , , , 6, undefined, , 5, , , null, 7 ]; // => [ 6, undefined, 5, null, 7 ]
// const a = [ , , , , , , , , , , , ]; // => []
// const a = []; // => []
// const a = [ , , , , undefined, , , , , null, , , , ]; // => [ undefined, null ]
// const a = [ 6, undefined, , 5, , , null, 7, , , ]; // => [ 6, undefined, 5, null, 7 ]
// const a = [ 6, undefined, , 5, , , null, 7]; // => [ 6, undefined, 5, null, 7 ]
// const a = [ 6, undefined, 5, null, 7 ]; // => [ 6, undefined, 5, null, 7 ]
// const a = [ 6, 5, 7 ]; // => [ 6, 5, 7 ]
// const a = [6, 5, 7, , { a: 22, d: [ 2, , 33 ]}, [ , 'one' ] ]; // => [ 6, 5, 7, Object { a: 22, d: [ 2, undefined, 33 ] }, [ undefined, 'one' ] ]
// const a = [ , , , 6, undefined, , 5, , , null, 7, , , ]; // => [ 6, undefined, 5, null, 7 ]

/**
 * purges all empty elements from array properties in destination object
 * 
 * Attention: mutates the dest object value
 * */
const condenseArraysIn = (() => { 
	function condensing( arr : [] ) {
		for( let i = arr.length, numRemovables = 0, isEmpty = false; i--; ) {
			isEmpty = !( i in arr );
			if( isEmpty ){ numRemovables++ }
			if( numRemovables === 0 ) { continue }
			if( i === 0 ) {
				// istanbul ignore next
				arr.splice( isEmpty ? i : i + 1, numRemovables );
				continue;
			}
			if( !isEmpty ) {
				arr.splice( i + 1, numRemovables );
				numRemovables = 0;
			}
		}
	}
	function condense( dest: unknown ) {
		if( Array.isArray( dest ) ) {
			const destArr = dest as [];
			condensing( destArr );
			for( let di = destArr.length; di--; ) { condense( destArr[ di ] ) }
			return;
		}
		try {
			for( const dk in ( dest as {} ) ) { condense( dest[ dk ] ) }
		} catch( e ) {}
	}
	return condense;
})();

/**
 * Pulls propertyPath values from state and
 * compiles them into a partial state object.
 */
export function mapPathsToObject<T>( source: T, propertyPaths: Array<string>, options?: Options ) : Partial<T>;
export function mapPathsToObject<T>( source: T, propertyPaths: Array<string>, options?: Transform ) : Partial<T>;
export function mapPathsToObject<T>(
	source : T,
	propertyPaths : Array<string>,
	options: Options|Transform = defaultFormatValue
) : Partial<T> {
	const { preserveArrays, allowSparseArrays, transform } = buildOpts( options );
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

	if( preserveArrays ) {
		restoreDestinationArrays( source, dest );
		!allowSparseArrays && condenseArraysIn( dest );
	}
	return dest;
}

export default mapPathsToObject;