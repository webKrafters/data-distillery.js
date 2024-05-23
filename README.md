# Data Distillery

Returns an object constructed using slices of an exisitng object.

Built on of the lodash.clondeepwith package.<br />

**Install:**\
npm i -S clone-total\
Alternate: npm i -S @webkrafters/clone-total

## Regarding Class Instances Values
All cloned properties and values which are Instances of non-native classes not implementing either the `clone` or the `cloneNode` methods may not be cloneable. Such instances are retured uncloned. To clone these, a `customizer` argument function may be supplied. Please see **Extended** example below.

### Example

```jsx
import clone from 'clone-total'; 

clone( object ); // returns cloned object
```

### Example (Extended)

```jsx

function customizer(
    value : unknown,
    key? : number | string,
    object? : T,
    stack? : unknown
) {
    if( /* <your fallback condition> */ ) {
        return yourCloneAlgorithm( value, key, object, stack );
    }
    // or allow the normal course to continue.
};

clone( object, customizer );
```

# License
MIT
 