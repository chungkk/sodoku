"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_chungkk_Desktop_GG_Driver_code_sudoku_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/chungkk/Desktop/GG Driver/code/sudoku/src/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_chungkk_Desktop_GG_Driver_code_sudoku_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmNodW5na2slMkZEZXNrdG9wJTJGR0clMjBEcml2ZXIlMkZjb2RlJTJGc3Vkb2t1JTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmNodW5na2slMkZEZXNrdG9wJTJGR0clMjBEcml2ZXIlMkZjb2RlJTJGc3Vkb2t1JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNvQztBQUNqSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3N1ZG9rdS1nYW1lLz9kMDkxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9jaHVuZ2trL0Rlc2t0b3AvR0cgRHJpdmVyL2NvZGUvc3Vkb2t1L3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvY2h1bmdray9EZXNrdG9wL0dHIERyaXZlci9jb2RlL3N1ZG9rdS9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth_options__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth-options */ \"(rsc)/./src/lib/auth-options.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth_options__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFDZ0I7QUFFakQsTUFBTUUsVUFBVUYsZ0RBQVFBLENBQUNDLDBEQUFXQTtBQUVPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3Vkb2t1LWdhbWUvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/MDA5OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aC1vcHRpb25zXCI7XG5cbmNvbnN0IGhhbmRsZXIgPSBOZXh0QXV0aChhdXRoT3B0aW9ucyk7XG5cbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsImF1dGhPcHRpb25zIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth-options.ts":
/*!*********************************!*\
  !*** ./src/lib/auth-options.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/mongodb */ \"(rsc)/./src/lib/mongodb.ts\");\n/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/models/User */ \"(rsc)/./src/models/User.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Email and password are required\");\n                }\n                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n                const user = await _models_User__WEBPACK_IMPORTED_MODULE_2__[\"default\"].findOne({\n                    email: credentials.email.toLowerCase()\n                });\n                if (!user) {\n                    throw new Error(\"Invalid email or password\");\n                }\n                const isValid = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_3__.verifyPassword)(credentials.password, user.passwordHash);\n                if (!isValid) {\n                    throw new Error(\"Invalid email or password\");\n                }\n                return {\n                    id: user._id.toString(),\n                    email: user.email,\n                    name: user.displayName\n                };\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.email = user.email;\n                token.name = user.name;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            session.user = {\n                id: token.id,\n                email: token.email,\n                name: token.name\n            };\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgtb3B0aW9ucy50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNrRTtBQUM1QjtBQUNMO0FBQ1c7QUEwQnJDLE1BQU1JLGNBQTJCO0lBQ3RDQyxXQUFXO1FBQ1RMLDJFQUFtQkEsQ0FBQztZQUNsQk0sTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFRO2dCQUN2Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBWUMsTUFBTTtnQkFBVztZQUNsRDtZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUNqRCxNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1aLHdEQUFTQTtnQkFFZixNQUFNYSxPQUFPLE1BQU1aLG9EQUFJQSxDQUFDYSxPQUFPLENBQUM7b0JBQUVQLE9BQU9ELFlBQVlDLEtBQUssQ0FBQ1EsV0FBVztnQkFBRztnQkFDekUsSUFBSSxDQUFDRixNQUFNO29CQUNULE1BQU0sSUFBSUQsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUksVUFBVSxNQUFNZCx5REFBY0EsQ0FBQ0ksWUFBWUksUUFBUSxFQUFFRyxLQUFLSSxZQUFZO2dCQUM1RSxJQUFJLENBQUNELFNBQVM7b0JBQ1osTUFBTSxJQUFJSixNQUFNO2dCQUNsQjtnQkFFQSxPQUFPO29CQUNMTSxJQUFJTCxLQUFLTSxHQUFHLENBQUNDLFFBQVE7b0JBQ3JCYixPQUFPTSxLQUFLTixLQUFLO29CQUNqQkYsTUFBTVEsS0FBS1EsV0FBVztnQkFDeEI7WUFDRjtRQUNGO0tBQ0Q7SUFDREMsU0FBUztRQUNQQyxVQUFVO1FBQ1ZDLFFBQVEsS0FBSyxLQUFLLEtBQUs7SUFDekI7SUFDQUMsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFZCxJQUFJLEVBQUU7WUFDdkIsSUFBSUEsTUFBTTtnQkFDUmMsTUFBTVQsRUFBRSxHQUFHTCxLQUFLSyxFQUFFO2dCQUNsQlMsTUFBTXBCLEtBQUssR0FBR00sS0FBS04sS0FBSztnQkFDeEJvQixNQUFNdEIsSUFBSSxHQUFHUSxLQUFLUixJQUFJO1lBQ3hCO1lBQ0EsT0FBT3NCO1FBQ1Q7UUFDQSxNQUFNTCxTQUFRLEVBQUVBLE9BQU8sRUFBRUssS0FBSyxFQUFFO1lBQzlCTCxRQUFRVCxJQUFJLEdBQUc7Z0JBQ2JLLElBQUlTLE1BQU1ULEVBQUU7Z0JBQ1pYLE9BQU9vQixNQUFNcEIsS0FBSztnQkFDbEJGLE1BQU1zQixNQUFNdEIsSUFBSTtZQUNsQjtZQUNBLE9BQU9pQjtRQUNUO0lBQ0Y7SUFDQU0sT0FBTztRQUNMQyxRQUFRO1FBQ1JDLE9BQU87SUFDVDtJQUNBQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7QUFDckMsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL3N1ZG9rdS1nYW1lLy4vc3JjL2xpYi9hdXRoLW9wdGlvbnMudHM/Y2MwMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdXRoT3B0aW9ucywgVXNlciBhcyBOZXh0QXV0aFVzZXIgfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xuaW1wb3J0IGNvbm5lY3REQiBmcm9tIFwiQC9saWIvbW9uZ29kYlwiO1xuaW1wb3J0IFVzZXIgZnJvbSBcIkAvbW9kZWxzL1VzZXJcIjtcbmltcG9ydCB7IHZlcmlmeVBhc3N3b3JkIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcblxuZGVjbGFyZSBtb2R1bGUgXCJuZXh0LWF1dGhcIiB7XG4gIGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICB1c2VyOiB7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAgZW1haWw6IHN0cmluZztcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICB9O1xuICB9XG5cbiAgaW50ZXJmYWNlIFVzZXIge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgXCJuZXh0LWF1dGgvand0XCIge1xuICBpbnRlcmZhY2UgSldUIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGVtYWlsOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogQXV0aE9wdGlvbnMgPSB7XG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogXCJjcmVkZW50aWFsc1wiLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscyk6IFByb21pc2U8TmV4dEF1dGhVc2VyIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW1haWwgYW5kIHBhc3N3b3JkIGFyZSByZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGNvbm5lY3REQigpO1xuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwudG9Mb3dlckNhc2UoKSB9KTtcbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBlbWFpbCBvciBwYXNzd29yZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCB2ZXJpZnlQYXNzd29yZChjcmVkZW50aWFscy5wYXNzd29yZCwgdXNlci5wYXNzd29yZEhhc2gpO1xuICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5faWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLmRpc3BsYXlOYW1lLFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcbiAgICAgICAgdG9rZW4uZW1haWwgPSB1c2VyLmVtYWlsO1xuICAgICAgICB0b2tlbi5uYW1lID0gdXNlci5uYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIHNlc3Npb24udXNlciA9IHtcbiAgICAgICAgaWQ6IHRva2VuLmlkLFxuICAgICAgICBlbWFpbDogdG9rZW4uZW1haWwsXG4gICAgICAgIG5hbWU6IHRva2VuLm5hbWUsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2xvZ2luXCIsXG4gICAgZXJyb3I6IFwiL2xvZ2luXCIsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxufTtcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiY29ubmVjdERCIiwiVXNlciIsInZlcmlmeVBhc3N3b3JkIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZE9uZSIsInRvTG93ZXJDYXNlIiwiaXNWYWxpZCIsInBhc3N3b3JkSGFzaCIsImlkIiwiX2lkIiwidG9TdHJpbmciLCJkaXNwbGF5TmFtZSIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth-options.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createGuestSession: () => (/* binding */ createGuestSession),\n/* harmony export */   createUserSession: () => (/* binding */ createUserSession),\n/* harmony export */   generateSessionToken: () => (/* binding */ generateSessionToken),\n/* harmony export */   generateVisitorId: () => (/* binding */ generateVisitorId),\n/* harmony export */   hashPassword: () => (/* binding */ hashPassword),\n/* harmony export */   isValidDisplayName: () => (/* binding */ isValidDisplayName),\n/* harmony export */   isValidEmail: () => (/* binding */ isValidEmail),\n/* harmony export */   isValidPassword: () => (/* binding */ isValidPassword),\n/* harmony export */   verifyPassword: () => (/* binding */ verifyPassword)\n/* harmony export */ });\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ \"(rsc)/./node_modules/uuid/dist-node/v4.js\");\n\n\nconst SALT_ROUNDS = 12;\nasync function hashPassword(password) {\n    return (0,bcryptjs__WEBPACK_IMPORTED_MODULE_0__.hash)(password, SALT_ROUNDS);\n}\nasync function verifyPassword(password, hashedPassword) {\n    return (0,bcryptjs__WEBPACK_IMPORTED_MODULE_0__.compare)(password, hashedPassword);\n}\nfunction generateVisitorId() {\n    return `guest_${(0,uuid__WEBPACK_IMPORTED_MODULE_1__[\"default\"])().substring(0, 8)}`;\n}\nfunction generateSessionToken() {\n    return (0,uuid__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n}\nfunction isValidEmail(email) {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(email);\n}\nfunction isValidDisplayName(name) {\n    if (name.length < 2 || name.length > 20) return false;\n    const nameRegex = /^[a-zA-Z0-9\\s]+$/;\n    return nameRegex.test(name);\n}\nfunction isValidPassword(password) {\n    return password.length >= 6;\n}\nfunction createGuestSession(name) {\n    return {\n        visitorId: generateVisitorId(),\n        name,\n        isGuest: true\n    };\n}\nfunction createUserSession(oderId, email, displayName) {\n    return {\n        visitorId: `user_${oderId}`,\n        oderId,\n        name: displayName,\n        email,\n        isGuest: false\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBeUM7QUFDTDtBQUVwQyxNQUFNSSxjQUFjO0FBRWIsZUFBZUMsYUFBYUMsUUFBZ0I7SUFDakQsT0FBT0wsOENBQUlBLENBQUNLLFVBQVVGO0FBQ3hCO0FBRU8sZUFBZUcsZUFDcEJELFFBQWdCLEVBQ2hCRSxjQUFzQjtJQUV0QixPQUFPUixpREFBT0EsQ0FBQ00sVUFBVUU7QUFDM0I7QUFFTyxTQUFTQztJQUNkLE9BQU8sQ0FBQyxNQUFNLEVBQUVOLGdEQUFNQSxHQUFHTyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDNUM7QUFFTyxTQUFTQztJQUNkLE9BQU9SLGdEQUFNQTtBQUNmO0FBRU8sU0FBU1MsYUFBYUMsS0FBYTtJQUN4QyxNQUFNQyxhQUFhO0lBQ25CLE9BQU9BLFdBQVdDLElBQUksQ0FBQ0Y7QUFDekI7QUFFTyxTQUFTRyxtQkFBbUJDLElBQVk7SUFDN0MsSUFBSUEsS0FBS0MsTUFBTSxHQUFHLEtBQUtELEtBQUtDLE1BQU0sR0FBRyxJQUFJLE9BQU87SUFDaEQsTUFBTUMsWUFBWTtJQUNsQixPQUFPQSxVQUFVSixJQUFJLENBQUNFO0FBQ3hCO0FBRU8sU0FBU0csZ0JBQWdCZCxRQUFnQjtJQUM5QyxPQUFPQSxTQUFTWSxNQUFNLElBQUk7QUFDNUI7QUFVTyxTQUFTRyxtQkFBbUJKLElBQVk7SUFDN0MsT0FBTztRQUNMSyxXQUFXYjtRQUNYUTtRQUNBTSxTQUFTO0lBQ1g7QUFDRjtBQUVPLFNBQVNDLGtCQUNkQyxNQUFjLEVBQ2RaLEtBQWEsRUFDYmEsV0FBbUI7SUFFbkIsT0FBTztRQUNMSixXQUFXLENBQUMsS0FBSyxFQUFFRyxPQUFPLENBQUM7UUFDM0JBO1FBQ0FSLE1BQU1TO1FBQ05iO1FBQ0FVLFNBQVM7SUFDWDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3Vkb2t1LWdhbWUvLi9zcmMvbGliL2F1dGgudHM/NjY5MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21wYXJlLCBoYXNoIH0gZnJvbSBcImJjcnlwdGpzXCI7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tIFwidXVpZFwiO1xuXG5jb25zdCBTQUxUX1JPVU5EUyA9IDEyO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gaGFzaChwYXNzd29yZCwgU0FMVF9ST1VORFMpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQoXG4gIHBhc3N3b3JkOiBzdHJpbmcsXG4gIGhhc2hlZFBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gY29tcGFyZShwYXNzd29yZCwgaGFzaGVkUGFzc3dvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVWaXNpdG9ySWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBndWVzdF8ke3V1aWR2NCgpLnN1YnN0cmluZygwLCA4KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKTogc3RyaW5nIHtcbiAgcmV0dXJuIHV1aWR2NCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEVtYWlsKGVtYWlsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xuICByZXR1cm4gZW1haWxSZWdleC50ZXN0KGVtYWlsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWREaXNwbGF5TmFtZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKG5hbWUubGVuZ3RoIDwgMiB8fCBuYW1lLmxlbmd0aCA+IDIwKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG5hbWVSZWdleCA9IC9eW2EtekEtWjAtOVxcc10rJC87XG4gIHJldHVybiBuYW1lUmVnZXgudGVzdChuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRQYXNzd29yZChwYXNzd29yZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXNzd29yZC5sZW5ndGggPj0gNjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbGF5ZXJTZXNzaW9uIHtcbiAgdmlzaXRvcklkOiBzdHJpbmc7XG4gIG9kZXJJZD86IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBlbWFpbD86IHN0cmluZztcbiAgaXNHdWVzdDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUd1ZXN0U2Vzc2lvbihuYW1lOiBzdHJpbmcpOiBQbGF5ZXJTZXNzaW9uIHtcbiAgcmV0dXJuIHtcbiAgICB2aXNpdG9ySWQ6IGdlbmVyYXRlVmlzaXRvcklkKCksXG4gICAgbmFtZSxcbiAgICBpc0d1ZXN0OiB0cnVlLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXNlclNlc3Npb24oXG4gIG9kZXJJZDogc3RyaW5nLFxuICBlbWFpbDogc3RyaW5nLFxuICBkaXNwbGF5TmFtZTogc3RyaW5nXG4pOiBQbGF5ZXJTZXNzaW9uIHtcbiAgcmV0dXJuIHtcbiAgICB2aXNpdG9ySWQ6IGB1c2VyXyR7b2RlcklkfWAsXG4gICAgb2RlcklkLFxuICAgIG5hbWU6IGRpc3BsYXlOYW1lLFxuICAgIGVtYWlsLFxuICAgIGlzR3Vlc3Q6IGZhbHNlLFxuICB9O1xufVxuIl0sIm5hbWVzIjpbImNvbXBhcmUiLCJoYXNoIiwidjQiLCJ1dWlkdjQiLCJTQUxUX1JPVU5EUyIsImhhc2hQYXNzd29yZCIsInBhc3N3b3JkIiwidmVyaWZ5UGFzc3dvcmQiLCJoYXNoZWRQYXNzd29yZCIsImdlbmVyYXRlVmlzaXRvcklkIiwic3Vic3RyaW5nIiwiZ2VuZXJhdGVTZXNzaW9uVG9rZW4iLCJpc1ZhbGlkRW1haWwiLCJlbWFpbCIsImVtYWlsUmVnZXgiLCJ0ZXN0IiwiaXNWYWxpZERpc3BsYXlOYW1lIiwibmFtZSIsImxlbmd0aCIsIm5hbWVSZWdleCIsImlzVmFsaWRQYXNzd29yZCIsImNyZWF0ZUd1ZXN0U2Vzc2lvbiIsInZpc2l0b3JJZCIsImlzR3Vlc3QiLCJjcmVhdGVVc2VyU2Vzc2lvbiIsIm9kZXJJZCIsImRpc3BsYXlOYW1lIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/mongodb.ts":
