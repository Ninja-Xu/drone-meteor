<template>
  <div class="main-container">
    <h1 class="main-title">低空气象飞行保障系统</h1>
    <div class="page">
      <div class="panel">
        <ul class="tab">
          <li
            class="item"
            :class="{ active: is3d }"
            @click="toggle3dHandler(true)"
          >
            三维显示
          </li>
          <li
            class="item"
            :class="{ active: !is3d }"
            @click="toggle3dHandler(false)"
          >
            二维显示
          </li>
        </ul>
        <div class="card">
          <h3 class="name">地区选择</h3>
          <el-cascader
            ref="areaSelect"
            class="custom-ele full"
            v-model="addr"
            :props="props"
          />
        </div>
        <div class="card">
          <h3 class="name">航线选择</h3>
          <el-select
            v-model="selectedRouteId"
            placeholder="请选择航线"
            class="custom-ele full"
          >
            <el-option
              v-for="route in flightRoutes"
              :key="route.id"
              :label="route.name"
              :value="route.id"
            ></el-option>
          </el-select>
        </div>
        <div class="card">
          <h3 class="name">气象要素选择</h3>
          <el-radio-group v-model="factor">
            <el-radio
              :label="factor.prop"
              v-for="(factor, i) in filterFactorList"
              :key="i"
              >{{ factor.name }}</el-radio
            >
          </el-radio-group>
        </div>
        <div class="card">
          <h3 class="name">数据时间选择</h3>
          <el-date-picker
            :format="dateFormat"
            :value-format="dateFormat"
            class="custom-ele full"
            v-model="date"
            type="datetime"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            @change="allChangeHandler"
          >
          </el-date-picker>
        </div>
        <div class="card" v-show="is3d">
          <h3 class="name">叠层显示设置</h3>
          <el-checkbox-group v-model="floorList">
            <el-checkbox
              class="checkbox-line"
              :label="level.min + ',' + level.max"
              v-for="(level, i) in level_list"
              :key="i"
              ><div class="floor">
                <span>{{ level.start }}-{{ level.end }}层</span
                ><span class="remark"
                  >（{{ level.min }}m~{{ level.max }}m）</span
                >
              </div></el-checkbox
            >
            <el-checkbox
              class="checkbox-line"
              ref="customCheck"
              :label="customLevel"
            >
              <el-select
                class="custom-ele"
                v-model="customStart"
                placeholder="请选择"
                @focus="visibleChangeHandler"
              >
                <el-option
                  v-for="item in custom_level_list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <span class="span">至</span>
              <el-select
                class="custom-ele"
                v-model="customEnd"
                placeholder="请选择"
                @focus="visibleChangeHandler"
              >
                <el-option
                  v-for="item in custom_level_list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="card" v-show="!is3d">
          <h3 class="name">数据层选择</h3>
          <el-select
            class="full custom-ele"
            v-model="ground.height"
            placeholder="请选择显示层级"
            @change="floorChangeHandler"
          >
            <el-option
              v-for="item in custom_level_list"
              :key="item.value"
              :label="item.label + '(' + item.value + '米)'"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="viewer-container">
        <div class="viewer">
          <div
            class="forecast-popup"
            v-if="forecastPopup.isVisible"
            :style="forecastPopup.position"
          >
            <div class="header">
              <span>{{ forecastPopup.data.name }} 预报数据</span>
              <span class="close-btn" @click="closeForecastPopup">&times;</span>
            </div>
            <div class="timestamp">数据时间: {{ forecastPopup.data.time }}</div>
            <div class="grid">
              <div class="item">
                <img src="/images/icon-temp.png" alt="" class="icon" />
                <span class="value">{{ forecastPopup.data.temp }}</span>
                <span class="label">温度</span>
              </div>
              <div class="item">
                <img src="/images/icon-winddir.png" alt="" class="icon" />
                <span class="value">{{
                  forecastPopup.data.windDirection
                }}</span>
                <span class="label">平均风向</span>
              </div>
              <div class="item">
                <img src="/images/icon-windspeed.png" alt="" class="icon" />
                <span class="value">{{ forecastPopup.data.windSpeed }}</span>
                <span class="label">平均风速</span>
              </div>
              <div class="item">
                <img src="/images/icon-humidity.png" alt="" class="icon" />
                <span class="value">{{ forecastPopup.data.humidity }}</span>
                <span class="label">湿度</span>
              </div>
            </div>
          </div>
          <div class="drone-info-popup" v-if="false" :style="droneInfoPosition">
            <div class="info-header">
              <span class="location-name">{{ droneInfo.locationName }}</span>
              <span class="flight-time"
                >预计飞行时间 {{ droneInfo.flightTime }} 分钟</span
              >
            </div>
          </div>
          <div class="drone-live-view-popup" v-if="isDroneLiveViewVisible">
            <div class="header">
              <span>无人机飞行实况</span>
              <span class="close-btn" @click="closeDroneLiveView">&times;</span>
            </div>
            <div class="content">
              <img
                src="https://images.unsplash.com/photo-1509280968350-07a97a155358?q=80&w=2835&auto=format&fit=crop"
                alt="Live UAV Feed"
              />
              <div class="location-overlay">当前位置：香河县</div>
            </div>
          </div>

          <div
            class="weather-station-popup"
            v-if="weatherStationPopup.isVisible"
            :style="weatherStationPopup.position"
          >
            <div class="header">
              <img src="/images/icon-startpoint.png" alt="" class="icon" />
              <span>{{ weatherStationPopup.data.name }}</span>
              <span class="close-btn" @click="closeWeatherStationPopup"
                >&times;</span
              >
            </div>
            <div class="timestamp">
              数据更新时间 {{ weatherStationPopup.data.time }}
            </div>
            <div class="grid">
              <div class="item">
                <img src="/images/icon-temp.png" alt="" class="icon" />
                <span class="value">{{ weatherStationPopup.data.temp }}</span>
                <span class="label">温度</span>
              </div>
              <div class="item">
                <img src="/images/icon-pressure.png" alt="" class="icon" />
                <span class="value">{{
                  weatherStationPopup.data.pressure
                }}</span>
                <span class="label">气压</span>
              </div>
              <div class="item">
                <img src="/images/icon-precip.png" alt="" class="icon" />
                <span class="value">{{
                  weatherStationPopup.data.precipitation
                }}</span>
                <span class="label">日降雨量(08时)</span>
              </div>
              <div class="item">
                <img src="/images/icon-humidity.png" alt="" class="icon" />
                <span class="value">{{
                  weatherStationPopup.data.humidity
                }}</span>
                <span class="label">湿度</span>
              </div>
              <div class="item">
                <img src="/images/icon-winddir.png" alt="" class="icon" />
                <span class="value">{{
                  weatherStationPopup.data.windDirection
                }}</span>
                <span class="label">平均风向(2分钟)</span>
              </div>
              <div class="item">
                <img src="/images/icon-windspeed.png" alt="" class="icon" />
                <span class="value">{{
                  weatherStationPopup.data.windSpeed
                }}</span>
                <span class="label">平均风速(2分钟)</span>
              </div>
              <div class="item">
                <img src="/images/icon-sun.png" alt="" class="icon" />
                <span class="value">{{ weatherStationPopup.data.light }}</span>
                <span class="label">光照强度</span>
              </div>
              <div class="item">
                <img src="/images/icon-uv.png" alt="" class="icon" />
                <span class="value">{{ weatherStationPopup.data.uv }}</span>
                <span class="label">UV(紫外线强度)</span>
              </div>
            </div>
          </div>

          <div class="legend">
            <span @click="legendToggleHandler">图例</span>
            <ul class="list" v-show="isLegendShow">
              <li
                class="item"
                v-for="legend in legend_list"
                :key="legend.color"
                :data-min="legend.min"
                :data-max="legend.max"
                :style="{ background: `rgb(${legend.color})` }"
              ></li>
              <p class="unit">{{ units[factor] }}</p>
            </ul>
          </div>
          <div class="tool" :class="{ row: !isToolShow }">
            <div class="custom-header">
              <div class="header">
                类型切换
                <img
                  src="@/assets/icon-arrow.png"
                  @click="toolClickHandler"
                  alt=""
                  class="img"
                  :class="{ on: !isToolShow }"
                />
              </div>
              <div class="content" v-show="isToolShow">
                <div class="line">
                  <span class="name">飞行控制</span>

                  <div class="flight-controls">
                    <button @click="toggleFlightAnimation" class="control-btn">
                      <template v-if="isDroneFlying">
                        <img
                          src="/images/icon-pause.png"
                          alt="Pause"
                          class="icon"
                        />
                      </template>
                      <template v-else>
                        <img
                          src="/images/icon-play.png"
                          alt="Play"
                          class="icon"
                        />
                      </template>
                    </button>
                  </div>
                </div>
                <div class="line">
                  <span class="name">地图切换</span>
                  <ul class="tab">
                    <li
                      class="item"
                      :class="{ on: isDistrict === districtTile }"
                      @click="mapStyleClickHandler(districtTile)"
                    >
                      行政图
                    </li>
                    <li
                      class="item"
                      :class="{ on: isDistrict !== districtTile }"
                      @click="mapStyleClickHandler(satelliteTile)"
                    >
                      卫星图
                    </li>
                  </ul>
                </div>
                <div class="line" v-show="!is3d">
                  <span class="name">显示切换</span>
                  <ul class="tab">
                    <li
                      class="item"
                      :class="{ on: !isGridShow }"
                      @click="mapDisplayClickHandler(false)"
                    >
                      落区图
                    </li>
                    <li
                      class="item"
                      :class="{ on: isGridShow }"
                      @click="mapDisplayClickHandler(true)"
                    >
                      格点数据
                    </li>
                  </ul>
                </div>
                <div class="line">
                  <span class="name">风场显示</span>
                  <el-switch v-model="isWindFiled"> </el-switch>
                  <el-select v-model="windHeight" placeholder="请选择风场高度">
                    <el-option
                      v-for="item in wind_height_list"
                      :key="item"
                      :label="item + '(米)'"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>
          <vc-viewer
            ref="cesiumViewer"
            @ready="ready"
            :selectionIndicator="false"
            :infoBox="false"
            :camera.sync="camera"
            :sceneMode="is3d ? 3 : 2"
            v-loading="loading"
          >
            <vc-provider-terrain-cesium
              ref="terrain"
            ></vc-provider-terrain-cesium>
            <vc-layer-imagery>
              <vc-provider-imagery-tianditu
                :mapStyle="isDistrict"
                token="16451c44816f76afa785d33114344a1d"
              ></vc-provider-imagery-tianditu>
            </vc-layer-imagery>

            <template v-if="selectedRoute && is3d">
              <vc-entity description="航线路径">
                <vc-graphics-polyline
                  :positions="selectedRoute.path"
                  :width="5"
                  :material="flightPathMaterial"
                ></vc-graphics-polyline>
              </vc-entity>
              <vc-entity
                v-for="(point, index) in selectedRoute.midpoints"
                :key="'midpoint-' + index"
                :id="'midpoint-' + index"
                :position="point"
                :description="
                  JSON.stringify({
                    type: 'midpoint',
                    name: point.name,
                    location: point.location,
                  })
                "
              >
                <vc-graphics-billboard
                  image="/images/icon-intermediate.png"
                  :scale="0.1"
                  :verticalOrigin="1"
                  :disableDepthTestDistance="Number.POSITIVE_INFINITY"
                ></vc-graphics-billboard>
                <vc-graphics-label
                  :text="point.name"
                  font="18px Microsoft YaHei"
                  fillColor="white"
                  :pixelOffset="[0, 40]"
                  :showBackground="true"
                  backgroundColor="rgba(0, 0, 0, 0.5)"
                  :backgroundPadding="[7, 5]"
                ></vc-graphics-label>
              </vc-entity>

              <vc-entity
                :id="'start-point-' + selectedRoute.id"
                :position="selectedRoute.startPoint"
                :description="
                  JSON.stringify({
                    type: 'start',
                    stationName: '金海湖观测站',
                    location: selectedRoute.locationName,
                  })
                "
              >
                <vc-graphics-billboard
                  image="/images/icon-startpoint.png"
                  :scale="0.2"
                  :verticalOrigin="1"
                  :disableDepthTestDistance="Number.POSITIVE_INFINITY"
                ></vc-graphics-billboard>
                <vc-graphics-label
                  text="起点名称"
                  font="18px Microsoft YaHei"
                  fillColor="white"
                  :pixelOffset="[0, 40]"
                  :showBackground="true"
                  backgroundColor="rgba(0, 0, 0, 0.5)"
                  :backgroundPadding="[7, 5]"
                ></vc-graphics-label>
              </vc-entity>

              <vc-entity
                :id="'end-point-' + selectedRoute.id"
                :position="selectedRoute.endPoint"
                :description="
                  JSON.stringify({
                    type: 'end',
                    stationName: '廊坊观测站',
                    location: '目的地',
                  })
                "
              >
                <vc-graphics-billboard
                  image="/images/icon-endpoint.png"
                  :scale="0.2"
                  :verticalOrigin="1"
                  :disableDepthTestDistance="Number.POSITIVE_INFINITY"
                ></vc-graphics-billboard>
                <vc-graphics-label
                  text="终点名称"
                  font="18px Microsoft YaHei"
                  fillColor="white"
                  :pixelOffset="[0, 40]"
                  :showBackground="true"
                  backgroundColor="rgba(0, 0, 0, 0.5)"
                  :backgroundPadding="[7, 5]"
                ></vc-graphics-label>
              </vc-entity>

              <vc-entity
                :id="'drone'"
                :position="dronePosition"
                :description="JSON.stringify({ type: 'drone' })"
              >
                <vc-graphics-billboard
                  image="/images/icon-drone.png"
                  :scale="0.2"
                  :verticalOrigin="1"
                  :disableDepthTestDistance="Number.POSITIVE_INFINITY"
                ></vc-graphics-billboard>
              </vc-entity>
            </template>
            <vc-entity :show="is3d" v-if="section.url" @ready="sectionReady">
              <vc-graphics-wall
                @definitionChanged="changedHandler"
                :positions.sync="section.hierarchy"
                :material="createTransparentMaterial(section.url)"
                :minimumHeights="section.minimumHeights"
              ></vc-graphics-wall>
            </vc-entity>
            <template v-if="is3d">
              <vc-entity
                v-for="label in labelList"
                :key="label.id"
                :position="label.position"
                :description="label.description"
              >
                <vc-graphics-label
                  :text="label.description"
                  font="16px sans-serif"
                  :pixelOffset="[0, 0]"
                ></vc-graphics-label>
              </vc-entity>
            </template>
            <template v-if="!is3d && isGridShow">
              <vc-entity
                v-for="label in gridList"
                :key="label.id"
                :position="label.position"
                :description="label.$value"
                @mouseover="mouseoverHandler(label)"
                @mouseout="mouseoutHandler(label)"
              >
                <vc-graphics-billboard
                  :image="label.image"
                  :show="
                    (factor === 'weather' && label.isImageShow) ||
                    factor === 'windD'
                  "
                  :scale="0.3"
                  :scaleByDistance="{
                    near: 40000,
                    nearValue: 1,
                    far: 200000,
                    farValue: 0.5,
                  }"
                  :rotation="label.rotation"
                  :alignedAxis="label.alignedAxis"
                ></vc-graphics-billboard>
                <vc-graphics-label
                  :show="label.isLabelShow"
                  :text="label.$value"
                  font="14px sans-serif"
                  :pixelOffset="[0, 0]"
                ></vc-graphics-label>
              </vc-entity>
            </template>
            <vc-entity v-if="!is3d">
              <vc-graphics-polygon
                v-if="!isGridShow"
                :height="ground.height"
                :heightReference="2"
                :hierarchy="box.shang.hierarchy"
                :material="createTransparentMaterial(ground.image)"
                :perPositionHeight="box.shang.perPositionHeight"
              ></vc-graphics-polygon>
            </vc-entity>
            <template v-if="is3d">
              <vc-entity v-for="(plane, i) in customSectionList" :key="i">
                <vc-graphics-polygon
                  :positions="plane.hierarchy"
                  :material="createTransparentMaterial(plane.url)"
                  :minimumHeights="plane.minimumHeights"
                ></vc-graphics-polygon>
              </vc-entity>
            </template>
            <template v-if="is3d">
              <vc-entity v-for="(plane, i) in box" :key="i">
                <vc-graphics-wall
                  v-if="plane.type === 'wall'"
                  :show="isBoxShow"
                  :positions="plane.hierarchy"
                  :material="createTransparentMaterial(plane.url)"
                  :minimumHeights="plane.minimumHeights"
                ></vc-graphics-wall>
                <vc-graphics-polygon
                  v-else-if="plane.height == 0"
                  :show="isBoxShow"
                  :heightReference="1"
                  :hierarchy="plane.hierarchy"
                  :material="createTransparentMaterial(plane.url)"
                  :perPositionHeight="plane.perPositionHeight"
                ></vc-graphics-polygon>
                <vc-graphics-polygon
                  v-else
                  :show="isBoxShow"
                  :height="plane.height"
                  :heightReference="2"
                  :hierarchy="plane.hierarchy"
                  :material="createTransparentMaterial(plane.url)"
                  :perPositionHeight="plane.perPositionHeight"
                ></vc-graphics-polygon>
              </vc-entity>
            </template>
            <vc-handler-draw-polygon
              :clamp-to-ground="true"
              ref="handlerPolygon"
              @activeEvt="activeEvt"
              @movingEvt="movingEvt"
              @drawEvt="drawEvt"
            ></vc-handler-draw-polygon>
          </vc-viewer>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as turf from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import $api, { ROOT } from "../api";
