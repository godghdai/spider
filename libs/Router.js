var Router = require('koa-router');
var Layer =  require('koa-router/lib/layer');
var isGeneratorFunction = require('is-generator-function');
var convert = require('koa-convert');
module.exports = Router;
/**
 * Create and register a route.
 *
 * @param {String} path Path string.
 * @param {Array.<String>} methods Array of HTTP verbs.
 * @param {Function} middleware Multiple middleware also accepted.
 * @returns {Layer}
 * @private
 */

Router.prototype.register = function (path, methods, middleware, opts) {
    opts = opts || {};

    var router = this;
    var stack = this.stack;

    // support array of paths
    if (Array.isArray(path)) {
        path.forEach(function (p) {
            router.register.call(router, p, methods, middleware, opts);
        });

        return this;
    }

    // Support for generators
    middleware.forEach(function (fn, i) {
        if (isGeneratorFunction(fn)) {
            middleware[i] = convert(fn);
        }
    });

    // create route
    var route = new Layer(path, methods, middleware, {
        end: opts.end === false ? opts.end : true,
        name: opts.name,
        sensitive: opts.sensitive || this.opts.sensitive || false,
        strict: opts.strict || this.opts.strict || false,
        prefix: opts.prefix || this.opts.prefix || "",
        ignoreCaptures: opts.ignoreCaptures
    });

    if (this.opts.prefix) {
        route.setPrefix(this.opts.prefix);
    }

    // add parameter middleware
    Object.keys(this.params).forEach(function (param) {
        route.param(param, this.params[param]);
    }, this);

    stack.push(route);

    return route;
};
