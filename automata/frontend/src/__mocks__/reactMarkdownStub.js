/*
 * The unified/remark/rehype stack is ESM-only and CRA's Jest cannot resolve its
 * export maps. Tests here care about layout and routing, not markdown parsing,
 * so the renderer is stubbed to emit its source text and the plugins to no-ops.
 */
const React = require('react');

const ReactMarkdown = ({ children }) => React.createElement('div', null, children);

module.exports = ReactMarkdown;
module.exports.default = ReactMarkdown;
module.exports.__esModule = true;
