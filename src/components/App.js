import React, { Component, createElement, useCallback } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import TableRenderers from "react-pivottable/TableRenderers";
import createPlotlyComponent from "react-plotly.js/factory";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import Plotly from "plotly.js-dist";
import { en_list, en2 } from "./data";
import Config from "./config";
import "./style.css";
import { PivotData } from "react-pivottable/Utilities";
import { GetPivotData, GetConfigurationData, GetPivotKeys } from "../service";
import axios from "../axios";
import { set } from "lodash";
// import "@gooddata/sdk-ui-pivot/styles/css/main.css";
// import { PivotTable } from "@gooddata/sdk-ui-pivot";
const Plot = createPlotlyComponent(Plotly);

const PlotlyRenderers = createPlotlyRenderers(Plot);

class App extends Component {
  state = {
    newFilters: [],
    valueFilter: {},
    dataReq: [],
    configData: [],
    pivotData: {
      x_values: ["gov_code"],
      y_values: ["created_at", "date_year"],
      measures: [
        { key: "total_amount", value: "sum" },
        { key: "total_amount", value: "count" },
        { key: "damen_n_min" },
      ],
      filters: [
        {
          date_day_range: {
            date_day_start: "21-07-2020",
            date_day_end: "24-07-2020",
          },
          gov_code: "31,1",
        },
      ],
    },
    isClicked: false,
    filters: [],
    filterKey: "",
    filterValue: "",
    measures: [],
    measureKey: "",
    measureValue: "",
    afterFormat: [],
    dataa: [],
    filterList: [],
    measureList: [],
    newFormat: [],
    functionList: [],
    functionIndex: -1,
    rows: [],
    cols: [],
    rendererName: "Table",
    aggregatorName: "sum_square",
    vals: [],
    filter1: "value",
    filter2: "",
    lang: "En_name",

    filterListValue: [],
    filterListValueIndex: -1,
    filterIndex: -1,

    measureIndex: -1,
    startDate: "",
    endDate: "",
  };
  list = ["total_amount", "total_revenue", "number_of_transactions"];
  excludeArr = ["Count", "Count as fraction of Total"];

  mapCases = ["gov_code"];

