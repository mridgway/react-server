/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import ReactElement from './ReactElement';
import assign from 'object-assign';

class ReactDomElement extends ReactElement {
    constructor(type, props, children) {
        super(type, props, children);
    }

    mountComponent(rootNodeId, context) {
        return (
            createOpenTagMarkup(this, rootNodeId, context) +
            createContentMarkup(this, rootNodeId, context) +
            createCloseTagMarkup(this, rootNodeId, context)
        );
    }
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
function createCloseTagMarkup(element, rootNodeId, context) {
    return omittedCloseTags[element.type] ? '' : '</' + element.type + '>'
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
function createOpenTagMarkup(element, rootNodeId, context) {
    var props = element.props;
    var ret = '<' + element.type;

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
    if (!rootNodeId) {
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
function createContentMarkup(element, rootNodeId, context) {
    var tag = element.type;
    var prefix = '';
    if (tag === 'listing' ||
        tag === 'pre' ||
        tag === 'textarea') {
        // Add an initial newline because browsers ignore the first newline in
        // a <listing>, <pre>, or <textarea> as an "authoring convenience" -- see
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody.
        prefix = '\n';
    }

    var props = element.props;

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
            if (Array.isArray(childrenToUse)) {
                return prefix + childrenToUse.map(function (child, i) {
                        var contentToUse =
                            CONTENT_TYPES[typeof child] ? child : null;
                        if (contentToUse != null) {
                            return escapeTextContentForBrowser(contentToUse);
                        }

                        var childId = rootNodeId ? rootNodeId + '.' + i : rootNodeId;
                        return child.mountComponent(childId, context)
                    }).join('');
            } else if ('object' === typeof childrenToUse) {
                var childId = rootNodeId ? rootNodeId + '.0' : rootNodeId;
                return prefix + childrenToUse.mountComponent(childId, context);
            }
        }
    }
    return prefix;
}

export default ReactDomElement;
