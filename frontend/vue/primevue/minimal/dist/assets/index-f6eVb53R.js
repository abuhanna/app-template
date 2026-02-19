import{a as J}from"./index-DL4gDugQ.js";import{B as K,m as q,p as R,c as v,o as m,g as b,v as N,q as Z,a0 as G,a1 as H,l as c,Z as Q,a as r,j as d,L as g,t as u,f as o,a2 as W}from"./index-D462s2qb.js";import{s as X}from"./index-CDpYWBTz.js";import{s as Y,a as ee,b as te,c as ne,d as ie}from"./index-CPCASWUx.js";import{s as oe}from"./index-DA-YKbrC.js";import{a as re}from"./index-ggVQrxbj.js";import{s as le}from"./index-Capuxi7Q.js";import"./index-DKTsTgk9.js";var ae=`
    .p-divider-horizontal {
        display: flex;
        width: 100%;
        position: relative;
        align-items: center;
        margin: dt('divider.horizontal.margin');
        padding: dt('divider.horizontal.padding');
    }

    .p-divider-horizontal:before {
        position: absolute;
        display: block;
        inset-block-start: 50%;
        inset-inline-start: 0;
        width: 100%;
        content: '';
        border-block-start: 1px solid dt('divider.border.color');
    }

    .p-divider-horizontal .p-divider-content {
        padding: dt('divider.horizontal.content.padding');
    }

    .p-divider-vertical {
        min-height: 100%;
        display: flex;
        position: relative;
        justify-content: center;
        margin: dt('divider.vertical.margin');
        padding: dt('divider.vertical.padding');
    }

    .p-divider-vertical:before {
        position: absolute;
        display: block;
        inset-block-start: 0;
        inset-inline-start: 50%;
        height: 100%;
        content: '';
        border-inline-start: 1px solid dt('divider.border.color');
    }

    .p-divider.p-divider-vertical .p-divider-content {
        padding: dt('divider.vertical.content.padding');
    }

    .p-divider-content {
        z-index: 1;
        background: dt('divider.content.background');
        color: dt('divider.content.color');
    }

    .p-divider-solid.p-divider-horizontal:before {
        border-block-start-style: solid;
    }

    .p-divider-solid.p-divider-vertical:before {
        border-inline-start-style: solid;
    }

    .p-divider-dashed.p-divider-horizontal:before {
        border-block-start-style: dashed;
    }

    .p-divider-dashed.p-divider-vertical:before {
        border-inline-start-style: dashed;
    }

    .p-divider-dotted.p-divider-horizontal:before {
        border-block-start-style: dotted;
    }

    .p-divider-dotted.p-divider-vertical:before {
        border-inline-start-style: dotted;
    }

    .p-divider-left:dir(rtl),
    .p-divider-right:dir(rtl) {
        flex-direction: row-reverse;
    }
`,se={root:function(i){var e=i.props;return{justifyContent:e.layout==="horizontal"?e.align==="center"||e.align===null?"center":e.align==="left"?"flex-start":e.align==="right"?"flex-end":null:null,alignItems:e.layout==="vertical"?e.align==="center"||e.align===null?"center":e.align==="top"?"flex-start":e.align==="bottom"?"flex-end":null:null}}},de={root:function(i){var e=i.props;return["p-divider p-component","p-divider-"+e.layout,"p-divider-"+e.type,{"p-divider-left":e.layout==="horizontal"&&(!e.align||e.align==="left")},{"p-divider-center":e.layout==="horizontal"&&e.align==="center"},{"p-divider-right":e.layout==="horizontal"&&e.align==="right"},{"p-divider-top":e.layout==="vertical"&&e.align==="top"},{"p-divider-center":e.layout==="vertical"&&(!e.align||e.align==="center")},{"p-divider-bottom":e.layout==="vertical"&&e.align==="bottom"}]},content:"p-divider-content"},ue=K.extend({name:"divider",style:ae,classes:de,inlineStyles:se}),pe={name:"BaseDivider",extends:q,props:{align:{type:String,default:null},layout:{type:String,default:"horizontal"},type:{type:String,default:"solid"}},style:ue,provide:function(){return{$pcDivider:this,$parentInstance:this}}};function h(t){"@babel/helpers - typeof";return h=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(i){return typeof i}:function(i){return i&&typeof Symbol=="function"&&i.constructor===Symbol&&i!==Symbol.prototype?"symbol":typeof i},h(t)}function D(t,i,e){return(i=ce(i))in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}function ce(t){var i=ve(t,"string");return h(i)=="symbol"?i:i+""}function ve(t,i){if(h(t)!="object"||!t)return t;var e=t[Symbol.toPrimitive];if(e!==void 0){var y=e.call(t,i);if(h(y)!="object")return y;throw new TypeError("@@toPrimitive must return a primitive value.")}return(i==="string"?String:Number)(t)}var P={name:"Divider",extends:pe,inheritAttrs:!1,computed:{dataP:function(){return R(D(D(D({},this.align,this.align),this.layout,this.layout),this.type,this.type))}}},me=["aria-orientation","data-p"],ye=["data-p"];function fe(t,i,e,y,_,p){return m(),v("div",N({class:t.cx("root"),style:t.sx("root"),role:"separator","aria-orientation":t.layout,"data-p":p.dataP},t.ptmi("root")),[t.$slots.default?(m(),v("div",N({key:0,class:t.cx("content"),"data-p":p.dataP},t.ptm("content")),[Z(t.$slots,"default")],16,ye)):b("",!0)],16,me)}P.render=fe;async function ge(t={}){const{data:i}=await G.get("/audit-logs",{params:t});return i}const be={class:"p-4"},he={class:"flex flex-wrap align-items-center justify-content-between gap-3 mb-4"},_e={class:"flex flex-wrap gap-2"},we={key:0,class:"flex flex-column gap-3"},xe={class:"grid"},ke={class:"col-6"},$e={class:"col-6"},Se={class:"col-6"},De={class:"col-6"},Ce={class:"col-12"},Ve={key:0},Ie={class:"surface-100 p-3 border-round mt-2",style:{"overflow-x":"auto"}},ze={style:{margin:"0","white-space":"pre-wrap"}},Ne={key:1},Pe={class:"surface-100 p-3 border-round mt-2",style:{"overflow-x":"auto"}},Ae={style:{margin:"0","white-space":"pre-wrap"}},Fe={key:2},Ue={class:"surface-100 p-3 border-round mt-2"},Te={style:{margin:"0"}},Re={__name:"index",setup(t){const i=H(),e=c(!1),y=c([]),_=c({global:{value:null,matchMode:W.CONTAINS}}),p=c(null),w=c(null),A=["User","Department","UploadedFile"],F=["Created","Updated","Deleted"];async function $(){e.value=!0;try{const a={};p.value&&(a.entityName=p.value),w.value&&(a.action=w.value);const n=await ge(a);y.value=n.items||[]}catch{i.add({severity:"error",summary:"Error",detail:"Failed to load audit logs",life:3e3})}finally{e.value=!1}}function C(a){return a?new Date(a).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function V(a){switch(a?.toLowerCase()){case"created":return"success";case"updated":return"info";case"deleted":return"danger";default:return"secondary"}}function S(a){if(!a)return null;try{return JSON.stringify(JSON.parse(a),null,2)}catch{return a}}const x=c(!1),s=c(null);function U(a){s.value=a,x.value=!0}return Q(()=>{$()}),(a,n)=>{const I=te,T=ie,E=le,L=ne,k=re,f=ee,z=oe,O=Y,B=X,j=P,M=J;return m(),v("div",be,[r(B,null,{content:d(()=>[r(O,{value:y.value,loading:e.value,filters:_.value,globalFilterFields:["entityName","entityId","action"],paginator:"",rows:10,rowsPerPageOptions:[5,10,25,50],stripedRows:"",dataKey:"id"},{header:d(()=>[o("div",he,[o("div",_e,[r(I,{modelValue:p.value,"onUpdate:modelValue":n[0]||(n[0]=l=>p.value=l),options:A,placeholder:"Filter by Entity",showClear:"",class:"w-12rem"},null,8,["modelValue"]),r(I,{modelValue:w.value,"onUpdate:modelValue":n[1]||(n[1]=l=>w.value=l),options:F,placeholder:"Filter by Action",showClear:"",class:"w-12rem"},null,8,["modelValue"]),r(L,null,{default:d(()=>[r(T,{class:"pi pi-search"}),r(E,{modelValue:_.value.global.value,"onUpdate:modelValue":n[2]||(n[2]=l=>_.value.global.value=l),placeholder:"Search..."},null,8,["modelValue"])]),_:1}),r(k,{label:"Apply",icon:"pi pi-filter",onClick:$,text:""}),r(k,{icon:"pi pi-refresh",text:"",rounded:"",onClick:$,loading:e.value},null,8,["loading"])])])]),empty:d(()=>[...n[5]||(n[5]=[o("div",{class:"flex flex-column align-items-center py-5 text-color-secondary"},[o("i",{class:"pi pi-history text-5xl mb-3"}),o("span",null,"No audit logs found")],-1)])]),default:d(()=>[r(f,{field:"entityName",header:"Entity",sortable:"",style:{"min-width":"120px"}}),r(f,{field:"entityId",header:"Entity ID",sortable:"",style:{"min-width":"100px"}}),r(f,{field:"action",header:"Action",sortable:"",style:{"min-width":"100px"}},{body:d(({data:l})=>[r(z,{value:l.action,severity:V(l.action)},null,8,["value","severity"])]),_:1}),r(f,{field:"userId",header:"User ID",sortable:"",style:{"min-width":"100px"}},{body:d(({data:l})=>[g(u(l.userId||"-"),1)]),_:1}),r(f,{field:"timestamp",header:"Timestamp",sortable:"",style:{"min-width":"180px"}},{body:d(({data:l})=>[g(u(C(l.timestamp)),1)]),_:1}),r(f,{header:"Details",style:{"min-width":"80px"}},{body:d(({data:l})=>[r(k,{icon:"pi pi-eye",text:"",rounded:"",onClick:Ee=>U(l)},null,8,["onClick"])]),_:1})]),_:1},8,["value","loading","filters"])]),_:1}),r(M,{visible:x.value,"onUpdate:visible":n[4]||(n[4]=l=>x.value=l),header:"Audit Log Details",style:{width:"50rem"},modal:""},{footer:d(()=>[r(k,{label:"Close",onClick:n[3]||(n[3]=l=>x.value=!1)})]),default:d(()=>[s.value?(m(),v("div",we,[o("div",xe,[o("div",ke,[n[6]||(n[6]=o("strong",null,"Entity:",-1)),g(" "+u(s.value.entityName),1)]),o("div",$e,[n[7]||(n[7]=o("strong",null,"Entity ID:",-1)),g(" "+u(s.value.entityId),1)]),o("div",Se,[n[8]||(n[8]=o("strong",null,"Action:",-1)),r(z,{value:s.value.action,severity:V(s.value.action),class:"ml-2"},null,8,["value","severity"])]),o("div",De,[n[9]||(n[9]=o("strong",null,"User ID:",-1)),g(" "+u(s.value.userId||"-"),1)]),o("div",Ce,[n[10]||(n[10]=o("strong",null,"Timestamp:",-1)),g(" "+u(C(s.value.timestamp)),1)])]),r(j),s.value.oldValues?(m(),v("div",Ve,[n[11]||(n[11]=o("strong",null,"Old Values:",-1)),o("div",Ie,[o("pre",ze,u(S(s.value.oldValues)),1)])])):b("",!0),s.value.newValues?(m(),v("div",Ne,[n[12]||(n[12]=o("strong",null,"New Values:",-1)),o("div",Pe,[o("pre",Ae,u(S(s.value.newValues)),1)])])):b("",!0),s.value.affectedColumns?(m(),v("div",Fe,[n[13]||(n[13]=o("strong",null,"Affected Columns:",-1)),o("div",Ue,[o("pre",Te,u(S(s.value.affectedColumns)),1)])])):b("",!0)])):b("",!0)]),_:1},8,["visible"])])}}};export{Re as default};
