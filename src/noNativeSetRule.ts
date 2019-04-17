import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Use immutable Set instead of native Set";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    // We convert the `ruleArguments` into a useful format before passing it to the constructor of AbstractWalker.
    return this.applyWithWalker(
      new NoNativeSetWalker(sourceFile, this.ruleName, {})
    );
  }
}

class NoNativeSetWalker extends Lint.AbstractWalker<{}> {
  importedSet = false;
  // tslint:disable-next-line: typedef
  public walk(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): void => {
      if (this.importedSet) {
        return;
      } else if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === "immutable" &&
        node.importClause &&
        node.importClause.namedBindings &&
        ts.isNamedImports(node.importClause.namedBindings) &&
        node.importClause.namedBindings.elements.some(
          importSpecifier => importSpecifier.name.text === "Set"
        )
      ) {
        this.importedSet = true;
      } else if (
        ts.isTypeReferenceNode(node) &&
        ts.isIdentifier(node.typeName) &&
        node.typeName.text === "Set"
      ) {
        this.addFailureAtNode(node, Rule.FAILURE_STRING);
      } else {
        // Continue recursion: call function `visit` for all children of the current node.
        return ts.forEachChild(node, visit);
      }
    };

    // Start recursion for all children of `sourceFile`.
    return ts.forEachChild(sourceFile, visit);
  }
}