import factorList from "@/data/factorList";
import {
  temp_legend_list,
  wind_legend_list,
  vis_legend_list,
  RH_legend_list,
  water_legend_list,
  cloud_legend_list,
  frog_legend_list,
  czl_legend_list,
  snow_legend_list,
  ys_legend_list,
  weather_legend_list,
  bz_shui_qi_legend_list,
  midu_legend_list,
  cloud_area_legend_list,
  pre_legend_list,
  chuizhi_legend_list,
  sh_legend_list,
  windD_legend_list,
  cloud_type_legend_list,
  haze_legend_list,
} from "@/data/legend";
const weather = {
  0: "晴",
  1: "多云",
  2: "阴",
};
const weather_image = {
  0: require("@/assets/sunny.jpeg"),
  1: require("@/assets/cloudy.jpeg"),
  2: require("@/assets/overcast.jpeg"),
};
const windIcon = require("@/assets/windD.png");
const units = {
  temp: "℃",
  wind: "m/s",
  vis: "m",
  RH: "%",
  bz_czl: "Pa/s",
  frog: "",
  cloud: "100%",
  cloud_area: "km^2",
  midu: "kg/m^3",
  water: "mm",
  cloud_height: "m",
  bz_yun_shui: "kg/m^2",
  bz_shui_qi: "kg/m^2",
  bz_snow: "mm",
  pre: "Pa",
  sh: "g/kg",
};
const min_height = 0,
  max_height = 30000;