/*!****************************!*\
  !*** ./src/lib/mongodb.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI || \"mongodb://localhost:27017/sudoku\";\nif (!MONGODB_URI) {\n    throw new Error(\"Please define the MONGODB_URI environment variable\");\n}\nconst cached = global.mongoose || {\n    conn: null,\n    promise: null\n};\nif (!global.mongoose) {\n    global.mongoose = cached;\n}\nasync function connectDB() {\n    if (cached.conn) {\n        return cached.conn;\n    }\n    if (!cached.promise) {\n        const opts = {\n            bufferCommands: false\n        };\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, opts).then((mongoose)=>{\n            console.log(\"MongoDB connected successfully\");\n            return mongoose;\n        });\n    }\n    try {\n        cached.conn = await cached.promise;\n    } catch (e) {\n        cached.promise = null;\n        throw e;\n    }\n    return cached.conn;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (connectDB);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL21vbmdvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdDO0FBRWhDLE1BQU1DLGNBQWNDLFFBQVFDLEdBQUcsQ0FBQ0YsV0FBVyxJQUFJO0FBRS9DLElBQUksQ0FBQ0EsYUFBYTtJQUNoQixNQUFNLElBQUlHLE1BQU07QUFDbEI7QUFZQSxNQUFNQyxTQUF3QkMsT0FBT04sUUFBUSxJQUFJO0lBQUVPLE1BQU07SUFBTUMsU0FBUztBQUFLO0FBRTdFLElBQUksQ0FBQ0YsT0FBT04sUUFBUSxFQUFFO0lBQ3BCTSxPQUFPTixRQUFRLEdBQUdLO0FBQ3BCO0FBRUEsZUFBZUk7SUFDYixJQUFJSixPQUFPRSxJQUFJLEVBQUU7UUFDZixPQUFPRixPQUFPRSxJQUFJO0lBQ3BCO0lBRUEsSUFBSSxDQUFDRixPQUFPRyxPQUFPLEVBQUU7UUFDbkIsTUFBTUUsT0FBTztZQUNYQyxnQkFBZ0I7UUFDbEI7UUFFQU4sT0FBT0csT0FBTyxHQUFHUix1REFBZ0IsQ0FBQ0MsYUFBYVMsTUFBTUcsSUFBSSxDQUFDLENBQUNiO1lBQ3pEYyxRQUFRQyxHQUFHLENBQUM7WUFDWixPQUFPZjtRQUNUO0lBQ0Y7SUFFQSxJQUFJO1FBQ0ZLLE9BQU9FLElBQUksR0FBRyxNQUFNRixPQUFPRyxPQUFPO0lBQ3BDLEVBQUUsT0FBT1EsR0FBRztRQUNWWCxPQUFPRyxPQUFPLEdBQUc7UUFDakIsTUFBTVE7SUFDUjtJQUVBLE9BQU9YLE9BQU9FLElBQUk7QUFDcEI7QUFFQSxpRUFBZUUsU0FBU0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N1ZG9rdS1nYW1lLy4vc3JjL2xpYi9tb25nb2RiLnRzPzUzYzIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbmdvb3NlIGZyb20gXCJtb25nb29zZVwiO1xuXG5jb25zdCBNT05HT0RCX1VSSSA9IHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJIHx8IFwibW9uZ29kYjovL2xvY2FsaG9zdDoyNzAxNy9zdWRva3VcIjtcblxuaWYgKCFNT05HT0RCX1VSSSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZGVmaW5lIHRoZSBNT05HT0RCX1VSSSBlbnZpcm9ubWVudCB2YXJpYWJsZVwiKTtcbn1cblxuaW50ZXJmYWNlIE1vbmdvb3NlQ2FjaGUge1xuICBjb25uOiB0eXBlb2YgbW9uZ29vc2UgfCBudWxsO1xuICBwcm9taXNlOiBQcm9taXNlPHR5cGVvZiBtb25nb29zZT4gfCBudWxsO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcbiAgdmFyIG1vbmdvb3NlOiBNb25nb29zZUNhY2hlIHwgdW5kZWZpbmVkO1xufVxuXG5jb25zdCBjYWNoZWQ6IE1vbmdvb3NlQ2FjaGUgPSBnbG9iYWwubW9uZ29vc2UgfHwgeyBjb25uOiBudWxsLCBwcm9taXNlOiBudWxsIH07XG5cbmlmICghZ2xvYmFsLm1vbmdvb3NlKSB7XG4gIGdsb2JhbC5tb25nb29zZSA9IGNhY2hlZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29ubmVjdERCKCk6IFByb21pc2U8dHlwZW9mIG1vbmdvb3NlPiB7XG4gIGlmIChjYWNoZWQuY29ubikge1xuICAgIHJldHVybiBjYWNoZWQuY29ubjtcbiAgfVxuXG4gIGlmICghY2FjaGVkLnByb21pc2UpIHtcbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYnVmZmVyQ29tbWFuZHM6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjYWNoZWQucHJvbWlzZSA9IG1vbmdvb3NlLmNvbm5lY3QoTU9OR09EQl9VUkksIG9wdHMpLnRoZW4oKG1vbmdvb3NlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIk1vbmdvREIgY29ubmVjdGVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgIHJldHVybiBtb25nb29zZTtcbiAgICB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY2FjaGVkLmNvbm4gPSBhd2FpdCBjYWNoZWQucHJvbWlzZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZC5wcm9taXNlID0gbnVsbDtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgcmV0dXJuIGNhY2hlZC5jb25uO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25uZWN0REI7XG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJNT05HT0RCX1VSSSIsInByb2Nlc3MiLCJlbnYiLCJFcnJvciIsImNhY2hlZCIsImdsb2JhbCIsImNvbm4iLCJwcm9taXNlIiwiY29ubmVjdERCIiwib3B0cyIsImJ1ZmZlckNvbW1hbmRzIiwiY29ubmVjdCIsInRoZW4iLCJjb25zb2xlIiwibG9nIiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/mongodb.ts\n");

/***/ }),

