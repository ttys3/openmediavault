/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2020 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/WorkspaceManager.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/workspace/grid/Panel.js")
// require("js/omv/util/Format.js")
// require("js/omv/service/SystemInfo.js")

/**
 * @class OMV.module.admin.diagnostic.system.Overview
 * @derived OMV.workspace.grid.Panel
 */
Ext.define("OMV.module.admin.diagnostic.system.Overview", {
	extend: "OMV.workspace.grid.Panel",
	requires: [
		"OMV.data.Store",
		"OMV.data.Model",
		"OMV.util.Format",
		"OMV.service.SystemInfo"
	],

	autoReload: false,
	hideTopToolbar: true,
	hidePagingToolbar: true,
	hideHeaders: true,
	disableSelection: true,
	columns: [{
		dataIndex: "name",
		stateId: "name",
		width: 150,
		renderer: function(value, metaData, record) {
			return _(value);
		}
	},{
		dataIndex: "value",
		stateId: "value",
		flex: 1,
		renderer: function(value, metaData, record) {
			var me = this;
			var result = value;
			switch (record.get("type")) {
			case "time":
				var renderer = OMV.util.Format.localeTimeRenderer();
				result = renderer.apply(me, arguments);
				break;
			case "progress":
				var renderer = OMV.util.Format.progressBarRenderer(
				  value.value / 100, value.text);
				result = renderer.apply(me, arguments);
				break;
			default:
				// Nothing to do here
				break;
			}
			return result;
		}
	}],
	viewConfig: {
		markDirty: false,
		trackOver: false
	},

	initComponent: function() {
		var me = this;
		me.store = Ext.create("OMV.data.Store", {
			autoLoad: false,
			model: OMV.data.Model.createImplicit({
				idProperty: "index",
				fields: [
					{ name: "index", type: "int" },
					{ name: "type", type: "string" },
					{ name: "name", type: "string" },
					{ name: "value", type: "auto" }
				]
			}),
			data: [],
			sorters: [{
				direction: "ASC",
				property: "index"
			}]
		});
		me.callParent(arguments);
		OMV.service.SystemInfo.on("refresh", me.onRefreshSystemInfo, me);
	},

	destroy: function() {
		var me = this;
		OMV.service.SystemInfo.un("refresh", me.onRefreshSystemInfo, me);
		me.callParent();
	},

	onRefreshSystemInfo: function(c, info) {
		var me = this;
		if (!Ext.isEmpty(info)) {
			var index = 0;
			me.getStore().addData([{
				"name": _("Hostname"),
				"value": info.hostname,
				"index": index++,
				"type": "string",
			},{
				"name": _("Version"),
				"value": info.version,
				"index": index++,
				"type": "string",
			},{
				"name": _("Processor"),
				"value": info.cpuModelName,
				"index": index++,
				"type": "string",
			},{
				"name": _("Kernel"),
				"value": info.kernel,
				"index": index++,
				"type": "string",
			},{
				"name": _("System time"),
				"value": info.time,
				"index": index++,
				"type": "string",
			},{
				"name": _("Uptime"),
				"value": info.uptime,
				"index": index++,
				"type": "string",
			},{
				"name": _("Load average"),
				"value": info.loadAverage,
				"index": index++,
				"type": "string",
			},{
				"name": _("CPU usage"),
				"value": {
					"text": info.cpuUsage.toFixed(1) + "%",
					"value": info.cpuUsage
				},
				"index": index++,
				"type": "progress",
			},{
				"name": _("Memory usage"),
				"value": {
					"text": (info.memUsed / info.memTotal).toFixed(1) +
						"% of " + parseInt(info.memTotal).binaryFormat(),
					"value": info.memUsed / info.memTotal
				},
				"index": index++,
				"type": "progress",
			}]);
		}
	}
});

OMV.WorkspaceManager.registerPanel({
	id: "overview",
	path: "/diagnostic/system",
	text: _("Overview"),
	position: 10,
	className: "OMV.module.admin.diagnostic.system.Overview"
});
