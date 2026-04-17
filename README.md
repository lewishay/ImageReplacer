# ImageReplacer
A Firefox extension that allows you to replace images across the web by modifying network requests

## Functionality
- Select a supported element on the current webpage to replace, and enter a URL of an image to replace it
- Store a replacement rule that will persist for future requests
- View, modify or delete existing replacement rules

## Supported elements
This extension currently supports the following:
- `img` elements
- `picture` elements
- `video` elements with a `poster` attribute
- `input` elements that have the `image` type
- Elements with a `background-image` attribute

## Limitations
This extension should work seamlessly for most use cases, but there are a few limitations due to the inconsistent nature of HTML/CSS on the web, browser settings and user behaviour. These limitations are as follows:
- The image source must be a network request (a http URL). Inline resources (the format "data:image/png;base64,...") are not supported as there is no network request to modify.
- A website with a strict content security policy can block the loading of a replacement image. This is more likely to happen on security-focused websites such as banks, government tools, internal enterprise tools, developer/documentation sites, etc.
- Depending on your browser settings, some images may be cached and therefore not appear to be replaced after a regular page refresh. If you notice this, I recommended to force refresh (Ctrl+F5 on Windows, Cmd+Shift+R on Mac).
- Replacement rules use source paths, so if a website has multiple source paths for what looks like the same image (typically in different sizes/qualities), each one would need a separate rule.
- Replacement images will abide by the same sizing rules implemented for the original image. However, there are some pages where an image and/or its parent container has no sizing rules defined, so the image will render at its native size. In these circumstances I recommend to choose a replacement image of a similar size to avoid changing the look and feel of a webpage.
- Images inside cross-origin iframes are not supported as they cannot be accessed by Javascript.
- Some websites may have a background image in a large parent container that can interfere with the ability to target other images on the page.
- Images that are rendered in psuedo elements via the `content` attribute are not supported. This is because network request modification is unreliable for these images due to how they are cached in the browser.

## Notes
- Replacement rules will only apply to the website where the rule was configured, not every website.
- Replacement rules can chain, e.g. if X is replaced by Y, then Y is replaced by Z, Z can now replace both Y and X. Whether this happens in practice will depend on if a user added multiple rules before refreshing the page.

## Development commands
Typescript is compiled to Javascript using:
`npm run build`

HTML/CSS are copied to the output dir using:
`npm run copy`

Addon is built to a ZIP file using:
`web-ext build`