/***/ "(rsc)/./src/models/User.ts":
/*!****************************!*\
  !*** ./src/models/User.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst GameRecordSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({\n    date: {\n        type: Date,\n        default: Date.now\n    },\n    mode: {\n        type: String,\n        enum: [\n            \"practice\",\n            \"solo\"\n        ],\n        required: true\n    },\n    difficulty: {\n        type: String,\n        enum: [\n            \"easy\",\n            \"medium\",\n            \"hard\"\n        ],\n        required: true\n    },\n    time: {\n        type: Number,\n        required: true\n    },\n    errors: {\n        type: Number,\n        default: 0\n    },\n    result: {\n        type: String,\n        enum: [\n            \"completed\",\n            \"abandoned\",\n            \"won\",\n            \"lost\"\n        ],\n        required: true\n    },\n    roomCode: {\n        type: String\n    }\n}, {\n    _id: false\n});\nconst UserSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({\n    email: {\n        type: String,\n        required: true,\n        unique: true,\n        lowercase: true,\n        trim: true,\n        match: [\n            /^\\S+@\\S+\\.\\S+$/,\n            \"Please enter a valid email\"\n        ]\n    },\n    passwordHash: {\n        type: String,\n        required: true,\n        minlength: 60\n    },\n    displayName: {\n        type: String,\n        required: true,\n        trim: true,\n        minlength: 2,\n        maxlength: 20\n    },\n    gameHistory: {\n        type: [\n            GameRecordSchema\n        ],\n        default: [],\n        validate: {\n            validator: function(v) {\n                return v.length <= 50;\n            },\n            message: \"Game history cannot exceed 50 records\"\n        }\n    },\n    stats: {\n        totalGames: {\n            type: Number,\n            default: 0\n        },\n        wins: {\n            type: Number,\n            default: 0\n        },\n        bestTime: {\n            easy: {\n                type: Number,\n                default: null\n            },\n            medium: {\n                type: Number,\n                default: null\n            },\n            hard: {\n                type: Number,\n                default: null\n            }\n        }\n    }\n}, {\n    timestamps: true\n});\nUserSchema.index({\n    email: 1\n}, {\n    unique: true\n});\nUserSchema.index({\n    createdAt: -1\n});\nUserSchema.methods.addGameRecord = function(record) {\n    const gameRecord = {\n        ...record,\n        date: new Date()\n    };\n    this.gameHistory.unshift(gameRecord);\n    if (this.gameHistory.length > 50) {\n        this.gameHistory = this.gameHistory.slice(0, 50);\n    }\n    this.stats.totalGames += 1;\n    if (record.result === \"won\") {\n        this.stats.wins += 1;\n    }\n    const currentBest = this.stats.bestTime[record.difficulty];\n    if ((record.result === \"completed\" || record.result === \"won\") && (currentBest === null || record.time < currentBest)) {\n        this.stats.bestTime[record.difficulty] = record.time;\n    }\n    return this.save();\n};\nconst User = (mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", UserSchema);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (User);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEtBQUssS0FBSSxLQUN2RG1DLENBQUFBLGdCQUFnQixRQUFRSixPQUFPbEMsSUFBSSxHQUFHc0MsV0FBVSxHQUNqRDtRQUNBLElBQUksQ0FBQ2hCLEtBQUssQ0FBQ0csUUFBUSxDQUFDUyxPQUFPbkMsVUFBVSxDQUFDLEdBQUdtQyxPQUFPbEMsSUFBSTtJQUN0RDtJQUVBLE9BQU8sSUFBSSxDQUFDdUMsSUFBSTtBQUNsQjtBQUVBLE1BQU1DLE9BQ0pyRCx3REFBZSxDQUFDcUQsSUFBSSxJQUFJckQscURBQWMsQ0FBUSxRQUFRbUI7QUFFeEQsaUVBQWVrQyxJQUFJQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3Vkb2t1LWdhbWUvLi9zcmMvbW9kZWxzL1VzZXIudHM/MDk2ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UsIHsgU2NoZW1hLCBEb2N1bWVudCwgTW9kZWwgfSBmcm9tIFwibW9uZ29vc2VcIjtcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lUmVjb3JkIHtcbiAgZGF0ZTogRGF0ZTtcbiAgbW9kZTogXCJwcmFjdGljZVwiIHwgXCJzb2xvXCI7XG4gIGRpZmZpY3VsdHk6IFwiZWFzeVwiIHwgXCJtZWRpdW1cIiB8IFwiaGFyZFwiO1xuICB0aW1lOiBudW1iZXI7XG4gIGVycm9yczogbnVtYmVyO1xuICByZXN1bHQ6IFwiY29tcGxldGVkXCIgfCBcImFiYW5kb25lZFwiIHwgXCJ3b25cIiB8IFwibG9zdFwiO1xuICByb29tQ29kZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVc2VyU3RhdHMge1xuICB0b3RhbEdhbWVzOiBudW1iZXI7XG4gIHdpbnM6IG51bWJlcjtcbiAgYmVzdFRpbWU6IHtcbiAgICBlYXN5OiBudW1iZXIgfCBudWxsO1xuICAgIG1lZGl1bTogbnVtYmVyIHwgbnVsbDtcbiAgICBoYXJkOiBudW1iZXIgfCBudWxsO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElVc2VyIGV4dGVuZHMgRG9jdW1lbnQge1xuICBlbWFpbDogc3RyaW5nO1xuICBwYXNzd29yZEhhc2g6IHN0cmluZztcbiAgZGlzcGxheU5hbWU6IHN0cmluZztcbiAgZ2FtZUhpc3Rvcnk6IEdhbWVSZWNvcmRbXTtcbiAgc3RhdHM6IFVzZXJTdGF0cztcbiAgY3JlYXRlZEF0OiBEYXRlO1xuICB1cGRhdGVkQXQ6IERhdGU7XG4gIGFkZEdhbWVSZWNvcmQocmVjb3JkOiBPbWl0PEdhbWVSZWNvcmQsIFwiZGF0ZVwiPik6IFByb21pc2U8SVVzZXI+O1xufVxuXG5jb25zdCBHYW1lUmVjb3JkU2NoZW1hID0gbmV3IFNjaGVtYTxHYW1lUmVjb3JkPihcbiAge1xuICAgIGRhdGU6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcbiAgICBtb2RlOiB7IHR5cGU6IFN0cmluZywgZW51bTogW1wicHJhY3RpY2VcIiwgXCJzb2xvXCJdLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIGRpZmZpY3VsdHk6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbXCJlYXN5XCIsIFwibWVkaXVtXCIsIFwiaGFyZFwiXSwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICB0aW1lOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBlcnJvcnM6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gICAgcmVzdWx0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBlbnVtOiBbXCJjb21wbGV0ZWRcIiwgXCJhYmFuZG9uZWRcIiwgXCJ3b25cIiwgXCJsb3N0XCJdLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICByb29tQ29kZTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgfSxcbiAgeyBfaWQ6IGZhbHNlIH1cbik7XG5cbmNvbnN0IFVzZXJTY2hlbWEgPSBuZXcgU2NoZW1hPElVc2VyPihcbiAge1xuICAgIGVtYWlsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICAgIGxvd2VyY2FzZTogdHJ1ZSxcbiAgICAgIHRyaW06IHRydWUsXG4gICAgICBtYXRjaDogWy9eXFxTK0BcXFMrXFwuXFxTKyQvLCBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsXCJdLFxuICAgIH0sXG4gICAgcGFzc3dvcmRIYXNoOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIG1pbmxlbmd0aDogNjAsXG4gICAgfSxcbiAgICBkaXNwbGF5TmFtZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICB0cmltOiB0cnVlLFxuICAgICAgbWlubGVuZ3RoOiAyLFxuICAgICAgbWF4bGVuZ3RoOiAyMCxcbiAgICB9LFxuICAgIGdhbWVIaXN0b3J5OiB7XG4gICAgICB0eXBlOiBbR2FtZVJlY29yZFNjaGVtYV0sXG4gICAgICBkZWZhdWx0OiBbXSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHZhbGlkYXRvcjogZnVuY3Rpb24gKHY6IEdhbWVSZWNvcmRbXSkge1xuICAgICAgICAgIHJldHVybiB2Lmxlbmd0aCA8PSA1MDtcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogXCJHYW1lIGhpc3RvcnkgY2Fubm90IGV4Y2VlZCA1MCByZWNvcmRzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgc3RhdHM6IHtcbiAgICAgIHRvdGFsR2FtZXM6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gICAgICB3aW5zOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICAgICAgYmVzdFRpbWU6IHtcbiAgICAgICAgZWFzeTogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IG51bGwgfSxcbiAgICAgICAgbWVkaXVtOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogbnVsbCB9LFxuICAgICAgICBoYXJkOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogbnVsbCB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgdGltZXN0YW1wczogdHJ1ZSxcbiAgfVxuKTtcblxuVXNlclNjaGVtYS5pbmRleCh7IGVtYWlsOiAxIH0sIHsgdW5pcXVlOiB0cnVlIH0pO1xuVXNlclNjaGVtYS5pbmRleCh7IGNyZWF0ZWRBdDogLTEgfSk7XG5cblVzZXJTY2hlbWEubWV0aG9kcy5hZGRHYW1lUmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZDogT21pdDxHYW1lUmVjb3JkLCBcImRhdGVcIj4pIHtcbiAgY29uc3QgZ2FtZVJlY29yZDogR2FtZVJlY29yZCA9IHtcbiAgICAuLi5yZWNvcmQsXG4gICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgfTtcblxuICB0aGlzLmdhbWVIaXN0b3J5LnVuc2hpZnQoZ2FtZVJlY29yZCk7XG4gIGlmICh0aGlzLmdhbWVIaXN0b3J5Lmxlbmd0aCA+IDUwKSB7XG4gICAgdGhpcy5nYW1lSGlzdG9yeSA9IHRoaXMuZ2FtZUhpc3Rvcnkuc2xpY2UoMCwgNTApO1xuICB9XG5cbiAgdGhpcy5zdGF0cy50b3RhbEdhbWVzICs9IDE7XG4gIGlmIChyZWNvcmQucmVzdWx0ID09PSBcIndvblwiKSB7XG4gICAgdGhpcy5zdGF0cy53aW5zICs9IDE7XG4gIH1cblxuICBjb25zdCBjdXJyZW50QmVzdCA9IHRoaXMuc3RhdHMuYmVzdFRpbWVbcmVjb3JkLmRpZmZpY3VsdHldO1xuICBpZiAoXG4gICAgKHJlY29yZC5yZXN1bHQgPT09IFwiY29tcGxldGVkXCIgfHwgcmVjb3JkLnJlc3VsdCA9PT0gXCJ3b25cIikgJiZcbiAgICAoY3VycmVudEJlc3QgPT09IG51bGwgfHwgcmVjb3JkLnRpbWUgPCBjdXJyZW50QmVzdClcbiAgKSB7XG4gICAgdGhpcy5zdGF0cy5iZXN0VGltZVtyZWNvcmQuZGlmZmljdWx0eV0gPSByZWNvcmQudGltZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNhdmUoKTtcbn07XG5cbmNvbnN0IFVzZXI6IE1vZGVsPElVc2VyPiA9XG4gIG1vbmdvb3NlLm1vZGVscy5Vc2VyIHx8IG1vbmdvb3NlLm1vZGVsPElVc2VyPihcIlVzZXJcIiwgVXNlclNjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IFVzZXI7XG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJTY2hlbWEiLCJHYW1lUmVjb3JkU2NoZW1hIiwiZGF0ZSIsInR5cGUiLCJEYXRlIiwiZGVmYXVsdCIsIm5vdyIsIm1vZGUiLCJTdHJpbmciLCJlbnVtIiwicmVxdWlyZWQiLCJkaWZmaWN1bHR5IiwidGltZSIsIk51bWJlciIsImVycm9ycyIsInJlc3VsdCIsInJvb21Db2RlIiwiX2lkIiwiVXNlclNjaGVtYSIsImVtYWlsIiwidW5pcXVlIiwibG93ZXJjYXNlIiwidHJpbSIsIm1hdGNoIiwicGFzc3dvcmRIYXNoIiwibWlubGVuZ3RoIiwiZGlzcGxheU5hbWUiLCJtYXhsZW5ndGgiLCJnYW1lSGlzdG9yeSIsInZhbGlkYXRlIiwidmFsaWRhdG9yIiwidiIsImxlbmd0aCIsIm1lc3NhZ2UiLCJzdGF0cyIsInRvdGFsR2FtZXMiLCJ3aW5zIiwiYmVzdFRpbWUiLCJlYXN5IiwibWVkaXVtIiwiaGFyZCIsInRpbWVzdGFtcHMiLCJpbmRleCIsImNyZWF0ZWRBdCIsIm1ldGhvZHMiLCJhZGRHYW1lUmVjb3JkIiwicmVjb3JkIiwiZ2FtZVJlY29yZCIsInVuc2hpZnQiLCJzbGljZSIsImN1cnJlbnRCZXN0Iiwic2F2ZSIsIlVzZXIiLCJtb2RlbHMiLCJtb2RlbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/models/User.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/bcryptjs","vendor-chunks/@babel","vendor-chunks/uuid","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fchungkk%2FDesktop%2FGG%20Driver%2Fcode%2Fsudoku&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();