const ratio = 10;
const max_lng = 136,
  min_lng = 73,
  max_lat = 54,
  min_lat = 3;
const level_list = [
  { min: 0, max: 50, step: 5, start: 1, end: 11 },
  { min: 100, max: 3000, step: 100, start: 12, end: 42 },
  { min: 3200, max: 30000, step: 200, start: 43, end: 178 },
];
const wind_height_list = [
  0, 300, 600, 800, 1000, 1200, 1400, 1700, 2000, 2250, 2500, 3000, 3500, 4200,
  4900, 5600, 5900, 7200, 8200, 9200, 10400, 11000, 12000, 12500, 13500, 14750,
  16000, 18500, 20500, 23800, 26500, 30000,
];
export default {
  name: "Home",
  data() {
    let custom_level_list = [];
    level_list.forEach((level) => {
      let { min, step, start, end } = level;
      for (let i = start; i <= end; i++) {
        custom_level_list.push({
          label: i + "层",
          value: min + (i - start) * step,
        });
      }
    });
    var checkLon = (_, value, callback) => {
      if (!value) {
        return callback(new Error("经度不能为空"));
      }
      if (isNaN(value)) {
        return callback(new Error("请输入正确的经度"));
      }
      setTimeout(() => {
        if (value < min_lng || value > max_lng) {
          callback(new Error("经度不在中国范围内"));
        } else {
          callback();
        }
      }, 100);
    };
    var checkLat = (_, value, callback) => {
      if (!value) {
        return callback(new Error("纬度不能为空"));
      }
      if (isNaN(value)) {
        return callback(new Error("请输入正确的纬度"));
      }
      setTimeout(() => {
        if (value < min_lat || value > max_lat) {
          callback(new Error("纬度不在中国范围内"));
        } else {
          callback();
        }
      }, 300);
    };
    let districtTile = `cia_c`;
    return {
      units,
      isWindFiled: false,
      loading: true,
      isBoxShow: true,
      isGridShow: false,
      satelliteTile: `img_c`,
      districtTile: `cia_c`,
      isDistrict: districtTile,
      date: "2020-01-01 08:00:00",
      dateFormat: "yyyy-MM-dd HH:mm:ss",
      pickerOptions: {
        disabledDate: (time) => {
          if (
            new Date(time) > new Date("2019-12-31 23:59:59") &&
            new Date(time) < new Date("2021-01-01 00:00:00")
          ) {
            return false;
          } else {
            return true;
          }
        },
      },
      addr: null,
      props: {
        checkStrictly: true,
        emitPath: false,
        lazy: true,
        lazyLoad(node, resolve) {
          const { data } = node;
          $api.getAreaList(data?.value?.code || 1).then((res) => {
            const nodes = res.data.map((menu) => {
              return {
                label: menu.name,
                value: menu,
              };
            });
            resolve(nodes);
          });
        },
      },
      camera: {
        position: {
          lng: 100,
          lat: 28,
          height: 10000000,
        },
        heading: 10,
        pitch: -90,
        roll: 0,
      },
      wind_height_list,
      legend: {
        temp_legend_list,
        wind_legend_list,
        vis_legend_list,
        RH_legend_list,
        water_legend_list,
        cloud_legend_list,
        bz_snow_legend_list: snow_legend_list,
        bz_yun_shui_legend_list: ys_legend_list,
        frog_legend_list,
        bz_czl_legend_list: czl_legend_list,
        weather_legend_list,
        bz_shui_qi_legend_list,
        midu_legend_list,
        cloud_area_legend_list,
        pre_legend_list,
        cloud_midu_legend_list: chuizhi_legend_list,
        sh_legend_list,
        windD_legend_list,
        cloud_type_legend_list,
        haze_legend_list,
      },
      isLegendShow: true,
      customStart: "",
      customEnd: "",
      custom_level_list,
      level_list,
      factor: "temp",
      clipping: {
        aLon: "",
        aLat: "",
        bLon: "",
        bLat: "",
      },
      factorList,
      rules: {
        aLon: [
          {
            validator: checkLon,
            trigger: "blur",
          },
        ],
        aLat: [
          {
            validator: checkLat,
            trigger: "blur",
          },
        ],
        bLon: [
          {
            validator: checkLon,
            trigger: "blur",
          },
        ],
        bLat: [
          {
            validator: checkLat,
            trigger: "blur",
          },
        ],
      },
      floorList: [],
      is3d: true,
      viewer: null,
      Cesium: null,
      handler: null,
      canClick: false,
      appearance: null,
      geometry: null,
      attributes: null,
      vertexFormat: null,
      positionsOutline: [],
      sectionCesiumObject: null,
      labelList: [],
      gridList: [],
      min_height,
      max_height,
      section: {
        url: "",
        hierarchy: [],
        minimumHeights: [],
      },
      customSectionList: [],
      ground: {
        height: 0,
        image: "",
      },
      box: {},
      windy: null,
      windHeight: 2000,
      editable: false,
      polygonDrawing: false,
      selectedGridList: [],
      coordStep: 0,
      isModified: false,
      allValue: 0,
      isToolShow: true,
      isDroneFlying: false,
      flightRoutes: [
        {
          id: 1,
          name: "航线A：平谷廊坊巡检",
          locationName: "平谷金海湖机场",
          path: [
            { lng: 117.20982, lat: 40.195766, height: 2000 },
            { lng: 117.001449, lat: 39.912235, height: 2500 },
            { lng: 116.945477, lat: 39.761807, height: 2500 },
            { lng: 116.702929, lat: 39.566476, height: 2000 },
          ],
          midpoints: [
            {
              id: "midpoint-1",
              name: "沿线点1",
              location: "燕郊镇",
              lng: 117.001449,
              lat: 39.912235,
              height: 0,
            },
            {
              id: "midpoint-2",
              name: "沿线点2",
              location: "大厂回族自治县",
              lng: 116.945477,
              lat: 39.761807,
              height: 0,
            },
          ],
          startPoint: { lng: 117.20982, lat: 40.195766, height: 0 },
          endPoint: { lng: 116.702929, lat: 39.566476, height: 0 },
        },
      ],
      otherSites: [
        { name: "备降点1", position: { lng: 117.0, lat: 40.2, height: 0 } },
        { name: "备降点2", position: { lng: 116.5, lat: 39.5, height: 0 } },
      ],
      selectedRouteId: null,
      dronePosition: null,
      droneOrientation: null,
      showDroneInfo: false,
      isDroneInfoVisible: false,
      droneInfoPosition: {
        left: "0px",
        top: "0px",
      },
      droneInfo: {
        locationName: "当前位置",
        flightTime: 0,
      },
      droneWeatherInfo: {
        name: "平谷金海湖机场",
        time: "2025-08-18 11:45",
        temp: 34.2,
        pressure: 1010.2,
        precipitation: 0.0,
        windSpeed: 0.9,
        visibility: 30,
        humidity: 20,
      },
      forecastPopup: {
        isVisible: false,
        data: {
          name: "",
          time: "",
          temp: "N/A",
          windDirection: "N/A",
          windSpeed: "N/A",
          humidity: "N/A",
          pressure: "N/A",
        },
        position: {
          left: "0px",
          top: "0px",
          display: "none",
        },
      },
      flightPathMaterial: null,
      isDroneLiveViewVisible: false,
      weatherStationPopup: {
        isVisible: false,
        data: {
          name: "格尔木湿地公园气象站",
          time: "2025年8月6日 17:17:05",
          temp: "34.2℃",
          pressure: "1010.2hPa",
          precipitation: "0.0mm",
          humidity: "53%",
          windDirection: "305(西北风)",
          windSpeed: "0.3m/s",
          light: "2.0",
          uv: "2.0",
        },
        position: {
          left: "0px",
          top: "0px",
          display: "none",
        },
      },
      dronePathProperty: null,
    };
  },
  computed: {
    isElementSingle() {
      return this.factorList.find(
        (f) => f.name === this.configController.form.element.name
      )?.single;
    },
    customLevel() {
      return this.customStart + "," + this.customEnd;
    },
    addrId() {
      return this.addr ? this.addr.id : 1;
    },
    legend_list() {
      return this.legend[this.factor + "_legend_list"];
    },
    filterFactorList() {
      return this.factorList.filter((factor) => {
        return (
          factor.show === "always" ||
          (this.is3d && factor.show === "3d") ||
          (!this.is3d && factor.show === "2d")
        );
      });
    },
    searchTablePropList() {
      return this.configController.searchForm.filters.map((f) => f.field);
    },
    selectedRoute() {
      if (!this.selectedRouteId) return null;
      return this.flightRoutes.find((r) => r.id === this.selectedRouteId);
    },
  },
  watch: {
    isWindFiled(nV) {
      if (nV) {
        this.renderWind();
      } else {
        this.windy && this.windy.removeLines();
      }
    },
    windHeight() {
      this.windHandler();
    },
    factor() {
      this.allChangeHandler();
    },
    is3d() {
      this.allChangeHandler();
    },
    canClick(nV) {
      if (nV) {
        this.handler.setInputAction(
          this.cesiumClickHandler,
          this.Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
      } else {
        this.handler.removeInputAction(
          this.Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
      }
    },
    floorList() {
      this.getFloorHeight();
      this.initBoxAndLabel();
      this.allChangeHandler();
    },
    addrId() {
      this.initBoxAndLabel();
      this.allChangeHandler();
    },
    isGridShow() {
      this.floorChangeHandler(this.ground.height);
    },
    selectedRouteId(newId, oldId) {
      if (oldId !== null) {
        this.stopAnimateDroneFlight();
      }
      if (newId) {
        this.handleRouteChange();
      } else {
        this.showDroneInfo = false;
      }
    },
  },
  created() {
    this.initBoxAndLabel();
    this.getBoxImage();
  },
  beforeDestroy() {
    this.stopAnimateDroneFlight();
  },
  destroyed() {
    this.windy && this.windy.removeLines();
    this.stopAnimateDroneFlight();
  },
  methods: {
    // 启动无人机飞行路径动画
    startFlight() {
      this.stopAnimateDroneFlight();
      if (!this.viewer || !this.selectedRoute) return;

      const { Cesium, viewer } = this;
      const routePath = this.selectedRoute.path;
      const animationDurationSeconds = 60;

      const start = Cesium.JulianDate.fromDate(new Date());
      const stop = Cesium.JulianDate.addSeconds(
        start,
        animationDurationSeconds,
        new Cesium.JulianDate()
      );

      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      // 移除 timeline.zoomTo，因为用户不希望显示时间线
      // viewer.timeline.zoomTo(start, stop);

      const sampledPosition = new Cesium.SampledPositionProperty();
      const pathCartesians = routePath.map((p) =>
        Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.height)
      );

      pathCartesians.forEach((pos, index) => {
        const timeOffset =
          (index / (pathCartesians.length - 1)) * animationDurationSeconds;
        const time = Cesium.JulianDate.addSeconds(
          start,
          timeOffset,
          new Cesium.JulianDate()
        );
        sampledPosition.addSample(time, pos);
      });

      this.dronePathProperty = sampledPosition;
      this.dronePosition = sampledPosition;

      // 添加无人机方向计算
      const computeOrientation = (time, result) => {
        const position = this.dronePathProperty.getValue(time);
        const nextPosition = this.dronePathProperty.getValue(
          Cesium.JulianDate.addSeconds(time, 1, new Cesium.JulianDate())
        );
        if (Cesium.defined(position) && Cesium.defined(nextPosition)) {
          const heading = this.getHeading(position, nextPosition);
          const hpr = new Cesium.HeadingPitchRoll(heading, 0, 0);
          return Cesium.Transforms.headingPitchRollQuaternion(
            position,
            hpr,
            result
          );
        }
        return Cesium.Quaternion.IDENTITY;
      };
      this.droneOrientation = new Cesium.CallbackProperty(
        computeOrientation,
        false
      );
      viewer.scene.preRender.addEventListener(this.updateDroneInfo);

      viewer.flyTo(viewer.entities.getById("drone"), {
        duration: 1.5,
        offset: new Cesium.HeadingPitchRange(
          0.0,
          -Cesium.Math.PI_OVER_FOUR,
          5000
        ),
      });

      this.viewer.clock.shouldAnimate = true;
      this.isDroneFlying = true;
    },
    /**
     * @description 切换飞行器的播放/暂停状态
     * @issue:
     * - 原始代码没有播放/暂停的控制，这里新增该功能
     */
    toggleFlightAnimation() {
      if (this.isDroneFlying) {
        this.viewer.clock.shouldAnimate = false;
        this.isDroneFlying = false;
      } else {
        // 如果动画已经停止，从当前时间继续播放
        this.viewer.clock.shouldAnimate = true;
        this.isDroneFlying = true;
      }
    },

    // 停止无人机飞行动画
    stopAnimateDroneFlight() {
      if (this.dronePathProperty) {
        if (this.viewer && this.viewer.scene) {
          this.viewer.scene.preRender.removeEventListener(this.updateDroneInfo);
        }
        this.dronePathProperty.removeAllSamples();
        this.dronePathProperty = null;
        this.dronePosition = null; // 清除无人机位置
        this.droneOrientation = null; // 清除无人机方向
      }
    },
    closeDroneLiveView() {
      this.isDroneLiveViewVisible = false;
    },
    openWeatherStationPopup(entityData, screenPosition) {
      this.weatherStationPopup.data.name = entityData.stationName;
      this.weatherStationPopup.isVisible = true;

      this.$nextTick(() => {
        this.weatherStationPopup.position = {
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          display: "block",
        };
      });
      this.closeForecastPopup();
    },

    closeWeatherStationPopup() {
      this.weatherStationPopup.isVisible = false;
    },
    openForecastPopup(entityData, screenPosition) {
      this.forecastPopup.isVisible = true;
      // 模拟获取数据
      this.fetchForecastData(entityData).then((data) => {
        this.forecastPopup.data = {
          name: data.name,
          time: data.time,
          temp: `${data.temp}℃`,
          windDirection: `${data.windDirection}°`,
          windSpeed: `${data.windSpeed}m/s`,
          humidity: `${data.humidity}%`,
          pressure: `${data.pressure}hPa`,
        };
      });

      this.$nextTick(() => {
        this.forecastPopup.position = {
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
        };
      });
      // 关闭其他弹窗
      this.closeWeatherStationPopup();
    },

    // 新增：关闭预报数据弹窗
    closeForecastPopup() {
      this.forecastPopup.isVisible = false;
    },
    updateDroneInfo() {
      if (!this.viewer || !this.selectedRoute || !this.dronePosition) {
        this.isDroneInfoVisible = false;
        return;
      }
      this.isDroneInfoVisible = true;

      // 获取当前时间
      const currentTime = this.viewer.clock.currentTime;
      const startTime = this.viewer.clock.startTime;
      const stopTime = this.viewer.clock.stopTime;

      // 计算飞行时间（模拟）
      const elapsedTimeSeconds = this.Cesium.JulianDate.secondsDifference(
        currentTime,
        startTime
      );
      const totalTimeSeconds = this.Cesium.JulianDate.secondsDifference(
        stopTime,
        startTime
      );
      const remainingTimeMinutes = Math.floor(
        (totalTimeSeconds - elapsedTimeSeconds) / 60
      );

      this.droneInfo.flightTime = Math.max(0, remainingTimeMinutes);

      // 获取当前无人机的位置
      const droneCartesian = this.dronePosition.getValue(currentTime);

      // 将三维世界坐标转换为二维屏幕坐标
      const screenPosition =
        this.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          this.viewer.scene,
          droneCartesian
        );

      if (screenPosition) {
        this.droneInfoPosition = {
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
        };
      } else {
        // 如果无人机在屏幕外，则隐藏弹窗
        this.isDroneInfoVisible = false;
      }
    },
    closeLiveView() {
      this.isLiveViewVisible = false;
    },
    handleRouteChange() {
      if (!this.selectedRoute || !this.viewer) return;
      this.droneInfo.locationName = this.selectedRoute.locationName;
      this.droneInfo.flightTime = 60; // 初始预计飞行时间为60分钟
      this.isDroneInfoVisible = true;
      this.isDroneFlying = true;
      this.startFlight();
      this.fetchDroneWeather(this.selectedRoute.path[0]);
      const positionsForBoundingSphere = this.selectedRoute.path.flatMap(
        (p) => [p.lng, p.lat, p.height]
      );
      const cartesianPositions = this.Cesium.Cartesian3.fromDegreesArrayHeights(
        positionsForBoundingSphere
      );
      const boundingSphere =
        this.Cesium.BoundingSphere.fromPoints(cartesianPositions);

      this.viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: 2.0,
      });
      this.showDroneInfo = true;
    },

    getHeading(p1, p2) {
      const transform = this.Cesium.Transforms.eastNorthUpToFixedFrame(p1);
      const relativeP2 = this.Cesium.Matrix4.multiplyByPoint(
        this.Cesium.Matrix4.inverse(transform, new this.Cesium.Matrix4()),
        p2,
        new this.Cesium.Cartesian3()
      );
      const heading =
        Math.atan2(relativeP2.y, relativeP2.x) - this.Cesium.Math.PI_OVER_TWO;
      return this.Cesium.Math.negativePiToPi(heading);
    },

    fetchDroneWeather(position) {
      console.log(`Fetching weather for:`, position);
      const now = new Date();
      this.droneWeatherInfo = {
        name: this.selectedRoute.locationName,
        time: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")} ${String(
          now.getHours()
        ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        temp: (30 + Math.random() * 5).toFixed(1),
        pressure: (1005 + Math.random() * 10).toFixed(1),
        precipitation: (Math.random() * 1).toFixed(1),
        windSpeed: (0.5 + Math.random() * 2).toFixed(1),
        visibility: 30,
        humidity: (15 + Math.random() * 10).toFixed(0),
      };
    },
    fetchForecastData(point) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date();
          resolve({
            name: point.location,
            time: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(now.getDate()).padStart(2, "0")} ${String(
              now.getHours()
            ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
            temp: (25 + Math.random() * 10).toFixed(1),
            windDirection: (Math.random() * 360).toFixed(0),
            windSpeed: (1 + Math.random() * 5).toFixed(1),
            humidity: (40 + Math.random() * 20).toFixed(0),
            pressure: (990 + Math.random() * 30).toFixed(1),
          });
        }, 500);
      });
    },

    ready(cesiumInstance) {
      const { Cesium, viewer } = cesiumInstance;
      this.viewer = viewer;
      this.Cesium = Cesium;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      const clickHandler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene.canvas
      );
      clickHandler.setInputAction((event) => {
        const pickedObject = viewer.scene.pick(event.position);

        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const entity = pickedObject.id;
          if (entity.description) {
            try {
              const entityData = JSON.parse(
                entity.description.getValue(this.viewer.clock.currentTime)
              );

              if (entityData.type === "start" || entityData.type === "end") {
                this.openWeatherStationPopup(entityData, event.position);
                return;
              }
              if (entityData.type === "midpoint") {
                this.openForecastPopup(entityData, event.position);
                return;
              }
              if (entityData.type === "drone") {
                this.isDroneLiveViewVisible = true;
                return;
              }
            } catch (e) {
              /* ignore */
            }
          }
        }
        this.closeWeatherStationPopup();
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      const { PerInstanceColorAppearance, ColorGeometryInstanceAttribute } =
        Cesium;
      this.appearance = new PerInstanceColorAppearance({
        flat: true,
        translucent: true,
      });
      this.vertexFormat = PerInstanceColorAppearance.FLAT_VERTEX_FORMAT;
      this.attributes = {
        color: new ColorGeometryInstanceAttribute(
          Cesium.Color.fromCssColorString("#16d0ff")
        ),
      };

      var minPitch = -Cesium.Math.PI_OVER_TWO;
      var maxPitch = 0;
      var minHeight = 200;
      viewer.camera.changed.addEventListener(() => {
        if (
          this.viewer.camera._suspendTerrainAdjustment &&
          this.viewer.scene.mode === Cesium.SceneMode.SCENE3D
        ) {
          this.viewer.camera._suspendTerrainAdjustment = false;
          this.viewer.camera._adjustHeightForTerrain();
        }
        var pitch = this.viewer.camera.pitch;
        if (pitch > maxPitch || pitch < minPitch) {
          this.viewer.scene.screenSpaceCameraController.enableTilt = false;
          if (pitch > maxPitch) {
            pitch = maxPitch;
          } else if (pitch < minPitch) {
            pitch = minPitch;
          }
          var destination = Cesium.Cartesian3.fromRadians(
            this.viewer.camera.positionCartographic.longitude,
            this.viewer.camera.positionCartographic.latitude,
            Math.max(this.viewer.camera.positionCartographic.height, minHeight)
          );
          this.viewer.camera.setView({
            destination: destination,
            orientation: { pitch: pitch },
          });
          this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        }
      });
      this.flightPathMaterial = new this.Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        color: this.Cesium.Color.AQUAMARINE,
      });
      this.selectedRouteId = 1;
    },
    createTransparentMaterial(imageUrl) {
      if (!this.Cesium) {
        return undefined;
      }
      if (!imageUrl) {
        return this.Cesium.Color.TRANSPARENT;
      }
      return new this.Cesium.ImageMaterialProperty({
        image: imageUrl,
        color: this.Cesium.Color.WHITE.withAlpha(0.6),
      });
    },
    toolClickHandler() {
      this.isToolShow = !this.isToolShow;
    },
    mapStyleClickHandler(type) {
      this.isDistrict = type;
    },
    mapDisplayClickHandler(flag) {
      this.isGridShow = flag;
    },
    toggle(type) {
      this.$refs[type].drawing = !this.$refs[type].drawing;
    },
    clear() {
      this.$refs.handlerPolygon.clear();
      this.selectedGridList = [];
    },
    editHandler() {
      let obj = {
        type: this.factor,
        time: this.date,
        height: this.ground.height,
        interval: this.coordStep,
        data: this.gridList.map((d) => ({
          lng: d.position.lng,
          lat: d.position.lat,
          val: d.$value,
        })),
      };
      $api.updateData(JSON.stringify(obj)).then((res) => {
        if (res.code === 0) {
          this.$message({ type: "success", message: "提交成功" });
        }
      });
    },
    allValueChangeHandler(v) {
      this.selectedGridList.forEach((d) => (d.$value = v));
    },
    activeEvt(_) {
      this[_.type] = _.isActive;
    },
    movingEvt() {},
    drawEvt(result) {
      if (result.finished) {
        let polygon = turf.polygon([
          [
            ...result.polyline.positions,
            ...result.polyline.positions.slice(0, 1),
          ].map(this.cartesian3ToLnglat),
        ]);

        this.selectedGridList = this.gridList.filter(
          (p) =>
            pointsWithinPolygon(
              turf.point([p.position.lng, p.position.lat]),
              polygon
            ).features.length
        );
      }
    },
    cartesian3ToLnglat(pos) {
      var cartographic = this.Cesium.Cartographic.fromCartesian(pos);
      var lat = this.Cesium.Math.toDegrees(cartographic.latitude);
      var lng = this.Cesium.Math.toDegrees(cartographic.longitude);
      return [lng, lat];
    },
    mouseoverHandler(label) {
      if (this.factor !== "weather") return;
      this.gridList = this.gridList.map((t) => {
        return {
          ...t,
          isLabelShow: t.id === label.id,
          isImageShow: t.id !== label.id,
        };
      });
    },
    mouseoutHandler() {
      if (this.factor !== "weather") return;
      this.gridList = this.gridList.map((t) => {
        return {
          ...t,
          isLabelShow: false,
          isImageShow: true,
        };
      });
    },
    windHandler() {
      if (this.isWindFiled) {
        this.renderWind();
      }
    },
    showWindy() {
      document.querySelector("#windycanvas").style.display = "initial";
    },
    hideWindy() {
      document.querySelector("#windycanvas").style.display = "none";
    },
    async renderWind() {
      this.loading = true;
      let res = await $api.getWindField({
        dateTime: this.date,
        height: this.windHeight,
        addrId: 1,
      });
      this.loading = false;
      if (!res.data) {
        return this.$message({
          message: "没有数据,请选择其他高度",
          type: "warning",
        });
      }
      try {
        this.windy && this.windy.removeLines();
      } catch (e) {
        console.log(e);
      }
      var self = this;
      var windycanvas = null;
      var Cesium = this.Cesium,
        viewer = this.viewer;
      var container = this.$refs.cesiumViewer.viewerContainer;
      var globalExtent = [];
      var getCesiumExtent = function () {
        var canvaswidth = container.offsetWidth,
          canvasheight = container.offsetHeight;

        var left_top_pt = new Cesium.Cartesian2(0, 0);
        var left_bottom_pt = new Cesium.Cartesian2(0, canvasheight);
        var right_top_pt = new Cesium.Cartesian2(canvaswidth, 0);
        var right_bottom_pt = new Cesium.Cartesian2(canvaswidth, canvasheight);

        var pick1 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(left_top_pt),
          viewer.scene
        );
        var pick2 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(left_bottom_pt),
          viewer.scene
        );
        var pick3 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(right_top_pt),
          viewer.scene
        );
        var pick4 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(right_bottom_pt),
          viewer.scene
        );
        if (pick1 && pick2 && pick3 && pick4) {
          var geoPt1 =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
          var geoPt2 =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
          var point1 = [
            (geoPt1.longitude / Math.PI) * 180,
            (geoPt1.latitude / Math.PI) * 180,
          ];
          var point2 = [
            (geoPt2.longitude / Math.PI) * 180,
            (geoPt2.latitude / Math.PI) * 180,
          ];
          if (point1[0] > point2[0]) {
            globalExtent = [
              point1[0],
              180,
              point1[1],
              point2[1],
              -180,
              point2[0],
              point1[1],
              point2[1],
            ];
          } else {
            globalExtent = [point1[0], point2[0], point1[1], point2[1]];
          }
        } else {
          globalExtent = [];
        }
      };
      viewer.scene.postRender.addEventListener(() => {
        getCesiumExtent();
      });
      var refreshTimer = -1;
      var mouse_down = false;
      var mouse_move = false;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function () {
        if (!self.isWindFiled) {
          return;
        }
        clearTimeout(refreshTimer);
        self.hideWindy();
        setTimeout(function () {
          self.windy.extent = globalExtent;
          self.windy.redraw();
          self.showWindy();
        }, 200);
      }, Cesium.ScreenSpaceEventType.WHEEL);
      handler.setInputAction(function () {
        mouse_down = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function () {
        mouse_down = true;
      }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
      handler.setInputAction(function () {
        if (!self.isWindFiled) {
          return;
        }
        if (mouse_down) {
          self.hideWindy();
          mouse_move = true;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function () {
        if (!self.isWindFiled) {
          return;
        }
        if (mouse_down && mouse_move) {
          self.windy.extent = globalExtent;
          self.windy.redraw();
        }
        self.showWindy();
        mouse_down = false;
        mouse_move = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function () {
        if (!self.isWindFiled) {
          return;
        }
        if (mouse_down && mouse_move) {
          self.windy.extent = globalExtent;
          self.windy.redraw();
        }
        self.showWindy();
        mouse_down = false;
        mouse_move = false;
      }, Cesium.ScreenSpaceEventType.RIGHT_UP);

      var resizeCanvas = function () {
        if (windycanvas == null) {
          return;
        }
        windycanvas.width = container.offsetWidth;
        windycanvas.height = container.offsetHeight;
        if (self.windy) {
          self.windy._resize(windycanvas.width, windycanvas.height);
        }
      };
      windycanvas = document.createElement("canvas");
      windycanvas.setAttribute("id", "windycanvas");
      windycanvas.style.position = "absolute";
      windycanvas.style["pointer-events"] = "none";
      windycanvas.style["z-index"] = 10;
      windycanvas.style["top"] = 0;
      document.querySelector(".viewer").appendChild(windycanvas);
      resizeCanvas();
      container.onresize = resizeCanvas;
      var params = {
        Cesium: Cesium,
        viewer: viewer,
        canvas: windycanvas,
        canvasWidth: container.offsetWidth,
        canvasHeight: container.offsetHeight,
        speedRate: 3000,
        particlesNumber: Math.min(
          1000,
          Math.floor(res.data[0].data.length / 2)
        ),
        maxAge: 120,
        frameRate: 10,
        color: "#ffffff",
        lineWidth: 1,
      };
      self.windy = new CanvasWindy(res.data, params);
    },
    floorChangeHandler(level) {
      if (this.isGridShow) {
        return this.getDataAtHeight(level).then((res) => {
          if (res.code === 0 && res.data) {
            let arr = [];
            let { sLat, sLng, data, interval } = res.data;
            let step = interval;
            this.coordStep = interval;
            for (let i = 0, len = data.length; i < len; i++) {
              for (let j = 0, length = data[i].length; j < length; j++) {
                let v = data[i][j];
                let billboard = {
                  position: {
                    lng: (sLng + step * j).toFixed(6),
                    lat: (sLat - step * i).toFixed(6),
                    height: level * ratio,
                  },
                  isLabelShow: false,
                  isImageShow: true,
                  id: `grid_${i}_${j}`,
                  rotation: this.factor === "windD" ? (-v / 180) * Math.PI : 0,
                  alignedAxis: {
                    x: 0,
                    y: 0,
                    z: 1,
                  },
                  $value: v.toFixed(1),
                  label: v.toFixed(1),
                };
                if (this.factor === "weather") {
                  billboard.label = weather[v];
                  billboard.image = weather_image[v];
                  billboard.show = true;
                } else if (this.factor === "windD") {
                  billboard.image = windIcon;
                  billboard.show = true;
                } else {
                  billboard.isLabelShow = true;
                }
                arr.push(billboard);
              }
            }
            this.gridList = arr;
          } else {
            this.gridList = [];
          }
        });
      }
      this.ground.height = level;
      return this.getImageAtHeightHelper(level).then((res) => {
        if (res.code === 0) {
          this.ground.image = `${ROOT}${res.data?.img}`;
        }
      });
    },
    legendToggleHandler() {
      this.isLegendShow = !this.isLegendShow;
    },
    allChangeHandler() {
      this.viewer.dataSources.removeAll();
      this.isBoxShow = true;
      if (this.isWindFiled) {
        this.renderWind();
      }
      if (this.factor === "weather") {
        this.isGridShow = true;
      }
      if (this.is3d) {
        if (this.factor === "cloud_height") {
          return this.getBoxImage().then((data) => {
            this.isBoxShow = false;
            const dataSourcePromise = this.Cesium.CzmlDataSource.load(data);
            this.viewer.dataSources.add(dataSourcePromise);
            return;
          });
        }
        return this.getBoxImage().then(() => {
          this.getFloorImages();
        });
      }
      return this.floorChangeHandler(this.ground.height);
    },
    getFloorHeight() {
      if (!this.floorList.length) return;
      let res = this.floorList.reduce(
        (accu, curr) => {
          let [min, max] = curr.split(",");
          min = +min;
          max = +max;
          if (+min >= +max) {
            [min, max] = [max, min];
          }
          if (min != undefined && +min <= accu.min) {
            accu.min = min;
          }
          if (max && +max >= accu.max) {
            accu.max = max;
          }
          return accu;
        },
        { min: 300000, max: 0 }
      );
      this.min_height = res.min;
      this.max_height = res.max;
    },
    getFloorImages() {
      this.getImageAtHeight(this.min_height, "xia");
      this.getImageAtHeight(this.max_height, "shang");
    },
    initBoxAndLabel() {
      let max_lat, max_lng, min_lat, min_lng;
      let min_height = this.min_height,
        max_height = this.max_height;
      if (this.addr) {
        let { elng, elat, slng, slat } = this.addr;
        (max_lng = +elng),
          (min_lng = +slng),
          (max_lat = Math.max(+slat, +elat)),
          (min_lat = Math.min(+slat, +elat));
      } else {
        (max_lng = 136), (min_lng = 73), (max_lat = 54), (min_lat = 3);
      }
      this.labelList = [
        {
          position: { lng: min_lng, lat: min_lat, height: min_height * ratio },
          description: `${min_height}m`,
          id: "label_1",
        },
        {
          position: { lng: min_lng, lat: min_lat, height: max_height * ratio },
          description: `${max_height}m`,
          id: "label_2",
        },
      ];
      this.positionsOutline = [
        { lng: max_lng, lat: max_lat, height: max_height * ratio },
        { lng: max_lng, lat: min_lat, height: max_height * ratio },
        { lng: min_lng, lat: min_lat, height: max_height * ratio },
        { lng: min_lng, lat: max_lat, height: max_height * ratio },
        { lng: max_lng, lat: max_lat, height: max_height * ratio },
      ];
      this.box = {
        shang: {
          hierarchy: [
            { lng: min_lng, lat: max_lat },
            { lng: max_lng, lat: max_lat },
            { lng: max_lng, lat: min_lat },
            { lng: min_lng, lat: min_lat },
          ],
          height: max_height * ratio,
          perPositionHeight: false,
          url: "",
        },
        xia: {
          hierarchy: [
            { lng: min_lng, lat: max_lat },
            { lng: max_lng, lat: max_lat },
            { lng: max_lng, lat: min_lat },
            { lng: min_lng, lat: min_lat },
          ],
          height: min_height * ratio,
          perPositionHeight: false,
          url: "",
        },
        qian: {
          type: "wall",
          hierarchy: [
            { lng: min_lng, lat: min_lat, height: max_height * ratio },
            { lng: max_lng, lat: min_lat, height: max_height * ratio },
          ],
          minimumHeights: [min_height * ratio, min_height * ratio],
          perPositionHeight: true,
          url: "",
        },
        hou: {
          type: "wall",
          hierarchy: [
            { lng: max_lng, lat: max_lat, height: max_height * ratio },
            { lng: min_lng, lat: max_lat, height: max_height * ratio },
          ],
          minimumHeights: [min_height * ratio, min_height * ratio],
          perPositionHeight: true,
          url: "",
        },
        zuo: {
          type: "wall",
          hierarchy: [
            { lng: min_lng, lat: max_lat, height: max_height * ratio },
            { lng: min_lng, lat: min_lat, height: max_height * ratio },
          ],
          minimumHeights: [min_height * ratio, min_height * ratio],
          perPositionHeight: true,
          url: "",
        },
        you: {
          type: "wall",
          hierarchy: [
            { lng: max_lng, lat: min_lat, height: max_height * ratio },
            { lng: max_lng, lat: max_lat, height: max_height * ratio },
          ],
          minimumHeights: [min_height * ratio, min_height * ratio],
          perPositionHeight: true,
          url: "",
        },
      };
    },
    toggle3dHandler(flag) {
      this.is3d = flag;
    },
    sectionReady({ cesiumObject }) {
      this.sectionCesiumObject = cesiumObject;
    },
    changedHandler() {},
    cesiumClickHandler(event) {
      var ellipsoid = this.viewer.scene.globe.ellipsoid;
      var cartesian = this.viewer.camera.pickEllipsoid(
        event.position,
        ellipsoid
      );
      var cartographic = this.Cesium.Cartographic.fromCartesian(cartesian);
      var lon = this.Cesium.Math.toDegrees(cartographic.longitude);
      var lat = this.Cesium.Math.toDegrees(cartographic.latitude);
      lon = lon.toFixed(6);
      lat = lat.toFixed(6);
      if (this.clipping.aLon && this.clipping.aLat) {
        this.clipping.bLon = lon;
        this.clipping.bLat = lat;
      } else {
        this.clipping.aLon = lon;
        this.clipping.aLat = lat;
      }
    },
    getBoxImage() {
      this.loading = true;
      return $api
        .drawRangeRect({
          isModified: this.isModified,
          type: this.factor,
          addrId: this.addrId,
          h1: this.min_height,
          h2: this.max_height,
          dateTime: this.date,
        })
        .then((res) => {
          this.loading = false;
          if (res.code === 0) {
            if (this.factor === "cloud_height") {
              return res.data.data;
            }
            for (const [key, value] of Object.entries(res.data)) {
              this.box[key].url = `${ROOT}${value}`;
            }
          } else {
            ["qian", "hou", "zuo", "you"].forEach((key) => {
              this.box[key].url = "";
            });
          }
        });
    },
    toggleClick() {
      this.canClick = !this.canClick;
    },
    visibleChangeHandler() {
      this.floorList = this.floorList.filter((v) => v !== this.customLevel);
    },
    getImageAtHeight(height, whichOne) {
      this.getImageAtHeightHelper(height).then((res) => {
        if (res.code === 0 && res.data) {
          this.box[whichOne].url = `${ROOT}${res.data.img}`;
          this.box[whichOne].height = +height * ratio;
        }
      });
    },
    getImageAtHeightHelper(height) {
      this.loading = true;
      return $api
        .getImageAtHeight({
          isModified: this.isModified,
          type: this.factor,
          height,
          addrId: this.addrId,
          dateTime: this.date,
        })
        .then((res) => {
          this.loading = false;
          if (!res.data) {
            this.$message({
              type: "warning",
              message: "暂无数据",
            });
          }
          return res;
        });
    },
    getDataAtHeight(height) {
      this.loading = true;
      return $api
        .getDataAtHeight({
          isModified: this.isModified,
          type: this.factor,
          height,
          addrId: this.addrId,
          dateTime: this.date,
        })
        .then((res) => {
          if (!res.data) {
            this.$message({
              type: "warning",
              message: "暂无数据",
            });
          }
          this.loading = false;
          return res;
        });
    },
    produceClickHandler() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let slng, slat, elng, elat;
          if (+this.clipping.aLon <= +this.clipping.bLon) {
            slng = this.clipping.aLon;
            slat = this.clipping.aLat;
            elng = this.clipping.bLon;
            elat = this.clipping.bLat;
          } else {
            slng = this.clipping.bLon;
            slat = this.clipping.bLat;
            elng = this.clipping.aLon;
            elat = this.clipping.aLat;
          }
          this.getSection({ slng, slat, elng, elat });
        }
      });
    },
    getSection({ slng, slat, elng, elat }) {
      this.loading = true;
      return $api
        .getSection({
          isModified: this.isModified,
          type: this.factor,
          slng,
          slat,
          elng,
          elat,
          addrId: this.addrId,
          dateTime: this.date,
        })
        .then((res) => {
          this.loading = false;
          if (res.code !== 0) return;
          if (!res.data) {
            this.$message({
              type: "warning",
              message: "暂无数据",
            });
          }
          let { lng1, lat1, lng2, lat2, section } = res.data;
          this.section.hierarchy = [
            {
              lng: lng1,
              lat: lat1,
              height: max_height * ratio,
            },
            {
              lng: lng2,
              lat: lat2,
              height: max_height * ratio,
            },
          ];
          this.section.minimumHeights = [
            min_height * ratio,
            min_height * ratio,
          ];
          this.section.url = `${ROOT}${section}`;
        });
    },
  },
};
</script>
<style lang="less" scoped>
@cyan: #16d0ff;
@darkcyan: #0b5273;
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.main-title {
  color: @cyan;
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 0 8px fade(@cyan, 50%);
}
.page {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  height: 100%;
}
.viewer-container {
  flex: 1;
  min-width: 0;
}
.forecast-popup {
  position: absolute;
  width: 340px;
  background: rgba(4, 30, 57, 0.9);
  border: 1px solid #16d0ff;
  border-radius: 8px;
  color: #fff;
  z-index: 101;
  overflow: hidden;
  box-shadow: 0 0 15px fade(#16d0ff, 50%);
  pointer-events: auto;
  transform: translate(20px, -50%);
  font-family: "Microsoft YaHei", sans-serif;
  .header {
    display: flex;
    align-items: center;
    background: #0b5273;
    padding: 8px 12px;
    font-size: 16px;
    font-weight: bold;
    color: #16d0ff;
    .close-btn {
      margin-left: auto;
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
      &:hover {
        color: #ff4d4d;
      }
    }
  }
  .timestamp {
    font-size: 12px;
    color: #aaa;
    padding: 8px 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0 12px 12px 12px;
    gap: 10px;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    background: fade(@darkcyan, 60%);
    padding: 6px;
    border-radius: 4px;
    .icon {
      width: 28px;
      height: 28px;
      margin-bottom: 5px;
    }
    .value {
      font-size: 14px;
      font-weight: bold;
      color: @cyan;
    }
    .label {
      font-size: 12px;
      color: #ccc;
      margin-top: 2px;
    }
  }
}
.drone-info-popup {
  position: absolute;
  background: rgba(40, 52, 64, 0.9);
  border: 1px solid #16d0ff;
  border-radius: 6px;
  color: white;
  padding: 8px 12px;
  z-index: 100;
  pointer-events: none; /* 让鼠标可以穿透弹窗，点击后面的地图 */
  box-shadow: 0 0 10px rgba(22, 208, 255, 0.4);
  /* 使用伪元素创建小箭头 */
  &::before {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #16d0ff;
  }
}

.info-header {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.location-name {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
}

.flight-time {
  font-size: 14px;
  color: #16d0ff;
  white-space: nowrap;
}
.drone-position-popup {
  position: absolute;
  transform: translate(-50%, -120%);
  background: rgba(4, 30, 57, 0.85);
  border: 1px solid #16d0ff;
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 0 10px fade(#16d0ff, 40%);
  .location-name {
    font-weight: bold;
    color: #16d0ff;
  }
  .flight-time {
    font-size: 12px;
    color: #ccc;
  }
}
.weather-station-popup {
  position: absolute;
  width: 380px;
  background: rgba(4, 30, 57, 0.9);
  border: 1px solid #16d0ff;
  border-radius: 8px;
  color: #fff;
  z-index: 101;
  overflow: hidden;
  box-shadow: 0 0 15px fade(#16d0ff, 50%);
  pointer-events: auto;
  transform: translate(20px, -50%);
  font-family: "Microsoft YaHei", sans-serif;
  .header {
    display: flex;
    align-items: center;
    background: #0b5273;
    padding: 8px 12px;
    font-size: 16px;
    font-weight: bold;
    color: #16d0ff;
    .icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      object-fit: cover;
      object-position: top;
      margin-right: 10px;
    }
    .close-btn {
      margin-left: auto;
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
      &:hover {
        color: #ff4d4d;
      }
    }
  }
  .timestamp {
    font-size: 12px;
    color: #aaa;
    padding: 8px 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0 12px 12px 12px;
    gap: 10px;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    .icon {
      width: 28px;
      height: 28px;
      margin-bottom: 5px;
    }
    .value {
      font-size: 12px;
      font-weight: bold;
    }
    .label {
      font-size: 10px;
      color: #ccc;
      margin-top: 2px;
    }
  }
}
.viewer {
  width: 100%;
  height: 100%;
  position: relative;
  .drone-live-view-popup {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 280px;
    background: rgba(4, 30, 57, 0.9);
    border: 1px solid #16d0ff;
    border-radius: 8px;
    z-index: 101;
    box-shadow: 0 0 15px fade(#16d0ff, 50%);
    color: white;
    pointer-events: auto;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0b5273;
      padding: 8px 12px;
      font-size: 16px;
      font-weight: bold;
    }
    .close-btn {
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
      padding: 0 5px;
      &:hover {
        color: #ff4d4d;
      }
    }
    .content {
      position: relative;
      img {
        width: 100%;
        height: auto;
        display: block;
        border-bottom-left-radius: 7px;
        border-bottom-right-radius: 7px;
      }
      .location-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  }
  .tool {
    left: auto;
  }
  .flight-controls {
    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(4, 30, 57, 0.8);
      border: 1px solid @cyan;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 0 10px fade(@cyan, 40%);
      transition: all 0.3s;
      &:hover {
        background: fade(@darkcyan, 80%);
      }
      .icon {
        width: 20px;
        height: 20px;
      }
    }
  }
  .drone-info-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(60px, -160px);
    width: 340px;
    background: rgba(4, 30, 57, 0.85);
    border: 1px solid @cyan;
    border-radius: 8px;
    color: #fff;
    z-index: 100;
    padding: 12px;
    font-family: "Microsoft YaHei", sans-serif;
    box-shadow: 0 0 15px fade(@cyan, 40%);
    pointer-events: none;
    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid @darkcyan;
      margin-bottom: 10px;
      span:first-child {
        font-weight: bold;
        color: @cyan;
      }
      .time {
        font-size: 12px;
        color: #ccc;
      }
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .info-item {
      display: flex;
      align-items: center;
      background: fade(@darkcyan, 60%);
      padding: 6px;
      border-radius: 4px;
      font-size: 14px;
      i {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        &.icon-temp {
          background-color: #ff5722;
        }
        &.icon-pressure {
          background-color: #2196f3;
        }
        &.icon-precip {
          background-color: #4caf50;
        }
        &.icon-wind {
          background-color: #9c27b0;
        }
        &.icon-vis {
          background-color: #ffeb3b;
        }
        &.icon-humidity {
          background-color: #00bcd4;
        }
      }
    }
  }
}
.btn {
  cursor: pointer;
  min-width: 100px;
  max-width: 180px;
  padding: 0 10px;
  white-space: nowrap;
  line-height: 28px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  background: #0086d1;
  &:not(:first-child) {
    margin-left: 10px;
  }
  &.mini {
    min-width: 50px;
  }
  &.red {
    background: #c1272d;
  }
  &.green {
    background: #39b54a;
  }
  &.cyan {
    background: @cyan;
  }
}
.btns {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
/deep/.el-dialog {
  background: #041e39;
  &__body {
    padding-top: 0;
  }
  .custom-header {
    width: 100%;
    background: none;
  }
  .wrapper {
    .subtitle {
      font-size: 20px;
      color: #fff;
      margin-bottom: 29px;
      padding-left: 10px;
      position: relative;
      display: flex;
      align-items: center;
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: @cyan;
      }
      .el-switch {
        margin-left: auto;
      }
    }
    .el-switch__label {
      color: #fff;
      &.is-active {
        color: #409eff;
      }
    }
    .card {
      .name {
        margin: 10px 0;
        font-size: 18px;
        color: @cyan;
      }
      .el-checkbox {
        width: 120px;
        &__label {
          color: #fff !important;
        }
      }
      .el-input {
        width: 300px;
      }
    }
    .el-descriptions__body,
    .el-table__expanded-cell {
      background: transparent;
    }
    .el-table__expanded-cell {
      padding-left: 15px;
    }
    .el-table__expand-icon,
    .el-descriptions {
      color: #fff;
    }
    .el-table {
      background: transparent;
      .btns {
        padding: 0;
      }
      &__row,
      th.el-table__cell,
      tr {
        background: transparent;
      }
      thead {
        color: @cyan;
      }
      tbody {
        color: #fff;
        tr:hover > td {
          background: transparent;
        }
      }
    }
    .tip {
      margin-bottom: 15px;
    }
    .search-form {
      width: 36%;
    }
    .wrapper-search {
      display: flex;
      align-items: flex-start;
      .el-table {
        margin-left: 20px;
        flex: 1;
      }
    }
    .form {
      .el-form-item {
        display: inline-flex;
        width: 300px;
        input::placeholder {
          color: rgb(135, 125, 125);
        }
      }
    }
  }
}
.custom-header {
  &.big {
    width: 380px;
  }
  width: 340px;
  background: fade(#040f26, 70);
  border-radius: 10px;
  padding: 0 20px;
  &:not(:first-child) {
    margin-left: 20px;
  }
  .header {
    line-height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @cyan;
    font-size: 18px;
    font-weight: normal;
    .img {
      width: 16px;
      transition: all 0.3s;
      cursor: pointer;
      &.on {
        transform: rotate(180deg);
      }
    }
  }
  .content {
    border-top: 1px solid @cyan;
    .line {
      padding: 20px 0;
      display: flex;
      align-items: center;
      .all-edit {
        font-size: 14px;
        margin-left: auto;
        margin-right: 5px;
        flex-shrink: 0;
        color: #fff;
      }
      .el-input {
        width: 80px;
        /deep/.el-input__inner {
          height: 30px;
          line-height: 30px;
        }
      }
      .el-select {
        /deep/.el-input__inner {
          background-color: #052a49;
          border: none;
          border-radius: 17px;
          color: @cyan;
        }
      }
      .name {
        flex-shrink: 0;
        line-height: 24px;
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        margin-right: 10px;
      }
      .tab {
        flex: 1;
        display: flex;
        align-items: center;
        height: 34px;
        background: #052a49;
        border-radius: 17px;
        font-size: 16px;
        .item {
          cursor: pointer;
          height: 100%;
          line-height: 34px;
          flex: 1;
          text-align: center;
          color: #0079a7;
          transition: all 0.3s;
          &.on {
            color: #fff;
            background: url("../assets/bg-active-btn.png") left bottom no-repeat;
            background-size: 100% auto;
          }
        }
      }
    }
    .edit-list {
      border-top: 1px solid #005e85;
      border-bottom: 1px solid #005e85;
      padding: 20px 0;
      height: 20vh;
      overflow: auto;
      li {
        &:not(:first-child) {
          margin-top: 8px;
        }
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #b3b3b3;
        .el-input {
          width: 80px;
          /deep/ .el-input__inner {
            height: 30px;
            line-height: 30px;
          }
        }
      }
    }
  }
}
.span {
  margin: 0 8px;
}
.editing {
  font-size: 13px;
  margin-top: 6px;
  max-height: 30vh;
  overflow: auto;
  li {
    margin-top: 6px;
  }
  /deep/ .el-input {
    margin-left: 10px;
    width: 90px;
    &__inner {
      padding: 0 10px;
    }
  }
}
/deep/ .el-checkbox,
.el-radio {
  color: @cyan;
  width: 99px;
  margin-right: 0px;
  margin-top: 16px;
  &:nth-child(3n) {
    width: 54px;
  }
  &__label {
    color: @cyan !important;
    font-size: 16px;
    padding-left: 6px;
  }
  &__inner {
    border-color: @cyan;
    background: transparent;
  }
  &__input.is-checked .el-checkbox__inner {
    border-color: @cyan;
    background-color: @cyan;
  }
}
/deep/ .custom-ele {
  width: 100px;
  &.full {
    margin-top: 16px;
    width: 100%;
  }
  &.fixed-width {
    width: 400px;
  }
  .el-input__inner {
    background: transparent;
    border-color: @darkcyan;
    color: @cyan;
    font-size: 16px;
  }
}
/deep/ .el-form-item {
  margin-bottom: 8px;
  .el-form-item:first-of-type {
    margin-right: 10px;
  }
  &__label {
    color: @cyan;
    white-space: nowrap;
  }
  &__content {
    display: flex;
    align-items: center;
    .el-input {
      &:not(:first-child) {
        margin-left: 10px;
      }
      &__inner {
        color: @cyan;
        background: transparent;
        border-color: @darkcyan;
      }
    }
  }
}
.page {
  display: flex;
  align-items: center;
  height: 100%;
  .panel {
    width: 312px;
    height: 100%;
    background: fade(#009fe8, 10);
    padding: 30px;
    .tab {
      display: flex;
      align-items: center;
      padding-bottom: 30px;
      border-bottom: 1px solid #009fe8;
      .item {
        cursor: pointer;
        flex: 1;
        font-size: 18px;
        color: #0d6c91;
        background: #052a49;
        transition: all 0.3s;
        text-align: center;
        line-height: 30px;
        border-radius: 6px;
        &.active {
          background: @cyan;
          color: #040f26;
        }
        &:not(:first-child) {
          margin-left: 11px;
        }
      }
    }
    .card {
      margin-bottom: 25px;
      &:first-of-type {
        margin-top: 26px;
      }
      .name {
        font-size: 18px;
        line-height: 1.2;
        color: #fff;
      }
    }
    .btn {
      cursor: pointer;
      width: 100%;
      background: none;
      line-height: 30px;
      text-align: center;
      color: @cyan;
      font-size: 16px;
      border: 1px solid @cyan;
      border-radius: 6px;
      &:not(:first-child) {
        margin-left: 10px;
      }
    }
    .el-form {
      margin-top: 15px;
      .btn {
        color: @darkcyan;
        border-color: @darkcyan;
        &.active {
          color: @cyan;
          border-color: @cyan;
        }
      }
    }
  }
  .checkbox-line {
    margin-top: 8px;
    width: 100%;
    display: flex;
    align-items: center;
    /deep/ .el-checkbox__label {
      flex: 1;
    }
    .floor {
      border: 1px solid @darkcyan;
      border-radius: 6px;
      padding: 0 12px;
      width: 100%;
      line-height: 30px;
      display: inline-flex;
      color: @cyan;
      font-size: 16px;
      span {
        line-height: inherit;
      }
      .remark {
        vertical-align: baseline;
        font-size: 14px;
        color: @darkcyan;
      }
    }
  }
  .factor-list {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    .item {
      cursor: pointer;
      width: 121px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      color: #0d6c91;
      background: #052a49;
      transition: all 0.3s;
      border-radius: 6px;
      &:nth-child(even) {
        margin-left: 10px;
      }
      &:nth-child(n + 3) {
        margin-top: 12px;
      }
      &.active {
        background: #16d0ff;
        color: #040f26;
      }
    }
  }
  .viewer-container {
    margin-left: 34px;
    .viewer-top {
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      .btn {
        display: inline-block;
      }
      .doc {
        color: #fff;
        margin-left: 20px;
      }
      .upload-demo {
        margin-left: 20px;
        display: inline-flex;
        align-items: center;
        /deep/ .el-upload-dragger {
          width: auto;
          height: auto;
        }
      }
    }
  }
  .viewer {
    width: 1476px;
    height: 852px;
    position: relative;
    .legend {
      position: absolute;
      left: 20px;
      bottom: 20px;
      z-index: 9999;
      color: #fff;
      span {
        cursor: pointer;
      }
      .list {
        margin-left: 10px;
        display: inline-flex;
        align-items: center;
        .item {
          width: 40px;
          height: 5px;
          flex-shrink: 0;
          position: relative;
          &::before {
            content: attr(data-min);
            font-size: 12px;
            transform: scale(0.9) translateX(-50%);
            position: absolute;
            left: 0;
            top: 100%;
            color: #fff;
          }
        }
        li:last-of-type::after {
          content: attr(data-max);
          font-size: 12px;
          transform: scale(0.9) translateX(-80%);
          position: absolute;
          left: 100%;
          top: 100%;
          color: #fff;
        }
        .unit {
          margin: 0 5px;
          font-size: 14px;
        }
      }
    }
    .tool {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 99;
      display: flex;
      align-items: flex-start;
      &.row {
        flex-direction: column;
        .custom-header:not(:first-child) {
          margin-left: 0;
          margin-top: 20px;
        }
      }
    }
  }
}
</style>