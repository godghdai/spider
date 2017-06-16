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
            fields: ['from','city','sum']
        });

        var grid2 = Ext.create('Ext.grid.Panel', {
            store: store2,
            title: '来源城市职位统计',
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
            },{
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
            fields: ['city','salary','sum']
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
            },{
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
                items: [grid,grid2,grid3]
            }
        ]
        me.callParent();
    }
});

