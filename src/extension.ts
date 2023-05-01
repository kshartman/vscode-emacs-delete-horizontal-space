'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerTextEditorCommand('emacs.deleteHorizontalSpace', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor');
            return;
        }
        deleteHorizontalSpace(editor);
    });
    context.subscriptions.push(disposable);
}

export function deactivate(): undefined {
    console.log("Deactivated extension");
    return undefined;
}

/**
 * Extension Method
 *
 */
declare global {
    interface String {
        /**
         * Takes a predicate and returns the index of the first rightest char in the string satisfying the predicate,
         * or -1 if there is no such char.
         *
         * @param {number} columnNumber the column index starts testing
         * @param {(theChar: string) => Boolean} predicate to test the char
         * @returns {number} -1 if there is no such char
         *
         * @memberOf String
         */
        findLastIndex(predicate: (theChar: string) => boolean, columnNumber?: number, ): number;

        /**
         * Takes a predicate and returns the index of the first leftest char in the string satisfying the predicate,
         * or -1 if there is no such char.
         *
         * @param {number} columnNumber the column index starts testing
         * @param {(theChar: string) => boolean} predicate to test the char
         * @returns {number} -1 if there is no such char
         *
         * @memberOf String
         */
        findFirstIndex(predicate: (theChar: string) => boolean, columnNumber?: number, ): number;
    }
}

String.prototype.findFirstIndex = function (predicate: (theChar: string) => boolean, columnNumber?: number) {
    const len = this.length;
    if (typeof columnNumber === 'undefined') {
        columnNumber = len;
    }
    else {
        columnNumber--;
    }

    for (let i = columnNumber; i >= 0; i--) {
        if (predicate(this[i])) {
            return i + 1;
        }
    }

    return 0;
};

String.prototype.findLastIndex = function (predicate: (theChar: string) => boolean, columnNumber?: number) {
    const len = this.length;
    if (typeof columnNumber === 'undefined') {
        columnNumber = len;
    }
    for (let i = columnNumber; i < len; i++) {
        if (predicate(this[i])) {
            return i;
        }
    }

    return len;
};

/**
 * Little util function to test non empty (whitespace) char using regex
 *
 * @param theChar
 */
const isNonEmptyChar = function (theChar: string): boolean {
    return /\S/.test(theChar);
};

function getCurrentLine(editor: vscode.TextEditor): string {
    const position = editor.selection.active;
    const range = new vscode.Range(position.with(position.line, 0), position.with(position.line + 1, 0));
    return editor.document.getText(range);
}

function deleteHorizontalSpace(editor: vscode.TextEditor) {
    let position = editor.selection.active;
    const document = editor.document;
    const line = getCurrentLine(editor);
    const first = line.findFirstIndex(isNonEmptyChar, position.character);
    const last = line.findLastIndex(isNonEmptyChar, position.character);
    if (first === last) return;
    const selection = new vscode.Selection(position.with(position.line, first), position.with(position.line, last));
    editor.selection = selection;
    editor.edit(editorBuilder => {
        editorBuilder.replace(selection, '');
    }).then(success => {
        position = editor.selection.active;
        editor.selection = new vscode.Selection(position, position);
    });
}
