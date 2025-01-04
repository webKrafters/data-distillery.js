import { beforeAll, describe, expect, jest, test } from '@jest/globals';

import * as utils from './main';

import createSourceData from './test-artifacts/data/create-data-obj';

describe( 'utils module', () => {
	describe( 'arrangePropertyPaths(...)', () => {
		describe( 'subset propertyPaths', () => {
			let actual, expected;
			beforeAll(() => {
				expected = [
					'address',
					'matrix.0.1',
					'friends[1]',
					'registered.time',
					'matrix[2][2]',
					'tags[4]',
					'history'
				];
				actual = utils.arrangePropertyPaths([
					'address',
					'friends[1].id', // subset
					'registered.time.hours', // subset
					'matrix.0.1',
					'friends[1]',
					'history.places', // subset
					'registered.time',
					'matrix[2][2]',
					'friends[1].name.last', // subset
					'history.places[2].year', // subset
					'tags[4]',
					'history'
				]);
			});
			test( 'are removed', () => {
				expect( actual ).toEqual( expected );
			} );
			test( 'maintains inclusion order', () => {
				expect( actual ).toStrictEqual( expected );
			} );
		} );
		test( 'removes duplicate propertyPaths', () => {
			const expected = [
				'friends[1]',
				'address',
				'matrix.0.1',
				'history',
				'registered.time',
				'matrix[2][2]',
				'tags[4]'
			];
			const actual = utils.arrangePropertyPaths([
				'friends[1]',
				'friends[1]',
				'address',
				'matrix.0.1',
				'history.places[2].year', // subset
				'friends[1]',
				'history',
				'registered.time',
				'address',
				'matrix[2][2]',
				'history',
				'tags[4]'
			]);
			expect( actual ).toEqual( expected );
			expect( actual ).toStrictEqual( expected );
		} );
		describe( 'no duplicates/no subsets found', () => {
			test( 'returns identical propertyPaths list', () => {
				const expected = [
					'address',
					'friends[1]',
					'history',
					'registered.time',
					'tags[4]'
				];
				const actual = utils.arrangePropertyPaths( expected );
				expect( actual ).not.toBe( expected );
				expect( actual ).toEqual( expected );
				expect( actual ).toStrictEqual( expected );
			} );
		} );
	} );
	describe( 'mapPathsToObject(...)', () => {
		let source, propertyPaths;
		beforeAll(() => {
			source = createSourceData();
			source.matrix = [
				[ 0, 3, 9 ],
				[ 4, 1, 1],
				[ 8, 7, 3]
			];
			propertyPaths = Object.freeze([
				'address',
				'friends[1]',
				'history.places.0.city',
				'matrix.0.1',
				'registered.timezone',
				'registered.time',
				'tags[4]',
				'matrix[2][2]',
				'matrix.0.2'
			]);
		});
		test( 'returns a subset of the source object matching arranged property paths', () => {
			expect( utils.mapPathsToObject( source, propertyPaths ) ).toEqual({
				address: source.address,
				friends: { 1: source.friends[ 1 ] },
				history: { places: { 0: { city: source.history.places[ 0 ].city } } },
				matrix: {
					0: { 1: source.matrix[ 0 ][ 1 ], 2: source.matrix[ 0 ][ 2 ] },
					2: { 2: source.matrix[ 2 ][ 2 ] }
				},
				registered: {
					time: source.registered.time,
					timezone: source.registered.timezone
				},
				tags: { 4: source.tags[ 4 ] }
			});
		} );
		test(
			'returns a subset of the source object in a natural object heirarchical format',
			() => expect( utils.mapPathsToObject( source, [ 'matrix.0.1', 'matrix.0.2' ] ) ).toEqual({
				matrix: {
					0: {
						1: source.matrix[ 0 ][ 1 ],
						2: source.matrix[ 0 ][ 2 ]
					}
				}
			})
		);
		test( 'returns a subset of the source object excluding non-existent property paths', () => {
			expect( utils.mapPathsToObject( source, [ 'matrix.0.1', 'matrix.0.44' ] ) ).toEqual({
				matrix: { 0: { 1: source.matrix[ 0 ][ 1 ] } }
			});
		});
		test( 'handles multi-dimensional arrays', () => {
			source = createSourceData();
			source.matrix = [
				[ [ 0, 3, 1 ], [ 4, 0, 3 ] ],
				[ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
				[ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
			];
			const matrix11 = { 1: source.matrix[ 1 ][ 1 ] };
			const matrix20 = { 0: source.matrix[ 2 ][ 0 ] };
			expect( utils.mapPathsToObject( source, [ 'matrix.1.1', 'matrix[2].0' ] ) )
				.toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
			expect( utils.mapPathsToObject( source, [ 'matrix[2].0', 'matrix.1.1' ] ) )
				.toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
			expect( utils.mapPathsToObject( source, [ 'matrix.1.1' ] ) )
				.toEqual({ matrix: { 1: matrix11 }	});
			expect( utils.mapPathsToObject( source, [ 'matrix[2].0' ] ) )
				.toEqual({ matrix: { 2: matrix20 }	});
		} );
		describe( 'Third parameter', () => {
			test( 'is optional: does not preserve array types (uses indexed object instead', () => {
				source = createSourceData();
				source.matrix = [
					[ [ 0, 3, 1 ], [ 4, 0, 3 ] ],
					[ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
					[ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
				];
				const matrix11 = { 1: source.matrix[ 1 ][ 1 ] };
				const matrix20 = { 0: source.matrix[ 2 ][ 0 ] };
				expect( utils.mapPathsToObject( source, [ 'matrix.1.1', 'matrix[2].0' ] ) )
					.toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
				expect( utils.mapPathsToObject( source, [ 'matrix[2].0', 'matrix.1.1' ] ) )
					.toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
				expect( utils.mapPathsToObject( source, [ 'matrix.1.1' ] ) )
					.toEqual({ matrix: { 1: matrix11 }	});
				expect( utils.mapPathsToObject( source, [ 'matrix[2].0' ] ) )
					.toEqual({ matrix: { 2: matrix20 }	});
			});
			test( 'accepts function type for transforming values at property paths', () => {
				const transformMock = jest.fn() as utils.Transform;
				utils.mapPathsToObject( createSourceData(), [ 'company', 'tags' ], transformMock );
				expect( transformMock ).toHaveBeenCalledTimes( 2 );
			});
			describe( 'accepts an options object', () => {
				test( 'accepts a "transform" property to apply to values at property paths', () => {
					const transformMock = jest.fn() as utils.Transform;
					utils.mapPathsToObject( createSourceData(), [ 'company', 'tags' ], { transform: transformMock });
					expect( transformMock ).toHaveBeenCalledTimes( 2 );
				} );
				test( 'accepts an "arrays.preserve" property to preserve array types and indexing', () => {
					source = createSourceData();
					source.matrix = [
						[ [ 0, 3, 1 ], [ 4, 0, 3 ] ],
						[ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
						[ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
					];
					const matrix11 = { 1: source.matrix[ 1 ][ 1 ] };
					const matrix20 = { 0: source.matrix[ 2 ][ 0 ] };
					expect( utils.mapPathsToObject(
						source,
						[ 'matrix.1.1', 'matrix[2].0' ],
						{ arrays: { preserve: true } }
					) ).toEqual({ matrix: [ undefined, [ undefined, matrix11[ 1 ] ], [ matrix20[ 0 ] ] ] });
					expect( utils.mapPathsToObject(
						source,
						[ 'matrix[2].0', 'matrix.1.1' ],
						{ arrays: { preserve: true } }
					) ).toEqual({ matrix: [ undefined, [ undefined, matrix11[ 1 ] ], [ matrix20[ 0 ] ] ] });
					expect( utils.mapPathsToObject(
						source,
						[ 'matrix.1.1' ],
						{ arrays: { preserve: true } }
					) ).toEqual({ matrix: [ undefined, [ undefined, matrix11[ 1 ] ] ] });
					expect( utils.mapPathsToObject(
						source,
						[ 'matrix[2].0' ],
						{ arrays: { preserve: true } }
					) ).toEqual({ matrix: [ undefined, undefined, [ matrix20[ 0 ] ] ]	});
				} );
				describe( 'the "arrays.sparse" property', () => {
					test( 'when "false" removes all unset elements in all arrays in the returned data', () => {
						source = createSourceData();
						source.matrix = [
							[ [ 0, 3, 1 ], [ 4, 0, 3 ], [ 0, 0, 0 ], [ 8, 9, 1 ], [ 2, 2, 2 ] ],
							[ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
							[ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
						];
						const matrix11 = { 1: source.matrix[ 1 ][ 1 ] };
						const matrix20 = { 0: source.matrix[ 2 ][ 0 ] };
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix.1.1', 'matrix[2].0' ],
							{ arrays: { preserve: true, sparse: false } }
						) ).toEqual({ matrix: [ [ matrix11[ 1 ] ], [ matrix20[ 0 ] ] ] });
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix[2].0', 'matrix.1.1', 'matrix[ 0 ][ 0 ]', 'matrix[ 0 ][ 1 ]', 'matrix[ 0 ][ 4 ]' ],
							{ arrays: { preserve: true, sparse: false } }
						) ).toEqual({ matrix: [
							[ [ 0, 3, 1 ], [ 4, 0, 3 ], [ 2, 2, 2 ] ],
							[ matrix11[ 1 ] ],
							[ matrix20[ 0 ] ]
						] });
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix.1.1' ],
							{ arrays: { preserve: true, sparse: false } }
						) ).toEqual({ matrix: [ [ matrix11[ 1 ] ] ] });
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix[2].0' ],
							{ arrays: { preserve: true, sparse: false } }
						) ).toEqual({ matrix: [ [ matrix20[ 0 ] ] ]	});
					} );
					test( 'has no effect when the "arrays.preserve" property is inactive', () => {
						source = createSourceData();
						source.matrix = [
							[ [ 0, 3, 1 ], [ 4, 0, 3 ] ],
							[ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
							[ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
						];
						const matrix11 = { 1: source.matrix[ 1 ][ 1 ] };
						const matrix20 = { 0: source.matrix[ 2 ][ 0 ] };
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix.1.1', 'matrix[2].0' ],
							{ arrays: { preserve: false, sparse: false } }
						) ).toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix[2].0', 'matrix.1.1' ],
							{ arrays: { preserve: false, sparse: false } }
						) ).toEqual({ matrix: { 1: matrix11, 2: matrix20 } });
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix.1.1' ],
							{ arrays: { preserve: false, sparse: false } }
						) ).toEqual({ matrix: { 1: matrix11 }	});
						expect( utils.mapPathsToObject(
							source,
							[ 'matrix[2].0' ],
							{ arrays: { preserve: false, sparse: false } }
						) ).toEqual({ matrix: { 2: matrix20 }	});
					} );
				} );
			} );
		});
	} );
} );
