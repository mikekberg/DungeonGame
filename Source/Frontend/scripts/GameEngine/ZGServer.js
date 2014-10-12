/// <reference path="../Libraries/jquery-1.6.2.js" />

var ZGServer = function(ip, port) {
	this.ip = ip || GameData.Server.ip || "127.0.0.1";
	this.port = port || GameData.Server.port || 3479;
	this.status = "DISCONNECTED";
	this.cid = -1;
	this.lAid = -1;
	this.loggedin = false;
	this.actionHandler = {}

	this.login = function(user, pass) {
		$.ajaxSetup({url: "http://" + this.ip + ":" + this.port + "/", global: false, type: "GET" });
		var loginResponse = $.ajax({data: { aid: ActionList.LOGIN, username: user, password: pass}, async: false});
		
		if (loginResponse.status == 0) {
			throw "Unable to connect to server '" + this.ip + "' on port " + this.port;
		}
		
		var loginData = JSON.parse(loginResponse.responseText);
		this.cid = loginData.cid;
		this.lAid = loginData.lastActionID;
		this.loggedin = true;
		var curThis = this;
		$.ajax({data: { aid: ActionList.POLL, lastActionID: this.lAid, cid: this.cid}, success: function(data) { curThis.pollResponse(data, curThis); }});
	}
	
	this.sendGlobalMessage = function(message) {
		$.ajax({data: { aid: ActionList.GLOBAL_MESSAGE, cid: this.cid, message: message}});
	};
	
	this.pollResponse = function(data, server) {
		if (!server.loggedin) {
			return;
		}
		
		for (var actionData in data.actionList) {
			if (this.actionHandler[data.actionList[actionData].actionID]) {
				var curAction = data.actionList[actionData];
				var reflectData = this.actionHandler[data.actionList[actionData].actionID].toString();
				reflectData = reflectData.slice(reflectData.indexOf("(")+1, reflectData.indexOf(")")).split(",");
				var functionCallTxt = "this.actionHandler[data.actionList[actionData].actionID](";
				
				for (var parm in reflectData) {
					var tParm = reflectData[parm].replace(/\s/g, "");
					if (curAction[tParm] != null) {
						functionCallTxt += "curAction." + tParm + ",";
					}
				}
				functionCallTxt = functionCallTxt.slice(0, (functionCallTxt.lastIndexOf(",") > -1 ? functionCallTxt.lastIndexOf(",") : functionCallTxt.length)) + ");";
				eval(functionCallTxt);
			}
		}
		this.lAid = data.currentActionID;
		setTimeout(function() {
					$.ajax({data: { aid: ActionList.POLL, lastActionID: server.lAid, cid: server.cid}, 
							success: function(data) { server.pollResponse(data, server) }});
				   }, 3000);
	};
	
	this.addActionHandler = function(actionID, handler) {
		this.actionHandler[actionID] = handler;
	}
	
	this.actionHandler[ActionList.GLOBAL_MESSAGE] = this.HandleGlobalMessage;
}

var ActionList = {
	ERROR: -1,
	LOGIN: 0,
	LOGIN_SUCCESSFUL: 1,
	LOGIN_FAILED: 2,
	POLL: 3,
	POLL_RESPONSE: 4,
	SYNC: 5,
	SYNC_RESPONSE: 6,
	GLOBAL_MESSAGE: 10,
};