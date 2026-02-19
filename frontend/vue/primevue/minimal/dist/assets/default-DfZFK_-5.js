import{u as Oe,b as X,d as ee,e as z,r as M,c as s,o,f as u,g as b,F as A,h as T,n as w,w as q,T as Se,i as g,j as v,t as I,k as Ee,l as B,s as Ae,B as R,m as _,p as te,q as P,v as c,x as K,y as ae,R as se,Y as le,C as ce,D as ue,z as J,A as j,S as de,E as U,G as Z,H as ne,I as ze,J as pe,a as m,K as me,L as fe,_ as Pe,M as Me,N as ie,O as Be,W as xe,P as L,Q as be,U as Te,V as W,X as G,Z as Ke,$ as _e}from"./index-D462s2qb.js";import{u as he}from"./persistentNotification-DWcvnp6G.js";import{_ as F}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{s as ve,a as x}from"./index-ggVQrxbj.js";import{O as $}from"./index-DKTsTgk9.js";import{F as De,s as je,a as Re}from"./index-DL4gDugQ.js";const Fe=[{label:"Notifications",path:"/notifications",icon:"pi pi-bell"},{label:"Files",path:"/files",icon:"pi pi-file",roles:["Admin"],section:"Administration"},{label:"Audit Logs",path:"/audit-logs",icon:"pi pi-history",roles:["Admin"],section:"Administration"}];function He(e,t){return e.filter(n=>!n.roles||n.roles.length===0?!0:t&&n.roles.includes(t))}function Ue(e){const t=new Map;return e.forEach(n=>{const r=n.section;t.has(r)||t.set(r,[]),t.get(r).push(n)}),t}const $e={class:"sidebar-header"},Ne={class:"logo-container"},Ve={key:0,class:"logo-text"},Ze={class:"sidebar-nav"},We={class:"nav-list"},Ye={key:0},qe={key:0,class:"nav-section-title"},Je={class:"nav-list"},Ge={key:0},Qe={__name:"AppSidebar",props:{visible:{default:!0},visibleModifiers:{}},emits:["update:visible"],setup(e){const t=Oe(e,"visible"),n=X(),r=ee(),a=z(()=>He(Fe,r.user?.role)),i=z(()=>Ue(a.value)),p=z(()=>i.value.get(void 0)||[]),f=z(()=>Array.from(i.value.entries()).filter(([d])=>d!==void 0)),l=d=>n.path===d||n.path.startsWith(d+"/");return(d,C)=>{const h=M("router-link"),y=Se;return o(),s("aside",{class:w(["app-sidebar",{collapsed:!t.value}])},[u("div",$e,[u("div",Ne,[C[0]||(C[0]=u("i",{class:"pi pi-box logo-icon"},null,-1)),t.value?(o(),s("span",Ve,"AppTemplate")):b("",!0)])]),u("nav",Ze,[u("ul",We,[(o(!0),s(A,null,T(p.value,k=>(o(),s("li",{key:k.path},[q((o(),g(h,{to:k.path,class:w(["nav-item",{active:l(k.path)}])},{default:v(()=>[u("i",{class:w(k.icon)},null,2),t.value?(o(),s("span",Ye,I(k.label),1)):b("",!0)]),_:2},1032,["to","class"])),[[y,{value:k.label,disabled:t.value},void 0,{right:!0}]])]))),128))]),(o(!0),s(A,null,T(f.value,([k,S])=>(o(),s("div",{key:k,class:"nav-section"},[t.value?(o(),s("span",qe,I(k),1)):b("",!0),u("ul",Je,[(o(!0),s(A,null,T(S,O=>(o(),s("li",{key:O.path},[q((o(),g(h,{to:O.path,class:w(["nav-item",{active:l(O.path)}])},{default:v(()=>[u("i",{class:w(O.icon)},null,2),t.value?(o(),s("span",Ge,I(O.label),1)):b("",!0)]),_:2},1032,["to","class"])),[[y,{value:O.label,disabled:t.value},void 0,{right:!0}]])]))),128))])]))),128))])],2)}}},Xe=F(Qe,[["__scopeId","data-v-fda62dc3"]]),et=Ee("locale",()=>{const e=B(localStorage.getItem("locale")||"en"),t=z(()=>e.value==="ar"),n=[{code:"en",name:"English",flag:"🇺🇸"},{code:"ar",name:"العربية",flag:"🇸🇦"}];function r(a){e.value=a,Ae(a)}return{locale:e,isRTL:t,availableLocales:n,setLocale:r}});var tt=`
    .p-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: dt('avatar.width');
        height: dt('avatar.height');
        font-size: dt('avatar.font.size');
        background: dt('avatar.background');
        color: dt('avatar.color');
        border-radius: dt('avatar.border.radius');
    }

    .p-avatar-image {
        background: transparent;
    }

    .p-avatar-circle {
        border-radius: 50%;
    }

    .p-avatar-circle img {
        border-radius: 50%;
    }

    .p-avatar-icon {
        font-size: dt('avatar.icon.size');
        width: dt('avatar.icon.size');
        height: dt('avatar.icon.size');
    }

    .p-avatar img {
        width: 100%;
        height: 100%;
    }

    .p-avatar-lg {
        width: dt('avatar.lg.width');
        height: dt('avatar.lg.width');
        font-size: dt('avatar.lg.font.size');
    }

    .p-avatar-lg .p-avatar-icon {
        font-size: dt('avatar.lg.icon.size');
        width: dt('avatar.lg.icon.size');
        height: dt('avatar.lg.icon.size');
    }

    .p-avatar-xl {
        width: dt('avatar.xl.width');
        height: dt('avatar.xl.width');
        font-size: dt('avatar.xl.font.size');
    }

    .p-avatar-xl .p-avatar-icon {
        font-size: dt('avatar.xl.icon.size');
        width: dt('avatar.xl.icon.size');
        height: dt('avatar.xl.icon.size');
    }

    .p-avatar-group {
        display: flex;
        align-items: center;
    }

    .p-avatar-group .p-avatar + .p-avatar {
        margin-inline-start: dt('avatar.group.offset');
    }

    .p-avatar-group .p-avatar {
        border: 2px solid dt('avatar.group.border.color');
    }

    .p-avatar-group .p-avatar-lg + .p-avatar-lg {
        margin-inline-start: dt('avatar.lg.group.offset');
    }

    .p-avatar-group .p-avatar-xl + .p-avatar-xl {
        margin-inline-start: dt('avatar.xl.group.offset');
    }
`,nt={root:function(t){var n=t.props;return["p-avatar p-component",{"p-avatar-image":n.image!=null,"p-avatar-circle":n.shape==="circle","p-avatar-lg":n.size==="large","p-avatar-xl":n.size==="xlarge"}]},label:"p-avatar-label",icon:"p-avatar-icon"},it=R.extend({name:"avatar",style:tt,classes:nt}),ot={name:"BaseAvatar",extends:_,props:{label:{type:String,default:null},icon:{type:String,default:null},image:{type:String,default:null},size:{type:String,default:"normal"},shape:{type:String,default:"square"},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:it,provide:function(){return{$pcAvatar:this,$parentInstance:this}}};function N(e){"@babel/helpers - typeof";return N=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},N(e)}function oe(e,t,n){return(t=rt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function rt(e){var t=at(e,"string");return N(t)=="symbol"?t:t+""}function at(e,t){if(N(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(N(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var ge={name:"Avatar",extends:ot,inheritAttrs:!1,emits:["error"],methods:{onError:function(t){this.$emit("error",t)}},computed:{dataP:function(){return te(oe(oe({},this.shape,this.shape),this.size,this.size))}}},st=["aria-labelledby","aria-label","data-p"],lt=["data-p"],ct=["data-p"],ut=["src","alt","data-p"];function dt(e,t,n,r,a,i){return o(),s("div",c({class:e.cx("root"),"aria-labelledby":e.ariaLabelledby,"aria-label":e.ariaLabel},e.ptmi("root"),{"data-p":i.dataP}),[P(e.$slots,"default",{},function(){return[e.label?(o(),s("span",c({key:0,class:e.cx("label")},e.ptm("label"),{"data-p":i.dataP}),I(e.label),17,lt)):e.$slots.icon?(o(),g(K(e.$slots.icon),{key:1,class:w(e.cx("icon"))},null,8,["class"])):e.icon?(o(),s("span",c({key:2,class:[e.cx("icon"),e.icon]},e.ptm("icon"),{"data-p":i.dataP}),null,16,ct)):e.image?(o(),s("img",c({key:3,src:e.image,alt:e.ariaLabel,onError:t[0]||(t[0]=function(){return i.onError&&i.onError.apply(i,arguments)})},e.ptm("image"),{"data-p":i.dataP}),null,16,ut)):b("",!0)]})],16,st)}ge.render=dt;var pt=`
    .p-menu {
        background: dt('menu.background');
        color: dt('menu.color');
        border: 1px solid dt('menu.border.color');
        border-radius: dt('menu.border.radius');
        min-width: 12.5rem;
    }

    .p-menu-list {
        margin: 0;
        padding: dt('menu.list.padding');
        outline: 0 none;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('menu.list.gap');
    }

    .p-menu-item-content {
        transition:
            background dt('menu.transition.duration'),
            color dt('menu.transition.duration');
        border-radius: dt('menu.item.border.radius');
        color: dt('menu.item.color');
        overflow: hidden;
    }

    .p-menu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('menu.item.padding');
        gap: dt('menu.item.gap');
        user-select: none;
        outline: 0 none;
    }

    .p-menu-item-label {
        line-height: 1;
    }

    .p-menu-item-icon {
        color: dt('menu.item.icon.color');
    }

    .p-menu-item.p-focus .p-menu-item-content {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item.p-focus .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-overlay {
        box-shadow: dt('menu.shadow');
    }

    .p-menu-submenu-label {
        background: dt('menu.submenu.label.background');
        padding: dt('menu.submenu.label.padding');
        color: dt('menu.submenu.label.color');
        font-weight: dt('menu.submenu.label.font.weight');
    }

    .p-menu-separator {
        border-block-start: 1px solid dt('menu.separator.border.color');
    }
`,mt={root:function(t){var n=t.props;return["p-menu p-component",{"p-menu-overlay":n.popup}]},start:"p-menu-start",list:"p-menu-list",submenuLabel:"p-menu-submenu-label",separator:"p-menu-separator",end:"p-menu-end",item:function(t){var n=t.instance;return["p-menu-item",{"p-focus":n.id===n.focusedOptionId,"p-disabled":n.disabled()}]},itemContent:"p-menu-item-content",itemLink:"p-menu-item-link",itemIcon:"p-menu-item-icon",itemLabel:"p-menu-item-label"},ft=R.extend({name:"menu",style:pt,classes:mt}),bt={name:"BaseMenu",extends:_,props:{popup:{type:Boolean,default:!1},model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},tabindex:{type:Number,default:0},ariaLabel:{type:String,default:null},ariaLabelledby:{type:String,default:null}},style:ft,provide:function(){return{$pcMenu:this,$parentInstance:this}}},ye={name:"Menuitem",hostName:"Menu",extends:_,inheritAttrs:!1,emits:["item-click","item-mousemove"],props:{item:null,templates:null,id:null,focusedOptionId:null,index:null},methods:{getItemProp:function(t,n){return t&&t.item?ze(t.item[n]):void 0},getPTOptions:function(t){return this.ptm(t,{context:{item:this.item,index:this.index,focused:this.isItemFocused(),disabled:this.disabled()}})},isItemFocused:function(){return this.focusedOptionId===this.id},onItemClick:function(t){var n=this.getItemProp(this.item,"command");n&&n({originalEvent:t,item:this.item.item}),this.$emit("item-click",{originalEvent:t,item:this.item,id:this.id})},onItemMouseMove:function(t){this.$emit("item-mousemove",{originalEvent:t,item:this.item,id:this.id})},visible:function(){return typeof this.item.visible=="function"?this.item.visible():this.item.visible!==!1},disabled:function(){return typeof this.item.disabled=="function"?this.item.disabled():this.item.disabled},label:function(){return typeof this.item.label=="function"?this.item.label():this.item.label},getMenuItemProps:function(t){return{action:c({class:this.cx("itemLink"),tabindex:"-1"},this.getPTOptions("itemLink")),icon:c({class:[this.cx("itemIcon"),t.icon]},this.getPTOptions("itemIcon")),label:c({class:this.cx("itemLabel")},this.getPTOptions("itemLabel"))}}},computed:{dataP:function(){return te({focus:this.isItemFocused(),disabled:this.disabled()})}},directives:{ripple:se}},ht=["id","aria-label","aria-disabled","data-p-focused","data-p-disabled","data-p"],vt=["data-p"],gt=["href","target"],yt=["data-p"],kt=["data-p"];function Lt(e,t,n,r,a,i){var p=pe("ripple");return i.visible()?(o(),s("li",c({key:0,id:n.id,class:[e.cx("item"),n.item.class],role:"menuitem",style:n.item.style,"aria-label":i.label(),"aria-disabled":i.disabled(),"data-p-focused":i.isItemFocused(),"data-p-disabled":i.disabled()||!1,"data-p":i.dataP},i.getPTOptions("item")),[u("div",c({class:e.cx("itemContent"),onClick:t[0]||(t[0]=function(f){return i.onItemClick(f)}),onMousemove:t[1]||(t[1]=function(f){return i.onItemMouseMove(f)}),"data-p":i.dataP},i.getPTOptions("itemContent")),[n.templates.item?n.templates.item?(o(),g(K(n.templates.item),{key:1,item:n.item,label:i.label(),props:i.getMenuItemProps(n.item)},null,8,["item","label","props"])):b("",!0):q((o(),s("a",c({key:0,href:n.item.url,class:e.cx("itemLink"),target:n.item.target,tabindex:"-1"},i.getPTOptions("itemLink")),[n.templates.itemicon?(o(),g(K(n.templates.itemicon),{key:0,item:n.item,class:w(e.cx("itemIcon"))},null,8,["item","class"])):n.item.icon?(o(),s("span",c({key:1,class:[e.cx("itemIcon"),n.item.icon],"data-p":i.dataP},i.getPTOptions("itemIcon")),null,16,yt)):b("",!0),u("span",c({class:e.cx("itemLabel"),"data-p":i.dataP},i.getPTOptions("itemLabel")),I(i.label()),17,kt)],16,gt)),[[p]])],16,vt)],16,ht)):b("",!0)}ye.render=Lt;function re(e){return Ot(e)||Ct(e)||It(e)||wt()}function wt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function It(e,t){if(e){if(typeof e=="string")return Q(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Q(e,t):void 0}}function Ct(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Ot(e){if(Array.isArray(e))return Q(e)}function Q(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var Y={name:"Menu",extends:bt,inheritAttrs:!1,emits:["show","hide","focus","blur"],data:function(){return{overlayVisible:!1,focused:!1,focusedOptionIndex:-1,selectedOptionIndex:-1}},target:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,list:null,mounted:function(){this.popup||(this.bindResizeListener(),this.bindOutsideClickListener())},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.target=null,this.container&&this.autoZIndex&&j.clear(this.container),this.container=null},methods:{itemClick:function(t){var n=t.item;this.disabled(n)||(n.command&&n.command(t),this.overlayVisible&&this.hide(),!this.popup&&this.focusedOptionIndex!==t.id&&(this.focusedOptionIndex=t.id))},itemMouseMove:function(t){this.focused&&(this.focusedOptionIndex=t.id)},onListFocus:function(t){this.focused=!0,!this.popup&&this.changeFocusedOptionIndex(0),this.$emit("focus",t)},onListBlur:function(t){this.focused=!1,this.focusedOptionIndex=-1,this.$emit("blur",t)},onListKeyDown:function(t){switch(t.code){case"ArrowDown":this.onArrowDownKey(t);break;case"ArrowUp":this.onArrowUpKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"Enter":case"NumpadEnter":this.onEnterKey(t);break;case"Space":this.onSpaceKey(t);break;case"Escape":this.popup&&(U(this.target),this.hide());case"Tab":this.overlayVisible&&this.hide();break}},onArrowDownKey:function(t){var n=this.findNextOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()},onArrowUpKey:function(t){if(t.altKey&&this.popup)U(this.target),this.hide(),t.preventDefault();else{var n=this.findPrevOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()}},onHomeKey:function(t){this.changeFocusedOptionIndex(0),t.preventDefault()},onEndKey:function(t){this.changeFocusedOptionIndex(Z(this.container,'li[data-pc-section="item"][data-p-disabled="false"]').length-1),t.preventDefault()},onEnterKey:function(t){var n=ne(this.list,'li[id="'.concat("".concat(this.focusedOptionIndex),'"]')),r=n&&ne(n,'a[data-pc-section="itemlink"]');this.popup&&U(this.target),r?r.click():n&&n.click(),t.preventDefault()},onSpaceKey:function(t){this.onEnterKey(t)},findNextOptionIndex:function(t){var n=Z(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),r=re(n).findIndex(function(a){return a.id===t});return r>-1?r+1:0},findPrevOptionIndex:function(t){var n=Z(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),r=re(n).findIndex(function(a){return a.id===t});return r>-1?r-1:0},changeFocusedOptionIndex:function(t){var n=Z(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),r=t>=n.length?n.length-1:t<0?0:t;r>-1&&(this.focusedOptionIndex=n[r].getAttribute("id"))},toggle:function(t,n){this.overlayVisible?this.hide():this.show(t,n)},show:function(t,n){this.overlayVisible=!0,this.target=n??t.currentTarget},hide:function(){this.overlayVisible=!1,this.target=null},onEnter:function(t){de(t,{position:"absolute",top:"0"}),this.alignOverlay(),this.bindOutsideClickListener(),this.bindResizeListener(),this.bindScrollListener(),this.autoZIndex&&j.set("menu",t,this.baseZIndex+this.$primevue.config.zIndex.menu),this.popup&&U(this.list),this.$emit("show")},onLeave:function(){this.unbindOutsideClickListener(),this.unbindResizeListener(),this.unbindScrollListener(),this.$emit("hide")},onAfterLeave:function(t){this.autoZIndex&&j.clear(t)},alignOverlay:function(){ue(this.container,this.target);var t=J(this.target);t>J(this.container)&&(this.container.style.minWidth=J(this.target)+"px")},bindOutsideClickListener:function(){var t=this;this.outsideClickListener||(this.outsideClickListener=function(n){var r=t.container&&!t.container.contains(n.target),a=!(t.target&&(t.target===n.target||t.target.contains(n.target)));t.overlayVisible&&r&&a?t.hide():!t.popup&&r&&a&&(t.focusedOptionIndex=-1)},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindScrollListener:function(){var t=this;this.scrollHandler||(this.scrollHandler=new ce(this.target,function(){t.overlayVisible&&t.hide()})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var t=this;this.resizeListener||(this.resizeListener=function(){t.overlayVisible&&!le()&&t.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},visible:function(t){return typeof t.visible=="function"?t.visible():t.visible!==!1},disabled:function(t){return typeof t.disabled=="function"?t.disabled():t.disabled},label:function(t){return typeof t.label=="function"?t.label():t.label},onOverlayClick:function(t){$.emit("overlay-click",{originalEvent:t,target:this.target})},containerRef:function(t){this.container=t},listRef:function(t){this.list=t}},computed:{focusedOptionId:function(){return this.focusedOptionIndex!==-1?this.focusedOptionIndex:null},dataP:function(){return te({popup:this.popup})}},components:{PVMenuitem:ye,Portal:ae}},St=["id","data-p"],Et=["id","tabindex","aria-activedescendant","aria-label","aria-labelledby"],At=["id"];function zt(e,t,n,r,a,i){var p=M("PVMenuitem"),f=M("Portal");return o(),g(f,{appendTo:e.appendTo,disabled:!e.popup},{default:v(function(){return[m(me,c({name:"p-anchored-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},e.ptm("transition")),{default:v(function(){return[!e.popup||a.overlayVisible?(o(),s("div",c({key:0,ref:i.containerRef,id:e.$id,class:e.cx("root"),onClick:t[3]||(t[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)}),"data-p":i.dataP},e.ptmi("root")),[e.$slots.start?(o(),s("div",c({key:0,class:e.cx("start")},e.ptm("start")),[P(e.$slots,"start")],16)):b("",!0),u("ul",c({ref:i.listRef,id:e.$id+"_list",class:e.cx("list"),role:"menu",tabindex:e.tabindex,"aria-activedescendant":a.focused?i.focusedOptionId:void 0,"aria-label":e.ariaLabel,"aria-labelledby":e.ariaLabelledby,onFocus:t[0]||(t[0]=function(){return i.onListFocus&&i.onListFocus.apply(i,arguments)}),onBlur:t[1]||(t[1]=function(){return i.onListBlur&&i.onListBlur.apply(i,arguments)}),onKeydown:t[2]||(t[2]=function(){return i.onListKeyDown&&i.onListKeyDown.apply(i,arguments)})},e.ptm("list")),[(o(!0),s(A,null,T(e.model,function(l,d){return o(),s(A,{key:i.label(l)+d.toString()},[l.items&&i.visible(l)&&!l.separator?(o(),s(A,{key:0},[l.items?(o(),s("li",c({key:0,id:e.$id+"_"+d,class:[e.cx("submenuLabel"),l.class],role:"none"},{ref_for:!0},e.ptm("submenuLabel")),[P(e.$slots,e.$slots.submenulabel?"submenulabel":"submenuheader",{item:l},function(){return[fe(I(i.label(l)),1)]})],16,At)):b("",!0),(o(!0),s(A,null,T(l.items,function(C,h){return o(),s(A,{key:C.label+d+"_"+h},[i.visible(C)&&!C.separator?(o(),g(p,{key:0,id:e.$id+"_"+d+"_"+h,item:C,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"])):i.visible(C)&&C.separator?(o(),s("li",c({key:"separator"+d+h,class:[e.cx("separator"),l.class],style:C.style,role:"separator"},{ref_for:!0},e.ptm("separator")),null,16)):b("",!0)],64)}),128))],64)):i.visible(l)&&l.separator?(o(),s("li",c({key:"separator"+d.toString(),class:[e.cx("separator"),l.class],style:l.style,role:"separator"},{ref_for:!0},e.ptm("separator")),null,16)):(o(),g(p,{key:i.label(l)+d.toString(),id:e.$id+"_"+d,item:l,index:d,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","index","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"]))],64)}),128))],16,Et),e.$slots.end?(o(),s("div",c({key:1,class:e.cx("end")},e.ptm("end")),[P(e.$slots,"end")],16)):b("",!0)],16,St)):b("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo","disabled"])}Y.render=zt;var Pt=`
    .p-popover {
        margin-block-start: dt('popover.gutter');
        background: dt('popover.background');
        color: dt('popover.color');
        border: 1px solid dt('popover.border.color');
        border-radius: dt('popover.border.radius');
        box-shadow: dt('popover.shadow');
        will-change: transform;
    }

    .p-popover-content {
        padding: dt('popover.content.padding');
    }

    .p-popover-flipped {
        margin-block-start: calc(dt('popover.gutter') * -1);
        margin-block-end: dt('popover.gutter');
    }

    .p-popover:after,
    .p-popover:before {
        bottom: 100%;
        left: calc(dt('popover.arrow.offset') + dt('popover.arrow.left'));
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }

    .p-popover:after {
        border-width: calc(dt('popover.gutter') - 2px);
        margin-left: calc(-1 * (dt('popover.gutter') - 2px));
        border-style: solid;
        border-color: transparent;
        border-bottom-color: dt('popover.background');
    }

    .p-popover:before {
        border-width: dt('popover.gutter');
        margin-left: calc(-1 * dt('popover.gutter'));
        border-style: solid;
        border-color: transparent;
        border-bottom-color: dt('popover.border.color');
    }

    .p-popover-flipped:after,
    .p-popover-flipped:before {
        bottom: auto;
        top: 100%;
    }

    .p-popover.p-popover-flipped:after {
        border-bottom-color: transparent;
        border-top-color: dt('popover.background');
    }

    .p-popover.p-popover-flipped:before {
        border-bottom-color: transparent;
        border-top-color: dt('popover.border.color');
    }
`,Mt={root:"p-popover p-component",content:"p-popover-content"},Bt=R.extend({name:"popover",style:Pt,classes:Mt}),xt={name:"BasePopover",extends:_,props:{dismissable:{type:Boolean,default:!0},appendTo:{type:[String,Object],default:"body"},baseZIndex:{type:Number,default:0},autoZIndex:{type:Boolean,default:!0},breakpoints:{type:Object,default:null},closeOnEscape:{type:Boolean,default:!0}},style:Bt,provide:function(){return{$pcPopover:this,$parentInstance:this}}},ke={name:"Popover",extends:xt,inheritAttrs:!1,emits:["show","hide"],data:function(){return{visible:!1}},watch:{dismissable:{immediate:!0,handler:function(t){t?this.bindOutsideClickListener():this.unbindOutsideClickListener()}}},selfClick:!1,target:null,eventTarget:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,styleElement:null,overlayEventListener:null,documentKeydownListener:null,beforeUnmount:function(){this.dismissable&&this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.destroyStyle(),this.unbindResizeListener(),this.target=null,this.container&&this.autoZIndex&&j.clear(this.container),this.overlayEventListener&&($.off("overlay-click",this.overlayEventListener),this.overlayEventListener=null),this.container=null},mounted:function(){this.breakpoints&&this.createStyle()},methods:{toggle:function(t,n){this.visible?this.hide():this.show(t,n)},show:function(t,n){this.visible=!0,this.eventTarget=t.currentTarget,this.target=n||t.currentTarget},hide:function(){this.visible=!1},onContentClick:function(){this.selfClick=!0},onEnter:function(t){var n=this;de(t,{position:"absolute",top:"0"}),this.alignOverlay(),this.dismissable&&this.bindOutsideClickListener(),this.bindScrollListener(),this.bindResizeListener(),this.autoZIndex&&j.set("overlay",t,this.baseZIndex+this.$primevue.config.zIndex.overlay),this.overlayEventListener=function(r){n.container.contains(r.target)&&(n.selfClick=!0)},this.focus(),$.on("overlay-click",this.overlayEventListener),this.$emit("show"),this.closeOnEscape&&this.bindDocumentKeyDownListener()},onLeave:function(){this.unbindOutsideClickListener(),this.unbindScrollListener(),this.unbindResizeListener(),this.unbindDocumentKeyDownListener(),$.off("overlay-click",this.overlayEventListener),this.overlayEventListener=null,this.$emit("hide")},onAfterLeave:function(t){this.autoZIndex&&j.clear(t)},alignOverlay:function(){ue(this.container,this.target,!1);var t=ie(this.container),n=ie(this.target),r=0;t.left<n.left&&(r=n.left-t.left),this.container.style.setProperty(Be("popover.arrow.left").name,"".concat(r,"px")),t.top<n.top&&(this.container.setAttribute("data-p-popover-flipped","true"),!this.isUnstyled&&xe(this.container,"p-popover-flipped"))},onContentKeydown:function(t){t.code==="Escape"&&this.closeOnEscape&&(this.hide(),U(this.target))},onButtonKeydown:function(t){switch(t.code){case"ArrowDown":case"ArrowUp":case"ArrowLeft":case"ArrowRight":t.preventDefault()}},focus:function(){var t=this.container.querySelector("[autofocus]");t&&t.focus()},onKeyDown:function(t){t.code==="Escape"&&this.closeOnEscape&&(this.visible=!1)},bindDocumentKeyDownListener:function(){this.documentKeydownListener||(this.documentKeydownListener=this.onKeyDown.bind(this),window.document.addEventListener("keydown",this.documentKeydownListener))},unbindDocumentKeyDownListener:function(){this.documentKeydownListener&&(window.document.removeEventListener("keydown",this.documentKeydownListener),this.documentKeydownListener=null)},bindOutsideClickListener:function(){var t=this;!this.outsideClickListener&&Me()&&(this.outsideClickListener=function(n){t.visible&&!t.selfClick&&!t.isTargetClicked(n)&&(t.visible=!1),t.selfClick=!1},document.addEventListener("click",this.outsideClickListener))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener),this.outsideClickListener=null,this.selfClick=!1)},bindScrollListener:function(){var t=this;this.scrollHandler||(this.scrollHandler=new ce(this.target,function(){t.visible&&(t.visible=!1)})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var t=this;this.resizeListener||(this.resizeListener=function(){t.visible&&!le()&&(t.visible=!1)},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},isTargetClicked:function(t){return this.eventTarget&&(this.eventTarget===t.target||this.eventTarget.contains(t.target))},containerRef:function(t){this.container=t},createStyle:function(){if(!this.styleElement&&!this.isUnstyled){var t;this.styleElement=document.createElement("style"),this.styleElement.type="text/css",Pe(this.styleElement,"nonce",(t=this.$primevue)===null||t===void 0||(t=t.config)===null||t===void 0||(t=t.csp)===null||t===void 0?void 0:t.nonce),document.head.appendChild(this.styleElement);var n="";for(var r in this.breakpoints)n+=`
                        @media screen and (max-width: `.concat(r,`) {
                            .p-popover[`).concat(this.$attrSelector,`] {
                                width: `).concat(this.breakpoints[r],` !important;
                            }
                        }
                    `);this.styleElement.innerHTML=n}},destroyStyle:function(){this.styleElement&&(document.head.removeChild(this.styleElement),this.styleElement=null)},onOverlayClick:function(t){$.emit("overlay-click",{originalEvent:t,target:this.target})}},directives:{focustrap:De,ripple:se},components:{Portal:ae}},Tt=["aria-modal"];function Kt(e,t,n,r,a,i){var p=M("Portal"),f=pe("focustrap");return o(),g(p,{appendTo:e.appendTo},{default:v(function(){return[m(me,c({name:"p-anchored-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},e.ptm("transition")),{default:v(function(){return[a.visible?q((o(),s("div",c({key:0,ref:i.containerRef,role:"dialog","aria-modal":a.visible,onClick:t[3]||(t[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)}),class:e.cx("root")},e.ptmi("root")),[e.$slots.container?P(e.$slots,"container",{key:0,closeCallback:i.hide,keydownCallback:function(d){return i.onButtonKeydown(d)}}):(o(),s("div",c({key:1,class:e.cx("content"),onClick:t[0]||(t[0]=function(){return i.onContentClick&&i.onContentClick.apply(i,arguments)}),onMousedown:t[1]||(t[1]=function(){return i.onContentClick&&i.onContentClick.apply(i,arguments)}),onKeydown:t[2]||(t[2]=function(){return i.onContentKeydown&&i.onContentKeydown.apply(i,arguments)})},e.ptm("content")),[P(e.$slots,"default")],16))],16,Tt)),[[f]]):b("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo"])}ke.render=Kt;var _t=`
    .p-overlaybadge {
        position: relative;
    }

    .p-overlaybadge .p-badge {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        transform: translate(50%, -50%);
        transform-origin: 100% 0;
        margin: 0;
        outline-width: dt('overlaybadge.outline.width');
        outline-style: solid;
        outline-color: dt('overlaybadge.outline.color');
    }

    .p-overlaybadge .p-badge:dir(rtl) {
        transform: translate(-50%, -50%);
    }
`,Dt={root:"p-overlaybadge"},jt=R.extend({name:"overlaybadge",style:_t,classes:Dt}),Rt={name:"OverlayBadge",extends:ve,style:jt,provide:function(){return{$pcOverlayBadge:this,$parentInstance:this}}},Le={name:"OverlayBadge",extends:Rt,inheritAttrs:!1,components:{Badge:ve}};function Ft(e,t,n,r,a,i){var p=M("Badge");return o(),s("div",c({class:e.cx("root")},e.ptmi("root")),[P(e.$slots,"default"),m(p,c(e.$props,{pt:e.ptm("pcBadge")}),null,16,["pt"])],16)}Le.render=Ft;const Ht={class:"notification-menu"},Ut={class:"notification-header"},$t={class:"notification-list"},Nt={key:0,class:"notification-empty"},Vt=["onClick"],Zt={class:"notification-icon"},Wt={class:"notification-content"},Yt={class:"notification-item-title"},qt={class:"notification-message"},Jt={class:"notification-time"},Gt={key:0,class:"notification-footer"},Qt={__name:"NotificationMenu",setup(e){const t=he(),n=B(),r=z(()=>t.notifications),a=z(()=>t.unreadCount),i=h=>{n.value.toggle(h)},p=()=>{n.value.hide()},f=h=>({info:"pi pi-info-circle",success:"pi pi-check-circle",warning:"pi pi-exclamation-triangle",error:"pi pi-times-circle"})[h]||"pi pi-bell",l=h=>{const y=new Date(h),S=new Date-y,O=Math.floor(S/6e4);if(O<1)return"Just now";if(O<60)return`${O}m ago`;const H=Math.floor(O/60);if(H<24)return`${H}h ago`;const V=Math.floor(H/24);return V<7?`${V}d ago`:y.toLocaleDateString()},d=async h=>{h.isRead||await t.markAsRead(h.id)},C=async()=>{await t.markAllAsRead()};return(h,y)=>{const k=M("router-link");return o(),s("div",Ht,[m(L(Le),{value:a.value>0?a.value:null,severity:"danger"},{default:v(()=>[m(L(x),{type:"button",onClick:i,text:"",rounded:"",severity:"secondary",class:"notification-button"},{default:v(()=>[...y[0]||(y[0]=[u("i",{class:"pi pi-bell",style:{"font-size":"1.25rem"}},null,-1)])]),_:1})]),_:1},8,["value"]),m(L(ke),{ref_key:"notificationPopover",ref:n,appendTo:"body",class:"notification-popover"},{default:v(()=>[u("div",Ut,[y[1]||(y[1]=u("span",{class:"notification-title"},"Notifications",-1)),a.value>0?(o(),g(L(x),{key:0,label:"Mark all read",text:"",size:"small",onClick:C})):b("",!0)]),u("div",$t,[r.value.length===0?(o(),s("div",Nt,[...y[2]||(y[2]=[u("i",{class:"pi pi-inbox"},null,-1),u("span",null,"No notifications",-1)])])):b("",!0),(o(!0),s(A,null,T(r.value.slice(0,5),S=>(o(),s("div",{key:S.id,class:w(["notification-item",{unread:!S.isRead}]),onClick:O=>d(S)},[u("div",Zt,[u("i",{class:w(f(S.type))},null,2)]),u("div",Wt,[u("span",Yt,I(S.title),1),u("span",qt,I(S.message),1),u("span",Jt,I(l(S.createdAt)),1)])],10,Vt))),128))]),r.value.length>0?(o(),s("div",Gt,[m(k,{to:"/notifications",class:"view-all-link",onClick:p},{default:v(()=>[...y[3]||(y[3]=[fe(" View all notifications ",-1)])]),_:1})])):b("",!0)]),_:1},512)])}}},Xt=F(Qt,[["__scopeId","data-v-6d76432c"]]);var en=`
    .p-breadcrumb {
        background: dt('breadcrumb.background');
        padding: dt('breadcrumb.padding');
        overflow-x: auto;
    }

    .p-breadcrumb-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: dt('breadcrumb.gap');
    }

    .p-breadcrumb-separator {
        display: flex;
        align-items: center;
        color: dt('breadcrumb.separator.color');
    }

    .p-breadcrumb-separator-icon:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-breadcrumb::-webkit-scrollbar {
        display: none;
    }

    .p-breadcrumb-item-link {
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: dt('breadcrumb.item.gap');
        transition:
            background dt('breadcrumb.transition.duration'),
            color dt('breadcrumb.transition.duration'),
            outline-color dt('breadcrumb.transition.duration'),
            box-shadow dt('breadcrumb.transition.duration');
        border-radius: dt('breadcrumb.item.border.radius');
        outline-color: transparent;
        color: dt('breadcrumb.item.color');
    }

    .p-breadcrumb-item-link:focus-visible {
        box-shadow: dt('breadcrumb.item.focus.ring.shadow');
        outline: dt('breadcrumb.item.focus.ring.width') dt('breadcrumb.item.focus.ring.style') dt('breadcrumb.item.focus.ring.color');
        outline-offset: dt('breadcrumb.item.focus.ring.offset');
    }

    .p-breadcrumb-item-link:hover .p-breadcrumb-item-label {
        color: dt('breadcrumb.item.hover.color');
    }

    .p-breadcrumb-item-label {
        transition: inherit;
    }

    .p-breadcrumb-item-icon {
        color: dt('breadcrumb.item.icon.color');
        transition: inherit;
    }

    .p-breadcrumb-item-link:hover .p-breadcrumb-item-icon {
        color: dt('breadcrumb.item.icon.hover.color');
    }
`,tn={root:"p-breadcrumb p-component",list:"p-breadcrumb-list",homeItem:"p-breadcrumb-home-item",separator:"p-breadcrumb-separator",separatorIcon:"p-breadcrumb-separator-icon",item:function(t){var n=t.instance;return["p-breadcrumb-item",{"p-disabled":n.disabled()}]},itemLink:"p-breadcrumb-item-link",itemIcon:"p-breadcrumb-item-icon",itemLabel:"p-breadcrumb-item-label"},nn=R.extend({name:"breadcrumb",style:en,classes:tn}),on={name:"BaseBreadcrumb",extends:_,props:{model:{type:Array,default:null},home:{type:null,default:null}},style:nn,provide:function(){return{$pcBreadcrumb:this,$parentInstance:this}}},we={name:"BreadcrumbItem",hostName:"Breadcrumb",extends:_,props:{item:null,templates:null,index:null},methods:{onClick:function(t){this.item.command&&this.item.command({originalEvent:t,item:this.item})},visible:function(){return typeof this.item.visible=="function"?this.item.visible():this.item.visible!==!1},disabled:function(){return typeof this.item.disabled=="function"?this.item.disabled():this.item.disabled},label:function(){return typeof this.item.label=="function"?this.item.label():this.item.label},isCurrentUrl:function(){var t=this.item,n=t.to,r=t.url,a=typeof window<"u"?window.location.pathname:"";return n===a||r===a?"page":void 0}},computed:{ptmOptions:function(){return{context:{item:this.item,index:this.index}}},getMenuItemProps:function(){var t=this;return{action:c({class:this.cx("itemLink"),"aria-current":this.isCurrentUrl(),onClick:function(r){return t.onClick(r)}},this.ptm("itemLink",this.ptmOptions)),icon:c({class:[this.cx("icon"),this.item.icon]},this.ptm("icon",this.ptmOptions)),label:c({class:this.cx("label")},this.ptm("label",this.ptmOptions))}}}},rn=["href","target","aria-current"];function an(e,t,n,r,a,i){return i.visible()?(o(),s("li",c({key:0,class:[e.cx("item"),n.item.class]},e.ptm("item",i.ptmOptions)),[n.templates.item?(o(),g(K(n.templates.item),{key:1,item:n.item,label:i.label(),props:i.getMenuItemProps},null,8,["item","label","props"])):(o(),s("a",c({key:0,href:n.item.url||"#",class:e.cx("itemLink"),target:n.item.target,"aria-current":i.isCurrentUrl(),onClick:t[0]||(t[0]=function(){return i.onClick&&i.onClick.apply(i,arguments)})},e.ptm("itemLink",i.ptmOptions)),[n.templates&&n.templates.itemicon?(o(),g(K(n.templates.itemicon),{key:0,item:n.item,class:w(e.cx("itemIcon",i.ptmOptions))},null,8,["item","class"])):n.item.icon?(o(),s("span",c({key:1,class:[e.cx("itemIcon"),n.item.icon]},e.ptm("itemIcon",i.ptmOptions)),null,16)):b("",!0),n.item.label?(o(),s("span",c({key:2,class:e.cx("itemLabel")},e.ptm("itemLabel",i.ptmOptions)),I(i.label()),17)):b("",!0)],16,rn))],16)):b("",!0)}we.render=an;var Ie={name:"Breadcrumb",extends:on,inheritAttrs:!1,components:{BreadcrumbItem:we,ChevronRightIcon:je}};function sn(e,t,n,r,a,i){var p=M("BreadcrumbItem"),f=M("ChevronRightIcon");return o(),s("nav",c({class:e.cx("root")},e.ptmi("root")),[u("ol",c({class:e.cx("list")},e.ptm("list")),[e.home?(o(),g(p,c({key:0,item:e.home,class:e.cx("homeItem"),templates:e.$slots,pt:e.pt,unstyled:e.unstyled},e.ptm("homeItem")),null,16,["item","class","templates","pt","unstyled"])):b("",!0),(o(!0),s(A,null,T(e.model,function(l,d){return o(),s(A,{key:l.label+"_"+d},[e.home||d!==0?(o(),s("li",c({key:0,class:e.cx("separator")},{ref_for:!0},e.ptm("separator")),[P(e.$slots,"separator",{},function(){return[m(f,c({"aria-hidden":"true",class:e.cx("separatorIcon")},{ref_for:!0},e.ptm("separatorIcon")),null,16,["class"])]})],16)):b("",!0),m(p,{item:l,index:d,templates:e.$slots,pt:e.pt,unstyled:e.unstyled},null,8,["item","index","templates","pt","unstyled"])],64)}),128))],16)],16)}Ie.render=sn;const ln={key:1,class:"text-color-secondary"},cn={__name:"Breadcrumbs",setup(e){const t=X(),n=i=>i.split("-").map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(" "),r={icon:"pi pi-home",route:"/"},a=z(()=>{const i=t.path.split("/").filter(Boolean);return i.map((p,f)=>{const l="/"+i.slice(0,f+1).join("/"),d=f===i.length-1;return{label:n(p),route:d?void 0:l}})});return(i,p)=>{const f=M("router-link");return o(),g(L(Ie),{home:r,model:a.value,class:"p-0 bg-transparent border-none"},{item:v(({item:l})=>[l.route?(o(),g(f,{key:0,to:l.route,class:"text-color no-underline"},{default:v(()=>[u("span",{class:w([l.icon,"mr-1"])},null,2),u("span",null,I(l.label),1)]),_:2},1032,["to"])):(o(),s("span",ln,[u("span",{class:w([l.icon,"mr-1"])},null,2),u("span",null,I(l.label),1)]))]),_:1},8,["model"])}}},un=F(cn,[["__scopeId","data-v-e0e24750"]]),dn={class:"app-header"},pn={class:"header-left"},mn={class:"header-right"},fn={class:"user-name"},bn={__name:"AppHeader",emits:["toggle-sidebar"],setup(e){const t=be();X();const n=ee(),r=Te(),a=et(),i=B(),p=B(),f=B(),l=z(()=>({light:"pi pi-sun",dark:"pi pi-moon",system:"pi pi-desktop"})[r.themeMode]||"pi pi-desktop"),d=B([{label:"Light",icon:"pi pi-sun",command:()=>r.setTheme("light")},{label:"Dark",icon:"pi pi-moon",command:()=>r.setTheme("dark")},{label:"System",icon:"pi pi-desktop",command:()=>r.setTheme("system")}]),C=E=>{p.value.toggle(E)},h=z(()=>a.availableLocales.map(E=>({label:E.name,icon:a.locale===E.code?"pi pi-check":"",command:()=>a.setLocale(E.code)}))),y=E=>{f.value.toggle(E)},k=z(()=>n.user?.name||n.user?.username||"User"),S=z(()=>k.value.split(" ").map(D=>D[0]).join("").toUpperCase().substring(0,2)),O=B([{label:"Profile",icon:"pi pi-user",command:()=>t.push("/profile")},{separator:!0},{label:"Logout",icon:"pi pi-sign-out",command:()=>V()}]),H=E=>{i.value.toggle(E)},V=async()=>{await n.logout(),t.push("/login")};return(E,D)=>(o(),s("header",dn,[u("div",pn,[m(L(x),{icon:"pi pi-bars",text:"",rounded:"",severity:"secondary",onClick:D[0]||(D[0]=An=>E.$emit("toggle-sidebar")),class:"menu-button"}),m(un)]),u("div",mn,[m(L(x),{type:"button",onClick:y,icon:"pi pi-globe",text:"",rounded:"",severity:"secondary",class:"lang-button"}),m(L(Y),{ref_key:"langMenu",ref:f,model:h.value,popup:!0},null,8,["model"]),m(L(x),{type:"button",onClick:C,icon:l.value,text:"",rounded:"",severity:"secondary",class:"theme-button"},null,8,["icon"]),m(L(Y),{ref_key:"themeMenu",ref:p,model:d.value,popup:!0},null,8,["model"]),m(Xt),m(L(x),{type:"button",onClick:H,class:"user-button",text:"",rounded:""},{default:v(()=>[m(L(ge),{label:S.value,shape:"circle",class:"user-avatar"},null,8,["label"]),u("span",fn,I(k.value),1),D[1]||(D[1]=u("i",{class:"pi pi-chevron-down",style:{"font-size":"0.75rem"}},null,-1))]),_:1}),m(L(Y),{ref_key:"userMenu",ref:i,model:O.value,popup:!0},null,8,["model"])])]))}},hn=F(bn,[["__scopeId","data-v-9e596a34"]]),vn={class:"app-footer"},gn={__name:"AppFooter",setup(e){const t=new Date().getFullYear();return(n,r)=>(o(),s("footer",vn,[u("span",null,"© "+I(L(t))+" AppTemplate. All rights reserved.",1)]))}},yn=F(gn,[["__scopeId","data-v-f6ad09b6"]]);var kn=`
    .p-confirmdialog .p-dialog-content {
        display: flex;
        align-items: center;
        gap: dt('confirmdialog.content.gap');
    }

    .p-confirmdialog-icon {
        color: dt('confirmdialog.icon.color');
        font-size: dt('confirmdialog.icon.size');
        width: dt('confirmdialog.icon.size');
        height: dt('confirmdialog.icon.size');
    }
`,Ln={root:"p-confirmdialog",icon:"p-confirmdialog-icon",message:"p-confirmdialog-message",pcRejectButton:"p-confirmdialog-reject-button",pcAcceptButton:"p-confirmdialog-accept-button"},wn=R.extend({name:"confirmdialog",style:kn,classes:Ln}),In={name:"BaseConfirmDialog",extends:_,props:{group:String,breakpoints:{type:Object,default:null},draggable:{type:Boolean,default:!0}},style:wn,provide:function(){return{$pcConfirmDialog:this,$parentInstance:this}}},Ce={name:"ConfirmDialog",extends:In,confirmListener:null,closeListener:null,data:function(){return{visible:!1,confirmation:null}},mounted:function(){var t=this;this.confirmListener=function(n){n&&n.group===t.group&&(t.confirmation=n,t.confirmation.onShow&&t.confirmation.onShow(),t.visible=!0)},this.closeListener=function(){t.visible=!1,t.confirmation=null},W.on("confirm",this.confirmListener),W.on("close",this.closeListener)},beforeUnmount:function(){W.off("confirm",this.confirmListener),W.off("close",this.closeListener)},methods:{accept:function(){this.confirmation.accept&&this.confirmation.accept(),this.visible=!1},reject:function(){this.confirmation.reject&&this.confirmation.reject(),this.visible=!1},onHide:function(){this.confirmation.onHide&&this.confirmation.onHide(),this.visible=!1}},computed:{appendTo:function(){return this.confirmation?this.confirmation.appendTo:"body"},target:function(){return this.confirmation?this.confirmation.target:null},modal:function(){return this.confirmation?this.confirmation.modal==null?!0:this.confirmation.modal:!0},header:function(){return this.confirmation?this.confirmation.header:null},message:function(){return this.confirmation?this.confirmation.message:null},blockScroll:function(){return this.confirmation?this.confirmation.blockScroll:!0},position:function(){return this.confirmation?this.confirmation.position:null},acceptLabel:function(){if(this.confirmation){var t,n=this.confirmation;return n.acceptLabel||((t=n.acceptProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.accept}return this.$primevue.config.locale.accept},rejectLabel:function(){if(this.confirmation){var t,n=this.confirmation;return n.rejectLabel||((t=n.rejectProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.reject}return this.$primevue.config.locale.reject},acceptIcon:function(){var t;return this.confirmation?this.confirmation.acceptIcon:(t=this.confirmation)!==null&&t!==void 0&&t.acceptProps?this.confirmation.acceptProps.icon:null},rejectIcon:function(){var t;return this.confirmation?this.confirmation.rejectIcon:(t=this.confirmation)!==null&&t!==void 0&&t.rejectProps?this.confirmation.rejectProps.icon:null},autoFocusAccept:function(){return this.confirmation.defaultFocus===void 0||this.confirmation.defaultFocus==="accept"},autoFocusReject:function(){return this.confirmation.defaultFocus==="reject"},closeOnEscape:function(){return this.confirmation?this.confirmation.closeOnEscape:!0}},components:{Dialog:Re,Button:x}};function Cn(e,t,n,r,a,i){var p=M("Button"),f=M("Dialog");return o(),g(f,{visible:a.visible,"onUpdate:visible":[t[2]||(t[2]=function(l){return a.visible=l}),i.onHide],role:"alertdialog",class:w(e.cx("root")),modal:i.modal,header:i.header,blockScroll:i.blockScroll,appendTo:i.appendTo,position:i.position,breakpoints:e.breakpoints,closeOnEscape:i.closeOnEscape,draggable:e.draggable,pt:e.pt,unstyled:e.unstyled},G({default:v(function(){return[e.$slots.container?b("",!0):(o(),s(A,{key:0},[e.$slots.message?(o(),g(K(e.$slots.message),{key:1,message:a.confirmation},null,8,["message"])):(o(),s(A,{key:0},[P(e.$slots,"icon",{},function(){return[e.$slots.icon?(o(),g(K(e.$slots.icon),{key:0,class:w(e.cx("icon"))},null,8,["class"])):a.confirmation.icon?(o(),s("span",c({key:1,class:[a.confirmation.icon,e.cx("icon")]},e.ptm("icon")),null,16)):b("",!0)]}),u("span",c({class:e.cx("message")},e.ptm("message")),I(i.message),17)],64))],64))]}),_:2},[e.$slots.container?{name:"container",fn:v(function(l){return[P(e.$slots,"container",{message:a.confirmation,closeCallback:l.closeCallback,acceptCallback:i.accept,rejectCallback:i.reject,initDragCallback:l.initDragCallback})]}),key:"0"}:void 0,e.$slots.container?void 0:{name:"footer",fn:v(function(){var l;return[m(p,c({class:[e.cx("pcRejectButton"),a.confirmation.rejectClass],autofocus:i.autoFocusReject,unstyled:e.unstyled,text:((l=a.confirmation.rejectProps)===null||l===void 0?void 0:l.text)||!1,onClick:t[0]||(t[0]=function(d){return i.reject()})},a.confirmation.rejectProps,{label:i.rejectLabel,pt:e.ptm("pcRejectButton")}),G({_:2},[i.rejectIcon||e.$slots.rejecticon?{name:"icon",fn:v(function(d){return[P(e.$slots,"rejecticon",{},function(){return[u("span",c({class:[i.rejectIcon,d.class]},e.ptm("pcRejectButton").icon,{"data-pc-section":"rejectbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["class","autofocus","unstyled","text","label","pt"]),m(p,c({label:i.acceptLabel,class:[e.cx("pcAcceptButton"),a.confirmation.acceptClass],autofocus:i.autoFocusAccept,unstyled:e.unstyled,onClick:t[1]||(t[1]=function(d){return i.accept()})},a.confirmation.acceptProps,{pt:e.ptm("pcAcceptButton")}),G({_:2},[i.acceptIcon||e.$slots.accepticon?{name:"icon",fn:v(function(d){return[P(e.$slots,"accepticon",{},function(){return[u("span",c({class:[i.acceptIcon,d.class]},e.ptm("pcAcceptButton").icon,{"data-pc-section":"acceptbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["label","class","autofocus","unstyled","pt"])]}),key:"1"}]),1032,["visible","class","modal","header","blockScroll","appendTo","position","breakpoints","closeOnEscape","draggable","onUpdate:visible","pt","unstyled"])}Ce.render=Cn;const On={class:"layout-wrapper"},Sn={class:"layout-main"},En={__name:"default",setup(e){const t=be(),n=ee(),r=he(),a=B(!0);return Ke(()=>{if(!n.isAuthenticated){t.push("/login");return}r.initSignalR()}),_e(()=>{r.disconnect&&r.disconnect()}),(i,p)=>{const f=M("router-view");return o(),s("div",On,[m(Xe,{visible:a.value,"onUpdate:visible":p[0]||(p[0]=l=>a.value=l)},null,8,["visible"]),u("div",{class:w(["layout-main-container",{"sidebar-collapsed":!a.value}])},[m(hn,{onToggleSidebar:p[1]||(p[1]=l=>a.value=!a.value)}),u("main",Sn,[m(f)]),m(yn)],2),m(L(Ce))])}}},Kn=F(En,[["__scopeId","data-v-8f226ec9"]]);export{Kn as default};
