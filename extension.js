const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('"select-next-occurance" is now active!');

	const getLastSelection = () => {
		const { selections } = vscode.window.activeTextEditor;
		return selections[selections.length - 1];
	};

	const selectedText = () => {
		const { document, selection } = vscode.window.activeTextEditor;
		return document.getText(selection);
	};

	const selectRange = (startIndex, endIndex) => {
		const editor = vscode.window.activeTextEditor;
		const { document } = editor;
		const newSelectionStart = document.positionAt(startIndex)
		const newSelectionEnd = document.positionAt(endIndex)
		editor.selection = new vscode.Selection(newSelectionStart, newSelectionEnd);
		editor.revealRange(new vscode.Range(newSelectionStart, newSelectionEnd));
	};

	const search = (start, end, reversed) => {
		const { selection, document } = vscode.window.activeTextEditor;
		// console.log("searching", document.offsetAt(start), document.offsetAt(end), reversed);

		const text = document.getText(
			new vscode.Range(document.positionAt(0), end)
		);
		const searchText = selectedText();
		var foundIndex;
		if(reversed == true){
			foundIndex = text.lastIndexOf(searchText, document.offsetAt(end));
		}else{
			foundIndex = text.indexOf(searchText, document.offsetAt(start));
		}
	

		if (foundIndex >= 0) {		
			selectRange(foundIndex, foundIndex + searchText.length);
			return true;
		}

		return false
	};

	const searchForward = () => {
		const { selection, document } = vscode.window.activeTextEditor;
		const documentStart = document.positionAt(0);
		const documentEnd = document.positionAt(Infinity);

		if(selection){
			//selection end to end of file
			var foundNext = search(selection.end, documentEnd, false);
			if(foundNext == false){
				//wrap and search begining of file to selection start
				foundNext = search(documentStart, selection.start, false)
				if (foundNext == false) {
					//no other occurances found
					vscode.window.showInformationMessage('no more occurances found in file');
				}
			}
		}
	};

	const searchBackwards = () => {
		const { selection, document } = vscode.window.activeTextEditor;
		const documentStart = document.positionAt(0);
		const documentEnd = document.positionAt(Infinity);
		
		if (selection) {
			//selection start to begining of file
			var foundPrev = search(documentStart, selection.start, true)
			if (foundPrev == false) {
				//wrap and search end of file to selection end
				foundPrev = search(selection.end, documentEnd, true)
				if (foundPrev == false) {
					//no other occurances found
					vscode.window.showInformationMessage('no more occurances found in file');
				}
			}
		}
	};




	let next = vscode.commands.registerCommand('extension.selectNextOccurance', function () {
		searchForward();
	});

	context.subscriptions.push(next);

	let previous = vscode.commands.registerCommand('extension.selectPreviousOccurance', function () {
		searchBackwards();
	});

	context.subscriptions.push(previous);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