  handleApply = async () => {
    // debugger;
    // document.querySelector(".pvtTable").style.display = "block";

    let rows = [];
    let cols = [];
    let rowsPreview = [];
    let colsPreview = [];
    this.state.dataa.map((item) => {
      Object.keys(item).map((key) => {
        if (this.state.rows.includes(key)) {
          rows.push(item[key]);
          debugger;
          // if (this.state.lang === "Ar_name") {
          //   // const rec = this.state.configData.find((el) => el.key == key);
          //   // let newKey = rec.ar_name;
          //   rowsPreview.push(key)
          // }
        }

        if (this.state.cols.includes(key)) {
          cols.push(item[key]);
          // if (this.state.lang === "Ar_name") {
          //   // const rec = this.state.configData.find((el) => el.key == key);
          //   // let newKey = rec.ar_name;
          //   colsPreview.push(key)
          // }
        }
      });
    });
    this.setState({ rows });
    this.setState({ cols });
    let pivotData;
    if (rows.length == 0) {
      // debugger;
      pivotData = {
        x_values: null,
        y_values: cols,
        measures: this.state.measures,
        filters: this.state.filters,
      };
      if (this.state.filters.length == 0) {
        pivotData = {
          x_values: null,
          y_values: cols,
          measures: this.state.measures,
        };
      }
    } else if (cols.length == 0) {
      pivotData = {
        x_values: rows,
        y_values: null,
        measures: this.state.measures,
        filters: this.state.filters,
      };
      if (this.state.filters.length == 0) {
        pivotData = {
          x_values: rows,
          y_values: null,
          measures: this.state.measures,
        };
      }
    } else {
      pivotData = {
        x_values: rows,
        y_values: cols,
        measures: this.state.measures,
        filters: this.state.filters,
      };
      if (this.state.filters.length == 0) {
        pivotData = {
          x_values: rows,
          y_values: cols,
          measures: this.state.measures,
        };
      }
    }
    console.log(pivotData);
    const data1 = await GetPivotData(pivotData);

    this.setState({ dataReq: data1 });

    console.log("KKKKKKKKKKKKKKKKKKKK");
    this.state.dataReq.map((item) => {
      Object.keys(item).map((key) => {
        const k = key.toLocaleLowerCase();
        if (this.mapCases.includes(k)) {
          const rec = this.state.configData.find((el) => el.key == k);
          const code = item[key];
          const obj = rec.data.find((el) => el.id == code);
          item[key] = this.state.lang == "En_name" ? obj.en_name : obj.ar_name;
        }
        if (this.state.lang === "Ar_name") {
          if (key == "measures") {
            const measureName = item[key];
            const rec = this.state.configData.find(
              (el) => el.key == measureName
            );

            item[key] = rec.ar_name;
          }
        }
      });
    });
    console.log(this.state.dataReq);

    this.state.dataReq.map((item) => {
      Object.keys(item).map((key) => {
        if (key == "measures") {
          if (!rows.includes(key)) {
            //  debugger
            rows.push(key);
            console.log("beeeeb");
          }
        }
      });
    });
    this.setState({ data: this.state.dataReq, hiddenAttributes: ["value"] });

    document
      .querySelectorAll(".pvtTable")
      .forEach((el) => (el.style.display = "block"));
    console.log(this.state.data);
  };
  handleShowInMap = () => {
    console.log(this.state.rows, this.state.cols);

    console.log(this.state.valueFilter);

    this.state.dataReq.map((item) => {
      Object.keys(item).map((key) => {
        if (this.state.valueFilter[key]) {
          // debugger;
          if (!Object.keys(this.state.valueFilter[key]).includes(item[key])) {
            // debugger;
            var obj = {};
            // console.log(i[key], keyy);
            obj[key] = item[key];
            if (!this.state.newFilters.includes(obj)) {
              // var obj = `{ ${key}: ${item[key]} }`;
              // if (i[key] !== keyy) {
              this.state.newFilters.push(obj);
              // console.log(this.state.newFilters);
            }
          }
        }
        // });
        // }
      });
    });
    var arr = [];
    var obj = {};
    var ob = null;
    this.state.newFilters.map((i) => {
      Object.keys(i).map((key) => {
        debugger;
        if (!arr.includes(key)) arr.push(key);
        if (arr.includes(key)) {
          const indez = arr.indexOf(key);
          if (arr[indez] == key) {
            console.log(ob);

            ob = "" + i[key] + "," + "";
            obj[key] += ob;
            console.log(obj);
          }
        }
      });
    });

    console.log(arr);
    const dataset = [...new Set(this.state.newFilters)];
    console.log(dataset);
  };
  // this.state.dataa.map(item=>{
  // // debugger
  //   // let newData={}
  //   var newObj={}
  //   Object.keys(item).map(key=>{
  //     // debugger

  //   if(this.list.includes(key)) {

  //     const val={value:item[key]}
  //     delete item[key]
  //     var  newData={...item,measures: key,...val}

  //     let localize_obj = {}
  //       Object.keys(newData).map(key=>{
  //         // debugger

  //       if(this.list.includes(key)) {

  //         delete newData[key]

  //       }

  //       else
  //       {

  //           if(key == "measures")
  //           {
  //             localize_obj = {...localize_obj,[Config[key][this.state.lang]]:Config[newData[key]][this.state.lang]}
  //           }

  //           else
  //           {

  //             localize_obj = {...localize_obj,[Config[key][this.state.lang]]:newData[key]}
  //           }

  //       }

  //         // newObj={...newData}

  //       })
  //       this.state.afterFormat.push(localize_obj)
  //   }

  // })
  // })
  reformatData = () => {
    this.state.dataa.map((item) => {
      let temp = [];
      let new_obj = {};
      let flag = false;
      Object.keys(item).map((key) => {
        if (this.measures.includes(key) && flag == false) {
          if (this.chosen_measures.includes(key)) {
            new_obj = { ...new_obj, [key]: item[key] };
          }
        }
        new_obj = { ...new_obj, [Config[key][this.state.lang]]: key };
      });
    });
  };

  btnHandler = () => {
    this.setState({
      rows: [...this.state.rows, "merchant_code", "billername", "gov_code"],
      cols: [...this.state.cols, "created_at", "sectorname", "total_amount"],
    });
  };

