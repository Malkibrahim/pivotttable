import axios from "axios";

export async function GetPivotData(pivotData) {
  // debugger

  const { data } = await axios.post(
    "http://10.22.1.33:8080/pivot_data/GetPivotData",
    pivotData
  );
  console.log(data);
  return data;
}

export async function GetConfigurationData() {
  // debugger

  const { data } = await axios.get(
    "http://10.22.1.33:8080/pivot_data/GetPivotKeysConfig"
  );
  console.log(data);
  return data;
}

export async function GetPivotKeys() {
  // debugger

  const { data } = await axios.get(
    "http://10.22.1.33:8080/pivot_data/GetPivotKeys"
  );
  console.log(data);
  return data;
}
