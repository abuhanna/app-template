import{B as F,s as De,b as ee,d as H,f as te,e as B,x as P,W as D,r as A,g as ne,h as L,o as s,w as g,c,i as b,m as d,a as v,T as ie,j as W,k as w,F as C,l as a,n as E,t as I,p as M,u as Pe,q as K,v as xe,y as oe,z as _,A as fe,C as me,D as U,E as O,R as he,Y as be,G as ve,H as ye,I as q,S as ge,J as N,K as se,L as Be,M as ke,_ as Ke,N as je,O as ae,P as ze,Q as Re,U as le,V as ce,X as Te,Z as Me,$ as we,a0 as Z,a1 as J}from"./index-ClbwuvgW.js";import{u as Le}from"./persistentNotification-DtSPFdru.js";import{s as j}from"./index-CO05eax1.js";import{F as Ce,u as _e,b as Ue,s as Ve}from"./index-F3f4gsKq.js";import{_ as $}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{s as Fe}from"./index-Yx-PzZM6.js";import{O as T}from"./index-B6u3Hjan.js";var He=`
    .p-drawer {
        display: flex;
        flex-direction: column;
        transform: translate3d(0px, 0px, 0px);
        position: relative;
        transition: transform 0.3s;
        background: dt('drawer.background');
        color: dt('drawer.color');
        border-style: solid;
        border-color: dt('drawer.border.color');
        box-shadow: dt('drawer.shadow');
    }

    .p-drawer-content {
        overflow-y: auto;
        flex-grow: 1;
        padding: dt('drawer.content.padding');
    }

    .p-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('drawer.header.padding');
    }

    .p-drawer-footer {
        padding: dt('drawer.footer.padding');
    }

    .p-drawer-title {
        font-weight: dt('drawer.title.font.weight');
        font-size: dt('drawer.title.font.size');
    }

    .p-drawer-full .p-drawer {
        transition: none;
        transform: none;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100%;
        top: 0px !important;
        left: 0px !important;
        border-width: 1px;
    }

    .p-drawer-left .p-drawer-enter-active {
        animation: p-animate-drawer-enter-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-left .p-drawer-leave-active {
        animation: p-animate-drawer-leave-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-right .p-drawer-enter-active {
        animation: p-animate-drawer-enter-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-right .p-drawer-leave-active {
        animation: p-animate-drawer-leave-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-top .p-drawer-enter-active {
        animation: p-animate-drawer-enter-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-top .p-drawer-leave-active {
        animation: p-animate-drawer-leave-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-bottom .p-drawer-enter-active {
        animation: p-animate-drawer-enter-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-bottom .p-drawer-leave-active {
        animation: p-animate-drawer-leave-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-full .p-drawer-enter-active {
        animation: p-animate-drawer-enter-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-full .p-drawer-leave-active {
        animation: p-animate-drawer-leave-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .p-drawer-left .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-end-width: 1px;
    }

    .p-drawer-right .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-start-width: 1px;
    }

    .p-drawer-top .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-end-width: 1px;
    }

    .p-drawer-bottom .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-start-width: 1px;
    }

    .p-drawer-left .p-drawer-content,
    .p-drawer-right .p-drawer-content,
    .p-drawer-top .p-drawer-content,
    .p-drawer-bottom .p-drawer-content {
        width: 100%;
        height: 100%;
    }

    .p-drawer-open {
        display: flex;
    }

    .p-drawer-mask:dir(rtl) {
        flex-direction: row-reverse;
    }

    @keyframes p-animate-drawer-enter-left {
        from {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-left {
        to {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-right {
        from {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-right {
        to {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-top {
        from {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-top {
        to {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-bottom {
        from {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-bottom {
        to {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-full {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-drawer-leave-full {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`,$e={mask:function(t){var n=t.position,o=t.modal;return{position:"fixed",height:"100%",width:"100%",left:0,top:0,display:"flex",justifyContent:n==="left"?"flex-start":n==="right"?"flex-end":"center",alignItems:n==="top"?"flex-start":n==="bottom"?"flex-end":"center",pointerEvents:o?"auto":"none"}},root:{pointerEvents:"auto"}},Ne={mask:function(t){var n=t.instance,o=t.props,r=["left","right","top","bottom"],i=r.find(function(h){return h===o.position});return["p-drawer-mask",{"p-overlay-mask p-overlay-mask-enter-active":o.modal,"p-drawer-open":n.containerVisible,"p-drawer-full":n.fullScreen},i?"p-drawer-".concat(i):""]},root:function(t){var n=t.instance;return["p-drawer p-component",{"p-drawer-full":n.fullScreen}]},header:"p-drawer-header",title:"p-drawer-title",pcCloseButton:"p-drawer-close-button",content:"p-drawer-content",footer:"p-drawer-footer"},Ze=F.extend({name:"drawer",style:He,classes:Ne,inlineStyles:$e}),We={name:"BaseDrawer",extends:H,props:{visible:{type:Boolean,default:!1},position:{type:String,default:"left"},header:{type:null,default:null},baseZIndex:{type:Number,default:0},autoZIndex:{type:Boolean,default:!0},dismissable:{type:Boolean,default:!0},showCloseIcon:{type:Boolean,default:!0},closeButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}},closeIcon:{type:String,default:void 0},modal:{type:Boolean,default:!0},blockScroll:{type:Boolean,default:!1},closeOnEscape:{type:Boolean,default:!0}},style:Ze,provide:function(){return{$pcDrawer:this,$parentInstance:this}}};function V(e){"@babel/helpers - typeof";return V=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},V(e)}function G(e,t,n){return(t=Ye(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Ye(e){var t=qe(e,"string");return V(t)=="symbol"?t:t+""}function qe(e,t){if(V(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var o=n.call(e,t);if(V(o)!="object")return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Oe={name:"Drawer",extends:We,inheritAttrs:!1,emits:["update:visible","show","after-show","hide","after-hide","before-hide"],data:function(){return{containerVisible:this.visible}},container:null,mask:null,content:null,headerContainer:null,footerContainer:null,closeButton:null,outsideClickListener:null,documentKeydownListener:null,watch:{dismissable:function(t){t&&!this.modal?this.bindOutsideClickListener():this.unbindOutsideClickListener()}},updated:function(){this.visible&&(this.containerVisible=this.visible)},beforeUnmount:function(){this.disableDocumentSettings(),this.mask&&this.autoZIndex&&P.clear(this.mask),this.container=null,this.mask=null},methods:{hide:function(){this.$emit("update:visible",!1)},onEnter:function(){this.$emit("show"),this.focus(),this.bindDocumentKeyDownListener(),this.autoZIndex&&P.set("modal",this.mask,this.baseZIndex||this.$primevue.config.zIndex.modal)},onAfterEnter:function(){this.enableDocumentSettings(),this.$emit("after-show")},onBeforeLeave:function(){this.modal&&!this.isUnstyled&&D(this.mask,"p-overlay-mask-leave-active"),this.$emit("before-hide")},onLeave:function(){this.$emit("hide")},onAfterLeave:function(){this.autoZIndex&&P.clear(this.mask),this.unbindDocumentKeyDownListener(),this.containerVisible=!1,this.disableDocumentSettings(),this.$emit("after-hide")},onMaskClick:function(t){this.dismissable&&this.modal&&this.mask===t.target&&this.hide()},focus:function(){var t=function(r){return r&&r.querySelector("[autofocus]")},n=this.$slots.header&&t(this.headerContainer);n||(n=this.$slots.default&&t(this.container),n||(n=this.$slots.footer&&t(this.footerContainer),n||(n=this.closeButton))),n&&B(n)},enableDocumentSettings:function(){this.dismissable&&!this.modal&&this.bindOutsideClickListener(),this.blockScroll&&Ue()},disableDocumentSettings:function(){this.unbindOutsideClickListener(),this.blockScroll&&_e()},onKeydown:function(t){t.code==="Escape"&&this.closeOnEscape&&this.hide()},containerRef:function(t){this.container=t},maskRef:function(t){this.mask=t},contentRef:function(t){this.content=t},headerContainerRef:function(t){this.headerContainer=t},footerContainerRef:function(t){this.footerContainer=t},closeButtonRef:function(t){this.closeButton=t?t.$el:void 0},bindDocumentKeyDownListener:function(){this.documentKeydownListener||(this.documentKeydownListener=this.onKeydown,document.addEventListener("keydown",this.documentKeydownListener))},unbindDocumentKeyDownListener:function(){this.documentKeydownListener&&(document.removeEventListener("keydown",this.documentKeydownListener),this.documentKeydownListener=null)},bindOutsideClickListener:function(){var t=this;this.outsideClickListener||(this.outsideClickListener=function(n){t.isOutsideClicked(n)&&t.hide()},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},isOutsideClicked:function(t){return this.container&&!this.container.contains(t.target)}},computed:{fullScreen:function(){return this.position==="full"},closeAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.close:void 0},dataP:function(){return te(G(G(G({"full-screen":this.position==="full"},this.position,this.position),"open",this.containerVisible),"modal",this.modal))}},directives:{focustrap:Ce},components:{Button:j,Portal:ee,TimesIcon:De}},Je=["data-p"],Ge=["role","aria-modal","data-p"];function Qe(e,t,n,o,r,i){var h=A("Button"),f=A("Portal"),l=ne("focustrap");return s(),L(f,null,{default:g(function(){return[r.containerVisible?(s(),c("div",d({key:0,ref:i.maskRef,onMousedown:t[0]||(t[0]=function(){return i.onMaskClick&&i.onMaskClick.apply(i,arguments)}),class:e.cx("mask"),style:e.sx("mask",!0,{position:e.position,modal:e.modal}),"data-p":i.dataP},e.ptm("mask")),[v(ie,d({name:"p-drawer",onEnter:i.onEnter,onAfterEnter:i.onAfterEnter,onBeforeLeave:i.onBeforeLeave,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave,appear:""},e.ptm("transition")),{default:g(function(){return[e.visible?W((s(),c("div",d({key:0,ref:i.containerRef,class:e.cx("root"),style:e.sx("root"),role:e.modal?"dialog":"complementary","aria-modal":e.modal?!0:void 0,"data-p":i.dataP},e.ptmi("root")),[e.$slots.container?w(e.$slots,"container",{key:0,closeCallback:i.hide}):(s(),c(C,{key:1},[a("div",d({ref:i.headerContainerRef,class:e.cx("header")},e.ptm("header")),[w(e.$slots,"header",{class:E(e.cx("title"))},function(){return[e.header?(s(),c("div",d({key:0,class:e.cx("title")},e.ptm("title")),I(e.header),17)):b("",!0)]}),e.showCloseIcon?w(e.$slots,"closebutton",{key:0,closeCallback:i.hide},function(){return[v(h,d({ref:i.closeButtonRef,type:"button",class:e.cx("pcCloseButton"),"aria-label":i.closeAriaLabel,unstyled:e.unstyled,onClick:i.hide},e.closeButtonProps,{pt:e.ptm("pcCloseButton"),"data-pc-group-section":"iconcontainer"}),{icon:g(function(u){return[w(e.$slots,"closeicon",{},function(){return[(s(),L(M(e.closeIcon?"span":"TimesIcon"),d({class:[e.closeIcon,u.class]},e.ptm("pcCloseButton").icon),null,16,["class"]))]})]}),_:3},16,["class","aria-label","unstyled","onClick","pt"])]}):b("",!0)],16),a("div",d({ref:i.contentRef,class:e.cx("content")},e.ptm("content")),[w(e.$slots,"default")],16),e.$slots.footer?(s(),c("div",d({key:0,ref:i.footerContainerRef,class:e.cx("footer")},e.ptm("footer")),[w(e.$slots,"footer")],16)):b("",!0)],64))],16,Ge)),[[l]]):b("",!0)]}),_:3},16,["onEnter","onAfterEnter","onBeforeLeave","onLeave","onAfterLeave"])],16,Je)):b("",!0)]}),_:3})}Oe.render=Qe;var Xe={name:"Sidebar",extends:Oe,mounted:function(){console.warn("Deprecated since v4. Use Drawer component instead.")}};const et={class:"sidebar-nav"},tt={class:"nav-list"},nt={key:0,class:"nav-section"},it={class:"nav-list"},ot={__name:"AppSidebar",props:{visible:{default:!0},visibleModifiers:{}},emits:["update:visible"],setup(e){const t=Pe(e,"visible"),n=K({get:()=>t.value,set:k=>t.value=k}),o=xe(),r=oe(),i=_(!1),h=K(()=>r.user?.role==="Admin"),f=[{label:"Dashboard",path:"/dashboard",icon:"pi pi-home"},{label:"Notifications",path:"/notifications",icon:"pi pi-bell"}],l=[{label:"Users",path:"/users",icon:"pi pi-users"},{label:"Departments",path:"/departments",icon:"pi pi-building"}],u=k=>o.path===k||o.path.startsWith(k+"/"),m=()=>{i.value&&(n.value=!1)},S=()=>{i.value=window.innerWidth<992};return fe(()=>{S(),window.addEventListener("resize",S)}),me(()=>{window.removeEventListener("resize",S)}),(k,y)=>{const z=A("router-link");return s(),L(O(Xe),{visible:n.value,"onUpdate:visible":y[0]||(y[0]=p=>n.value=p),modal:i.value,dismissable:i.value,showCloseIcon:i.value,class:"app-sidebar",pt:{root:{class:"sidebar-root"},content:{class:"sidebar-content"}}},{default:g(()=>[y[2]||(y[2]=a("div",{class:"sidebar-header"},[a("div",{class:"logo-container"},[a("i",{class:"pi pi-box logo-icon"}),a("span",{class:"logo-text"},"AppTemplate")])],-1)),a("nav",et,[a("ul",tt,[(s(),c(C,null,U(f,p=>a("li",{key:p.path},[v(z,{to:p.path,class:E(["nav-item",{active:u(p.path)}]),onClick:m},{default:g(()=>[a("i",{class:E(p.icon)},null,2),a("span",null,I(p.label),1)]),_:2},1032,["to","class"])])),64))]),h.value?(s(),c("div",nt,[y[1]||(y[1]=a("span",{class:"nav-section-title"},"Administration",-1)),a("ul",it,[(s(),c(C,null,U(l,p=>a("li",{key:p.path},[v(z,{to:p.path,class:E(["nav-item",{active:u(p.path)}]),onClick:m},{default:g(()=>[a("i",{class:E(p.icon)},null,2),a("span",null,I(p.label),1)]),_:2},1032,["to","class"])])),64))])])):b("",!0)])]),_:1},8,["visible","modal","dismissable","showCloseIcon"])}}},rt=$(ot,[["__scopeId","data-v-d7f5cade"]]);var st=`
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
`,at={root:function(t){var n=t.props;return["p-menu p-component",{"p-menu-overlay":n.popup}]},start:"p-menu-start",list:"p-menu-list",submenuLabel:"p-menu-submenu-label",separator:"p-menu-separator",end:"p-menu-end",item:function(t){var n=t.instance;return["p-menu-item",{"p-focus":n.id===n.focusedOptionId,"p-disabled":n.disabled()}]},itemContent:"p-menu-item-content",itemLink:"p-menu-item-link",itemIcon:"p-menu-item-icon",itemLabel:"p-menu-item-label"},lt=F.extend({name:"menu",style:st,classes:at}),ct={name:"BaseMenu",extends:H,props:{popup:{type:Boolean,default:!1},model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},tabindex:{type:Number,default:0},ariaLabel:{type:String,default:null},ariaLabelledby:{type:String,default:null}},style:lt,provide:function(){return{$pcMenu:this,$parentInstance:this}}},Ie={name:"Menuitem",hostName:"Menu",extends:H,inheritAttrs:!1,emits:["item-click","item-mousemove"],props:{item:null,templates:null,id:null,focusedOptionId:null,index:null},methods:{getItemProp:function(t,n){return t&&t.item?Be(t.item[n]):void 0},getPTOptions:function(t){return this.ptm(t,{context:{item:this.item,index:this.index,focused:this.isItemFocused(),disabled:this.disabled()}})},isItemFocused:function(){return this.focusedOptionId===this.id},onItemClick:function(t){var n=this.getItemProp(this.item,"command");n&&n({originalEvent:t,item:this.item.item}),this.$emit("item-click",{originalEvent:t,item:this.item,id:this.id})},onItemMouseMove:function(t){this.$emit("item-mousemove",{originalEvent:t,item:this.item,id:this.id})},visible:function(){return typeof this.item.visible=="function"?this.item.visible():this.item.visible!==!1},disabled:function(){return typeof this.item.disabled=="function"?this.item.disabled():this.item.disabled},label:function(){return typeof this.item.label=="function"?this.item.label():this.item.label},getMenuItemProps:function(t){return{action:d({class:this.cx("itemLink"),tabindex:"-1"},this.getPTOptions("itemLink")),icon:d({class:[this.cx("itemIcon"),t.icon]},this.getPTOptions("itemIcon")),label:d({class:this.cx("itemLabel")},this.getPTOptions("itemLabel"))}}},computed:{dataP:function(){return te({focus:this.isItemFocused(),disabled:this.disabled()})}},directives:{ripple:he}},dt=["id","aria-label","aria-disabled","data-p-focused","data-p-disabled","data-p"],ut=["data-p"],pt=["href","target"],ft=["data-p"],mt=["data-p"];function ht(e,t,n,o,r,i){var h=ne("ripple");return i.visible()?(s(),c("li",d({key:0,id:n.id,class:[e.cx("item"),n.item.class],role:"menuitem",style:n.item.style,"aria-label":i.label(),"aria-disabled":i.disabled(),"data-p-focused":i.isItemFocused(),"data-p-disabled":i.disabled()||!1,"data-p":i.dataP},i.getPTOptions("item")),[a("div",d({class:e.cx("itemContent"),onClick:t[0]||(t[0]=function(f){return i.onItemClick(f)}),onMousemove:t[1]||(t[1]=function(f){return i.onItemMouseMove(f)}),"data-p":i.dataP},i.getPTOptions("itemContent")),[n.templates.item?n.templates.item?(s(),L(M(n.templates.item),{key:1,item:n.item,label:i.label(),props:i.getMenuItemProps(n.item)},null,8,["item","label","props"])):b("",!0):W((s(),c("a",d({key:0,href:n.item.url,class:e.cx("itemLink"),target:n.item.target,tabindex:"-1"},i.getPTOptions("itemLink")),[n.templates.itemicon?(s(),L(M(n.templates.itemicon),{key:0,item:n.item,class:E(e.cx("itemIcon"))},null,8,["item","class"])):n.item.icon?(s(),c("span",d({key:1,class:[e.cx("itemIcon"),n.item.icon],"data-p":i.dataP},i.getPTOptions("itemIcon")),null,16,ft)):b("",!0),a("span",d({class:e.cx("itemLabel"),"data-p":i.dataP},i.getPTOptions("itemLabel")),I(i.label()),17,mt)],16,pt)),[[h]])],16,ut)],16,dt)):b("",!0)}Ie.render=ht;function de(e){return gt(e)||yt(e)||vt(e)||bt()}function bt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function vt(e,t){if(e){if(typeof e=="string")return Q(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Q(e,t):void 0}}function yt(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function gt(e){if(Array.isArray(e))return Q(e)}function Q(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,o=Array(t);n<t;n++)o[n]=e[n];return o}var Se={name:"Menu",extends:ct,inheritAttrs:!1,emits:["show","hide","focus","blur"],data:function(){return{overlayVisible:!1,focused:!1,focusedOptionIndex:-1,selectedOptionIndex:-1}},target:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,list:null,mounted:function(){this.popup||(this.bindResizeListener(),this.bindOutsideClickListener())},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.target=null,this.container&&this.autoZIndex&&P.clear(this.container),this.container=null},methods:{itemClick:function(t){var n=t.item;this.disabled(n)||(n.command&&n.command(t),this.overlayVisible&&this.hide(),!this.popup&&this.focusedOptionIndex!==t.id&&(this.focusedOptionIndex=t.id))},itemMouseMove:function(t){this.focused&&(this.focusedOptionIndex=t.id)},onListFocus:function(t){this.focused=!0,!this.popup&&this.changeFocusedOptionIndex(0),this.$emit("focus",t)},onListBlur:function(t){this.focused=!1,this.focusedOptionIndex=-1,this.$emit("blur",t)},onListKeyDown:function(t){switch(t.code){case"ArrowDown":this.onArrowDownKey(t);break;case"ArrowUp":this.onArrowUpKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"Enter":case"NumpadEnter":this.onEnterKey(t);break;case"Space":this.onSpaceKey(t);break;case"Escape":this.popup&&(B(this.target),this.hide());case"Tab":this.overlayVisible&&this.hide();break}},onArrowDownKey:function(t){var n=this.findNextOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()},onArrowUpKey:function(t){if(t.altKey&&this.popup)B(this.target),this.hide(),t.preventDefault();else{var n=this.findPrevOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()}},onHomeKey:function(t){this.changeFocusedOptionIndex(0),t.preventDefault()},onEndKey:function(t){this.changeFocusedOptionIndex(N(this.container,'li[data-pc-section="item"][data-p-disabled="false"]').length-1),t.preventDefault()},onEnterKey:function(t){var n=se(this.list,'li[id="'.concat("".concat(this.focusedOptionIndex),'"]')),o=n&&se(n,'a[data-pc-section="itemlink"]');this.popup&&B(this.target),o?o.click():n&&n.click(),t.preventDefault()},onSpaceKey:function(t){this.onEnterKey(t)},findNextOptionIndex:function(t){var n=N(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),o=de(n).findIndex(function(r){return r.id===t});return o>-1?o+1:0},findPrevOptionIndex:function(t){var n=N(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),o=de(n).findIndex(function(r){return r.id===t});return o>-1?o-1:0},changeFocusedOptionIndex:function(t){var n=N(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),o=t>=n.length?n.length-1:t<0?0:t;o>-1&&(this.focusedOptionIndex=n[o].getAttribute("id"))},toggle:function(t,n){this.overlayVisible?this.hide():this.show(t,n)},show:function(t,n){this.overlayVisible=!0,this.target=n??t.currentTarget},hide:function(){this.overlayVisible=!1,this.target=null},onEnter:function(t){ge(t,{position:"absolute",top:"0"}),this.alignOverlay(),this.bindOutsideClickListener(),this.bindResizeListener(),this.bindScrollListener(),this.autoZIndex&&P.set("menu",t,this.baseZIndex+this.$primevue.config.zIndex.menu),this.popup&&B(this.list),this.$emit("show")},onLeave:function(){this.unbindOutsideClickListener(),this.unbindResizeListener(),this.unbindScrollListener(),this.$emit("hide")},onAfterLeave:function(t){this.autoZIndex&&P.clear(t)},alignOverlay:function(){ye(this.container,this.target);var t=q(this.target);t>q(this.container)&&(this.container.style.minWidth=q(this.target)+"px")},bindOutsideClickListener:function(){var t=this;this.outsideClickListener||(this.outsideClickListener=function(n){var o=t.container&&!t.container.contains(n.target),r=!(t.target&&(t.target===n.target||t.target.contains(n.target)));t.overlayVisible&&o&&r?t.hide():!t.popup&&o&&r&&(t.focusedOptionIndex=-1)},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindScrollListener:function(){var t=this;this.scrollHandler||(this.scrollHandler=new ve(this.target,function(){t.overlayVisible&&t.hide()})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var t=this;this.resizeListener||(this.resizeListener=function(){t.overlayVisible&&!be()&&t.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},visible:function(t){return typeof t.visible=="function"?t.visible():t.visible!==!1},disabled:function(t){return typeof t.disabled=="function"?t.disabled():t.disabled},label:function(t){return typeof t.label=="function"?t.label():t.label},onOverlayClick:function(t){T.emit("overlay-click",{originalEvent:t,target:this.target})},containerRef:function(t){this.container=t},listRef:function(t){this.list=t}},computed:{focusedOptionId:function(){return this.focusedOptionIndex!==-1?this.focusedOptionIndex:null},dataP:function(){return te({popup:this.popup})}},components:{PVMenuitem:Ie,Portal:ee}},kt=["id","data-p"],wt=["id","tabindex","aria-activedescendant","aria-label","aria-labelledby"],Lt=["id"];function Ct(e,t,n,o,r,i){var h=A("PVMenuitem"),f=A("Portal");return s(),L(f,{appendTo:e.appendTo,disabled:!e.popup},{default:g(function(){return[v(ie,d({name:"p-anchored-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},e.ptm("transition")),{default:g(function(){return[!e.popup||r.overlayVisible?(s(),c("div",d({key:0,ref:i.containerRef,id:e.$id,class:e.cx("root"),onClick:t[3]||(t[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)}),"data-p":i.dataP},e.ptmi("root")),[e.$slots.start?(s(),c("div",d({key:0,class:e.cx("start")},e.ptm("start")),[w(e.$slots,"start")],16)):b("",!0),a("ul",d({ref:i.listRef,id:e.$id+"_list",class:e.cx("list"),role:"menu",tabindex:e.tabindex,"aria-activedescendant":r.focused?i.focusedOptionId:void 0,"aria-label":e.ariaLabel,"aria-labelledby":e.ariaLabelledby,onFocus:t[0]||(t[0]=function(){return i.onListFocus&&i.onListFocus.apply(i,arguments)}),onBlur:t[1]||(t[1]=function(){return i.onListBlur&&i.onListBlur.apply(i,arguments)}),onKeydown:t[2]||(t[2]=function(){return i.onListKeyDown&&i.onListKeyDown.apply(i,arguments)})},e.ptm("list")),[(s(!0),c(C,null,U(e.model,function(l,u){return s(),c(C,{key:i.label(l)+u.toString()},[l.items&&i.visible(l)&&!l.separator?(s(),c(C,{key:0},[l.items?(s(),c("li",d({key:0,id:e.$id+"_"+u,class:[e.cx("submenuLabel"),l.class],role:"none"},{ref_for:!0},e.ptm("submenuLabel")),[w(e.$slots,e.$slots.submenulabel?"submenulabel":"submenuheader",{item:l},function(){return[ke(I(i.label(l)),1)]})],16,Lt)):b("",!0),(s(!0),c(C,null,U(l.items,function(m,S){return s(),c(C,{key:m.label+u+"_"+S},[i.visible(m)&&!m.separator?(s(),L(h,{key:0,id:e.$id+"_"+u+"_"+S,item:m,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"])):i.visible(m)&&m.separator?(s(),c("li",d({key:"separator"+u+S,class:[e.cx("separator"),l.class],style:m.style,role:"separator"},{ref_for:!0},e.ptm("separator")),null,16)):b("",!0)],64)}),128))],64)):i.visible(l)&&l.separator?(s(),c("li",d({key:"separator"+u.toString(),class:[e.cx("separator"),l.class],style:l.style,role:"separator"},{ref_for:!0},e.ptm("separator")),null,16)):(s(),L(h,{key:i.label(l)+u.toString(),id:e.$id+"_"+u,item:l,index:u,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","index","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"]))],64)}),128))],16,wt),e.$slots.end?(s(),c("div",d({key:1,class:e.cx("end")},e.ptm("end")),[w(e.$slots,"end")],16)):b("",!0)],16,kt)):b("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo","disabled"])}Se.render=Ct;var Ot=`
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
`,It={root:"p-popover p-component",content:"p-popover-content"},St=F.extend({name:"popover",style:Ot,classes:It}),Et={name:"BasePopover",extends:H,props:{dismissable:{type:Boolean,default:!0},appendTo:{type:[String,Object],default:"body"},baseZIndex:{type:Number,default:0},autoZIndex:{type:Boolean,default:!0},breakpoints:{type:Object,default:null},closeOnEscape:{type:Boolean,default:!0}},style:St,provide:function(){return{$pcPopover:this,$parentInstance:this}}},Ee={name:"Popover",extends:Et,inheritAttrs:!1,emits:["show","hide"],data:function(){return{visible:!1}},watch:{dismissable:{immediate:!0,handler:function(t){t?this.bindOutsideClickListener():this.unbindOutsideClickListener()}}},selfClick:!1,target:null,eventTarget:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,styleElement:null,overlayEventListener:null,documentKeydownListener:null,beforeUnmount:function(){this.dismissable&&this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.destroyStyle(),this.unbindResizeListener(),this.target=null,this.container&&this.autoZIndex&&P.clear(this.container),this.overlayEventListener&&(T.off("overlay-click",this.overlayEventListener),this.overlayEventListener=null),this.container=null},mounted:function(){this.breakpoints&&this.createStyle()},methods:{toggle:function(t,n){this.visible?this.hide():this.show(t,n)},show:function(t,n){this.visible=!0,this.eventTarget=t.currentTarget,this.target=n||t.currentTarget},hide:function(){this.visible=!1},onContentClick:function(){this.selfClick=!0},onEnter:function(t){var n=this;ge(t,{position:"absolute",top:"0"}),this.alignOverlay(),this.dismissable&&this.bindOutsideClickListener(),this.bindScrollListener(),this.bindResizeListener(),this.autoZIndex&&P.set("overlay",t,this.baseZIndex+this.$primevue.config.zIndex.overlay),this.overlayEventListener=function(o){n.container.contains(o.target)&&(n.selfClick=!0)},this.focus(),T.on("overlay-click",this.overlayEventListener),this.$emit("show"),this.closeOnEscape&&this.bindDocumentKeyDownListener()},onLeave:function(){this.unbindOutsideClickListener(),this.unbindScrollListener(),this.unbindResizeListener(),this.unbindDocumentKeyDownListener(),T.off("overlay-click",this.overlayEventListener),this.overlayEventListener=null,this.$emit("hide")},onAfterLeave:function(t){this.autoZIndex&&P.clear(t)},alignOverlay:function(){ye(this.container,this.target,!1);var t=ae(this.container),n=ae(this.target),o=0;t.left<n.left&&(o=n.left-t.left),this.container.style.setProperty(ze("popover.arrow.left").name,"".concat(o,"px")),t.top<n.top&&(this.container.setAttribute("data-p-popover-flipped","true"),!this.isUnstyled&&D(this.container,"p-popover-flipped"))},onContentKeydown:function(t){t.code==="Escape"&&this.closeOnEscape&&(this.hide(),B(this.target))},onButtonKeydown:function(t){switch(t.code){case"ArrowDown":case"ArrowUp":case"ArrowLeft":case"ArrowRight":t.preventDefault()}},focus:function(){var t=this.container.querySelector("[autofocus]");t&&t.focus()},onKeyDown:function(t){t.code==="Escape"&&this.closeOnEscape&&(this.visible=!1)},bindDocumentKeyDownListener:function(){this.documentKeydownListener||(this.documentKeydownListener=this.onKeyDown.bind(this),window.document.addEventListener("keydown",this.documentKeydownListener))},unbindDocumentKeyDownListener:function(){this.documentKeydownListener&&(window.document.removeEventListener("keydown",this.documentKeydownListener),this.documentKeydownListener=null)},bindOutsideClickListener:function(){var t=this;!this.outsideClickListener&&je()&&(this.outsideClickListener=function(n){t.visible&&!t.selfClick&&!t.isTargetClicked(n)&&(t.visible=!1),t.selfClick=!1},document.addEventListener("click",this.outsideClickListener))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener),this.outsideClickListener=null,this.selfClick=!1)},bindScrollListener:function(){var t=this;this.scrollHandler||(this.scrollHandler=new ve(this.target,function(){t.visible&&(t.visible=!1)})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var t=this;this.resizeListener||(this.resizeListener=function(){t.visible&&!be()&&(t.visible=!1)},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},isTargetClicked:function(t){return this.eventTarget&&(this.eventTarget===t.target||this.eventTarget.contains(t.target))},containerRef:function(t){this.container=t},createStyle:function(){if(!this.styleElement&&!this.isUnstyled){var t;this.styleElement=document.createElement("style"),this.styleElement.type="text/css",Ke(this.styleElement,"nonce",(t=this.$primevue)===null||t===void 0||(t=t.config)===null||t===void 0||(t=t.csp)===null||t===void 0?void 0:t.nonce),document.head.appendChild(this.styleElement);var n="";for(var o in this.breakpoints)n+=`
                        @media screen and (max-width: `.concat(o,`) {
                            .p-popover[`).concat(this.$attrSelector,`] {
                                width: `).concat(this.breakpoints[o],` !important;
                            }
                        }
                    `);this.styleElement.innerHTML=n}},destroyStyle:function(){this.styleElement&&(document.head.removeChild(this.styleElement),this.styleElement=null)},onOverlayClick:function(t){T.emit("overlay-click",{originalEvent:t,target:this.target})}},directives:{focustrap:Ce,ripple:he},components:{Portal:ee}},At=["aria-modal"];function Dt(e,t,n,o,r,i){var h=A("Portal"),f=ne("focustrap");return s(),L(h,{appendTo:e.appendTo},{default:g(function(){return[v(ie,d({name:"p-anchored-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},e.ptm("transition")),{default:g(function(){return[r.visible?W((s(),c("div",d({key:0,ref:i.containerRef,role:"dialog","aria-modal":r.visible,onClick:t[3]||(t[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)}),class:e.cx("root")},e.ptmi("root")),[e.$slots.container?w(e.$slots,"container",{key:0,closeCallback:i.hide,keydownCallback:function(u){return i.onButtonKeydown(u)}}):(s(),c("div",d({key:1,class:e.cx("content"),onClick:t[0]||(t[0]=function(){return i.onContentClick&&i.onContentClick.apply(i,arguments)}),onMousedown:t[1]||(t[1]=function(){return i.onContentClick&&i.onContentClick.apply(i,arguments)}),onKeydown:t[2]||(t[2]=function(){return i.onContentKeydown&&i.onContentKeydown.apply(i,arguments)})},e.ptm("content")),[w(e.$slots,"default")],16))],16,At)),[[f]]):b("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo"])}Ee.render=Dt;var Pt={root:"p-badge p-component"},xt=F.extend({name:"badge-directive",classes:Pt}),Bt=Re.extend({style:xt});function x(e){"@babel/helpers - typeof";return x=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},x(e)}function ue(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),n.push.apply(n,o)}return n}function pe(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?ue(Object(n),!0).forEach(function(o){X(e,o,n[o])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ue(Object(n)).forEach(function(o){Object.defineProperty(e,o,Object.getOwnPropertyDescriptor(n,o))})}return e}function X(e,t,n){return(t=Kt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Kt(e){var t=jt(e,"string");return x(t)=="symbol"?t:t+""}function jt(e,t){if(x(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var o=n.call(e,t);if(x(o)!="object")return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var zt=Bt.extend("badge",{mounted:function(t,n){console.warn("Deprecated since v4. Use OverlayBadge component instead.");var o=Te("pv_id")+"_badge",r=Me("span",X(X({id:o,class:!this.isUnstyled()&&this.cx("root")},this.$attrSelector,""),"p-bind",this.ptm("root",{context:pe(pe({},n.modifiers),{},{nogutter:String(n.value).length===1,dot:n.value==null})})));t.$_pbadgeId=r.getAttribute("id");for(var i in n.modifiers)!this.isUnstyled()&&D(r,"p-badge-"+i);n.value!=null?(x(n.value)==="object"?t.$_badgeValue=n.value.value:t.$_badgeValue=n.value,r.appendChild(document.createTextNode(t.$_badgeValue)),String(t.$_badgeValue).length===1&&!this.isUnstyled()&&!this.isUnstyled()&&D(r,"p-badge-circle")):!this.isUnstyled()&&D(r,"p-badge-dot"),t.setAttribute("data-pd-badge",!0),!this.isUnstyled()&&D(t,"p-overlay-badge"),t.setAttribute("data-p-overlay-badge","true"),t.appendChild(r),this.$el=r},updated:function(t,n){if(!this.isUnstyled()&&D(t,"p-overlay-badge"),t.setAttribute("data-p-overlay-badge","true"),n.oldValue!==n.value){var o=document.getElementById(t.$_pbadgeId);x(n.value)==="object"?t.$_badgeValue=n.value.value:t.$_badgeValue=n.value,this.isUnstyled()||(t.$_badgeValue?(le(o,"p-badge-dot")&&ce(o,"p-badge-dot"),t.$_badgeValue.length===1?D(o,"p-badge-circle"):ce(o,"p-badge-circle")):!t.$_badgeValue&&!le(o,"p-badge-dot")&&D(o,"p-badge-dot")),o.innerHTML="",o.appendChild(document.createTextNode(t.$_badgeValue))}}});const Rt={class:"notification-menu"},Tt={class:"notification-header"},Mt={class:"notification-list"},_t={key:0,class:"notification-empty"},Ut=["onClick"],Vt={class:"notification-icon"},Ft={class:"notification-content"},Ht={class:"notification-item-title"},$t={class:"notification-message"},Nt={class:"notification-time"},Zt={key:0,class:"notification-footer"},Wt={__name:"NotificationMenu",setup(e){const t=zt,n=Le(),o=_(),r=K(()=>n.notifications),i=K(()=>n.unreadCount),h=k=>{o.value.toggle(k)},f=()=>{o.value.hide()},l=k=>({info:"pi pi-info-circle",success:"pi pi-check-circle",warning:"pi pi-exclamation-triangle",error:"pi pi-times-circle"})[k]||"pi pi-bell",u=k=>{const y=new Date(k),p=new Date-y,R=Math.floor(p/6e4);if(R<1)return"Just now";if(R<60)return`${R}m ago`;const Y=Math.floor(R/60);if(Y<24)return`${Y}h ago`;const re=Math.floor(Y/24);return re<7?`${re}d ago`:y.toLocaleDateString()},m=async k=>{k.isRead||await n.markAsRead(k.id)},S=async()=>{await n.markAllAsRead()};return(k,y)=>{const z=A("router-link");return s(),c("div",Rt,[W((s(),L(O(j),{type:"button",onClick:h,text:"",rounded:"",severity:"secondary",class:"notification-button"},{default:g(()=>[...y[0]||(y[0]=[a("i",{class:"pi pi-bell",style:{"font-size":"1.25rem"}},null,-1)])]),_:1})),[[O(t),i.value>0?i.value:null,void 0,{danger:!0}]]),v(O(Ee),{ref_key:"notificationPopover",ref:o,appendTo:"body",class:"notification-popover"},{default:g(()=>[a("div",Tt,[y[1]||(y[1]=a("span",{class:"notification-title"},"Notifications",-1)),i.value>0?(s(),L(O(j),{key:0,label:"Mark all read",text:"",size:"small",onClick:S})):b("",!0)]),a("div",Mt,[r.value.length===0?(s(),c("div",_t,[...y[2]||(y[2]=[a("i",{class:"pi pi-inbox"},null,-1),a("span",null,"No notifications",-1)])])):b("",!0),(s(!0),c(C,null,U(r.value.slice(0,5),p=>(s(),c("div",{key:p.id,class:E(["notification-item",{unread:!p.isRead}]),onClick:R=>m(p)},[a("div",Vt,[a("i",{class:E(l(p.type))},null,2)]),a("div",Ft,[a("span",Ht,I(p.title),1),a("span",$t,I(p.message),1),a("span",Nt,I(u(p.createdAt)),1)])],10,Ut))),128))]),r.value.length>0?(s(),c("div",Zt,[v(z,{to:"/notifications",class:"view-all-link",onClick:f},{default:g(()=>[...y[3]||(y[3]=[ke(" View all notifications ",-1)])]),_:1})])):b("",!0)]),_:1},512)])}}},Yt=$(Wt,[["__scopeId","data-v-17631589"]]),qt={class:"app-header"},Jt={class:"header-left"},Gt={class:"header-right"},Qt={class:"user-name"},Xt={__name:"AppHeader",emits:["toggle-sidebar"],setup(e){const t=we(),n=oe(),o=_(),r=K(()=>n.user?.name||n.user?.username||"User"),i=K(()=>r.value.split(" ").map(m=>m[0]).join("").toUpperCase().substring(0,2)),h=_([{label:"Profile",icon:"pi pi-user",command:()=>t.push("/profile")},{separator:!0},{label:"Logout",icon:"pi pi-sign-out",command:()=>l()}]),f=u=>{o.value.toggle(u)},l=async()=>{await n.logout(),t.push("/login")};return(u,m)=>(s(),c("header",qt,[a("div",Jt,[v(O(j),{icon:"pi pi-bars",text:"",rounded:"",severity:"secondary",onClick:m[0]||(m[0]=S=>u.$emit("toggle-sidebar")),class:"menu-button"}),m[1]||(m[1]=a("span",{class:"app-title"},"AppTemplate",-1))]),a("div",Gt,[v(Yt),v(O(j),{type:"button",onClick:f,class:"user-button",text:"",rounded:""},{default:g(()=>[v(O(Fe),{label:i.value,shape:"circle",class:"user-avatar"},null,8,["label"]),a("span",Qt,I(r.value),1),m[2]||(m[2]=a("i",{class:"pi pi-chevron-down",style:{"font-size":"0.75rem"}},null,-1))]),_:1}),v(O(Se),{ref_key:"userMenu",ref:o,model:h.value,popup:!0},null,8,["model"])])]))}},en=$(Xt,[["__scopeId","data-v-0a72540b"]]),tn={class:"app-footer"},nn={__name:"AppFooter",setup(e){const t=new Date().getFullYear();return(n,o)=>(s(),c("footer",tn,[a("span",null,"© "+I(O(t))+" AppTemplate. All rights reserved.",1)]))}},on=$(nn,[["__scopeId","data-v-f6ad09b6"]]);var rn=`
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
`,sn={root:"p-confirmdialog",icon:"p-confirmdialog-icon",message:"p-confirmdialog-message",pcRejectButton:"p-confirmdialog-reject-button",pcAcceptButton:"p-confirmdialog-accept-button"},an=F.extend({name:"confirmdialog",style:rn,classes:sn}),ln={name:"BaseConfirmDialog",extends:H,props:{group:String,breakpoints:{type:Object,default:null},draggable:{type:Boolean,default:!0}},style:an,provide:function(){return{$pcConfirmDialog:this,$parentInstance:this}}},Ae={name:"ConfirmDialog",extends:ln,confirmListener:null,closeListener:null,data:function(){return{visible:!1,confirmation:null}},mounted:function(){var t=this;this.confirmListener=function(n){n&&n.group===t.group&&(t.confirmation=n,t.confirmation.onShow&&t.confirmation.onShow(),t.visible=!0)},this.closeListener=function(){t.visible=!1,t.confirmation=null},Z.on("confirm",this.confirmListener),Z.on("close",this.closeListener)},beforeUnmount:function(){Z.off("confirm",this.confirmListener),Z.off("close",this.closeListener)},methods:{accept:function(){this.confirmation.accept&&this.confirmation.accept(),this.visible=!1},reject:function(){this.confirmation.reject&&this.confirmation.reject(),this.visible=!1},onHide:function(){this.confirmation.onHide&&this.confirmation.onHide(),this.visible=!1}},computed:{appendTo:function(){return this.confirmation?this.confirmation.appendTo:"body"},target:function(){return this.confirmation?this.confirmation.target:null},modal:function(){return this.confirmation?this.confirmation.modal==null?!0:this.confirmation.modal:!0},header:function(){return this.confirmation?this.confirmation.header:null},message:function(){return this.confirmation?this.confirmation.message:null},blockScroll:function(){return this.confirmation?this.confirmation.blockScroll:!0},position:function(){return this.confirmation?this.confirmation.position:null},acceptLabel:function(){if(this.confirmation){var t,n=this.confirmation;return n.acceptLabel||((t=n.acceptProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.accept}return this.$primevue.config.locale.accept},rejectLabel:function(){if(this.confirmation){var t,n=this.confirmation;return n.rejectLabel||((t=n.rejectProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.reject}return this.$primevue.config.locale.reject},acceptIcon:function(){var t;return this.confirmation?this.confirmation.acceptIcon:(t=this.confirmation)!==null&&t!==void 0&&t.acceptProps?this.confirmation.acceptProps.icon:null},rejectIcon:function(){var t;return this.confirmation?this.confirmation.rejectIcon:(t=this.confirmation)!==null&&t!==void 0&&t.rejectProps?this.confirmation.rejectProps.icon:null},autoFocusAccept:function(){return this.confirmation.defaultFocus===void 0||this.confirmation.defaultFocus==="accept"},autoFocusReject:function(){return this.confirmation.defaultFocus==="reject"},closeOnEscape:function(){return this.confirmation?this.confirmation.closeOnEscape:!0}},components:{Dialog:Ve,Button:j}};function cn(e,t,n,o,r,i){var h=A("Button"),f=A("Dialog");return s(),L(f,{visible:r.visible,"onUpdate:visible":[t[2]||(t[2]=function(l){return r.visible=l}),i.onHide],role:"alertdialog",class:E(e.cx("root")),modal:i.modal,header:i.header,blockScroll:i.blockScroll,appendTo:i.appendTo,position:i.position,breakpoints:e.breakpoints,closeOnEscape:i.closeOnEscape,draggable:e.draggable,pt:e.pt,unstyled:e.unstyled},J({default:g(function(){return[e.$slots.container?b("",!0):(s(),c(C,{key:0},[e.$slots.message?(s(),L(M(e.$slots.message),{key:1,message:r.confirmation},null,8,["message"])):(s(),c(C,{key:0},[w(e.$slots,"icon",{},function(){return[e.$slots.icon?(s(),L(M(e.$slots.icon),{key:0,class:E(e.cx("icon"))},null,8,["class"])):r.confirmation.icon?(s(),c("span",d({key:1,class:[r.confirmation.icon,e.cx("icon")]},e.ptm("icon")),null,16)):b("",!0)]}),a("span",d({class:e.cx("message")},e.ptm("message")),I(i.message),17)],64))],64))]}),_:2},[e.$slots.container?{name:"container",fn:g(function(l){return[w(e.$slots,"container",{message:r.confirmation,closeCallback:l.closeCallback,acceptCallback:i.accept,rejectCallback:i.reject,initDragCallback:l.initDragCallback})]}),key:"0"}:void 0,e.$slots.container?void 0:{name:"footer",fn:g(function(){var l;return[v(h,d({class:[e.cx("pcRejectButton"),r.confirmation.rejectClass],autofocus:i.autoFocusReject,unstyled:e.unstyled,text:((l=r.confirmation.rejectProps)===null||l===void 0?void 0:l.text)||!1,onClick:t[0]||(t[0]=function(u){return i.reject()})},r.confirmation.rejectProps,{label:i.rejectLabel,pt:e.ptm("pcRejectButton")}),J({_:2},[i.rejectIcon||e.$slots.rejecticon?{name:"icon",fn:g(function(u){return[w(e.$slots,"rejecticon",{},function(){return[a("span",d({class:[i.rejectIcon,u.class]},e.ptm("pcRejectButton").icon,{"data-pc-section":"rejectbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["class","autofocus","unstyled","text","label","pt"]),v(h,d({label:i.acceptLabel,class:[e.cx("pcAcceptButton"),r.confirmation.acceptClass],autofocus:i.autoFocusAccept,unstyled:e.unstyled,onClick:t[1]||(t[1]=function(u){return i.accept()})},r.confirmation.acceptProps,{pt:e.ptm("pcAcceptButton")}),J({_:2},[i.acceptIcon||e.$slots.accepticon?{name:"icon",fn:g(function(u){return[w(e.$slots,"accepticon",{},function(){return[a("span",d({class:[i.acceptIcon,u.class]},e.ptm("pcAcceptButton").icon,{"data-pc-section":"acceptbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["label","class","autofocus","unstyled","pt"])]}),key:"1"}]),1032,["visible","class","modal","header","blockScroll","appendTo","position","breakpoints","closeOnEscape","draggable","onUpdate:visible","pt","unstyled"])}Ae.render=cn;const dn={class:"layout-wrapper"},un={class:"layout-main-container"},pn={class:"layout-main"},fn={__name:"default",setup(e){const t=we(),n=oe(),o=Le(),r=_(!0),i=()=>{r.value=window.innerWidth>=992};return fe(()=>{if(!n.isAuthenticated){t.push("/login");return}o.connect(),i(),window.addEventListener("resize",i)}),me(()=>{window.removeEventListener("resize",i),o.disconnect()}),(h,f)=>{const l=A("router-view");return s(),c("div",dn,[v(rt,{visible:r.value,"onUpdate:visible":f[0]||(f[0]=u=>r.value=u)},null,8,["visible"]),a("div",un,[v(en,{onToggleSidebar:f[1]||(f[1]=u=>r.value=!r.value)}),a("main",pn,[v(l)]),v(on)]),v(O(Ae))])}}},wn=$(fn,[["__scopeId","data-v-30f07f64"]]);export{wn as default};
