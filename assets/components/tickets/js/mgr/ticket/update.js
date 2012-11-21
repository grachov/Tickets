Tickets.page.UpdateTicket = function(config) {
	config = config || {record:{}};
	config.record = config.record || {};
	Ext.applyIf(config,{
		panelXType: 'modx-panel-ticket'
	});
	config.canDuplicate = false;
	config.canDelete = false;
	Tickets.page.UpdateTicket.superclass.constructor.call(this,config);
};
Ext.extend(Tickets.page.UpdateTicket,MODx.page.UpdateResource,{

	getButtons: function(cfg) {
		var btns = [];
		if (cfg.canSave == 1) {
			btns.push({
				process: 'update'
				,text: _('save')
				,method: 'remote'
				,checkDirty: cfg.richtext || MODx.request.activeSave == 1 ? false : true
				,keys: [{
					key: MODx.config.keymap_save || 's'
					,ctrl: true
				}]
			});
			btns.push('-');
		} else if (cfg.locked) {
			btns.push({
				text: cfg.lockedText || _('locked')
				,handler: Ext.emptyFn
				,disabled: true
			});
			btns.push('-');
		}
		btns.push({
			text: _('resource_publish')
			,id: 'modx-ticket-publish'
			,hidden: cfg.record.published ? true : false
			,handler: this.publishTicket
		});
		btns.push({
			text: _('resource_unpublish')
			,id: 'modx-ticket-unpublish'
			,hidden: cfg.record.published ? false : true
			,handler: this.unpublishTicket
		});
		btns.push('-');
		btns.push({
			process: 'preview'
			,text: _('view')
			,handler: this.preview
			,scope: this
		});
		btns.push('-');
		btns.push({
			process: 'cancel'
			,text: _('cancel')
			,handler: this.cancel
			,scope: this
		});
		btns.push('-');
		btns.push({
			text: _('help_ex')
			,handler: MODx.loadHelpPane
		});
		return btns;
	}

	,publishTicket: function(btn,e) {
		MODx.Ajax.request({
			url: MODx.config.connectors_url+'resource/index.php'
			,params: {
				action: 'publish'
				,id: MODx.request.id
			}
			,listeners: {
				'success':{fn:function(r) {
					var p = Ext.getCmp('modx-resource-published');
					if (p) {
						p.setValue(1);
					}
					var po = Ext.getCmp('modx-resource-publishedon');
					if (po) {
						po.setValue(r.object.publishedon);
					}
					var bp = Ext.getCmp('modx-ticket-publish');
					if (bp) {
						bp.hide();
					}
					var bu = Ext.getCmp('modx-ticket-unpublish');
					if (bu) {
						bu.show();
					}
				},scope:this}
			}
		});
	}

	,unpublishTicket: function(btn,e) {
		MODx.Ajax.request({
			url: MODx.config.connectors_url+'resource/index.php'
			,params: {
				action: 'unpublish'
				,id: MODx.request.id
			}
			,listeners: {
				'success':{fn:function(r) {
					var p = Ext.getCmp('modx-resource-published');
					if (p) {
						p.setValue(0);
					}
					var po = Ext.getCmp('modx-resource-publishedon');
					if (po) {
						po.setValue('');
					}
					var bp = Ext.getCmp('modx-ticket-publish');
					if (bp) {
						bp.show();
					}
					var bu = Ext.getCmp('modx-ticket-unpublish');
					if (bu) {
						bu.hide();
					}
				},scope:this}
			}
		});
	}

	,cancel: function(btn,e) {
		var updatePage = MODx.action ? MODx.action['resource/update'] : 'resource/update';
		var fp = Ext.getCmp(this.config.formpanel);
		if (fp && fp.isDirty()) {
			Ext.Msg.confirm(_('warning'),_('resource_cancel_dirty_confirm'),function(e) {
				if (e == 'yes') {
					MODx.releaseLock(MODx.request.id);
					MODx.sleep(400);
					location.href = 'index.php?a='+updatePage+'&id='+this.config.record['parent'];
				}
			},this);
		} else {
			MODx.releaseLock(MODx.request.id);
			location.href = 'index.php?a='+updatePage+'&id='+this.config.record['parent'];
		}
	}
});
Ext.reg('tickets-page-ticket-update',Tickets.page.UpdateTicket);



