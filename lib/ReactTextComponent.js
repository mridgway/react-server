/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMTextComponent
 * @typechecks static-only
 */

var DOMPropertyOperations = require("react/lib/DOMPropertyOperations");
var assign = require("object-assign");
var escapeTextContentForBrowser = require("react/lib/escapeTextContentForBrowser");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactDOMTextComponent
 * @extends ReactComponent
 * @internal
 */
class ReactTextComponent {
    constructor(text) {
        this._text = '' + text;
    }

    mountComponent(rootID, transaction, context) {
        var escapedText = escapeTextContentForBrowser(this._text);

        if (transaction.renderToStaticMarkup) {
            // Normally we'd wrap this in a `span` for the reasons stated above, but
            // since this is a situation where React won't take over (static pages),
            // we can simply return the text as it is.
            return escapedText;
        }

        return (
            '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' +
            escapedText +
            '</span>'
        );
    }
}

export default ReactTextComponent;
