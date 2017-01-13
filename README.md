# Automodal
## The automatic fired popup that remember if you already opened it

This plugin is based on VodkaBears/Remodal so it has all their functionnalities with the new automatic features.
Read the remodal README.md to know the other features of Automodal, here I will just explain how the Automatic system works.

## Intro

Each modal is created using the data-automodal-id attribute on the container of the popup. 
There is a javascript timer that will fire each that has an autoDelay property different than false (it default to 1000).
The autoDelay property is the time in miliseconds to wait before firing the popup.

Each modal has a property called autoReset that will define if that modal should be open only once and then send a cookie to avoid popping the same modal again. The autoReset is the expiration time in minutes of the cookie. When the cookie expires and the user reload the window the modal will pop again.

## Example

This automodal will fireup after 5 seconds and then send a cookie to the browser that will expire after 5 minutes.
If the page is loaded after the cookie has expired the pop-up will fire again.

```html
<div data-automodal-id="myModalId" data-automodal-options="autoDelay: 5000; autoReset: 5">
		<button data-automodal-action="close" class="automodal-close"></button>
		<h1>Automodal</h1>
		<p>Automatic popup that reminds if you already opened it.</p>
		<p>Responsive, lightweight, fast, synchronized with CSS animations, 
		fully customizable modal window plugin with declarative configuration and hash tracking.</p>
	<div>
```

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
