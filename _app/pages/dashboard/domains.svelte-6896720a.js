var t=Object.defineProperty,e=Object.defineProperties,n=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,s=(e,n,a)=>n in e?t(e,n,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[n]=a,l=(t,e)=>{for(var n in e||(e={}))r.call(e,n)&&s(t,n,e[n]);if(a)for(var n of a(e))o.call(e,n)&&s(t,n,e[n]);return t},c=(t,a)=>e(t,n(a));import{S as i,i as d,s as $,a7 as f,a8 as u,G as m,I as p,j as h,k as g,m as v,n as w,o as y,f as b,J as x,x as E,u as k,v as A,d as I,a9 as D,t as N,g as T,aa as O,ab as C,ac as S,ad as P,e as R,c as j,a as V,b as B,a2 as L,a5 as H,r as q,w as F,W as J,ae as M,af as U,l as Y,h as _,ag as z,E as G,ah as W,ai as K,aj as Q,ak as X,V as Z,al as tt,am as et,an as nt,ao as at,ap as rt,aq as ot,ar as st,as as lt,a3 as ct,A as it}from"../../chunks/vendor-050d8cbf.js";import{e as dt,a as $t,c as ft}from"../../chunks/store-utils-3fdd23c5.js";import{b as ut}from"../../chunks/api-utils-e88dc490.js";import{s as mt}from"../../chunks/user.state-7cf1189d.js";import"../../chunks/user-32a9ba32.js";import"../../chunks/singletons-bb9012b7.js";const pt=dt(ft,(t=>ut("/domain/","POST",t)),((t,e)=>{ht.dispatch(),mt.set({message:t.message,title:e?"Success!":"Failed to create domain",kind:e?"success":"error"})})),ht=dt($t,(()=>ut("/domain/all")),((t,e)=>{e||mt.set({message:t.message,title:"Failed to retrieve your domains",kind:"error"})})),gt=dt($t,(t=>ut("/domain/update-many","POST",t).then((t=>c(l({},t),{data:{count:t.data.length,domains:t.data}})))),((t,e)=>{ht.dispatch(),mt.set({message:t.message,title:e?"Success!":"Failed to edit domain(s)",kind:e?"success":"error"})})),vt=dt($t,(t=>ut("/domain/delete-many","DELETE",t).then((t=>{var e;return c(l({},t),{data:{count:null==(e=t.data)?void 0:e.length,domains:t.data}})}))),((t,e)=>{ht.dispatch(),mt.set({message:t.message,title:e?"Success!":"Failed to delete domain(s)",kind:e?"success":"error"})}));class wt{}function yt(t){var e,n,a,r;try{return c(l({},t),{name:null!=(e=t.name)?e:"",ipAddresses:null!=(a=null==(n=t.ipAddresses)?void 0:n.join(","))?a:"",data:JSON.stringify(t.data,null,2),redirects:null!=(r=t.redirects)?r:[]})}catch(o){return console.error(o),{}}}function bt(t){return c(l({},t),{ipAddresses:t.ipAddresses.split(","),data:t.data?JSON.parse(t.data):null})}const xt=JSON.stringify({customerName:"Example Biz",accountTier:"pro"},null,2);function Et(t){let e;return{c(){e=N("View")},l(t){e=T(t,"View")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function kt(t){let e,n,a;function r(e){t[6](e)}let o={labelText:"Data that relates to your tenant that owns this domain. Edit this by selecting the row from the table and clicking 'Edit'.",placeholder:xt,readonly:!0,rows:15};return void 0!==t[2]&&(o.value=t[2]),e=new O({props:o}),m.push((()=>p(e,"value",r))),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,n){y(e,t,n),a=!0},p(t,a){const r={};!n&&4&a&&(n=!0,r.value=t[2],x((()=>n=!1))),e.$set(r)},i(t){a||(E(e.$$.fragment,t),a=!0)},o(t){k(e.$$.fragment,t),a=!1},d(t){A(e,t)}}}function At(t){let e,n,a,r,o;function s(e){t[7](e)}e=new f({props:{style:"cursor:pointer",$$slots:{default:[Et]},$$scope:{ctx:t}}}),e.$on("click",t[5]);let l={modalHeading:"Config for "+t[0].name,passiveModal:!0,$$slots:{default:[kt]},$$scope:{ctx:t}};return void 0!==t[1]&&(l.open=t[1]),a=new u({props:l}),m.push((()=>p(a,"open",s))),a.$on("click:button--secondary",t[8]),a.$on("open",t[9]),a.$on("close",t[10]),a.$on("submit",t[11]),{c(){h(e.$$.fragment),n=g(),h(a.$$.fragment)},l(t){v(e.$$.fragment,t),n=w(t),v(a.$$.fragment,t)},m(t,r){y(e,t,r),b(t,n,r),y(a,t,r),o=!0},p(t,[n]){const o={};8192&n&&(o.$$scope={dirty:n,ctx:t}),e.$set(o);const s={};1&n&&(s.modalHeading="Config for "+t[0].name),8196&n&&(s.$$scope={dirty:n,ctx:t}),!r&&2&n&&(r=!0,s.open=t[1],x((()=>r=!1))),a.$set(s)},i(t){o||(E(e.$$.fragment,t),E(a.$$.fragment,t),o=!0)},o(t){k(e.$$.fragment,t),k(a.$$.fragment,t),o=!1},d(t){A(e,t),t&&I(n),A(a,t)}}}function It(t,e,n){const a=D();let{data:r}=e,o=!1,s="";function l(){n(2,s=yt(r).data),n(1,o=!0)}function c(t,e){n(1,o=!1),e&&a("submit",{config:JSON.parse(t)})}return t.$$set=t=>{"data"in t&&n(0,r=t.data)},[r,o,s,l,c,()=>l(),function(t){s=t,n(2,s)},function(t){o=t,n(1,o)},()=>c(null,!1),function(e){C.call(this,t,e)},function(e){C.call(this,t,e)},()=>c(s,!0)]}class Dt extends i{constructor(t){super(),d(this,t,It,At,$,{data:0})}}function Nt(t,e,n){const a=t.slice();return a[12]=e[n],a[13]=e,a[14]=n,a}function Tt(t){let e,n,a,r,o,s,l,c,i,d,$,f,u,D,N;function T(e){t[8](e,t[12])}let O={labelText:"From",placeholder:"/logo"};function C(e){t[9](e,t[12])}void 0!==t[12].from&&(O.value=t[12].from),a=new P({props:O}),m.push((()=>p(a,"value",T))),l=new M({props:{style:"position:relative; top:2.5em"}});let S={labelText:"To",placeholder:"https://s3.aws.com/example-customer-logo.png"};return void 0!==t[12].to&&(S.value=t[12].to),d=new P({props:S}),m.push((()=>p(d,"value",C))),D=new H({props:{kind:"danger-tertiary",size:"field",iconDescription:"Delete",icon:U}}),D.$on("click",(function(){return t[10](t[14])})),{c(){e=R("div"),n=R("div"),h(a.$$.fragment),o=g(),s=R("div"),h(l.$$.fragment),c=g(),i=R("div"),h(d.$$.fragment),f=g(),u=R("div"),h(D.$$.fragment),this.h()},l(t){e=j(t,"DIV",{class:!0});var r=V(e);n=j(r,"DIV",{class:!0});var $=V(n);v(a.$$.fragment,$),$.forEach(I),o=w(r),s=j(r,"DIV",{});var m=V(s);v(l.$$.fragment,m),m.forEach(I),c=w(r),i=j(r,"DIV",{class:!0});var p=V(i);v(d.$$.fragment,p),p.forEach(I),f=w(r),u=j(r,"DIV",{class:!0});var h=V(u);v(D.$$.fragment,h),h.forEach(I),r.forEach(I),this.h()},h(){B(n,"class","redirect-from svelte-10bkv08"),B(i,"class","redirect-to svelte-10bkv08"),B(u,"class","row-inline-container svelte-10bkv08"),B(e,"class","block redirect-form-row svelte-10bkv08")},m(t,r){b(t,e,r),L(e,n),y(a,n,null),L(e,o),L(e,s),y(l,s,null),L(e,c),L(e,i),y(d,i,null),L(e,f),L(e,u),y(D,u,null),N=!0},p(e,n){t=e;const o={};!r&&1&n&&(r=!0,o.value=t[12].from,x((()=>r=!1))),a.$set(o);const s={};!$&&1&n&&($=!0,s.value=t[12].to,x((()=>$=!1))),d.$set(s)},i(t){N||(E(a.$$.fragment,t),E(l.$$.fragment,t),E(d.$$.fragment,t),E(D.$$.fragment,t),N=!0)},o(t){k(a.$$.fragment,t),k(l.$$.fragment,t),k(d.$$.fragment,t),k(D.$$.fragment,t),N=!1},d(t){t&&I(e),A(a),A(l),A(d),A(D)}}}function Ot(t){let e;return{c(){e=N("+ Add A Redirect")},l(t){e=T(t,"+ Add A Redirect")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function Ct(t){let e,n,a,r,o,s,l,c,i,d,$,f,u,D,C,S,M,U,Y,_,z,G,W;function K(e){t[5](e)}let Q={disabled:t[1],labelText:"Domain name",placeholder:"example.com or tenant.yoursite.com",helperText:"Enter a root domain or subdomain that your tenant will use to access your service"};function X(e){t[6](e)}void 0!==t[0].name&&(Q.value=t[0].name),n=new P({props:Q}),m.push((()=>p(n,"value",K)));let Z={rows:2,labelText:"IP Addresses",helperText:"Enter a comma-separated list of IP Addresses where your service is. Your tenant's domains will point to these. Enter more than 1 address for load-balancing.",placeholder:"172.88.1.2,81.44.3.6"};function tt(e){t[7](e)}void 0!==t[0].ipAddresses&&(Z.value=t[0].ipAddresses),s=new O({props:Z}),m.push((()=>p(s,"value",X)));let et={rows:10,labelText:"Tenant Data",placeholder:xt,helperText:"Generally the structure of this object will be consistent with all your tenants but the values should vary."};void 0!==t[0].data&&(et.value=t[0].data),d=new O({props:et}),m.push((()=>p(d,"value",tt)));let nt=t[0].redirects,at=[];for(let m=0;m<nt.length;m+=1)at[m]=Tt(Nt(t,nt,m));const rt=t=>k(at[t],1,1,(()=>{at[t]=null}));return G=new H({props:{kind:"tertiary",size:"field",$$slots:{default:[Ot]},$$scope:{ctx:t}}}),G.$on("click",t[3]),{c(){e=R("div"),h(n.$$.fragment),r=g(),o=R("div"),h(s.$$.fragment),c=g(),i=R("div"),h(d.$$.fragment),f=g(),u=R("div"),D=R("div"),C=R("h5"),S=N("Redirects"),M=g(),U=R("p"),Y=N("Redirect from a path on the tenant's domain to some url that returns the relevant content\n\t\t\t\tfor the tenant."),_=g();for(let t=0;t<at.length;t+=1)at[t].c();z=g(),h(G.$$.fragment),this.h()},l(t){e=j(t,"DIV",{class:!0});var a=V(e);v(n.$$.fragment,a),a.forEach(I),r=w(t),o=j(t,"DIV",{class:!0});var l=V(o);v(s.$$.fragment,l),l.forEach(I),c=w(t),i=j(t,"DIV",{class:!0});var $=V(i);v(d.$$.fragment,$),$.forEach(I),f=w(t),u=j(t,"DIV",{class:!0});var m=V(u);D=j(m,"DIV",{class:!0});var p=V(D);C=j(p,"H5",{});var h=V(C);S=T(h,"Redirects"),h.forEach(I),M=w(p),U=j(p,"P",{});var g=V(U);Y=T(g,"Redirect from a path on the tenant's domain to some url that returns the relevant content\n\t\t\t\tfor the tenant."),g.forEach(I),p.forEach(I),_=w(m);for(let e=0;e<at.length;e+=1)at[e].l(m);z=w(m),v(G.$$.fragment,m),m.forEach(I),this.h()},h(){B(e,"class","block"),B(o,"class","block"),B(i,"class","block"),B(D,"class","block"),B(u,"class","block")},m(t,a){b(t,e,a),y(n,e,null),b(t,r,a),b(t,o,a),y(s,o,null),b(t,c,a),b(t,i,a),y(d,i,null),b(t,f,a),b(t,u,a),L(u,D),L(D,C),L(C,S),L(D,M),L(D,U),L(U,Y),L(u,_);for(let e=0;e<at.length;e+=1)at[e].m(u,null);L(u,z),y(G,u,null),W=!0},p(t,e){const r={};2&e&&(r.disabled=t[1]),!a&&1&e&&(a=!0,r.value=t[0].name,x((()=>a=!1))),n.$set(r);const o={};!l&&1&e&&(l=!0,o.value=t[0].ipAddresses,x((()=>l=!1))),s.$set(o);const c={};if(!$&&1&e&&($=!0,c.value=t[0].data,x((()=>$=!1))),d.$set(c),17&e){let n;for(nt=t[0].redirects,n=0;n<nt.length;n+=1){const a=Nt(t,nt,n);at[n]?(at[n].p(a,e),E(at[n],1)):(at[n]=Tt(a),at[n].c(),E(at[n],1),at[n].m(u,z))}for(q(),n=nt.length;n<at.length;n+=1)rt(n);F()}const i={};32768&e&&(i.$$scope={dirty:e,ctx:t}),G.$set(i)},i(t){if(!W){E(n.$$.fragment,t),E(s.$$.fragment,t),E(d.$$.fragment,t);for(let t=0;t<nt.length;t+=1)E(at[t]);E(G.$$.fragment,t),W=!0}},o(t){k(n.$$.fragment,t),k(s.$$.fragment,t),k(d.$$.fragment,t),at=at.filter(Boolean);for(let e=0;e<at.length;e+=1)k(at[e]);k(G.$$.fragment,t),W=!1},d(t){t&&I(e),A(n),t&&I(r),t&&I(o),A(s),t&&I(c),t&&I(i),A(d),t&&I(f),t&&I(u),J(at,t),A(G)}}}function St(t){let e,n;return e=new S({props:{$$slots:{default:[Ct]},$$scope:{ctx:t}}}),e.$on("submit",t[2]),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p(t,[n]){const a={};32771&n&&(a.$$scope={dirty:n,ctx:t}),e.$set(a)},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function Pt(t,e,n){let{data:a={}}=e,{isEdit:r=!1}=e;const o=D();function s(t){n(0,a.redirects=a.redirects.filter(((e,n)=>n!==t)),a)}return t.$$set=t=>{"data"in t&&n(0,a=t.data),"isEdit"in t&&n(1,r=t.isEdit)},[a,r,function(){o("submit",a)},function(){n(0,a.redirects=[...a.redirects,new wt],a)},s,function(e){t.$$.not_equal(a.name,e)&&(a.name=e,n(0,a))},function(e){t.$$.not_equal(a.ipAddresses,e)&&(a.ipAddresses=e,n(0,a))},function(e){t.$$.not_equal(a.data,e)&&(a.data=e,n(0,a))},function(e,r){t.$$.not_equal(r.from,e)&&(r.from=e,n(0,a))},function(e,r){t.$$.not_equal(r.to,e)&&(r.to=e,n(0,a))},t=>s(t)]}class Rt extends i{constructor(t){super(),d(this,t,Pt,St,$,{data:0,isEdit:1})}}function jt(t,e,n){const a=t.slice();return a[11]=e[n],a}function Vt(t){let e,n,a=t[11].name+"";return{c(){e=R("h4"),n=N(a),this.h()},l(t){e=j(t,"H4",{class:!0});var r=V(e);n=T(r,a),r.forEach(I),this.h()},h(){B(e,"class","block data-header svelte-1qtkyyh")},m(t,a){b(t,e,a),L(e,n)},p(t,e){4&e&&a!==(a=t[11].name+"")&&_(n,a)},d(t){t&&I(e)}}}function Bt(t){let e,n;return e=new Rt({props:{isEdit:t[1],data:t[11]}}),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p(t,n){const a={};2&n&&(a.isEdit=t[1]),4&n&&(a.data=t[11]),e.$set(a)},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function Lt(t){let e,n,a,r=t[1]&&Vt(t),o=t[0]&&Bt(t);return{c(){r&&r.c(),e=g(),o&&o.c(),n=Y()},l(t){r&&r.l(t),e=w(t),o&&o.l(t),n=Y()},m(t,s){r&&r.m(t,s),b(t,e,s),o&&o.m(t,s),b(t,n,s),a=!0},p(t,a){t[1]?r?r.p(t,a):(r=Vt(t),r.c(),r.m(e.parentNode,e)):r&&(r.d(1),r=null),t[0]?o?(o.p(t,a),1&a&&E(o,1)):(o=Bt(t),o.c(),E(o,1),o.m(n.parentNode,n)):o&&(q(),k(o,1,1,(()=>{o=null})),F())},i(t){a||(E(o),a=!0)},o(t){k(o),a=!1},d(t){r&&r.d(t),t&&I(e),o&&o.d(t),t&&I(n)}}}function Ht(t){let e,n,a=t[2],r=[];for(let s=0;s<a.length;s+=1)r[s]=Lt(jt(t,a,s));const o=t=>k(r[t],1,1,(()=>{r[t]=null}));return{c(){for(let t=0;t<r.length;t+=1)r[t].c();e=Y()},l(t){for(let e=0;e<r.length;e+=1)r[e].l(t);e=Y()},m(t,a){for(let e=0;e<r.length;e+=1)r[e].m(t,a);b(t,e,a),n=!0},p(t,n){if(7&n){let s;for(a=t[2],s=0;s<a.length;s+=1){const o=jt(t,a,s);r[s]?(r[s].p(o,n),E(r[s],1)):(r[s]=Lt(o),r[s].c(),E(r[s],1),r[s].m(e.parentNode,e))}for(q(),s=a.length;s<r.length;s+=1)o(s);F()}},i(t){if(!n){for(let t=0;t<a.length;t+=1)E(r[t]);n=!0}},o(t){r=r.filter(Boolean);for(let e=0;e<r.length;e+=1)k(r[e]);n=!1},d(t){J(r,t),t&&I(e)}}}function qt(t){let e,n,a;function r(e){t[5](e)}let o={modalHeading:t[1]?"Edit domains":"Create a domain",primaryButtonText:t[1]?"Save Changes":"Create domain",secondaryButtonText:"Cancel",$$slots:{default:[Ht]},$$scope:{ctx:t}};return void 0!==t[0]&&(o.open=t[0]),e=new u({props:o}),m.push((()=>p(e,"open",r))),e.$on("click:button--secondary",t[6]),e.$on("open",t[7]),e.$on("close",t[8]),e.$on("submit",t[9]),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,n){y(e,t,n),a=!0},p(t,[a]){const r={};2&a&&(r.modalHeading=t[1]?"Edit domains":"Create a domain"),2&a&&(r.primaryButtonText=t[1]?"Save Changes":"Create domain"),16391&a&&(r.$$scope={dirty:a,ctx:t}),!n&&1&a&&(n=!0,r.open=t[0],x((()=>n=!1))),e.$set(r)},i(t){a||(E(e.$$.fragment,t),a=!0)},o(t){k(e.$$.fragment,t),a=!1},d(t){A(e,t)}}}function Ft(t,e,n){let a,{data:r=[{}]}=e,{isEdit:o=!1}=e,{isOpen:s=!1}=e;const l=D();function c(t,e){if(e){const e=t.map(bt);l("submit",{data:e})}n(0,s=!1)}return t.$$set=t=>{"data"in t&&n(4,r=t.data),"isEdit"in t&&n(1,o=t.isEdit),"isOpen"in t&&n(0,s=t.isOpen)},t.$$.update=()=>{16&t.$$.dirty&&n(2,a=r.map(yt))},[s,o,a,c,r,function(t){s=t,n(0,s)},()=>c(null,!1),function(e){C.call(this,t,e)},function(e){C.call(this,t,e)},()=>c(a,!0)]}class Jt extends i{constructor(t){super(),d(this,t,Ft,qt,$,{data:4,isEdit:1,isOpen:0})}}function Mt(t,e,n){const a=t.slice();return a[25]=e[n],a}function Ut(t,e,n){const a=t.slice();return a[30]=e[n],a[32]=n,a}function Yt(t){let e,n;return e=new X({props:{headers:t[10],rows:5}}),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p:Z,i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function _t(t){let e,n,a;function r(e){t[18](e)}let o={zebra:!0,expandable:!0,batchSelection:!0,expandedRowIds:t[3],headers:t[10],rows:t[0],$$slots:{cell:[pe,({cell:t,row:e})=>({28:t,29:e}),({cell:t,row:e})=>[(t?268435456:0)|(e?536870912:0)]],"expanded-row":[se,({row:t})=>({29:t}),({row:t})=>[t?536870912:0]],default:[ee]},$$scope:{ctx:t}};return void 0!==t[2]&&(o.selectedRowIds=t[2]),e=new tt({props:o}),m.push((()=>p(e,"selectedRowIds",r))),e.$on("click:row",t[19]),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,n){y(e,t,n),a=!0},p(t,a){const r={};8&a[0]&&(r.expandedRowIds=t[3]),1&a[0]&&(r.rows=t[0]),805307008&a[0]|4&a[1]&&(r.$$scope={dirty:a,ctx:t}),!n&&4&a[0]&&(n=!0,r.selectedRowIds=t[2],x((()=>n=!1))),e.$set(r)},i(t){a||(E(e.$$.fragment,t),a=!0)},o(t){k(e.$$.fragment,t),a=!1},d(t){A(e,t)}}}function zt(t){let e;return{c(){e=N("Edit")},l(t){e=T(t,"Edit")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function Gt(t){let e;return{c(){e=N("Delete")},l(t){e=T(t,"Delete")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function Wt(t){let e,n,a,r;return e=new H({props:{icon:ot,$$slots:{default:[zt]},$$scope:{ctx:t}}}),e.$on("click",t[15]),a=new H({props:{icon:st,$$slots:{default:[Gt]},$$scope:{ctx:t}}}),a.$on("click",t[16]),{c(){h(e.$$.fragment),n=g(),h(a.$$.fragment)},l(t){v(e.$$.fragment,t),n=w(t),v(a.$$.fragment,t)},m(t,o){y(e,t,o),b(t,n,o),y(a,t,o),r=!0},p(t,n){const r={};4&n[1]&&(r.$$scope={dirty:n,ctx:t}),e.$set(r);const o={};4&n[1]&&(o.$$scope={dirty:n,ctx:t}),a.$set(o)},i(t){r||(E(e.$$.fragment,t),E(a.$$.fragment,t),r=!0)},o(t){k(e.$$.fragment,t),k(a.$$.fragment,t),r=!1},d(t){A(e,t),t&&I(n),A(a,t)}}}function Kt(t){let e,n,a;return n=new lt({}),{c(){e=R("div"),h(n.$$.fragment),this.h()},l(t){e=j(t,"DIV",{class:!0});var a=V(e);v(n.$$.fragment,a),a.forEach(I),this.h()},h(){B(e,"class","loading-row svelte-1s55gtg")},m(t,r){b(t,e,r),y(n,e,null),a=!0},p:Z,i(t){a||(E(n.$$.fragment,t),a=!0)},o(t){k(n.$$.fragment,t),a=!1},d(t){t&&I(e),A(n)}}}function Qt(t){let e,n;return e=new H({props:{$$slots:{default:[Xt]},$$scope:{ctx:t}}}),e.$on("click",t[17]),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p(t,n){const a={};4&n[1]&&(a.$$scope={dirty:n,ctx:t}),e.$set(a)},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function Xt(t){let e;return{c(){e=N("+ Create A Domain")},l(t){e=T(t,"+ Create A Domain")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function Zt(t){let e,n,a,r;const o=[Qt,Kt],s=[];function l(t,e){return t[9].isLoading?1:0}return e=l(t),n=s[e]=o[e](t),{c(){n.c(),a=Y()},l(t){n.l(t),a=Y()},m(t,n){s[e].m(t,n),b(t,a,n),r=!0},p(t,r){let c=e;e=l(t),e===c?s[e].p(t,r):(q(),k(s[c],1,1,(()=>{s[c]=null})),F(),n=s[e],n?n.p(t,r):(n=s[e]=o[e](t),n.c()),E(n,1),n.m(a.parentNode,a))},i(t){r||(E(n),r=!0)},o(t){k(n),r=!1},d(t){s[e].d(t),t&&I(a)}}}function te(t){let e,n,a,r;return e=new at({props:{$$slots:{default:[Wt]},$$scope:{ctx:t}}}),a=new rt({props:{$$slots:{default:[Zt]},$$scope:{ctx:t}}}),{c(){h(e.$$.fragment),n=g(),h(a.$$.fragment)},l(t){v(e.$$.fragment,t),n=w(t),v(a.$$.fragment,t)},m(t,o){y(e,t,o),b(t,n,o),y(a,t,o),r=!0},p(t,n){const r={};128&n[0]|4&n[1]&&(r.$$scope={dirty:n,ctx:t}),e.$set(r);const o={};512&n[0]|4&n[1]&&(o.$$scope={dirty:n,ctx:t}),a.$set(o)},i(t){r||(E(e.$$.fragment,t),E(a.$$.fragment,t),r=!0)},o(t){k(e.$$.fragment,t),k(a.$$.fragment,t),r=!1},d(t){A(e,t),t&&I(n),A(a,t)}}}function ee(t){let e,n;return e=new et({props:{$$slots:{default:[te]},$$scope:{ctx:t}}}),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p(t,n){const a={};640&n[0]|4&n[1]&&(a.$$scope={dirty:n,ctx:t}),e.$set(a)},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function ne(t){let e;return{c(){e=N("None")},l(t){e=T(t,"None")},m(t,n){b(t,e,n)},p:Z,d(t){t&&I(e)}}}function ae(t){let e,n=t[29].redirects,a=[];for(let r=0;r<n.length;r+=1)a[r]=oe(Ut(t,n,r));return{c(){for(let t=0;t<a.length;t+=1)a[t].c();e=Y()},l(t){for(let e=0;e<a.length;e+=1)a[e].l(t);e=Y()},m(t,n){for(let e=0;e<a.length;e+=1)a[e].m(t,n);b(t,e,n)},p(t,r){if(536870912&r[0]){let o;for(n=t[29].redirects,o=0;o<n.length;o+=1){const s=Ut(t,n,o);a[o]?a[o].p(s,r):(a[o]=oe(s),a[o].c(),a[o].m(e.parentNode,e))}for(;o<a.length;o+=1)a[o].d(1);a.length=n.length}},d(t){J(a,t),t&&I(e)}}}function re(t){let e;return{c(){e=R("br")},l(t){e=j(t,"BR",{})},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function oe(t){let e,n,a,r=ye(t[30])+"",o=t[32]!==t[29].redirects.length-1&&re();return{c(){e=N(r),n=g(),o&&o.c(),a=Y()},l(t){e=T(t,r),n=w(t),o&&o.l(t),a=Y()},m(t,r){b(t,e,r),b(t,n,r),o&&o.m(t,r),b(t,a,r)},p(t,n){536870912&n[0]&&r!==(r=ye(t[30])+"")&&_(e,r),t[32]!==t[29].redirects.length-1?o||(o=re(),o.c(),o.m(a.parentNode,a)):o&&(o.d(1),o=null)},d(t){t&&I(e),t&&I(n),o&&o.d(t),t&&I(a)}}}function se(t){let e,n,a,r;function o(t,e){return t[29].redirects.length?ae:ne}let s=o(t),l=s(t);return{c(){e=R("div"),n=R("h5"),a=N("Redirects"),r=g(),l.c(),this.h()},l(t){e=j(t,"DIV",{slot:!0,class:!0});var o=V(e);n=j(o,"H5",{});var s=V(n);a=T(s,"Redirects"),s.forEach(I),r=w(o),l.l(o),o.forEach(I),this.h()},h(){B(e,"slot","expanded-row"),B(e,"class","expanded-row svelte-1s55gtg")},m(t,o){b(t,e,o),L(e,n),L(n,a),L(e,r),l.m(e,null)},p(t,n){s===(s=o(t))&&l?l.p(t,n):(l.d(1),l=s(t),l&&(l.c(),l.m(e,null)))},d(t){t&&I(e),l.d()}}}function le(t){let e,n=t[28].value+"";return{c(){e=N(n)},l(t){e=T(t,n)},m(t,n){b(t,e,n)},p(t,a){268435456&a[0]&&n!==(n=t[28].value+"")&&_(e,n)},i:Z,o:Z,d(t){t&&I(e)}}}function ce(t){let e,n,a,r;const o=[$e,de],s=[];function l(t,e){return t[29].redirects.length?0:1}return e=l(t),n=s[e]=o[e](t),{c(){n.c(),a=Y()},l(t){n.l(t),a=Y()},m(t,n){s[e].m(t,n),b(t,a,n),r=!0},p(t,r){let c=e;e=l(t),e!==c&&(q(),k(s[c],1,1,(()=>{s[c]=null})),F(),n=s[e],n||(n=s[e]=o[e](t),n.c()),E(n,1),n.m(a.parentNode,a))},i(t){r||(E(n),r=!0)},o(t){k(n),r=!1},d(t){s[e].d(t),t&&I(a)}}}function ie(t){let e,n,a,r;const o=[me,ue],s=[];function l(t,e){return t[29].redirects.length?0:1}return e=l(t),n=s[e]=o[e](t),{c(){n.c(),a=Y()},l(t){n.l(t),a=Y()},m(t,n){s[e].m(t,n),b(t,a,n),r=!0},p(t,r){let c=e;e=l(t),e===c?s[e].p(t,r):(q(),k(s[c],1,1,(()=>{s[c]=null})),F(),n=s[e],n?n.p(t,r):(n=s[e]=o[e](t),n.c()),E(n,1),n.m(a.parentNode,a))},i(t){r||(E(n),r=!0)},o(t){k(n),r=!1},d(t){s[e].d(t),t&&I(a)}}}function de(t){let e;return{c(){e=N("None")},l(t){e=T(t,"None")},m(t,n){b(t,e,n)},i:Z,o:Z,d(t){t&&I(e)}}}function $e(t){let e,n;return e=new f({props:{style:"cursor: pointer",$$slots:{default:[fe]},$$scope:{ctx:t}}}),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function fe(t){let e;return{c(){e=N("Expand")},l(t){e=T(t,"Expand")},m(t,n){b(t,e,n)},d(t){t&&I(e)}}}function ue(t){let e;return{c(){e=N("None")},l(t){e=T(t,"None")},m(t,n){b(t,e,n)},p:Z,i:Z,o:Z,d(t){t&&I(e)}}}function me(t){let e,n;return e=new Dt({props:{data:t[29]}}),{c(){h(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,a){y(e,t,a),n=!0},p(t,n){const a={};536870912&n[0]&&(a.data=t[29]),e.$set(a)},i(t){n||(E(e.$$.fragment,t),n=!0)},o(t){k(e.$$.fragment,t),n=!1},d(t){A(e,t)}}}function pe(t){let e,n,a,r,o;const s=[ie,ce,le],l=[];function c(t,e){return"data"===t[28].key?0:"redirects"===t[28].key?1:2}return a=c(t),r=l[a]=s[a](t),{c(){e=R("div"),n=R("span"),r.c(),this.h()},l(t){e=j(t,"DIV",{slot:!0});var a=V(e);n=j(a,"SPAN",{});var o=V(n);r.l(o),o.forEach(I),a.forEach(I),this.h()},h(){B(e,"slot","cell")},m(t,r){b(t,e,r),L(e,n),l[a].m(n,null),o=!0},p(t,e){let o=a;a=c(t),a===o?l[a].p(t,e):(q(),k(l[o],1,1,(()=>{l[o]=null})),F(),r=l[a],r?r.p(t,e):(r=l[a]=s[a](t),r.c()),E(r,1),r.m(n,null))},i(t){o||(E(r),o=!0)},o(t){k(r),o=!1},d(t){t&&I(e),l[a].d()}}}function he(t){var e,n;let a,r,o,s=(null==(n=null==(e=t[0])?void 0:e.find(l))?void 0:n.name)+"";function l(...e){return t[22](t[25],...e)}return{c(){a=N(s),r=g(),o=R("br")},l(t){a=T(t,s),r=w(t),o=j(t,"BR",{})},m(t,e){b(t,a,e),b(t,r,e),b(t,o,e)},p(e,n){var r,o;t=e,5&n[0]&&s!==(s=(null==(o=null==(r=t[0])?void 0:r.find(l))?void 0:o.name)+"")&&_(a,s)},d(t){t&&I(a),t&&I(r),t&&I(o)}}}function ge(t){let e,n,a,r,o,s=t[2],l=[];for(let d=0;d<s.length;d+=1)l[d]=he(Mt(t,s,d));function c(e){t[23](e)}let i={labelText:"I wish to delete the above domains"};return void 0!==t[8]&&(i.checked=t[8]),a=new nt({props:i}),m.push((()=>p(a,"checked",c))),{c(){e=R("p");for(let t=0;t<l.length;t+=1)l[t].c();n=g(),h(a.$$.fragment),this.h()},l(t){e=j(t,"P",{class:!0});var r=V(e);for(let e=0;e<l.length;e+=1)l[e].l(r);r.forEach(I),n=w(t),v(a.$$.fragment,t),this.h()},h(){B(e,"class","block")},m(t,r){b(t,e,r);for(let n=0;n<l.length;n+=1)l[n].m(e,null);b(t,n,r),y(a,t,r),o=!0},p(t,n){if(5&n[0]){let a;for(s=t[2],a=0;a<s.length;a+=1){const r=Mt(t,s,a);l[a]?l[a].p(r,n):(l[a]=he(r),l[a].c(),l[a].m(e,null))}for(;a<l.length;a+=1)l[a].d(1);l.length=s.length}const o={};!r&&256&n[0]&&(r=!0,o.checked=t[8],x((()=>r=!1))),a.$set(o)},i(t){o||(E(a.$$.fragment,t),o=!0)},o(t){k(a.$$.fragment,t),o=!1},d(t){t&&I(e),J(l,t),t&&I(n),A(a,t)}}}function ve(t){let e,n,a,r,o,s;return e=new W({props:{title:"Confirm Deletion"}}),a=new K({props:{hasForm:!0,$$slots:{default:[ge]},$$scope:{ctx:t}}}),o=new Q({props:{danger:!0,primaryButtonText:"Delete Domains",secondaryButtonText:"Cancel",primaryButtonDisabled:!t[8]}}),{c(){h(e.$$.fragment),n=g(),h(a.$$.fragment),r=g(),h(o.$$.fragment)},l(t){v(e.$$.fragment,t),n=w(t),v(a.$$.fragment,t),r=w(t),v(o.$$.fragment,t)},m(t,l){y(e,t,l),b(t,n,l),y(a,t,l),b(t,r,l),y(o,t,l),s=!0},p(t,e){const n={};261&e[0]|4&e[1]&&(n.$$scope={dirty:e,ctx:t}),a.$set(n);const r={};256&e[0]&&(r.primaryButtonDisabled=!t[8]),o.$set(r)},i(t){s||(E(e.$$.fragment,t),E(a.$$.fragment,t),E(o.$$.fragment,t),s=!0)},o(t){k(e.$$.fragment,t),k(a.$$.fragment,t),k(o.$$.fragment,t),s=!1},d(t){A(e,t),t&&I(n),A(a,t),t&&I(r),A(o,t)}}}function we(t){let e,n,a,r,o,s,l;const c=[_t,Yt],i=[];function d(t,e){return t[1]?1:0}return e=d(t),n=i[e]=c[e](t),r=new Jt({props:{isOpen:t[4],isEdit:t[5],data:t[6]}}),r.$on("submit",t[20]),r.$on("close",t[21]),s=new z({props:{open:t[7],$$slots:{default:[ve]},$$scope:{ctx:t}}}),s.$on("submit",t[14]),s.$on("close",t[24]),{c(){n.c(),a=g(),h(r.$$.fragment),o=g(),h(s.$$.fragment)},l(t){n.l(t),a=w(t),v(r.$$.fragment,t),o=w(t),v(s.$$.fragment,t)},m(t,n){i[e].m(t,n),b(t,a,n),y(r,t,n),b(t,o,n),y(s,t,n),l=!0},p(t,o){let l=e;e=d(t),e===l?i[e].p(t,o):(q(),k(i[l],1,1,(()=>{i[l]=null})),F(),n=i[e],n?n.p(t,o):(n=i[e]=c[e](t),n.c()),E(n,1),n.m(a.parentNode,a));const $={};16&o[0]&&($.isOpen=t[4]),32&o[0]&&($.isEdit=t[5]),64&o[0]&&($.data=t[6]),r.$set($);const f={};128&o[0]&&(f.open=t[7]),261&o[0]|4&o[1]&&(f.$$scope={dirty:o,ctx:t}),s.$set(f)},i(t){l||(E(n),E(r.$$.fragment,t),E(s.$$.fragment,t),l=!0)},o(t){k(n),k(r.$$.fragment,t),k(s.$$.fragment,t),l=!1},d(t){i[e].d(t),t&&I(a),A(r,t),t&&I(o),A(s,t)}}}function ye(t){return t?`${t.from} → ${t.to}`:""}function be(t,e,n){let a;G(t,ft,(t=>n(9,a=t)));let{rows:r=[]}=e,{isLoading:o=!1}=e,s=[],l=[];let c,i=!1,d=!1,$=!1,f=!1;function u(t){if(l.includes(t))n(3,l=l.filter((e=>e!==t)));else{const e=[...l,t];n(3,l=Array.from(new Set(e)))}}function m(t){n(5,d=t),n(6,c=t?r.filter((t=>s.includes(t.id))):[{}]),n(4,i=!0)}function p(t){if(d){const e=t.detail.data;gt.dispatch(e)}else{const e=t.detail.data[0];pt.dispatch(e)}}return t.$$set=t=>{"rows"in t&&n(0,r=t.rows),"isLoading"in t&&n(1,o=t.isLoading)},[r,o,s,l,i,d,c,$,f,a,[{key:"name",value:"Name"},{key:"ipAddresses",value:"IP Addresses"},{key:"data",value:"Custom Data"},{key:"redirects",value:"Redirects"}],u,m,p,function(){n(7,$=!1),n(8,f=!1),vt.dispatch(s.map((t=>r.find((e=>e.id===t)).name))),n(2,s=[])},()=>m(!0),()=>n(7,$=!0),()=>m(!1),function(t){s=t,n(2,s)},t=>u(t.detail.id),t=>p(t),()=>n(4,i=!1),(t,e)=>e.id===t,function(t){f=t,n(8,f)},()=>n(7,$=!1)]}class xe extends i{constructor(t){super(),d(this,t,be,we,$,{rows:0,isLoading:1},null,[-1,-1])}}function Ee(t){let e,n,a,r,o,s,l,c,i,d,$,f,u,m,p,h,v,y,x,E,k,A,D,O,C,S,P,B,H;return{c(){e=R("h3"),n=N("Getting Started"),a=g(),r=R("p"),o=N("Configure the domains that you manage on behalf of your tenants. All domains automatically\n\t\t\thave TLS certificates."),s=g(),l=R("p"),c=N("Check a row to edit or delete 1 or more domains. Here are some things that you can configure\n\t\t\tfor a domain:"),i=g(),d=R("br"),$=g(),f=R("ul"),u=R("li"),m=R("b"),p=N("The IP Address of your backend service."),h=N(" If you enter more than 1, AppMasker will load\n\t\t\t\tbalance between them. Your tenants will need to create either a CNAME (for subdomains) or A/AAAA\n\t\t\t\t(for root domains) record pointed to xxx.xx.xx.x"),v=g(),y=R("li"),x=R("b"),E=N("Enter custom JSON data."),k=N(" You can query this data from our API later. Use it to adjust your\n\t\t\t\tapp's UI for the tenant or enable other dynamic functionality."),A=g(),D=R("li"),O=R("b"),C=N("Create Redirects."),S=N(" For example, you could have the "),P=R("code"),B=N("/logo"),H=N(" path for any\n\t\t\t\tdomain redirect to the tenant's logo (some url).")},l(t){e=j(t,"H3",{});var g=V(e);n=T(g,"Getting Started"),g.forEach(I),a=w(t),r=j(t,"P",{});var b=V(r);o=T(b,"Configure the domains that you manage on behalf of your tenants. All domains automatically\n\t\t\thave TLS certificates."),b.forEach(I),s=w(t),l=j(t,"P",{});var N=V(l);c=T(N,"Check a row to edit or delete 1 or more domains. Here are some things that you can configure\n\t\t\tfor a domain:"),N.forEach(I),i=w(t),d=j(t,"BR",{}),$=w(t),f=j(t,"UL",{});var R=V(f);u=j(R,"LI",{});var L=V(u);m=j(L,"B",{});var q=V(m);p=T(q,"The IP Address of your backend service."),q.forEach(I),h=T(L," If you enter more than 1, AppMasker will load\n\t\t\t\tbalance between them. Your tenants will need to create either a CNAME (for subdomains) or A/AAAA\n\t\t\t\t(for root domains) record pointed to xxx.xx.xx.x"),L.forEach(I),v=w(R),y=j(R,"LI",{});var F=V(y);x=j(F,"B",{});var J=V(x);E=T(J,"Enter custom JSON data."),J.forEach(I),k=T(F," You can query this data from our API later. Use it to adjust your\n\t\t\t\tapp's UI for the tenant or enable other dynamic functionality."),F.forEach(I),A=w(R),D=j(R,"LI",{});var M=V(D);O=j(M,"B",{});var U=V(O);C=T(U,"Create Redirects."),U.forEach(I),S=T(M," For example, you could have the "),P=j(M,"CODE",{});var Y=V(P);B=T(Y,"/logo"),Y.forEach(I),H=T(M," path for any\n\t\t\t\tdomain redirect to the tenant's logo (some url)."),M.forEach(I),R.forEach(I)},m(t,g){b(t,e,g),L(e,n),b(t,a,g),b(t,r,g),L(r,o),b(t,s,g),b(t,l,g),L(l,c),b(t,i,g),b(t,d,g),b(t,$,g),b(t,f,g),L(f,u),L(u,m),L(m,p),L(u,h),L(f,v),L(f,y),L(y,x),L(x,E),L(y,k),L(f,A),L(f,D),L(D,O),L(O,C),L(D,S),L(D,P),L(P,B),L(D,H)},d(t){t&&I(e),t&&I(a),t&&I(r),t&&I(s),t&&I(l),t&&I(i),t&&I(d),t&&I($),t&&I(f)}}}function ke(t){let e,n,a,r,o,s,l,c,i;return o=new ct({props:{$$slots:{default:[Ee]},$$scope:{ctx:t}}}),c=new xe({props:{rows:t[0].data.domains,isLoading:t[0].isLoading}}),{c(){e=R("h1"),n=N("Domains"),a=g(),r=R("div"),h(o.$$.fragment),s=g(),l=R("div"),h(c.$$.fragment),this.h()},l(t){e=j(t,"H1",{});var i=V(e);n=T(i,"Domains"),i.forEach(I),a=w(t),r=j(t,"DIV",{class:!0});var d=V(r);v(o.$$.fragment,d),d.forEach(I),s=w(t),l=j(t,"DIV",{class:!0});var $=V(l);v(c.$$.fragment,$),$.forEach(I),this.h()},h(){B(r,"class","block"),B(l,"class","block")},m(t,d){b(t,e,d),L(e,n),b(t,a,d),b(t,r,d),y(o,r,null),b(t,s,d),b(t,l,d),y(c,l,null),i=!0},p(t,[e]){const n={};2&e&&(n.$$scope={dirty:e,ctx:t}),o.$set(n);const a={};1&e&&(a.rows=t[0].data.domains),1&e&&(a.isLoading=t[0].isLoading),c.$set(a)},i(t){i||(E(o.$$.fragment,t),E(c.$$.fragment,t),i=!0)},o(t){k(o.$$.fragment,t),k(c.$$.fragment,t),i=!1},d(t){t&&I(e),t&&I(a),t&&I(r),A(o),t&&I(s),t&&I(l),A(c)}}}function Ae(t,e,n){let a;return G(t,$t,(t=>n(0,a=t))),it((()=>{ht.dispatch()})),[a]}export default class extends i{constructor(t){super(),d(this,t,Ae,ke,$,{})}}
