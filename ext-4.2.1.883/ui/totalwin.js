Ext.define('spider.ux.TotalWin', {
    extend: 'Ext.window.Window',
    title: '统计信息',
    height: 800,
    width: 400,
    layout: 'border',
    modal: true,
    initComponent: function (cfg) {
        var me = this;
        var store = new Ext.data.JsonStore({
            proxy: {
                type: 'ajax',
                url: 'http://localhost:3000/listone',
                reader: {
                    type: 'json',
                    root: 'datas',
                    idProperty: '_id'
                }
            },
            fields: ['_id', 'sum']
        });

        var grid = Ext.create('Ext.grid.Panel', {
            store: store,
            title: '城市职位统计',
            disableSelection: false,
            loadMask: true,
            region: 'center',
            viewConfig: {
                id: 'gv2',
                trackOver: true,
                stripeRows: true

            },
            columns: [{
                text: "城市",
                dataIndex: '_id',
                width: 150,
                sortable: false
            }, {
                text: "SUM",
                dataIndex: 'sum',
                width: 100,
                sortable: true
            }],
            listeners: {
                itemclick: function (view, record, item, index, e, eOpts) {

                }
            }
        });
        store.load();

        var store2 = new Ext.data.JsonStore({
            proxy: {
                type: 'ajax',
                url: 'http://localhost:3000/listtwo',
                reader: {
                    type: 'json',
                    root: 'datas'
                }
            },
            fields: ['from', 'city', 'sum']
        });

        var grid2 = Ext.create('Ext.grid.Panel', {
            store: store2,
            disableSelection: false,
            loadMask: true,
            region: 'center',
            viewConfig: {
                id: 'gv3',
                trackOver: true,
                stripeRows: true

            },
            columns: [{
                text: "来源",
                dataIndex: 'from',
                width: 150,
                sortable: false
            }, {
                text: "城市",
                dataIndex: 'city',
                width: 150,
                sortable: false
            }, {
                text: "SUM",
                dataIndex: 'sum',
                width: 100,
                sortable: true
            }],
            listeners: {
                itemclick: function (view, record, item, index, e, eOpts) {

                }
            }
        });
        store2.load();


        var store3 = new Ext.data.JsonStore({
            proxy: {
                type: 'ajax',
                url: 'http://localhost:3000/listthree',
                reader: {
                    type: 'json',
                    root: 'datas'
                }
            },
            fields: ['city', 'salary', 'sum']
        });

        var grid3 = Ext.create('Ext.grid.Panel', {
            store: store3,
            title: '城市工资统计',
            disableSelection: false,
            loadMask: true,
            region: 'center',
            viewConfig: {
                id: 'gv4',
                trackOver: true,
                stripeRows: true

            },
            columns: [{
                text: "城市",
                dataIndex: 'city',
                width: 150,
                sortable: false
            }, {
                text: "工资",
                dataIndex: 'salary',
                width: 150,
                sortable: false
            }, {
                text: "SUM",
                dataIndex: 'sum',
                width: 100,
                sortable: true
            }],
            listeners: {
                itemclick: function (view, record, item, index, e, eOpts) {

                }
            }
        });
        store3.load();


        me.items = [
            {
                xtype: 'tabpanel',
                region: 'center',
                items: [grid, {
                    title: '来源城市职位统计',
                    tbar: ['-',{
                        xtype: 'combo',
                        fieldLabel: '来源',
                        emptyText: "所有",
                        labelWidth: 30,
                        width: 100,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['abbr', 'name'],
                            data: [{
                                "abbr": "BJ",
                                "name": "所有"
                            }, {
                                "abbr": "BJ",
                                "name": "BOSS招聘"
                            }, {
                                "abbr": "SH",
                                "name": "拉勾"
                            }, {
                                "abbr": "GZ",
                                "name": "智联"
                            }]
                        }),
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'abbr',
                        listeners: {
                            'select': function (combo, records, eOpts) {
                                _city = records[0]["data"]["name"];
                                if (_city == "所有") _city = "";
                                store.loadPage(1);
                            }
                        }
                    }],
                    layout: 'border',
                    items: [grid2]
                }, grid3]
            }
        ]
        me.callParent();
    }
});

