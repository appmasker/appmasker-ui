import{r as t}from"./singletons-bb9012b7.js";const o=async function(o,n){return t.goto(o,n,[])};const n="http://localhost:3000",r="price_1JiUwOHZNZE3BaVXJsloqnt8",s=(t,n="GET",r)=>fetch(`http://localhost:3000${t}`,{method:n,body:r?JSON.stringify(r):void 0,credentials:"include",redirect:"follow",headers:{"Content-Type":"application/json"}}).then((async t=>{const n=await(null==t?void 0:t.json())||{};if(401===t.status&&!location.href.includes("/auth"))return o("/auth");if(t.ok)return n;throw new Error((null==n?void 0:n.message)||"An error occurred")}));export{n as B,r as a,s as b,o as g};
