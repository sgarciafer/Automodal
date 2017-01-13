		<button data-automodal-action="close" class="automodal-close"></button>
		<h1>Automodal</h1>
		<p>Automatic popup that reminds if you already opened it.</p>
		<p>Responsive, lightweight, fast, synchronized with CSS animations, 
		fully customizable modal window plugin with declarative configuration and hash tracking.</p>
	<div>
```

## Multiple aumatic pop-ups on the same page

To avoid firing simultaneously multiple pop-ups and respect a delay between them the timer resets after an opened popup has been closed. 
For instance if you want 3 popup that fire with 1 second interval you can set it like this: 
```html
<div data-automodal-id="firstModal" data-automodal-options="autoDelay: 1000, autoReset: 5">
		<button data-automodal-action="close" class="automodal-close"></button>
		<h1>Automodal 1</h1>
</div>

<div data-automodal-id="secondModal" data-automodal-options="autoDelay: 1000, autoReset: 5">
		<button data-automodal-action="close" class="automodal-close"></button>
		<h1>Automodal 2</h1>
</div>

<div data-automodal-id="thirdModal" data-automodal-options="autoDelay: 1000, autoReset: 5">
		<button data-automodal-action="close" class="automodal-close"></button>
		<h1>Automodal 3</h1>
</div>
```
In this example the first popup will open after 1 second. The timer stops while the pop-up is open, when the pop-up is closed the timer start again and the second modal wait 1000 seconds before firing.

# IMPORTANT NOTE ABOUT CHROME BROWSER

Chrome browser do not alow to store cookies when the URL points to a local file, so if you want to test this plugin using the demo/index.html do it on a Firefox browser, or find a trick to make it work on Chrome. 
The cookies system will work perfectly on Chrome once the URL has a proper domain name!

Read more here: http://stackoverflow.com/questions/6232331/setting-cookies-using-javascript-in-a-local-html-file

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
