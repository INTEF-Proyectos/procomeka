var u={exports:{}},l={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x;function h(){if(x)return l;x=1;var s=Symbol.for("react.transitional.element"),a=Symbol.for("react.fragment");function i(d,e,r){var n=null;if(r!==void 0&&(n=""+r),e.key!==void 0&&(n=""+e.key),"key"in e){r={};for(var c in e)c!=="key"&&(r[c]=e[c])}else r=e;return e=r.ref,{$$typeof:s,type:d,key:n,ref:e!==void 0?e:null,props:r}}return l.Fragment=a,l.jsx=i,l.jsxs=i,l}var o;function j(){return o||(o=1,u.exports=h()),u.exports}var t=j();function v({id:s,message:a,variant:i="neutral",polite:d=!0}){const e=["admin-feedback",i==="success"?"admin-feedback--success":"",i==="error"?"admin-feedback--error":""].filter(Boolean).join(" ");return t.jsx("div",{id:s,className:a?e:void 0,role:d?"status":"alert","aria-live":d?"polite":"assertive",children:a})}function p({columns:s,rows:a,getRowKey:i,emptyMessage:d,colSpan:e=s.length}){return t.jsx("div",{className:"admin-table-wrap",children:t.jsxs("table",{children:[t.jsx("thead",{children:t.jsx("tr",{children:s.map(r=>t.jsx("th",{children:r.header},r.id))})}),t.jsx("tbody",{children:a.length===0?t.jsx("tr",{className:"admin-empty-row",children:t.jsx("td",{colSpan:e,children:d})}):a.map(r=>t.jsx("tr",{children:s.map(n=>t.jsx("td",{className:n.className,children:n.cell(r)},n.id))},i(r)))})]})})}export{v as A,p as C,t as j};
