
`.remodal-wrapper` – the additional wrapper for the `.remodal`, it is not the overlay and used for the alignment.

`.remodal-overlay` – the overlay of modal dialogs, it is under the wrapper.

`.remodal-bg` – the background of modal dialogs, it is under the overlay and usually it is the wrapper of your content. You should add it on your own.

The `remodal` prefix can be changed in the global settings. See [the `NAMESPACE` option](#namespace).

#### States

States are added to the `.remodal`, `.remodal-overlay`, `.remodal-bg`, `.remodal-wrapper` classes.

List:
```
.remodal-is-opening
.remodal-is-opened
.remodal-is-closing
.remodal-is-closed
```

#### Modifier

A modifier that is specified in the [options](#options) is added to the `.remodal`, `.remodal-overlay`, `.remodal-bg`, `.remodal-wrapper` classes.

## Using with other javascript libraries

Remodal has wrappers that make it easy to use with other javascript libraries:

### Ember

* [ember-remodal](https://github.com/sethbrasile/ember-remodal)

## License

```
The MIT License (MIT)

Copyright (c) 2015 Ilya Makarov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```