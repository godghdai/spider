    Ext.onReady(function() {
        var tab = null;
        var propertyGrid, _from = "",
            _city = "",
            _companyName = "";


        Ext.define('ForumThread', {
            extend: 'Ext.data.Model',
            fields: [
                "positionName", "salary", "city", "workYear", "education", "company", "industryField", "financeStage", "companySize", '_id', "_from"
            ],
            idProperty: '_id'
        });

        var store = Ext.create('Ext.data.Store', {
            pageSize: 50,
            model: 'ForumThread',
            remoteSort: true,
            proxy: {
                type: 'ajax',
                url: 'http://localhost:3000/list',
                disableCaching: false,
                reader: {
                    root: 'topics',
                    totalProperty: 'total'
                },
                simpleSortMode: true
            },
            sorters: [{
                property: 'city',
                direction: 'DESC'
            }]
        });

        store.on('beforeload', function(store, options) {
            var _params = {
                "_from": _from,
                "_city": _city,
                "_companyName": _companyName
            };
            Ext.apply(store.proxy.extraParams, _params);

        });

        var grid = Ext.create('Ext.grid.Panel', {
            store: store,
            disableSelection: false,
            loadMask: true,
            region: 'center',
            tbar: [{
                    xtype: 'splitbutton',
                    text: '学历',
                    menu: [{
                        text: '本科',
                        handler: function() {
                            alert("Item 1 clicked");
                        }
                    }, {
                        text: '中专',
                        handler: function() {
                            alert("Item 2 clicked");
                        }
                    }]
                }, {
                    xtype: 'combo',
                    fieldLabel: '城市',
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
                            "name": "北京"
                        }, {
                            "abbr": "SH",
                            "name": "上海"
                        }, {
                            "abbr": "GZ",
                            "name": "广州"
                        }, {
                            "abbr": "SZ",
                            "name": "深圳"
                        }]
                    }),
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'abbr',
                    listeners: {
                        'select': function(combo, records, eOpts) {
                            _city = records[0]["data"]["name"];
                            if (_city == "所有") _city = "";
                            store.loadPage(1);
                        }
                    }
                },
                '-', {
                    xtype: 'label',
                    forId: 'myFieldId',
                    text: '公司：'
                }, {
                    xtype: 'textfield',
                    id: 'companyName',
                    emptyText: '输入公司名',
                    listeners: {
                        specialkey: function(field, e) {
                            if (e.getKey() == Ext.EventObject.ENTER) {
                                _companyName = Ext.getCmp("companyName").getValue();
                                store.loadPage(1);
                            }
                        }
                    }
                }, {
                    text: '搜索',
                    listeners: {
                        click: function() {
                            //  console.dir(Ext.getCmp("companyName").getValue());
                            _companyName = Ext.getCmp("companyName").getValue();
                            store.loadPage(1);
                        }
                    }
                }
            ],
            viewConfig: {
                id: 'gv',
                trackOver: true,
                stripeRows: true

            },

            columns: [{
                text: "职位",
                dataIndex: 'positionName',
                flex: 1,
                sortable: false
            }, {
                text: "待遇",
                dataIndex: 'salary',
                width: 100,
                sortable: true
            }, {
                text: "城市",
                dataIndex: 'city',
                width: 70,
                align: 'right',
                sortable: true
            }, {
                text: "经验",
                dataIndex: 'workYear',
                width: 150,
                sortable: true
            }, {
                id: 'education',
                text: "学历",
                dataIndex: 'education',
                width: 150,
                sortable: true
            }, {
                id: 'company',
                text: "公司",
                dataIndex: 'company',
                width: 150,
                sortable: true
            }, {
                id: 'industryField',
                text: "industryField",
                dataIndex: 'industryField',
                width: 150,
                sortable: true
            }, {
                id: 'financeStage',
                text: "financeStage",
                dataIndex: 'financeStage',
                width: 150,
                sortable: true
            }, {
                id: 'companySize',
                text: "规模",
                dataIndex: 'companySize',
                width: 150,
                sortable: true
            }, {
                text: "来源",
                dataIndex: '_from',
                width: 150,
                sortable: true
            }],
            // paging bar on the bottom
            bbar: Ext.create('Ext.PagingToolbar', {
                store: store,
                displayInfo: true
            })
        });
        store.loadPage(1);


        var viewport = Ext.create('Ext.Viewport', {
            id: 'border-example',
            layout: 'border',
            items: [
                Ext.create('Ext.Component', {
                    region: 'north',
                    height: 32,
                    autoEl: {
                        tag: 'div',
                        html: '<strong style="line-height: 32px;margin-left: 10px;">爬虫测试</strong>'
                    }
                }), {
                    region: 'south',
                    contentEl: 'south',
                    split: true,
                    height: 100,
                    minSize: 100,
                    maxSize: 200,
                    collapsible: true,
                    collapsed: true,
                    title: 'South',
                    margins: '0 0 0 0'
                }, {
                    region: 'west',
                    xtype: 'treepanel',
                    title: '菜单',
                    width: 200,
                    height: 150,
                    collapsible: true,
                    split: true,
                    animCollapse: true,
                    store: Ext.create('Ext.data.TreeStore', {
                        root: {
                            expanded: true,
                            children: [{
                                text: "Nodejs招聘",
                                expanded: true,
                                children: [{
                                    text: "BOSS招聘",
                                    leaf: true
                                }, {
                                    text: "拉勾",
                                    leaf: true
                                }]
                            }, {
                                text: "nodejs api",
                                leaf: true
                            }, {
                                text: "devdocs",
                                leaf: true
                            }, {
                                text: "cron表达式生成",
                                leaf: true
                            }]
                        }
                    }),
                    rootVisible: false,
                    listeners: {
                        itemclick: function(view, record, item, index, e, eOpts) {

                            var id = record.get('text');

                            switch (id) {
                                case "Nodejs招聘":
                                    _from = "";
                                    store.loadPage(1);
                                    break;
                                case "BOSS招聘":
                                case "拉勾":
                                    _from = id;
                                    store.loadPage(1);
                                    break;
                                default:
                                    var dic = {
                                        "nodejs api": "https://nodejs.org/api/",
                                        "devdocs": "http://devdocs.io/",
                                        "cron表达式生成": "./cron/index.html"
                                    };
                                    if (!Ext.getCmp(id)) {
                                        tab.add({
                                            title: record.get('text'),
                                            html: ' <iframe scrolling="auto" frameborder="0" width="100%" height="100%" src="' + (dic[record.get('text')] || "https://www.baidu.com/") + '"> </iframe>',
                                            closable: true,
                                            id: id
                                        });

                                    }
                            }
                            tab.setActiveTab(id);
                            // Ext.Msg.alert('Status', 'Changes saved successfully.');

                        }

                    }
                },

                tab = Ext.create('Ext.tab.Panel', {
                    region: 'center',
                    deferredRender: false,
                    activeTab: 1,
                    items: [{
                        contentEl: 'info',
                        title: '说明',
                        autoScroll: true
                    }, {
                        title: '招聘信息聚合',
                        layout: 'border',
                        items: [grid,

                            propertyGrid = Ext.create('Ext.grid.PropertyGrid', {
                                region: 'east',
                                title: '招聘信息Get',
                                animCollapse: true,
                                collapsible: true,
                                split: true,
                                width: 225,
                                minSize: 175,
                                maxSize: 400,
                                margins: '0 5 0 0',
                                dockedItems: [{
                                    dock: 'top',
                                    xtype: 'toolbar',
                                    items: ['->', {
                                        xtype: 'button',
                                        text: '获取最新招聘信息',
                                        tooltip: 'Test Button',
                                        listeners: {
                                            click: function() {

                                                if (propertyGrid.getSource()["页数"] == null) {
                                                    Ext.Msg.alert('提示', '页数为空!!');
                                                    return;
                                                };

                                                var p;
                                                var newWin = new Ext.Window({
                                                    width: 300,
                                                    height: 70,
                                                    modal: true,
                                                    closable: false,
                                                    resizable: false,
                                                    bodyStyle: 'background:#e8e8e8; border-color:#e8e8e8;',
                                                    items: [p = Ext.create('Ext.ProgressBar', {
                                                        region: 'center'
                                                    })]
                                                });

                                                newWin.show();

                                                p.wait({
                                                    interval: 500,
                                                    text: '正在努力更新...'
                                                });

                                                Ext.Ajax.request({
                                                    url: 'http://localhost:3000/spider',
                                                    method: 'GET',
                                                    params: {
                                                        pages: propertyGrid.getSource()["页数"]
                                                    },
                                                    success: function(response) {
                                                        var text = response.responseText;
                                                        p.reset();
                                                        p.updateText('down!');
                                                        newWin.close();
                                                        store.loadPage(1);
                                                    },
                                                    failure: function(response, options) {
                                                        p.reset();
                                                        p.updateText('请求超时或网络故障!');
                                                        newWin.close();
                                                    }
                                                });
                                            }
                                        }
                                    }]
                                }],
                                closable: true,
                                source: {
                                    "cron表达式": "",
                                    "自动获取": false,
                                    "页数": 5
                                }
                            })



                        ]

                    }]
                })
            ]
        });



    });