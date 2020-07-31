"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var convert = require("xml-js");
var config_1 = require("./config");
exports.default = (function (ins) {
    var options = ins.options;
    var isAtom = false;
    var isContent = false;
    var base = {
        _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
        rss: {
            _attributes: __assign({ version: "2.0" }, ins.namespaces),
            channel: {
                title: { _text: options.title },
                link: { _text: options.link },
                description: { _text: options.description },
                lastBuildDate: { _text: options.updated ? options.updated : new Date().toUTCString() }
            }
        }
    };
    if (!options.disableGenerator) {
        base.rss.channel.generator = { _text: options.generator || config_1.generator };
    }
    if (!options.disableDocs) {
        base.rss.channel.docs = { _text: options.docs ? options.docs : "https://validator.w3.org/feed/docs/rss2.html" };
    }
    if (options.language) {
        base.rss.channel.language = { _text: options.language };
    }
    if (options.image) {
        base.rss.channel.image = {
            title: { _text: options.title },
            url: { _text: options.image },
            link: { _text: options.link }
        };
    }
    if (options.copyright) {
        base.rss.channel.copyright = { _text: options.copyright };
    }
    ins.categories.map(function (category) {
        if (!base.rss.channel.category) {
            base.rss.channel.category = [];
        }
        base.rss.channel.category.push({ _text: category });
    });
    var atomLink = options.feed || (options.feedLinks && options.feedLinks.atom);
    if (atomLink) {
        isAtom = true;
        base.rss.channel["atom:link"] = [
            {
                _attributes: {
                    href: atomLink,
                    rel: "self",
                    type: "application/rss+xml"
                }
            }
        ];
    }
    if (options.hub) {
        isAtom = true;
        if (!base.rss.channel["atom:link"]) {
            base.rss.channel["atom:link"] = [];
        }
        base.rss.channel["atom:link"] = {
            _attributes: {
                href: options.hub,
                rel: "hub"
            }
        };
    }
    if (ins.extra) {
        Object.keys(ins.extra).forEach(function (key) {
            base.rss.channel[key] = ins.extra[key];
        });
    }
    base.rss.channel.item = [];
    ins.items.map(function (entry) {
        var item = {};
        if (entry.title) {
            item.title = { _cdata: entry.title };
        }
        if (entry.link) {
            item.link = { _text: entry.link };
        }
        if (entry.guid) {
            item.guid = { _text: entry.guid };
        }
        else if (entry.id) {
            item.guid = { _text: entry.id };
        }
        else if (entry.link) {
            item.guid = { _text: entry.link };
        }
        if (entry.date) {
            item.pubDate = { _text: entry.date.toUTCString() };
        }
        if (entry.description) {
            item.description = { _cdata: entry.description };
        }
        if (entry.content) {
            isContent = true;
            item["content:encoded"] = { _cdata: entry.content };
        }
        if (Array.isArray(entry.author)) {
            item.author = [];
            entry.author.map(function (author) {
                if (author.email && author.name) {
                    item.author.push({ _text: author.email + " (" + author.name + ")" });
                }
            });
        }
        if (Array.isArray(entry.category)) {
            item.category = [];
            entry.category.map(function (category) {
                item.category.push(formatCategory(category));
            });
        }
        if (entry.image) {
            item.enclosure = { _attributes: { url: entry.image } };
        }
        if (entry.extra) {
            Object.keys(entry.extra).forEach(function (key) {
                if (!entry.extra)
                    return;
                item[key] = entry.extra[key];
            });
        }
        base.rss.channel.item.push(item);
    });
    if (isContent) {
        base.rss._attributes["xmlns:content"] = "http://purl.org/rss/1.0/modules/content/";
    }
    if (isAtom) {
        base.rss._attributes["xmlns:atom"] = "http://www.w3.org/2005/Atom";
    }
    return convert.js2xml(base, { compact: true, ignoreComment: true, spaces: 4 });
});
var formatCategory = function (category) {
    var name = category.name, domain = category.domain;
    return {
        _text: name,
        _attributes: {
            domain: domain
        }
    };
};
//# sourceMappingURL=rss2.js.map