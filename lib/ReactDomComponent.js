/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import ReactComponent from './ReactComponent';
import assign from 'object-assign';
import traverseAllChildren from 'react/lib/traverseAllChildren';
import {instantiateReactComponent} from './ReactComponentFactory';

var invariant = require("react/lib/invariant");
var warning = require("react/lib/warning");

var validatedTagCache = {};
var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset
var hasOwnProperty = {}.hasOwnProperty;
function validateDangerousTag(tag) {
    if (!hasOwnProperty.call(validatedTagCache, tag)) {
        ("production" !== process.env.NODE_ENV ? invariant(VALID_TAG_REGEX.test(tag), 'Invalid tag: %s', tag) : invariant(VALID_TAG_REGEX.test(tag)));
        validatedTagCache[tag] = true;
    }
}

class ReactDomComponent extends ReactComponent {
    constructor(element) {
        super(element);
        validateDangerousTag(this.type);
    }

    mountComponent(rootNodeId, transaction, context) {
        this._validateProps(this.props);
        return (
            createOpenTagMarkup(this, rootNodeId, transaction, context) +
            createContentMarkup(this, rootNodeId, transaction, context) +
            createCloseTagMarkup(this, rootNodeId, transaction, context)
        );
    }

    _validateProps(props) {
        if (!props) {
            return;
        }
        // Note the use of `==` which checks for null or undefined.
        if (props.dangerouslySetInnerHTML != null) {
            ("production" !== process.env.NODE_ENV ? invariant(
                props.children == null,
                'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
            ) : invariant(props.children == null));
            ("production" !== process.env.NODE_ENV ? invariant(
                typeof props.dangerouslySetInnerHTML === 'object' &&
                '__html' in props.dangerouslySetInnerHTML,
                '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' +
                'Please visit https://fb.me/react-invariant-dangerously-set-inner-html ' +
                'for more information.'
            ) : invariant(typeof props.dangerouslySetInnerHTML === 'object' &&
                '__html' in props.dangerouslySetInnerHTML));
        }
        if ("production" !== process.env.NODE_ENV) {
            ("production" !== process.env.NODE_ENV ? warning(
                props.innerHTML == null,
                'Directly setting property `innerHTML` is not permitted. ' +
                'For more information, lookup documentation on `dangerouslySetInnerHTML`.'
            ) : null);
            ("production" !== process.env.NODE_ENV ? warning(
                !props.contentEditable || props.children == null,
                'A component is `contentEditable` and contains `children` managed by ' +
                'React. It is now your responsibility to guarantee that none of ' +
                'those nodes are unexpectedly modified or duplicated. This is ' +
                'probably not intentional.'
            ) : null);
        }
        ("production" !== process.env.NODE_ENV ? invariant(
            props.style == null || typeof props.style === 'object',
            'The `style` prop expects a mapping from style properties to values, ' +
            'not a string. For example, style={{marginRight: spacing + \'em\'}} when ' +
            'using JSX.'
        ) : invariant(props.style == null || typeof props.style === 'object'));
    }
}

function mountChildren(component, rootNodeID, transaction, context) {
    var mountImages = [];
    var element = component.element;
    var childrenToUse = component.props.children;
    traverseAllChildren(childrenToUse, function mountChild(traverseContext, child, name) {
        if (child == null) {
            return;
        }
        var childInstance = instantiateReactComponent(child, element.type);
        // Inlined for performance, see `ReactInstanceHandles.createReactID`.
        var rootID = rootNodeID + name;
        var mountImage = childInstance.mountComponent(
            rootID,
            transaction,
            context
        );
        mountImages.push(mountImage);
    }, mountImages);

    return mountImages;
}

var omittedCloseTags = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
    // NOTE: menuitem's close tag should be omitted, but that causes problems.
};
function createCloseTagMarkup(component, rootNodeId, transaction, context) {
    return omittedCloseTags[component.type] ? '' : '</' + component.type + '>';
}

/**
 * Creates markup for the open tag and all attributes.
 *
 * This method has side effects because events get registered.
 *
 * Iterating over object properties is faster than iterating over arrays.
 * @see http://jsperf.com/obj-vs-arr-iteration
 *
 * @private
 * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
 * @return {string} Markup of opening tag.
 */
var CSSPropertyOperations = require('react/lib/CSSPropertyOperations');
var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
function createOpenTagMarkup(component, rootNodeId, transaction, context) {
    var props = component.props;
    var ret = '<' + component.type;

    for (var propKey in props) {
        if (!props.hasOwnProperty(propKey)) {
            continue;
        }
        var propValue = props[propKey];
        if (propValue == null) {
            continue;
        }

        if (propKey === 'style') {
            if (propValue) {
                propValue = assign({}, props.style);
            }
            propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
            DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
            ret += ' ' + markup;
        }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
        return ret + '>';
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(rootNodeId);
    return ret + ' ' + markupForID + '>';
}

/**
 * Creates markup for the content between the tags.
 *
 * @private
 * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
 * @param {object} context
 * @return {string} Content markup.
 */
var escapeTextContentForBrowser = require('react/lib/escapeTextContentForBrowser');
var CONTENT_TYPES = {'string': true, 'number': true};
function createContentMarkup(component, rootNodeId, transaction, context) {
    var tag = component.type;
    var prefix = '';
    if (tag === 'listing' ||
        tag === 'pre' ||
        tag === 'textarea') {
        // Add an initial newline because browsers ignore the first newline in
        // a <listing>, <pre>, or <textarea> as an "authoring convenience" -- see
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody.
        prefix = '\n';
    }

    var props = component.props;

    // Intentional use of != to avoid catching zero/false.
    var innerHTML = props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
        if (innerHTML.__html != null) {
            return prefix + innerHTML.__html;
        }
    } else {
        var contentToUse =
            CONTENT_TYPES[typeof props.children] ? props.children : null;
        var childrenToUse = contentToUse != null ? null : props.children;
        if (contentToUse != null) {
            return prefix + escapeTextContentForBrowser(contentToUse);
        } else if (childrenToUse != null ) {
            return prefix + mountChildren(component, rootNodeId, transaction, context).join('');
        }
    }
    return prefix;
}

export default ReactDomComponent;
