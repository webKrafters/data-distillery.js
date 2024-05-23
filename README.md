# Data Distillery

Returns an object constructed using slices of an exisitng object.

**Install:**\
npm i -S data-distillery\
Alternate: npm i -S @webkrafters/data-distillery

### Example

```jsx
import distill from 'data-distillery'; 

const source = {
    address: {
        city: 'Test City',
        state: 'My Province'
    },
    matrix: [
        [ [ 0, 3, 1 ], [ 4, 0, 3 ] ],
        [ [ 4, 1, 9 ], [ 7, 4, 9 ] ],
        [ [ 8, 7, 3 ], [ 0, 3, 1 ] ]
    ],
    registered: {
        time: new Date(),
        timezone: 'Eastern Time'
    },
    tags: [ 'test', 'foo', 'bar', 'baz', 'boo', 'tap', 'bak' ]
};

distill( source, [
    'matrix.1.1',
    'matrix[2].0',
    'address',
    'registered.timezone',
    'tags[4]',
    'matrix[0][1]'
]);
// returns distilled object => {
//   matrix: {
//     0: { 1: [ 4, 0, 3 ] },
//     1: { 1: [ 7, 4, 9 ] },
//     2: { 0: [ 8, 7, 3 ] }
//   },
//   address: {
//     city: 'Test City',
//     state: 'My Province'
//   },
//   registered: {
//     timezone: 'Eastern Time'
//   },
//   tags: {
//     4: 'boo'
//   }
// }

```

# License
MIT
 