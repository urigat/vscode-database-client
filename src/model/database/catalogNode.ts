import { DbTreeDataProvider } from "@/provider/treeDataProvider";
import { DatabaseCache } from "@/service/common/databaseCache";
import { QueryUnit } from "@/service/queryUnit";
import * as path from "path";
import * as vscode from "vscode";
import { Constants, ModelType } from "../../common/constants";
import { Util } from '../../common/util';
import { ConnectionManager } from "../../service/connectionManager";
import { CopyAble } from "../interface/copyAble";
import { Node } from "../interface/node";

export class CatalogNode extends Node implements CopyAble {


    public contextValue: string = ModelType.CATALOG;
    public iconPath: string = path.join(Constants.RES_PATH, "icon/database.svg");
    constructor(public database: string, readonly parent: Node) {
        super(database)
        this.init(this.parent)
        this.cacheSelf()
        const lcp = ConnectionManager.activeNode;
        if (this.isActive(lcp) && (lcp.database == this.database)) {
            this.iconPath = path.join(Constants.RES_PATH, "icon/database-active.svg");
            this.description = `Active`
        }
    }

    public getChildren(): Promise<Node[]> | Node[] {
        return this.parent.getChildren.call(this,true)
    }

    public async newQuery() {

        QueryUnit.showSQLTextDocument(this,'',`${this.database}.sql`)

    }

    public dropDatatabase() {

        vscode.window.showInputBox({ prompt: `Are you want to drop database ${this.schema} ?     `, placeHolder: 'Input database name to confirm.' }).then(async (inputContent) => {
            if (inputContent && inputContent.toLowerCase() == this.database.toLowerCase()) {
                this.execute(`DROP DATABASE ${this.wrap(this.database)}`).then(() => {
                    DatabaseCache.clearDatabaseCache(`${this.getConnectId()}`)
                    DbTreeDataProvider.refresh(this.parent);
                    vscode.window.showInformationMessage(`Drop database ${this.schema} success!`)
                })
            } else {
                vscode.window.showInformationMessage(`Cancel drop database ${this.schema}!`)
            }
        })

    }

    public copyName() {
        Util.copyToBoard(this.schema)
    }

}