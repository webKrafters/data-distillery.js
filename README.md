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

// DEFAULT USAGE
// -------------
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

### An Optional Parameter 3:
This function also accepts an optional third parameter which may either be
<ul>
    <li>a transformation function or </li>
    <li>an options object</li>
</ul>
<p>
The transformation function is of the the type:<br />
<code>&lt;T&gt;({ value } : PropertyInfo) : T => value;</code><br />
This function is called on all values mapping to the provided property paths listed in the second argument.
</p>
<p>The options object is of the type:</p>

<pre>
{
    tranform?: &lt;T&gt;({ value } : PropertyInfo) : T => value;</code>
    arrays?: {
        preserve?: boolean // defaults to false
        sparse?: boolean // defaults to true
    }
}
</pre>
<ol>
    <li>The options.transform serves the same function as aforedescribed transformation.</li>
    <li>function
</p>


</p>





# License
MIT
 