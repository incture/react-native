sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/Log"
], function (Controller, History, MessageBox, JSONModel, Filter, FilterOperator, Log) {
	"use strict";

	return Controller.extend("com.incture.lch.Accountant.controller.BaseController", {

		_oCommon: {},

		oLoadmore: {},

		iGroupId: 0, //to-do  move this to _oCommon

		fnInitializeApp: function () {
			var oThisController = this;
			var oMdlCommon = this.getModel("mCommon");
			var sRootPath = jQuery.sap.getModulePath("com.incture.lch.Accountant");
			/*oThisController.fnTaskDetails();*/
			oThisController.fnSetCurrentUser();
		
			oMdlCommon.attachRequestCompleted(function (oEvent) {
				oMdlCommon.setProperty("/today", new Date());
				oMdlCommon.refresh();

				/*	oThisController.fnManageSrvCall();*/

			});
			oMdlCommon.loadData(sRootPath + "/model/Property.json", null, false);

			Array.prototype.uniqueByStrProp = function (prop1, prop2) {
				var aAll = this;
				var aUnique = [];
				for (var i = 0; i < aAll.length; i++) {
					var oCurRow = aAll[i];
					if (aUnique.filter(function (fRow) {
							if (prop1 && prop2) {
								return fRow[prop1] === oCurRow[prop1] && fRow[prop2] === oCurRow[prop2];
							} else if (prop1 && !prop2) {
								return fRow[prop1] === oCurRow[prop1];
							} else if (!prop1 && prop2) {
								return fRow[prop2] === oCurRow[prop2];
							} else {
								return false;
							}
						}).length === 0) {
						aUnique.push(oCurRow);
					}
				}
				return aUnique;
			};

			if (!String.splice) {
				String.prototype.splice = function (start, delCount, newSubStr) {
					return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
				};
			}
		},

		fnGetPerformanceTime: function (fnName, dStartTime, dEndTime, sCatchError) {
			var sLogType;
			var dTimeTaken = dEndTime - dStartTime;
			var dTotalTime = (dTimeTaken / 1000).toFixed(5);
			if (sCatchError) {
				sLogType = "E";
			} else if (dTotalTime > "5.00000") {
				sLogType = "W";
			} else {
				sLogType = "I";
			}
			this.fnCreateLogMessage(fnName, dTotalTime, sLogType, sCatchError);
		},

		fnCreateLogMessage: function (fnName, dTimeTaken, sLogType, sCatchError) {
			var sMessage = "";
			switch (sLogType) {
			case "W":
				sMessage = (fnName + " took " + dTimeTaken + " seconds");
				break;
			case "E":
				sMessage = (fnName + " took " + dTimeTaken + " seconds" + ",\n " + sCatchError);
				break;
			case "F":
				sMessage = (fnName + " took " + dTimeTaken + " seconds");
				break;
			default:
				sMessage = (fnName + " took " + dTimeTaken + " seconds");
			}
			this.fnCreateLog(sMessage, sLogType);
		},

		fnCreateLog: function (sMessage, sType, oData) {
			switch (sType) {
			case "D":
				Log.debug("Debug: " + sMessage);
				if (oData) {
					Log.debug(oData);
				}
				break;
			case "E":
				Log.error("Error: " + sMessage);
				if (oData) {
					Log.error(oData);
				}
				break;
			case "F":
				Log.fatal("Fatal: " + sMessage);
				if (oData) {
					Log.fatal(oData);
				}
				break;
			case "W":
				Log.warning("Warning: " + sMessage);
				if (oData) {
					Log.warning(oData);
				}
				break;
			default:
				Log.info("Information: " + sMessage);
				if (oData) {
					Log.info(oData);
				}
			}
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			var oMdl = this.getOwnerComponent().getModel(sName);
			if (!oMdl) {
				oMdl = new JSONModel({});
				this.setModel(oMdl, sName);
			}
			oMdl.setSizeLimit(9999);
			return oMdl;
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		_BusyDialog: new sap.m.BusyDialog({
			busyIndicatorDelay: 0 //,
				// customIcon:"./media/lodr-nw.gif",
				// customIconRotationSpeed:0,
				// customIconWidth:"150px",
				// customIconHeight:"150px"
		}),

		openBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.open();
			} else {
				this._BusyDialog = new sap.m.BusyDialog({
					busyIndicatorDelay: 0
				});
				this._BusyDialog.open();
			}
		},

		closeBusyDialog: function () {
			if (this._BusyDialog) {
				this._BusyDialog.close();
			}
		},

		/**
		 * @author Mohammed Saleem Bani
		 * @purpose Message from Resource Bundle 
		 * @param1 pMessage -- String-Property of Resource Bundle
		 * @param2 aParametrs -- Array-Parameters
		 */
		getMessage: function (pMessage, aParametrs) {
			// read msg from i18n model
			var sMsg = "";
			var oMdlI18n = this.getOwnerComponent().getModel("i18n");
			if (oMdlI18n) {
				this._oCommon._oBundle = oMdlI18n.getResourceBundle();
			} else {
				this._oCommon._oBundle = null;
				return sMsg;
			}

			if (aParametrs && aParametrs.length) {
				sMsg = this._oCommon._oBundle.getText(pMessage, aParametrs);
			} else {
				sMsg = this._oCommon._oBundle.getText(pMessage);
			}

			return sMsg;
		},

		/**
		 * @author Mohammed Saleem Bani
		 * @purpose Message 
		 * @param1 pMessage -- String-Message to be displayed
		 * @param2 pMsgTyp -- String-Message type
		 * @param2 pHandler -- function-callback function
		 */
		showMessage: function (pMessage, pMsgTyp, pHandler) {

			if (pMessage.trim().length === 0) {
				return;
			}

			if (["A", "E", "I", "W"].indexOf(pMsgTyp) === -1) {
				sap.m.MessageToast.show(pMessage);
			} else {
				var sIcon = "";

				switch (pMsgTyp) {
				case 'W':
					sIcon = "WARNING";
					break;
				case 'E':
					sIcon = "ERROR";
					break;
				case 'I':
					sIcon = "INFORMATION";
					break;
				case 'A':
					sIcon = "NONE";
					break;
				default:
				}
				MessageBox.show(pMessage, {
					icon: sIcon,
					title: sIcon,
					onClose: pHandler
				});
			}
		},

		/**
		 * @author Mohammed Saleem Bani
		 * @purpose Message 
		 * @param1 pMessage -- String-Message to be displayed
		 * @param2 pMsgTyp -- String-Message type
		 * @param2 pHandler -- function-callback function
		 */
		confirmUserAction: function (pMessage, pMsgTyp, pHandler) {
			var sIcon = "";

			switch (pMsgTyp) {
			case 'W':
				sIcon = "WARNING";
				break;
			case 'E':
				sIcon = "ERROR";
				break;
			case 'I':
				sIcon = "INFORMATION";
				break;
			case 'A':
				sIcon = "NONE";
				break;
			default:

			}
			MessageBox.confirm(pMessage, {
				icon: sIcon,
				title: "Confirm",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: pHandler
			});
		},

		fnDelayedCall: function (callback, delayMicroSeconds) {
			var delay = (delayMicroSeconds && delayMicroSeconds > 0) ? delayMicroSeconds : 0;
			jQuery.sap.delayedCall(delay, null, callback);
		},

		fnProcessDataRequest: function (sUrl, sReqType, oHeader, bShowBusy, pHandler, oData) {
			var oThisController = this;
			var oAjaxSettings = {
				url: sUrl,
				type: sReqType,
				cache: false,
				beforeSend: function (jqXHR) {
					if (bShowBusy) {
						oThisController.openBusyDialog();
					}
				},
				complete: function (jqXHR, status) {

					if (jqXHR.getResponseHeader("com.sap.cloud.security.login")) {
						oThisController.showMessage(oThisController.getMessage("SESSION_EXPIRED", "I"), function () {
							window.location.reload();
						});
					} else {
						if (pHandler) {
							pHandler(jqXHR, status);
						}
					}

					if (status === "error") {
						oThisController.closeBusyDialog();
					}

					if (bShowBusy) {
						oThisController.closeBusyDialog();
					}
				}
			};

			if (oHeader && oHeader instanceof Object) {
				oAjaxSettings.headers = oHeader;
			}

			if (oData && oData instanceof Object) {
				oAjaxSettings.data = JSON.stringify(oData);
			}

			$.ajax(oAjaxSettings);
		},

		getSNumberPadZeroes: function (value, length) {
			var sNumber = "" + value;
			while (sNumber.length < length) {
				sNumber = "0" + sNumber;
			}
			return sNumber;
		},

		onChangeLang: function (oEvent) {
			var sSelKey = oEvent.getSource().getSelectedKey();

			if (!sSelKey) {
				sSelKey = "en";
			}

			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties",
				bundleLocale: sSelKey
			});

			this.getOwnerComponent().setModel(i18nModel, "i18n");
			this.setAttribute("language", sSelKey);
			i18nModel.refresh();
		},

		fnGetLaunchPadRoles: function () {
			debugger;
			var oThisController = this;
			this._oRouter = this.getRouter();
			var oMdlCommon = this.getModel("mCommon");
			var sUrl = "/lch_services/lchRole/getRole/";
			var oHeader = {
				"Content-Type": "application/json",
				"Accept": "application/json",
				/*	"role": "",*/
				"user": ""
			};

			oHeader.user = oThisController._oCommon.userDetails.id;
			/*	oHeader.role = oThisController._oCommon.userDetails.name;*/
		/*	oHeader.user = "P000331";*/
			sUrl += oHeader.user;

			oThisController.fnProcessDataRequest(sUrl, "GET", oHeader, false, function (oXHR, status) {

				if (oXHR && oXHR.responseJSON) {
					/*	oThisController._oCommon.userDetails["sRoles"] = oXHR.responseJSON.toString();*/
					oMdlCommon.setProperty("/aCockpitRoles", oXHR.responseJSON);
					oMdlCommon.refresh();
				} else {
					oMdlCommon.setProperty("/cockpitRoles", []);
					oMdlCommon.refresh();

				}

			});
		},

		//All Generic Functions that are not specific to the App will be above this line

		fnSetCurrentUser: function (callback) {
			var oThisController = this;
			var oMdlCommon = this.getModel("mCommon");
			oThisController.fnProcessDataRequest("../user", "GET", null, false, function (oXHR, status) {
				if (oXHR && oXHR.responseJSON) {
					oThisController._oCommon.userDetails = oXHR.responseJSON;
					if (!oXHR.responseJSON.emails) {
						oXHR.responseJSON.emails = "testing@email.com";
					}
					oMdlCommon.setProperty("/userDetails", oXHR.responseJSON);
					oMdlCommon.refresh();
					oThisController.fnTaskDetails();
				}
			}, null);

		},
		
			fnTaskDetails: function () {
			var oThisController = this;
			var oMdlCommon = this.getModel("mCommon"),
				sUrl = "/lch_services/premiumOrders/getAllAccountantOrders";

			var oHeader = {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				oPayload = {
					"destinationName": "",
					"fromDate": "",
					"noOfEntry": "",
					"orderId": "",
					"originName": "",
					"pageNumber": "",
					"reasonCode": "",
					"status": "",
					"toDate": "",
					"userId": oMdlCommon.getProperty("/userDetails/id")

				};
			oThisController.fnProcessDataRequest(sUrl, "POST", oHeader, false, function (oXHR, status) {
				try {
					if (oXHR && oXHR.responseJSON) {

						oMdlCommon.setProperty("/aTaskList", oXHR.responseJSON);
						oMdlCommon.refresh();
						
					}

				} catch (e) {
					// console.log(e);
				}
			},oPayload);
		},

		/*	fnSetUserInterFace: function (sAction) {
				var oOrderModel = this.getModel("mOrderModel");
				if (sAction === "Display") {
					oMdlCommon.setProperty("/oRoleConfig/bEditable", false);
				} else if (sAction === "Edit") {
					oMdlCommon.setProperty("/oRoleConfig/bEditable", true);
				} else {
					oMdlCommon.setProperty("/oRoleConfig/bEditable", true);
				}
			}*/

	});

});