# Vanilla TypeScript Autocomplete
=============

A little component for autocomplete features attached to an input text.

It works both for static iteratable objects, that for asynchrounous api calls.

####HTML Markup for static mode with items list passed
```html
    <input type="text" name="country" class="autocomplete"
        placeholder="Search by country name"
        data-items='{"IT":"Italia","AD":"Andorra","AE":"United Arab Emirates","AF":"Afghanistan", ...}'>
```



####HTML Markup for dynamics mode with asynchrounous api call
```html
    <input type="text" name="country" class="autocomplete"
            placeholder="Search by country name"
            data-uri="/api/search">
```
 

####TypeScript
```typescript
import { Autocomplete } from "ts-autocomplete";

const tsa = new Autocomplete('.autocomplete' , (value: string) => {
	// Do stuff with the selected value
}, () => {
	// Do stuff when the autocomplete is resetted
})
```