Tickets.panel.Ticket = function(config) {
	config = config || {};
	Ext.applyIf(config,{
	});
	Tickets.panel.Ticket.superclass.constructor.call(this,config);
};
Ext.extend(Tickets.panel.Ticket,MODx.panel.Resource,{
	getFields: function(config) {
		var it = [];
		it.push({
			title: _('ticket')
			,id: 'modx-resource-settings'
			,cls: 'modx-resource-tab'
			,layout: 'form'
			,labelAlign: 'top'
			,labelSeparator: ''
			,bodyCssClass: 'tab-panel-wrapper main-wrapper'
			,autoHeight: true
			,defaults: {
				border: false
				,msgTarget: 'under'
				,width: 400
			}
			,items: this.getMainFields(config)
		});
		it.push({
			title: _('comments')
			,id: 'modx-tickets-comments'
			,cls: 'modx-resource-tab'
			,layout: 'form'
			,labelAlign: 'top'
			,labelSeparator: ''
			,bodyCssClass: 'tab-panel-wrapper main-wrapper'
			,autoHeight: true
			,items: this.getComments(config)
		});
		/*
		 it.push({
		 title: _('ticket_statistics')
		 ,autoHeight: true
		 ,items: [{
		 html: _('ticket_statistics.intro_msg')
		 ,border: false
		 ,bodyCssClass: 'panel-desc'
		 },{
		 xtype: 'panel'
		 ,bodyCssClass: 'main-wrapper'
		 ,autoHeight: true
		 ,border: false
		 ,items: [{
		 html: '<p>Statistics goes here.</p>'
		 ,border: false
		 }]
		 }]
		 });*/
		if (config.show_tvs && MODx.config.tvs_below_content != 1) {
			it.push(this.getTemplateVariablesPanel(config));
		}
		if (MODx.perm.resourcegroup_resource_list == 1) {
			it.push(this.getAccessPermissionsTab(config));
		}
		var its = [];
		its.push(this.getPageHeader(config),{
			id:'modx-resource-tabs'
			,xtype: 'modx-tabs'
			,forceLayout: true
			,deferredRender: false
			,collapsible: true
			,itemId: 'tabs'
			,stateful: true
			,stateId: 'tickets-ticket-upd-tabpanel'
			,stateEvents: ['tabchange']
			,getState:function() {return { activeTab:this.items.indexOf(this.getActiveTab())};}
			,items: it
		});

		if (MODx.config.tvs_below_content == 1) {
			var tvs = this.getTemplateVariablesPanel(config);
			tvs.style = 'margin-top: 10px';
			its.push(tvs);
		}
		return its;
	}

	,getMainLeftFields: function(config) {
		config = config || {record:{}};
		var mlf = [{
			xtype: 'textfield'
			,fieldLabel: _('resource_pagetitle')+'<span class="required">*</span>'
			,description: '<b>[[*pagetitle]]</b><br />'+_('resource_pagetitle_help')
			,name: 'pagetitle'
			,id: 'modx-resource-pagetitle'
			,maxLength: 255
			,anchor: '100%'
			,allowBlank: false
			,enableKeyEvents: true
			,listeners: {
				'keyup': {scope:this,fn:function(f,e) {
					var title = Ext.util.Format.stripTags(f.getValue());
					Ext.getCmp('modx-resource-header').getEl().update('<h2>'+title+'</h2>');
				}}
			}
		}];

		mlf.push({
			xtype: 'textfield'
			,fieldLabel: _('resource_longtitle')
			,description: '<b>[[*longtitle]]</b><br />'+_('resource_longtitle_help')
			,name: 'longtitle'
			,id: 'modx-resource-longtitle'
			,anchor: '100%'
			,value: config.record.longtitle || ''
		});

		mlf.push({
			xtype: 'textarea'
			,fieldLabel: _('resource_summary')
			,description: '<b>[[*introtext]]</b><br />'+_('resource_summary_help')
			,name: 'introtext'
			,id: 'modx-resource-introtext'
			,anchor: '100%'
			,value: config.record.introtext || ''
		});


		var ct = this.getContentField(config);
		if (ct) {
			mlf.push(ct);
		}
		return mlf;
	}

	,getContentField: function(config) {
		return [{
			id: 'modx-content-above'
			,border: false
		},{
			xtype: 'textarea'
			,fieldLabel: _('content')
			,name: 'ta'
			,id: 'ta'
			,anchor: '100%'
			,height: 400
			,grow: false
			,value: (config.record.content || config.record.ta) || ''
		},{
			id: 'modx-content-below'
			,border: false
		}];
	}


	,getMainRightFields: function(config) {
		config = config || {};
		return [{
			xtype: 'fieldset'
			,title: _('ticket_publishing_information')
			,id: 'tickets-box-publishing-information'
			,defaults: {
				msgTarget: 'under'
			}
			,items: [{
				xtype: 'tickets-combo-publish-status'
				,id: 'modx-resource-published'
				,name: 'published'
				,hiddenName: 'published'
				,fieldLabel: _('ticket_status')
			},{
				xtype: 'xdatetime'
				,fieldLabel: _('resource_publishedon')
				,description: '<b>[[*publishedon]]</b><br />'+_('resource_publishedon_help')
				,name: 'publishedon'
				,id: 'modx-resource-publishedon'
				,allowBlank: true
				,dateFormat: MODx.config.manager_date_format
				,timeFormat: MODx.config.manager_time_format
				,dateWidth: 120
				,timeWidth: 120
				,value: config.record.publishedon
			},{
				xtype: MODx.config.publish_document ? 'xdatetime' : 'hidden'
				,fieldLabel: _('resource_publishdate')
				,description: '<b>[[*pub_date]]</b><br />'+_('resource_publishdate_help')
				,name: 'pub_date'
				,id: 'modx-resource-pub-date'
				,allowBlank: true
				,dateFormat: MODx.config.manager_date_format
				,timeFormat: MODx.config.manager_time_format
				,dateWidth: 120
				,timeWidth: 120
				,value: config.record.pub_date
			},{
				xtype: MODx.config.publish_document ? 'xdatetime' : 'hidden'
				,fieldLabel: _('resource_unpublishdate')
				,description: '<b>[[*unpub_date]]</b><br />'+_('resource_unpublishdate_help')
				,name: 'unpub_date'
				,id: 'modx-resource-unpub-date'
				,allowBlank: true
				,dateFormat: MODx.config.manager_date_format
				,timeFormat: MODx.config.manager_time_format
				,dateWidth: 120
				,timeWidth: 120
				,value: config.record.unpub_date
			},{
				xtype: MODx.config.publish_document ? 'modx-combo-user' : 'hidden'
				,fieldLabel: _('resource_createdby')
				,description: '<b>[[*createdby]]</b><br />'+_('resource_createdby_help')
				,name: 'created_by'
				,hiddenName: 'createdby'
				,id: 'modx-resource-createdby'
				,allowBlank: true
				,baseParams: {
					action: 'getList'
					,combo: '1'
					,limit: 0
				}
				,width: 300
				,value: config.record.createdby
			}]
		},{
			html: '<hr />'
			,border: false
		},{
			xtype: 'fieldset'
			,title: _('ticket_ticket_options')
			,id: 'tickets-box-options'
			,defaults: {
				msgTarget: 'under'
			}
			,items: [{
				xtype: 'modx-combo-template'
				,fieldLabel: _('resource_template')
				,description: '<b>[[*template]]</b><br />'+_('resource_template_help')
				,name: 'template'
				,id: 'modx-resource-template'
				,anchor: '100%'
				,editable: false
				,baseParams: {
					action: 'getList'
					,combo: '1'
				}
			}
			/*
			,{
				xtype: 'textfield'
				,fieldLabel: _('ticket_ticket_alias')
				,description: '<b>[[*alias]]</b><br />'+_('ticket_ticket_alias_help')
				,name: 'alias'
				,id: 'modx-resource-alias'
				,maxLength: 100
				,anchor: '100%'
				,value: config.record.alias || ''
			},{
				xtype: 'textfield'
				,fieldLabel: _('ticket_ticket_tags')
				,description: _('ticket_ticket_tags_help')
				,name: 'tags'
				,id: 'modx-resource-tags'
				,anchor: '100%'
				,value: config.record.tags || ''
			}
			*/
			,{
				xtype: 'hidden'
				,name: 'menutitle'
				,id: 'modx-resource-menutitle'
				,value: config.record.menutitle || ''

			},{
				xtype: 'hidden'
				,name: 'link_attributes'
				,id: 'modx-resource-link-attributes'
				,value: config.record.link_attributes || ''

			},{
				xtype: 'hidden'
				,name: 'richtext'
				,id: 'modx-resource-richtext'
				,value: parseInt(config.record.richtext)

			},{
				xtype: 'hidden'
				,name: 'hidemenu'
				,id: 'modx-resource-hidemenu'
				,value: config.record.hidemenu

			}]
		}]
	}

	,getComments: function(config) {
		return [{
			xtype: 'tickets-tab-comments'
			,record: config.record
			,parents: config.record.id
			,layout: 'form'
		}];
	}

});
Ext.reg('modx-panel-ticket',Tickets.panel.Ticket);