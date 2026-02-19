import{B as q,f as K,m as E,c as w,o as $,a2 as L,z as g,q as G,a3 as C,A as J,l as d,a as r,E as o,w as p,M as I,t as x,j as N,a4 as Q,a5 as W,i as A,a6 as X}from"./index-ClbwuvgW.js";import{u as Y}from"./department-BdgeOQz3.js";import{u as Z,s as ee,a as b,b as te,c as ae,d as ie}from"./index-BwztZg9L.js";import{s as ne}from"./index-LwmQ9GO6.js";import{s as y}from"./index-CO05eax1.js";import{s as re,a as S}from"./index-DmDW0EJB.js";import{s as oe}from"./index-F3f4gsKq.js";import{s as P}from"./index-CNnvIFhq.js";import{_ as le}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-B6u3Hjan.js";var se=`
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`,de={root:function(e){var l=e.instance,u=e.props;return["p-textarea p-component",{"p-filled":l.$filled,"p-textarea-resizable ":u.autoResize,"p-textarea-sm p-inputfield-sm":u.size==="small","p-textarea-lg p-inputfield-lg":u.size==="large","p-invalid":l.$invalid,"p-variant-filled":l.$variant==="filled","p-textarea-fluid":l.$fluid}]}},ce=q.extend({name:"textarea",style:se,classes:de}),ue={name:"BaseTextarea",extends:re,props:{autoResize:Boolean},style:ce,provide:function(){return{$pcTextarea:this,$parentInstance:this}}};function k(t){"@babel/helpers - typeof";return k=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},k(t)}function pe(t,e,l){return(e=fe(e))in t?Object.defineProperty(t,e,{value:l,enumerable:!0,configurable:!0,writable:!0}):t[e]=l,t}function fe(t){var e=me(t,"string");return k(e)=="symbol"?e:e+""}function me(t,e){if(k(t)!="object"||!t)return t;var l=t[Symbol.toPrimitive];if(l!==void 0){var u=l.call(t,e);if(k(u)!="object")return u;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var U={name:"Textarea",extends:ue,inheritAttrs:!1,observer:null,mounted:function(){var e=this;this.autoResize&&(this.observer=new ResizeObserver(function(){requestAnimationFrame(function(){e.resize()})}),this.observer.observe(this.$el))},updated:function(){this.autoResize&&this.resize()},beforeUnmount:function(){this.observer&&this.observer.disconnect()},methods:{resize:function(){if(this.$el.offsetParent){var e=this.$el.style.height,l=parseInt(e)||0,u=this.$el.scrollHeight,v=!l||u>l,f=l&&u<l;f?(this.$el.style.height="auto",this.$el.style.height="".concat(this.$el.scrollHeight,"px")):v&&(this.$el.style.height="".concat(u,"px"))}},onInput:function(e){this.autoResize&&this.resize(),this.writeValue(e.target.value,e)}},computed:{attrs:function(){return E(this.ptmi("root",{context:{filled:this.$filled,disabled:this.disabled}}),this.formField)},dataP:function(){return K(pe({invalid:this.$invalid,fluid:this.$fluid,filled:this.$variant==="filled"},this.size,this.size))}}},ve=["value","name","disabled","aria-invalid","data-p"];function be(t,e,l,u,v,f){return $(),w("textarea",E({class:t.cx("root"),value:t.d_value,name:t.name,disabled:t.disabled,"aria-invalid":t.invalid||void 0,"data-p":f.dataP,onInput:e[0]||(e[0]=function(){return f.onInput&&f.onInput.apply(f,arguments)})},f.attrs),null,16,ve)}U.render=be;const he={class:"departments-page"},ge={class:"page-header"},xe={class:"table-header"},ye={class:"action-buttons"},we={class:"form-field"},$e={key:0,class:"p-error"},ke={class:"form-field"},De={key:0,class:"p-error"},ze={class:"form-field"},Ae={key:0,class:"form-field"},Se={class:"flex align-items-center gap-2"},Ve={__name:"index",setup(t){const e=Y(),l=L(),{confirmDelete:u}=Z(),v=g(!1),f=g(!1),h=g(!1),m=g(null),D=g({global:{value:null,matchMode:X.CONTAINS}}),T=G(()=>e.departments),i=C({code:"",name:"",description:"",isActive:!0}),c=C({code:"",name:""}),O=s=>s?new Date(s).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):"-",M=()=>{i.code="",i.name="",i.description="",i.isActive=!0,Object.keys(c).forEach(s=>c[s]="")},j=()=>{m.value=null,M(),h.value=!0},B=s=>{m.value=s,i.code=s.code,i.name=s.name,i.description=s.description||"",i.isActive=s.isActive,Object.keys(c).forEach(a=>c[a]=""),h.value=!0},V=()=>{h.value=!1,m.value=null},F=()=>{let s=!0;return Object.keys(c).forEach(a=>c[a]=""),i.code.trim()||(c.code="Code is required",s=!1),i.name.trim()||(c.name="Name is required",s=!1),s},_=async()=>{if(F()){f.value=!0;try{m.value?(await e.updateDepartment(m.value.id,{name:i.name,description:i.description,isActive:i.isActive}),l.success("Department updated successfully")):(await e.createDepartment({code:i.code,name:i.name,description:i.description}),l.success("Department created successfully")),V()}catch(s){l.error(s.response?.data?.message||"Operation failed")}finally{f.value=!1}}},R=async s=>{if(await u(s.name))try{await e.deleteDepartment(s.id),l.success("Department deleted successfully")}catch(z){l.error(z.response?.data?.message||"Delete failed")}};return J(async()=>{v.value=!0;try{await e.fetchDepartments()}finally{v.value=!1}}),(s,a)=>{const z=Q;return $(),w("div",he,[d("div",ge,[a[7]||(a[7]=d("div",null,[d("h1",null,"Department Management"),d("p",{class:"page-subtitle"},"Manage organizational departments")],-1)),r(o(y),{label:"Add Department",icon:"pi pi-plus",onClick:j})]),r(o(ne),null,{content:p(()=>[r(o(ee),{value:T.value,loading:v.value,paginator:"",rows:10,rowsPerPageOptions:[5,10,25,50],dataKey:"id",filterDisplay:"row",filters:D.value,"onUpdate:filters":a[1]||(a[1]=n=>D.value=n),globalFilterFields:["code","name"],responsiveLayout:"scroll",class:"departments-table"},{header:p(()=>[d("div",xe,[r(o(te),null,{default:p(()=>[r(o(ae),{class:"pi pi-search"}),r(o(S),{modelValue:D.value.global.value,"onUpdate:modelValue":a[0]||(a[0]=n=>D.value.global.value=n),placeholder:"Search departments..."},null,8,["modelValue"])]),_:1})])]),empty:p(()=>[...a[8]||(a[8]=[d("div",{class:"table-empty"},[d("i",{class:"pi pi-building"}),d("span",null,"No departments found")],-1)])]),default:p(()=>[r(o(b),{field:"code",header:"Code",sortable:"",style:{"min-width":"120px"}},{body:p(({data:n})=>[r(o(P),{value:n.code,severity:"secondary"},null,8,["value"])]),_:1}),r(o(b),{field:"name",header:"Name",sortable:"",style:{"min-width":"200px"}}),r(o(b),{field:"description",header:"Description",style:{"min-width":"300px"}},{body:p(({data:n})=>[I(x(n.description||"-"),1)]),_:1}),r(o(b),{field:"isActive",header:"Status",sortable:"",style:{"min-width":"100px"}},{body:p(({data:n})=>[r(o(P),{value:n.isActive?"Active":"Inactive",severity:n.isActive?"success":"secondary"},null,8,["value","severity"])]),_:1}),r(o(b),{field:"createdAt",header:"Created",sortable:"",style:{"min-width":"150px"}},{body:p(({data:n})=>[I(x(O(n.createdAt)),1)]),_:1}),r(o(b),{header:"Actions",style:{"min-width":"120px"}},{body:p(({data:n})=>[d("div",ye,[N(r(o(y),{icon:"pi pi-pencil",text:"",rounded:"",severity:"info",onClick:H=>B(n)},null,8,["onClick"]),[[z,"Edit",void 0,{top:!0}]]),N(r(o(y),{icon:"pi pi-trash",text:"",rounded:"",severity:"danger",onClick:H=>R(n)},null,8,["onClick"]),[[z,"Delete",void 0,{top:!0}]])])]),_:1})]),_:1},8,["value","loading","filters"])]),_:1}),r(o(oe),{visible:h.value,"onUpdate:visible":a[6]||(a[6]=n=>h.value=n),header:m.value?"Edit Department":"Create Department",style:{width:"500px"},modal:"",class:"department-dialog"},{footer:p(()=>[r(o(y),{label:"Cancel",text:"",onClick:V}),r(o(y),{label:m.value?"Update":"Create",loading:f.value,onClick:_},null,8,["label","loading"])]),default:p(()=>[d("form",{onSubmit:W(_,["prevent"]),class:"dialog-form"},[d("div",we,[a[9]||(a[9]=d("label",{for:"code"},"Code *",-1)),r(o(S),{id:"code",modelValue:i.code,"onUpdate:modelValue":a[2]||(a[2]=n=>i.code=n),disabled:!!m.value,invalid:!!c.code,class:"w-full",placeholder:"e.g., IT, HR, FIN"},null,8,["modelValue","disabled","invalid"]),c.code?($(),w("small",$e,x(c.code),1)):A("",!0)]),d("div",ke,[a[10]||(a[10]=d("label",{for:"name"},"Name *",-1)),r(o(S),{id:"name",modelValue:i.name,"onUpdate:modelValue":a[3]||(a[3]=n=>i.name=n),invalid:!!c.name,class:"w-full",placeholder:"e.g., Information Technology"},null,8,["modelValue","invalid"]),c.name?($(),w("small",De,x(c.name),1)):A("",!0)]),d("div",ze,[a[11]||(a[11]=d("label",{for:"description"},"Description",-1)),r(o(U),{id:"description",modelValue:i.description,"onUpdate:modelValue":a[4]||(a[4]=n=>i.description=n),rows:"3",class:"w-full",placeholder:"Optional description..."},null,8,["modelValue"])]),m.value?($(),w("div",Ae,[a[12]||(a[12]=d("label",{for:"isActive"},"Status",-1)),d("div",Se,[r(o(ie),{id:"isActive",modelValue:i.isActive,"onUpdate:modelValue":a[5]||(a[5]=n=>i.isActive=n)},null,8,["modelValue"]),d("span",null,x(i.isActive?"Active":"Inactive"),1)])])):A("",!0)],32)]),_:1},8,["visible","header"])])}}},je=le(Ve,[["__scopeId","data-v-b2b74081"]]);export{je as default};
