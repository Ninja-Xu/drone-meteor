import axios from "axios";
import qs from "qs";

const BASE = "http://118.195.212.85:8025";
// const BASE = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://118.195.212.85:8200';
const ROOT = `${BASE}/server`;
const instance = axios.create({
  baseURL: `${ROOT}`,
  transformRequest: [
    function (data) {
      if (data instanceof FormData) {
        return data;
      }
      return qs.stringify(data);
    },
  ],
});

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  draw({ type, addrId, dateTime }) {
    //type: wind,temp,RH,vis
    return instance.post("/draw", { type, addrId, dateTime });
  },
  getSection({ isModified, type, slng, slat, elng, elat, addrId, dateTime }) {
    return instance.post(`${(isModified && "/dingzheng") || "/draw"}/section`, {
      type,
      slng,
      slat,
      elng,
      elat,
      addrId,
      dateTime,
    });
  },
  getImageAtHeight({ isModified, type, height, addrId, dateTime }) {
    return instance.post(`${(isModified && "/dingzheng") || "/draw"}/height`, {
      type,
      height,
      addrId,
      dateTime,
    });
  },
  getDataAtHeight({ isModified, type, height, addrId, dateTime }) {
    return instance.post(`${(isModified && "/dingzheng") || "/draw"}/data`, {
      type,
      height,
      addrId,
      dateTime,
    });
  },
  getAreaList(pcode) {
    return instance.post("/draw/addrList", { pcode });
  },
  drawRangeRect({ isModified, type, addrId, h1, h2, dateTime }) {
    return instance.post(
      `${(isModified && "/dingzheng") || "/draw"}/rangeRect`,
      { type, addrId, h1, h2, dateTime }
    );
  },
  getWindField({ dateTime, height, addrId }) {
    return instance.post("/draw/windLayer", { dateTime, height, addrId });
  },
  updateData(data) {
    return instance.post("/dingzheng/update", { data });
  },
  configAddFSS({
    name,
    elements,
    areaCode,
    areaName,
    startDate,
    endDate,
    config,
    year,
  }) {
    return instance.post("/dataSetting/addFSS", {
      name,
      elements,
      areaCode,
      areaName,
      startDate,
      endDate,
      config,
      year,
    });
  },
  configAddSS({ name, elements, areaCode, areaName, config, year }) {
    return instance.post("/dataSetting/addSS", {
      name,
      elements,
      areaCode,
      areaName,
      config,
      year,
    });
  },
  configDelete(code) {
    return instance.post("/dataSetting/del", { code });
  },
  configGetFSSList() {
    return instance.post("/dataSetting/findFSS");
  },
  configGetSSList() {
    return instance.post("/dataSetting/findSS");
  },
  configStartUp(id) {
    return instance.post("/dataSetting/startUp", { id });
  },
  configStop(id) {
    return instance.post("/dataSetting/stop", { id });
  },
  configDownloadFile(code) {
    return instance.get(`/dataSetting/zip?code=${code}`, {
      responseType: "blob",
    });
  },
  uploadFile(file) {
    return instance.post("/dataSetting/uploadDataFile", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  searchWeather({ dateTime, lon, lat, eleJson }) {
    return instance.post("/dataSetting/search", {
      dateTime,
      lon,
      lat,
      eleJson,
    });
  },
};

export { BASE, ROOT };
