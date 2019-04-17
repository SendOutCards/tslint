"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        // We convert the `ruleArguments` into a useful format before passing it to the constructor of AbstractWalker.
        return this.applyWithWalker(new NoNativeSetWalker(sourceFile, this.ruleName, {}));
    };
    Rule.FAILURE_STRING = "Use immutable Set instead of native Set";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoNativeSetWalker = /** @class */ (function (_super) {
    __extends(NoNativeSetWalker, _super);
    function NoNativeSetWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.importedSet = false;
        return _this;
    }
    // tslint:disable-next-line: typedef
    NoNativeSetWalker.prototype.walk = function (sourceFile) {
        var _this = this;
        var visit = function (node) {
            if (_this.importedSet) {
                return;
            }
            else if (ts.isImportDeclaration(node) &&
                ts.isStringLiteral(node.moduleSpecifier) &&
                node.moduleSpecifier.text === "immutable" &&
                node.importClause &&
                node.importClause.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings) &&
                node.importClause.namedBindings.elements.some(function (importSpecifier) { return importSpecifier.name.text === "Set"; })) {
                _this.importedSet = true;
            }
            else if (ts.isTypeReferenceNode(node) &&
                ts.isIdentifier(node.typeName) &&
                node.typeName.text === "Set") {
                _this.addFailureAtNode(node, Rule.FAILURE_STRING);
            }
            else {
                // Continue recursion: call function `visit` for all children of the current node.
                return ts.forEachChild(node, visit);
            }
        };
        // Start recursion for all children of `sourceFile`.
        return ts.forEachChild(sourceFile, visit);
    };
    return NoNativeSetWalker;
}(Lint.AbstractWalker));
