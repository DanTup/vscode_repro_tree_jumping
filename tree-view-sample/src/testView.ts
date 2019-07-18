import * as vscode from 'vscode';

export class TestView {

	constructor(context: vscode.ExtensionContext) {
		const prov = new DataProvider();
		const view = vscode.window.createTreeView('testView', { treeDataProvider: prov, showCollapseAll: true });
		view.onDidChangeSelection((e) => {
			if (e.selection && e.selection.length === 1)
				prov.onDidChangeTreeDataEmitter.fire(e.selection[0]);
		});
		vscode.commands.registerCommand('testView.reveal', async () => {
			const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			if (key) {
				await view.reveal({ key }, { focus: true, select: false, expand: true });
			}
		});
	}
}

const tree = {};
for (let i = 0; i < 1000; i++)
	tree[`node${i}`] = {};
let nodes = {};

class DataProvider implements vscode.TreeDataProvider<{ key: string }> {
	public onDidChangeTreeDataEmitter: vscode.EventEmitter<{ key: string }> = new vscode.EventEmitter<{ key: string }>();
	public readonly onDidChangeTreeData: vscode.Event<{ key: string }> = this.onDidChangeTreeDataEmitter.event;

	public getChildren(element: { key: string }): { key: string }[] {
		return getChildren(element ? element.key : undefined).map(key => getNode(key));
	}
	public getTreeItem(element: { key: string }): vscode.TreeItem {
		const treeItem = getTreeItem(element.key);
		treeItem.id = element.key;
		return treeItem;
	}
	public getParent({ key }: { key: string }): { key: string } {
		const parentKey = key.substring(0, key.length - 1);
		return parentKey ? new Key(parentKey) : void 0;
	}
}

function getChildren(key: string): string[] {
	if (!key) {
		return Object.keys(tree);
	}
	let treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	return {
		label: key,
		tooltip: `Tooltip for ${key}`,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}
