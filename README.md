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
    arrays?: {
        preserve?: boolean // defaults to false
        sparse?: boolean // defaults to true
    },
    tranform?: &lt;T&gt;({ value } : PropertyInfo) : T => value;</code>
}
</pre>

<table style="border:0 solid #bbb; border-width:1px 0;">
    <thead>
        <tr>
            <th colspan="2" style="border-bottom:1px solid #bbb; font-size:20px; text-align:center;">
                Available Options
            </th> 
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="font-size:20px; text-align:left">Property</td>
            <td style="font-size:20px; text-align:left">Description</td>
        </tr>
        <tr>
            <td style="VALIGN="TOP"">
                <code>arrays</code>
            </td>
            <td>
                dascribes the strategy for handling array types encountered durring the distillation process.
            </td>
        </tr>
        <tr>
            <td VALIGN="TOP">
                <code>transform</code>
            </td>
            <td>serves the same function as the afore-described transformation function.</td>
        </tr>
    </tbody>
</table>
<br/>
<table style="border:0 solid #bbb; border-width:1px 0;">
    <thead>
        <tr>
            <th colspan="2" style="border-bottom:1px solid #bbb; font-size:20px; text-align:center;">
                Available <code>arrays</code> Options
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="font-size:20px; text-align:left">Property</td>
            <td style="font-size:20px; text-align:left">Description</td>
        </tr>
        <tr>
            <td VALIGN="TOP">
                <code>preserve</code>
            </td>
            <td>
                when <code>true</code> will preserve properties of array types in the collected data and maintain the original indexes of values in the arrays.<br /><br />
                <u><strong>Note:</strong></u> altering the name of a propery within the distilled object will preclude that property, if an array, from array preservation.
            </td>
        </tr>
        <tr>
            <td VALIGN="TOP">
                <code>sparse</code>
            </td>
            <td>
                when <code>false</code> will compact all arrays in the distilled data by removing all <b><i><u>unassigned</u></i></b> array elements.<br /><br />
                <u><strong>Note:</strong></u> this is active only when the <code>options.arrays.preserve</code> property is true.
            </td>
        </tr>
    </tbody>
</table>

<br /><br />

# License
MIT
 