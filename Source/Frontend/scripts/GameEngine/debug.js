var dbg = {
    enabled: false,
    dialogDiv: $("<div id='debug_div' title='Debugger'></div>"),
    mainTable: $("<table style='width: 100%; font-size: 12px; color: #ffffff' colspan='0' colspace='0'><thead><tr><td><strong>Name</strong></td><td><strong>Value</strong></td></tr></thead></table>"),
    init: function() {
        this.dialogDiv.html(this.mainTable);
        this.dbgDialog = this.dialogDiv.dialog({ position: ['right', 'top'] });
        this.enabled = true;
    },
    hide: function() {
        this.dialogDiv.dialog('close');
        this.enabled = false;
    },
    add: function(name, value) {
        if (!this.enabled)
            return;
            
        var row = $("td.#" + name, dbg.mainTable);
        if (row.length == 0) {
            $("tr:last", this.mainTable).after("<tr><td>" + name + "</td><td id='" + name + "'>" + value + "</td></tr>");
        }
        else {
            row.text(value);
        }
    },
};