  aggregatorFilterHandler = (value, filterNum) => {
    if (this.state.aggregatorName !== "Sum over Sum") {
      this.setState({ vals: [value, "Average"], filter1: value });
    } else {
      let arr = [];
      if (filterNum == 1) {
        if (this.state.filter2 !== "") {
          arr = [value, this.state.filter2];
        } else {
          arr = [value];
        }

        this.setState({ vals: arr, filter1: value });
      } else {
        if (this.state.filter1 !== "") {
          arr = [this.state.filter1, value];
        } else {
          arr = [value];
        }

        this.setState({ vals: arr, filter2: value });
      }
    }
  };
  newMeasure = () => {};
  // test=()=>{
  //   this.setState({rows:[...this.state.cols,...this.state.rows]})
  //   this.setState({cols:[]})
  // }
  exportdata = () => {
    //  this.test()
    //  debugger
    if (this.state.afterFormat.length > 0) {
      const newState = { ...this.state };
      newState.rows = [...this.state.cols, ...this.state.rows];
      newState.cols = [];
      var pivotData = new PivotData(newState);

      var rowKeys = pivotData.getRowKeys();
      var colKeys = pivotData.getColKeys();
      console.log(rowKeys);
      if (rowKeys.length === 0) {
        rowKeys.push([]);
      }
      if (colKeys.length === 0) {
        colKeys.push([]);
      }

      var headerRow = pivotData.props.rows.map(function (r) {
        return r;
      });
      if (colKeys.length === 1 && colKeys[0].length === 0) {
        // headerRow.push(this.state.aggregatorName);

        headerRow.push("Totals");
      } else {
        colKeys.map(function (c) {
          return headerRow.push(c.join("-"));
        });
      }

      var result = rowKeys.map(function (r) {
        var row = r.map(function (x) {
          return x;
        });
        colKeys.map(function (c) {
          var v = pivotData.getAggregator(r, c).value();
          console.log("vv", v);
          row.push(v ? v : "");
        });
        return row;
      });

      //   result.push({"dsdsds":5454})

      result.unshift(headerRow);

      var FinalResult = result
        .map(function (r) {
          return r.join(",");
        })
        .join("\n");

      const element = document.createElement("a");
      const file = new Blob([FinalResult], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "myFile.csv";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    } else {
      alert("No Selections Made");
    }
  };
  // componentDidUpdate(){

  //   const attributes = document.querySelectorAll('.pvtColLabel')
  //   // attributes[0].addEventListener("click",function(){
  //     console.log(attributes)
  //   // })
  //   attributes.forEach((cur,i)=>{
  //   //   console.log(cur.innerHTML)
  //   //   const div =document.createElement("div")
  //   //   const arrow=document.createElement("span")
  //   //   arrow.className = cur.innerHTML;
  //   // cur.innerHTML=
  //     cur.addEventListener("click",function(e){
  //       // console.log(e.target.value)
  //         if(this.state.isClicked==false){

  //           this.setState({isClicked:true});
  //         }else{
  //           this.setState({isClicked:false});

  //         }
  //         console.log(this.state.isClicked)
  //     })
  //     // cur.click()
  //   })
  // }

  getKeys = () => {
    axios
      .get("GetPivotKeysConfig")
      .then((response) => {
        console.log("response", response.data);

        let data = response.data;

        let tempData = [];
        let tempFilters = [];
        let tempMeasures = [];
        let tempFunctions = [];
        data.map((item) => {
          if (item.type == "D") {
            if (this.state.lang == "En_name") {
              tempData.push({ [item.en_name]: item.key });
              // tempFilters.push({[item.EN_NAME]:item.KEY})
              console.log("fff", item);
              tempFilters.push({
                key: item.key,
                value: item.en_name,
                list: item.data,
              });
            } else {
              tempData.push({ [item.ar_name]: item.key });
              tempFilters.push({
                key: item.key,
                value: item.ar_name,
                list: item.data,
              });
            }
          } else if (item.type == "M" && item.key !== "total_count") {
            if (this.state.lang == "En_name") {
              // tempData.push({[item.en_name]:item.key})
              tempMeasures.push({ key: item.key, value: item.en_name });
              // tempMeasures.push({[item.EN_NAME]:item.KEY})
            } else {
              // tempData.push({[item.ar_name]:item.key})

              tempMeasures.push({ key: item.key, value: item.ar_name });
            }
          } else if (item.type == "F") {
            tempFunctions.push(item);
          }
        });

        this.setState({
          dataa: tempData,
          filterList: tempFilters,
          measureList: tempMeasures,
          functionList: tempFunctions,
        });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  // componentDidUpdate()
  // {
  //   this.getKeys()
  // }
  async componentDidMount() {
    // document.querySelectorAll('.pvtTable').style.display="none"

    document
      .querySelectorAll(".pvtTable")
      .forEach((el) => (el.style.display = "none"));

    const config = await GetConfigurationData();
    console.log("aaaaa", config);
    this.setState({ configData: config });
    // console.log(this.data2)
    //  const configsss= await GetPivotKeys();
    //  console.log("aaa",configsss)

    this.getKeys();
    //////////////////////////// drilled down///////////////
    // console.log(this.data2)

    // setInterval(()=>{

    //   let new_data = [...this.state.obj]

    //   new_data[0] = {...new_data[0],total_amount:new_data[0].total_amount + 100}

    // new_data[2] = {...new_data[2],total_amount:new_data[2].total_amount + 1000}

    //       this.setState({data:new_data})

    //     },1000)
  }
  hideHandler = () => {
    document.querySelector(".pvtCols").style.display = "none";
    document.querySelector(".pvtRows").style.display = "none";

    document.querySelector(".pvtVertList").style.display = "none";
  };

  changeLanguage = () => {
    this.setState({
      lang: this.state.lang == "En_name" ? "Ar_name" : "En_name",
    });

    this.getKeys();
    // this.handleApply();
  };
  render() {
    console.log("data", this.state.dataa);

    // console.log("Filter 1",typeof this.state.filter1)
    // var count = (data, rowKey, colKey) => {
    //     return {
    //       sum:0,
    //       count: 0,
    //       push: function(record) { this.sum+= parseFloat(record.damen_fee);this.count++},
    //       value: function() { return 0; },
    //       format: function(x) { return  this.sum + " / " + this.count; },
    //    };
    //   };

    var sum_square = (data, rowKey, colKey) => {
      let filter1 = this.state.filter1;

      return {
        sum: 0,
        push: function (record) {
          this.sum += record[filter1];
        },
        value: function () {
          return 0;
        },
        format: function (x) {
          return this.sum;
        },
      };
    };
    var sum = function (attributeArray) {
      // var formatter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : usFmt;
      var attr = attributeArray[0];

      return function () {
        return {
          sum: 0,
          push: function push(record) {
            if (!isNaN(parseFloat(record[attr]))) {
              this.sum += parseFloat(record[attr]);
            }
          },
          value: function value() {
            return this.sum;
          },

          format: function (x) {
            return x;
          },
          numInputs: typeof attr !== "undefined" ? 0 : 1,
        };
      };
    };

    // console.log("filter key",this.state.filterKey)
    // console.log("filter value",this.state.filterValue)
    console.log("filters", this.state.filters);

    console.log("measures", this.state.measures);
    return (
      <div>
        <div className="buttons">
          {/* <button onClick={()=>{

                        let x = ["ahmed","sharawy"]
                        let y = []
                        for(let i = 0;i<4;i++)
                        {
                            y.push(...x)
                        }

                        console.log("y",y)
                    }}>
                        Change csdafsadfs
                    </button> */}
          {/* <button onClick={this.changeLanguage}>Change Language</button> */}
          <div onClick={this.test}>
            <button onClick={this.exportdata}>Export to Excel</button>
          </div>
          <button
            onClick={() => {
              if (this.state.dataa.length > 2000) {
                this.setState({ dataa: en2 });
              } else {
                this.setState({ dataa: en2 });
              }
            }}
          >
            Change Data
          </button>

          <button onClick={this.btnHandler}>change dimensions</button>

          <button
            onClick={() => {
              const lab = document.querySelectorAll(".pvtTotal");
              lab.forEach(function (cur, i, arr) {
                console.log(parseInt(cur.innerHTML));
                if (parseInt(cur.innerHTML) > 3) {
                  cur.style.backgroundColor = "blue";
                }
              });
              this.setState({ data: en_list });
            }}
          >
            Highlighter
          </button>

          <select
            onChange={(e) => this.setState({ rendererName: e.target.value })}
          >
            <option>Table</option>

            <option>Table Heatmap</option>
            <option>Table Col Heatmap</option>
            <option>Table</option>
            <option>Table Row Heatmap</option>
            <option>Exportable TSV</option>
            <option>Grouped Column Chart</option>
            <option>Stacked Column Chart</option>
            <option>Grouped Bar Chart</option>
            <option>Stacked Bar Chart</option>
            <option>Line Chart</option>
            <option>Dot Chart</option>
            <option>Area Chart</option>
            <option>Scatter Chart</option>
            <option>Multiple Pie Chart</option>
          </select>

          <select
            onChange={(e) =>
              this.setState({ aggregatorName: e.target.value, vals: [] })
            }
            value={this.state.aggregatorName}
          >
            <option>Count</option>

            <option>Count Unique Values</option>
            <option>List Unique Values</option>
            <option>Sum</option>
            <option>Integer Sum</option>
            <option>Average</option>
            <option>Median</option>
            <option>Sample Variance</option>
            <option>Sample Standard Deviation</option>
            <option>Minimum</option>
            <option>Maximum</option>
            <option>First</option>
            <option>Last</option>
            <option>Sum over Sum</option>
            <option>Sum as Fraction of Total</option>

            <option>Sum as Fraction of Rows</option>

            <option>Sum as Fraction of Columns</option>

            <option>Count as Fraction of Total</option>

            <option>Sum as Fraction of Rows</option>

            <option>Sum as Fraction of Columns</option>
            <option>sum_square</option>
          </select>

          {this.excludeArr.indexOf(this.state.aggregatorName) == -1 && (
            <select
              onChange={(e) => this.aggregatorFilterHandler(e.target.value, 1)}
              value={this.state.filter1}
            >
              <option style={{ display: "none" }}></option>
              {Object.keys(
                this.state.dataa.length > 0 ? this.state.dataa[0] : []
              ).map((key) => {
                return <option>{key}</option>;
              })}
            </select>
          )}
          {this.state.aggregatorName == "Sum over Sum" && (
            <select
              onChange={(e) => this.aggregatorFilterHandler(e.target.value, 2)}
              value={this.state.filter1}
            >
              <option style={{ display: "none" }}></option>
              {Object.keys(
                this.state.dataa.length > 0 ? this.state.dataa[0] : []
              ).map((key) => {
                return <option>{key}</option>;
              })}
            </select>
          )}
          <button onClick={() => this.hideHandler()}>Hide Attributes</button>
        </div>

        <div>
          <label>Filters : </label>

          <select
            value={
              this.state.filterIndex !== -1
                ? this.state.filterList[this.state.filterIndex - 1].value
                : ""
            }
            onChange={(e) => {
              console.log(
                "index",
                this.state.filterList[e.target.selectedIndex - 1]
              );

              this.setState({
                filterIndex: e.target.selectedIndex,
                filterListValue: this.state.filterList[
                  e.target.selectedIndex - 1
                ].list,
              });
            }}
          >
            <option style={{ display: "none" }}></option>
            {this.state.filterList.map((item) => {
              return <option>{item.value}</option>;
            })}
          </select>

          {this.state.filterIndex !== -1 &&
            this.state.filterListValue !== undefined && (
              <select
                value={
                  this.state.filterListValueIndex !== -1
                    ? this.state.filterListValue[
                        this.state.filterListValueIndex - 1
                      ].value
                    : ""
                }
                onChange={(e) => {
                  this.setState({
                    filterListValueIndex: e.target.selectedIndex,
                  });
                }}
              >
                <option style={{ display: "none" }}></option>
                {this.state.filterListValue.map((item) => {
                  if (this.state.lang == "En_name") {
                    return <option>{item.en_name}</option>;
                  } else {
                    return <option>{item.ar_name}</option>;
                  }
                })}
              </select>
            )}

          <button
            onClick={() => {
              //  console.log(this.state.filterList[this.state.filterIndex - 1])

              let obj = {
                [this.state.filterList[this.state.filterIndex - 1].key]: this
                  .state.filterListValue[this.state.filterListValueIndex - 1]
                  .id,
              };

              console.log(
                "ffsafsafs",
                this.state.filterList[this.state.filterIndex - 1]
              );
              let index = this.state.filters.findIndex(
                (item) =>
                  Object.keys(item)[0] ==
                  this.state.filterList[this.state.filterIndex - 1].key
              );

              console.log("index", index);
              console.log(
                "obj",
                this.state.filterList[this.state.filterIndex - 1]
              );
              if (index != -1) {
                let old_obj = this.state.filters[index];
                let new_obj = {
                  [this.state.filterList[this.state.filterIndex - 1].key]:
                    old_obj[
                      this.state.filterList[this.state.filterIndex - 1].key
                    ] +
                    "," +
                    this.state.filterListValue[
                      this.state.filterListValueIndex - 1
                    ].id,
                };

                this.state.filters[index] = new_obj;

                this.setState({ filters: this.state.filters });
              } else {
                this.setState({ filters: [...this.state.filters, obj] });
              }

              //  this.setState({filters:[...this.state.filters,[this.state.filterKey]:this.state.filterValue}])
            }}
          >
            Add
          </button>

          <br />

          <label>Measures : </label>

          <select
            value={
              this.state.measureIndex !== -1
                ? this.state.measureList[this.state.measureIndex - 1].value
                : ""
            }
            onChange={(e) =>
              this.setState({ measureIndex: e.target.selectedIndex })
            }
          >
            <option style={{ display: "none" }}></option>
            {this.state.measureList.map((item) => {
              console.log(item);

              return <option>{item.value}</option>;
            })}
          </select>
          {/* <input type="text" onChange={(e)=>this.setState({measureKey:e.target.value})} /> */}

          <select
            value={this.state.measureValue}
            onChange={(e) => this.setState({ measureValue: e.target.value })}
          >
            <option style={{ display: "none" }}></option>
            <option>count</option>
            <option>sum</option>
          </select>

          {/* <input type="text" onChange={(e)=>this.setState({measureValue:e.target.value})} /> */}

          <button
            onClick={() => {
              let obj = {
                key: this.state.measureList[this.state.measureIndex - 1].key,
                value: this.state.measureValue,
              };
              this.setState({ measures: [...this.state.measures, obj] });
              //  this.setState({filters:[...this.state.filters,[this.state.filterKey]:this.state.filterValue}])
            }}
          >
            Add
          </button>

          <br />

          <label>Functions : </label>

          <select
            value={
              this.state.functionIndex !== -1
                ? this.state.functionList[this.state.functionIndex - 1][
                    this.state.lang.toLowerCase()
                  ]
                : ""
            }
            onChange={(e) =>
              this.setState({ functionIndex: e.target.selectedIndex })
            }
          >
            <option style={{ display: "none" }}></option>
            {this.state.functionList.map((item) => {
              if (this.state.lang == "En_name") {
                return <option>{item.en_name}</option>;
              } else {
                return <option>{item.ar_name}</option>;
              }
            })}
          </select>
          {/* <input type="text" onChange={(e)=>this.setState({measureKey:e.target.value})} /> */}

          {/* <input type="text" onChange={(e)=>this.setState({measureValue:e.target.value})} /> */}

          <button
            onClick={() => {
              let obj = {
                key: this.state.functionList[this.state.functionIndex - 1].key,
              };
              this.setState({ measures: [...this.state.measures, obj] });
              //  this.setState({filters:[...this.state.filters,[this.state.filterKey]:this.state.filterValue}])
            }}
          >
            Add
          </button>

          <br />

          <label>Date Range : </label>
          <label>Start Date : </label>
          <input
            type="date"
            onChange={(e) =>
              this.setState({
                startDate: e.target.value.split("-").reverse().join("-"),
              })
            }
          />
          <label> End Date : </label>
          <input
            type="date"
            onChange={(e) =>
              this.setState({
                endDate: e.target.value.split("-").reverse().join("-"),
              })
            }
          />

          <button
            onClick={() => {
              let obj = {
                date_day_range: {
                  date_day_start: this.state.startDate,
                  date_day_end: this.state.endDate,
                },
              };
              this.setState({ filters: [...this.state.filters, obj] });
            }}
          >
            Add
          </button>
        </div>
        <button onClick={this.handleApply}>apply</button>
        <button onClick={this.handleShowInMap}>Show in map</button>
        <PivotTableUI
          data={this.state.dataa}
          onChange={(s) => {
            console.log("table data", s.valueFilter);

            // if(s.rows.includes("damen_fee"))
            // {
            //     let data = s.rows
            //     let index = data.indexOf("damen_fee")
            //     console.log(index)
            //     data.splice(index,1)
            //     console.log(data)
            //     // this.setState({rows:data})
            //     this.setState(s)
            //     return
            // }
            this.setState(s);

            if (this.state.dataReq.length > 0) {
              document
                .querySelectorAll(".pvtTable")
                .forEach((el) => (el.style.display = "block"));
            }
          }}
          renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
          rows={this.state.rows}
          cols={this.state.cols}
          // measures={"amount","average"}
          //  aggregators={{cc: function(x) { return count}, dd: function(x) { return count}}}

          aggregators={{
            sum_square: function (x) {
              return sum_square;
            },
          }}
          aggregatorName={this.state.aggregatorName}
          // aggregatorName={"sum"}

          vals={this.state.aggregatorFilters} // aggregator filter attribute
          rendererName={this.state.rendererName}
          // hiddenAttributes = {["value"]}
          // hiddenFromDragDrop = {["value"]}
          {...this.state}
        />
      </div>
    );
  }
}

export default App;
