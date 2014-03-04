sap.ui.table.TreeTable
		.extend(
				"com.leandro.gp.copc.htable.Htablecopc",
				{
					metadata : { // Not to be confused with the Data Source
						// metadata property
						properties : {
							"name" : "string",
							"data" : null,
							"mesSelecionado" : null,
							"contaContabil" : null

						}
					},
					setMesSelecionado : function(value) {
						this.mesSelecionado = parseInt(value);
						// this.setData(this.data);

					},
					getMesSelecionado : function() {
						return this.mesSelecionado;
					},
					setContaContabil : function(value) {
						this.contaContabil = value;

					},
					getContaContabil : function() {
						return this.contaContabil;
					},
					setData : function(value) {
						this.data = value;
						if(!this.isReload){
							this.isReload = true;
							return;
						}	
						if (this.data) {
							this.destroyColumns();

							this.numCols = 0;
							this.numRows = 0;
							this.numColTuples = 0;
							this.numRowTuples = 0;
							this.numColsOfData = 0;
							this.numRowsOfData = 0;

							this.computeTableLayout();

							this.arrColspan = this.newArray(this.numCols,
									this.numRows);
							;
							this.arrRowspan = this.newArray(this.numCols,
									this.numRows);
							;
							this.arrText = this.newArray(this.numCols,
									this.numRows);
							;
							this.arrType = this.newArray(this.numCols,
									this.numRows);
							;

							this.applyTopLeftCorner();
							this.applyColumnHeaders();
							this.applyRowHeaders();
							this.applyData();
							this.hierarquiza();

							this.mountColunas();

							this
									.setSelectionMode(sap.ui.table.SelectionMode.Single);
							this.setAllowColumnReordering(true);
							this.setExpandFirstLevel(false);
							this.result["text"] = "root";
							this
									.attachRowSelectionChange(function(oEvent) {
										var iRowIndex = oEvent
												.getParameter("rowIndex");
										var oRowContext = oEvent
												.getParameter("rowContext");
										var bExpanded = oEvent
												.getParameter("expanded");
										alert("rowIndex: " + iRowIndex
												+ " - rowContext: "
												+ oRowContext.getPath()
												+ " - expanded? " + bExpanded);
									});
							var oData = {
								root : this.reorder()
							};

							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData);
							this.setModel(oModel);
							this.bindRows("/root");

						}

					},
					reorder : function() {
						var dados = this.result[1];
						var resultado = new Object();
						var contador1 = 0;
						var contador2 = 0;
						for ( var i = 200; i >= 0; i--) {
							if (dados[i]) {
								resultado[contador1] = this.copyObj(dados[i]);
								for ( var z = 200; z >= 0; z--) {
									if (dados[i][z]) {
										resultado[contador1][contador2] = this
												.copyObj(dados[i][z]);
										contador2++;
									}
								}
								contador1++;
							}
						}
						return resultado;
					},
					copyObj : function(obj) {
						var copy = new Object();
						for ( var element in obj) {
							var temp = parseInt(element);
							if (isNaN(temp)) {
								copy[element] = obj[element];
							}
						}
						return copy;

					},
					agregaValue : function(t, mes) {
						var mesSelecionado = null;

						if (this.getMesSelecionado())
							mesSelecionado = parseInt(this.getMesSelecionado());

						if (!this.value)
							this.value = new Object();

						// i starts on 2 because we have two dimensions
						for ( var i = 2; i < this.arrText.length; i++) {
							if (!this.arrText[i][t])
								continue;

							if (mesSelecionado) {
								if (mes == mesSelecionado)
									this.value[this.arrText[i][0].text] = this.arrText[i][t];
							} else {

								var valorAtual = 0;
								if (this.value[this.arrText[i][0].text])
									valorAtual = this.value[this.arrText[i][0].text];

								this.value[this.arrText[i][0].text] = this.arrText[i][t]
										+ valorAtual;

							}
							if (!mesSelecionado || mes <= mesSelecionado) {
								var valorAtualAcu = 0;
								if (this.value[this.arrText[i][0].text + "Acu"])
									valorAtualAcu = this.value[this.arrText[i][0].text
											+ "Acu"];

								this.value[this.arrText[i][0].text + "Acu"] = this.arrText[i][t]
										+ valorAtualAcu;

							}
						}
					},
					putValues : function(dado) {
						for ( var i = 2; i < this.arrText.length; i++) {
							var tmpValue = 0;
							if (this.value[this.arrText[i][0].text]) {
								var valorFix = this.value[this.arrText[i][0].text]
										.toFixed(2);
								tmpValue = numeral(valorFix).format("0,000.00");
							} else
								tmpValue = "0,00";
							dado[this.arrText[i][0].text] = tmpValue;
						}

						// here is where the extra calculations are done, since
						// every value goes through here
						if (dado.level == 2)
							dado["contaContabil"] = dado.key + "-" + dado.text;

						var montReal = this.value["Montante Real"];
						var montPlan = this.value["Montante Planejado"];
						var diferenca = montReal - montPlan;
						var vari = (montReal / montPlan)-1;

						var montRealAcu = this.value["Montante RealAcu"];
						var montPlanAcu = this.value["Montante PlanejadoAcu"];
						var diferencaAcu = montReal - montPlan;
						var variAcu = (montRealAcu / montPlanAcu)-1;
						
						dado["vari"] = numeral(
								vari == null || isNaN(vari) ? 0
										: vari).format("0,000.00%");
						dado["variAcu"] = numeral(
								variAcu == null || isNaN(variAcu) ? 0
										: variAcu).format("0,000.00%");
						
						dado["diferenca"] = numeral(
								diferenca == null || isNaN(diferenca) ? 0
										: diferenca).format("0,000.00");
						dado["diferencaAcu"] = numeral(
								diferencaAcu == null || isNaN(diferencaAcu) ? 0
										: diferencaAcu).format("0,000.00");
						dado["Montante RealAcu"] = numeral(
								montRealAcu == null || isNaN(montRealAcu) ? 0
										: montRealAcu).format("0,000.00");
						dado["Montante PlanejadoAcu"] = numeral(
								montPlanAcu == null || isNaN(montPlanAcu) ? 0
										: montPlanAcu).format("0,000.00");

						this.value = new Object();
						return dado;
					},
					hierarquiza : function() {
						// DIMENSION members
						var dados = this.arrText[0];

						var meses = this.arrText[1];

						// result that will be used inside the tree table
						this.result = new Object();
						// holds the children for the member on the first level,
						// as soon as i find a member on the first level, i
						// assing this array as its children
						var resultTemp = new Array();

						// Holds the soon of every object as the array passes
						// trough
						// it
						var sonHolder = new Array();
						// member being handle currently
						var atual = null;
						var levelAtual = 0;
						for ( var i = (dados.length - 1); i != 0; i--) {
							var dado = dados[i];

							this.agregaValue(i, parseInt(meses[i].text));
							if (!dado)
								continue;

							// if theres no level, it means that the member is
							// on
							// the root
							// of the hierarchy
							if (!dado.level) {
								// if the member is the very first, and has no
								// children
								if (!atual)
									this.result[i] = this.putValues(dado);
								else {
									// if the member has children

									// the member that was treated last run was
									// not
									// yet added to
									// the result, so here i do it
									resultTemp.push(atual);

									// here I add the current hierarquized first
									// level of the hierarchy
									this.result[i] = this.putValues(this
											.arrayToObj(dado, resultTemp));
									levelAtual = 0;
									resultTemp = new Array();
									atual = null;
								}
							} else {
								if (!atual)
									atual = new Object();

								if (dado.level == levelAtual || levelAtual == 0) {
									sonHolder.push(this.putValues(dado));
									levelAtual = dado.level;
								} else {

									if (dado.level < levelAtual) {
										atual = this.arrayToObj(this
												.putValues(dado), sonHolder);
										sonHolder = new Array();
									} else {
										resultTemp.push(atual);
										atual = dado;
										sonHolder.push(this.putValues(dado));
									}
									levelAtual = dado.level;
								}

							}
						}

					},
					applyTopLeftCorner : function() {
						this.markSpannedCellRectangle(0, 0, this.numRowTuples,
								this.numColTuples);

						this.arrColspan[0][0] = this.numRowTuples;
						this.arrRowspan[0][0] = this.numColTuples;
						this.arrText[0][0] = "";
						this.arrType[0][0] = "topleft";
					},
					markSpannedCellRectangle : function(arrCol, arrRow,
							colspan, rowspan) {
						for ( var i = arrRow; i < arrRow + rowspan; i++) {
							for ( var j = arrCol; j < arrCol + colspan; j++) {
								this.arrColspan[j][i] = -1;
								this.arrRowspan[j][i] = -1;
							}
						}
					},
					getData : function() {
						return this.data;
					},
					mountColunas : function() {
						var that = this;
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Abertura",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : "text",
							width : "180px"
						}));
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Conta Contabil",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : new sap.ui.commons.Button( {
								lite : true,
								press : function(evt) {
								
									var btntxt = evt.getSource().getText();
									if(btntxt == "")
										return;
									
									var conta = btntxt.split("-")[0];
									that.setContaContabil(conta);
									that.fireDesignStudioPropertiesChanged( [
											"contaContabil"]);
									that.fireDesignStudioEvent("onchange");
									that.isReload = false;
								}
							}).bindProperty("text", "contaContabil"),
							width : "200px"
						}));
						var montReal = new sap.ui.commons.TextView()
								.bindProperty("text", "Montante Real");
						montReal.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Real",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : montReal,
							width : "70px"
						}));

						var montPlan = new sap.ui.commons.TextView()
								.bindProperty("text", "Montante Planejado");
						montPlan.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Orçado",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : montPlan,
							width : "70px"
						}));

						var diferenca = new sap.ui.commons.TextView().bindProperty(
								"text", "diferenca");
						diferenca.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Diferença",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : diferenca,
							width : "70px"
						}));
						
						var vari = new sap.ui.commons.TextView().bindProperty(
								"text", "vari");
						vari.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Var%",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : vari,
							width : "60px"
						}));

						var montPlanAcu = new sap.ui.commons.TextView()
								.bindProperty("text", "Montante RealAcu");
						montPlanAcu.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Real",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : montPlanAcu,
							width : "70px"
						}));
						var montPlanAcu = new sap.ui.commons.TextView()
								.bindProperty("text", "Montante PlanejadoAcu");
						montPlanAcu.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : "Orçado",
							template : montPlanAcu,
							width : "70px"
						}));
						var diferencaAcu = new sap.ui.commons.TextView()
								.bindProperty("text", "diferencaAcu");
						diferencaAcu.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Diferença",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : diferencaAcu,
							width : "70px"
						}));
						var variAcu = new sap.ui.commons.TextView().bindProperty(
								"text", "variAcu");
						variAcu.setTextAlign(sap.ui.core.TextAlign.Right);
						// texto.setDesign(sap.ui.commons.TextViewDesign.Bold);
						this.addColumn(new sap.ui.table.Column( {
							label : new sap.ui.commons.Label( {
								text : "Var%",
								textAlign : sap.ui.core.TextAlign.Center
							}),
							template : variAcu,
							width : "60px"
						}));

						for ( var i = 0; i < this.getColumns().length; i++) {
							this.getColumns()[i]
									.setHAlign(sap.ui.commons.layout.HAlign.Center);
						}

					},
					computeTableLayout : function() {
						var colAxis = this.data.axis_columns;
						this.numColsOfData = colAxis.length;

						var rowAxis = this.data.axis_rows;
						this.numRowsOfData = rowAxis.length;

						this.numColTuples = 0;
						var sampleColAxisTuple = colAxis[0];
						for ( var i = 0; i < sampleColAxisTuple.length; i++) {
							if (sampleColAxisTuple[i] > -1) {
								this.numColTuples++;
							}
						}
						this.numRowTuples = sampleColAxisTuple.length
								- this.numColTuples;

						this.numCols = this.numRowTuples + this.numColsOfData;
						this.numRows = this.numColTuples + this.numRowsOfData;
					},
					newArray : function(x, y) {
						var array = new Array(x);
						for ( var i = 0; i < x; i++) {
							array[i] = new Array(y);
						}
						return array;
					},
					applyColumnHeaders : function() {
						var OFFSET_COLS = this.numRowTuples;
						for ( var row = 0; row < this.numColTuples; row++) {
							for ( var col = 0; col < this.numColsOfData; col++) {
								if (this.isCellHiddenBySpan(OFFSET_COLS + col,
										row) == false) {
									var colspan = this.computeColHeaderColspan(
											col, row);
									var rowspan = this.computeColHeaderRowspan(
											col, row);
									this.markSpannedCellRectangle(OFFSET_COLS
											+ col, row, colspan, rowspan);

									var colMember = this.data.dimensions[row].members[this.data.axis_columns[col][row]];
									var text = colMember;
									var type = colMember.type;
									this.arrColspan[OFFSET_COLS + col][row] = colspan;
									this.arrRowspan[OFFSET_COLS + col][row] = rowspan;
									this.arrText[OFFSET_COLS + col][row] = text;
									this.arrType[OFFSET_COLS + col][row] = (type == "RESULT") ? "header-bold"
											: "header";

									col += colspan - 1;
								}
							}
						}
					},
					isCellHiddenBySpan : function(arrCol, arrRow) {
						var colspan = this.arrColspan[arrCol][arrRow];
						if (colspan == -1) {
							return true;
						}
						var rowspan = this.arrRowspan[arrCol][arrRow];
						if (rowspan == -1) {
							return true;
						}
						return false;
					},
					computeColHeaderRowspan : function(col, row) {
						var rowspan = 1;
						var colMember = this.data.dimensions[row].members[this.data.axis_columns[col][row]];
						if (colMember.type == "RESULT") {
							for ( var i = row + 1; i < numColTuples; i++) {
								var colMemberToCompare = this.data.dimensions[i].members[this.data.axis_columns[col][i]];
								if (colMemberToCompare.type == "RESULT") {
									rowspan++;
								} else {
									break;
								}
							}
						}
						return rowspan;
					},
					computeColHeaderColspan : function(col, row) {
						var colspan = 1;
						var index = this.data.axis_columns[col][row];
						for ( var i = col + 1; i < this.data.axis_columns.length; i++) {
							var nextIndex = this.data.axis_columns[i][row];
							if (index == nextIndex) {
								// end colspan if "parent" tuples of next column
								// are not the same
								for ( var j = 0; j < row; j++) {
									var parentIndex = this.data.axis_columns[col][j];
									var parentIndexToCompare = this.data.axis_columns[i][j];
									if (parentIndex != parentIndexToCompare) {
										return colspan;
									}
								}
								colspan++;
							} else {
								break;
							}
						}
						return colspan;
					},
					applyRowHeaders : function() {
						var DIM_OFFSET = this.numColTuples;
						var OFFSET_ROWS = this.numColTuples;
						for ( var col = 0; col < this.numRowTuples; col++) {
							for ( var row = 0; row < this.numRowsOfData; row++) {
								if (this.isCellHiddenBySpan(col, OFFSET_ROWS
										+ row) == false) {
									var colspan = this.computeRowHeaderColspan(
											col, row);
									var rowspan = this.computeRowHeaderRowspan(
											col, row);
									this
											.markSpannedCellRectangle(col,
													OFFSET_ROWS + row, colspan,
													rowspan);

									var rowMember = this.data.dimensions[DIM_OFFSET
											+ col].members[this.data.axis_rows[row][DIM_OFFSET
											+ col]];
									var text = rowMember;
									var type = rowMember.type;

									this.arrColspan[col][OFFSET_ROWS + row] = colspan;
									this.arrRowspan[col][OFFSET_ROWS + row] = rowspan;
									this.arrText[col][OFFSET_ROWS + row] = text;
									this.arrType[col][OFFSET_ROWS + row] = (type == "RESULT") ? "header-bold"
											: "header";

									row += rowspan - 1;
								}
							}
						}
					},
					computeRowHeaderRowspan : function(col, row) {
						var DIM_OFFSET = this.numColTuples;
						var rowspan = 1;
						var index = this.data.axis_rows[row][DIM_OFFSET + col];
						for ( var i = row + 1; i < this.data.axis_rows.length; i++) {
							var nextIndex = this.data.axis_rows[i][DIM_OFFSET
									+ col];
							if (index == nextIndex) {
								// end rowspan if "parent" tuples of next row
								// are not the same
								for ( var j = 0; j < col; j++) {
									var parentIndex = this.data.axis_rows[row][DIM_OFFSET
											+ j];
									var nextParentIndex = this.data.axis_rows[i][DIM_OFFSET
											+ j];
									if (parentIndex != nextParentIndex) {
										return rowspan;
									}
								}
								rowspan++;
							} else {
								break;
							}
						}
						return rowspan;
					},
					computeRowHeaderColspan : function(col, row) {
						var DIM_OFFSET = this.numColTuples;
						var colspan = 1;
						var rowMember = this.data.dimensions[DIM_OFFSET + col].members[this.data.axis_rows[row][DIM_OFFSET
								+ col]];
						if (rowMember.type == "RESULT") {
							for ( var i = col + 1; i < this.numRowTuples; i++) {
								var rowMemberToCompare = this.data.dimensions[DIM_OFFSET
										+ i].members[this.data.axis_rows[row][DIM_OFFSET
										+ i]];
								if (rowMemberToCompare.type == "RESULT") {
									colspan++;
								} else {
									break;
								}
							}
						}
						return colspan;
					},
					applyData : function() {
						var OFFSET_COLS = this.numRowTuples;
						var OFFSET_ROWS = this.numColTuples;
						var dataIndex = 0;
						for ( var row = 0; row < this.numRowsOfData; row++) {
							for ( var col = 0; col < this.numColsOfData; col++) {
								this.arrColspan[OFFSET_COLS + col][OFFSET_ROWS
										+ row] = 1;
								this.arrRowspan[OFFSET_COLS + col][OFFSET_ROWS
										+ row] = 1;
								this.arrText[OFFSET_COLS + col][OFFSET_ROWS
										+ row] = this.formatValue(
										this.data.data[dataIndex],
										this.data.tuples[dataIndex]);
								dataIndex++;
							}
						}
					},
					formatValue : function(value, tuple) {
						if (value === null) {
							return "";
						}
						return value;
						for ( var i = 0; i < this.data.dimensions.length; i++) {
							var strFormat = this.data.dimensions[i].members[tuple[i]].formatString;
							if (strFormat) {
								sap.common.globalization.NumericFormatManager
										.setPVL(this.data.locale);
								return sap.common.globalization.NumericFormatManager
										.format(value, strFormat);
							}
						}
						return val;
					},
					arrayToObj : function(dado, arr) {
						for ( var i = 0; i < arr.length; i++) {
							dado[i] = arr[i];
						}
						return dado;
					},
					// SAPUI5 Renderer, we can leave it aloneS
					renderer : {

					// render : function(rm, oControl) {
					// }
					},
					// Called by sap.designstudio.sdkui5.Handler
					// (sdkui5_handler.js)
					initDesignStudio : function() {
						try {
							//inside the button i set this to false,
							//so taht the table does not reaload on it's click
							this.isReload = true;
							/*
							 * var that = this; this.attachChange(function() {
							 * that.setSelectedKey(that.getSelectedItemId());
							 * that.setSelectedValue(that.getValue());
							 * that.fireDesignStudioPropertiesChanged( [
							 * "selectedValue", "selectedKey" ]);
							 * that.fireDesignStudioEvent("onchange"); });
							 */
						} catch (e) {
							alert(e); // Aw snap
						}

					}

				});