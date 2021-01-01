var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function s(t){t.forEach(n)}function a(t){return"function"==typeof t}function o(t,n){return t!=t?n==n:t!==n}function r(t,n,e,s){return t[1]&&s?function(t,n){for(const e in n)t[e]=n[e];return t}(e.ctx.slice(),t[1](s(n))):e.ctx}function i(t,n,e,s,a,o,i){const l=function(t,n,e,s){if(t[2]&&s){const a=t[2](s(e));if(void 0===n.dirty)return a;if("object"==typeof a){const t=[],e=Math.max(n.dirty.length,a.length);for(let s=0;s<e;s+=1)t[s]=n.dirty[s]|a[s];return t}return n.dirty|a}return n.dirty}(n,s,a,o);if(l){const a=r(n,e,s,i);t.p(a,l)}}function l(t,n){t.appendChild(n)}function c(t,n,e){t.insertBefore(n,e||null)}function p(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function g(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function h(t,n,e){t.classList[e?"add":"remove"](n)}let m;function v(t){m=t}function k(){if(!m)throw new Error("Function called outside component initialization");return m}function y(){const t=k();return(n,e)=>{const s=t.$$.callbacks[n];if(s){const a=function(t,n){const e=document.createEvent("CustomEvent");return e.initCustomEvent(t,!1,!1,n),e}(n,e);s.slice().forEach((n=>{n.call(t,a)}))}}}const $=[],b=[],x=[],w=[],E=Promise.resolve();let M=!1;function C(){M||(M=!0,E.then(L))}function T(t){x.push(t)}let _=!1;const I=new Set;function L(){if(!_){_=!0;do{for(let t=0;t<$.length;t+=1){const n=$[t];v(n),H(n.$$)}for(v(null),$.length=0;b.length;)b.pop()();for(let t=0;t<x.length;t+=1){const n=x[t];I.has(n)||(I.add(n),n())}x.length=0}while($.length);for(;w.length;)w.pop()();M=!1,_=!1,I.clear()}}function H(t){if(null!==t.fragment){t.update(),s(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(T)}}const O=new Set;function P(t,n){t&&t.i&&(O.delete(t),t.i(n))}function A(t,n,e,s){if(t&&t.o){if(O.has(t))return;O.add(t),undefined.c.push((()=>{O.delete(t),s&&(e&&t.d(1),s())})),t.o(n)}}function S(t,e,o){const{fragment:r,on_mount:i,on_destroy:l,after_update:c}=t.$$;r&&r.m(e,o),T((()=>{const e=i.map(n).filter(a);l?l.push(...e):s(e),t.$$.on_mount=[]})),c.forEach(T)}function j(t,n){const e=t.$$;null!==e.fragment&&(s(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function D(n,a,o,r,i,l,c=[-1]){const u=m;v(n);const d=a.props||{},f=n.$$={fragment:null,ctx:null,props:l,update:t,not_equal:i,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:e(),dirty:c,skip_bound:!1};let g=!1;if(f.ctx=o?o(n,d,((t,e,...s)=>{const a=s.length?s[0]:e;return f.ctx&&i(f.ctx[t],f.ctx[t]=a)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](a),g&&function(t,n){-1===t.$$.dirty[0]&&($.push(t),C(),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}(n,t)),e})):[],f.update(),g=!0,s(f.before_update),f.fragment=!!r&&r(f.ctx),a.target){if(a.hydrate){const t=function(t){return Array.from(t.childNodes)}(a.target);f.fragment&&f.fragment.l(t),t.forEach(p)}else f.fragment&&f.fragment.c();a.intro&&P(n.$$.fragment),S(n,a.target,a.anchor),L()}v(u)}class N{$destroy(){j(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const q=t=>({intersecting:2&t,entry:1&t}),U=t=>({intersecting:t[1],entry:t[0]});function z(t){let n;const e=t[7].default,s=function(t,n,e,s){if(t){const a=r(t,n,e,s);return t[0](a)}}(e,t,t[6],U);return{c(){s&&s.c()},m(t,e){s&&s.m(t,e),n=!0},p(t,[n]){s&&s.p&&67&n&&i(s,e,t,t[6],n,q,U)},i(t){n||(P(s,t),n=!0)},o(t){A(s,t),n=!1},d(t){s&&s.d(t)}}}function G(t,n,e){let{$$slots:s={},$$scope:a}=n,{element:o=null}=n,{root:r=null}=n,{rootMargin:i="0px"}=n,{threshold:l=0}=n,{entry:c=null}=n,{intersecting:p=!1}=n;const u=y();let d,f=null;var g;return g=async()=>{null!=c&&u("observe",c),await(C(),E),null!=o&&o!=f&&(d.observe(o),null!=f&&d.unobserve(f),f=o)},k().$$.after_update.push(g),function(t){k().$$.on_destroy.push(t)}((()=>{d.disconnect()})),t.$$set=t=>{"element"in t&&e(2,o=t.element),"root"in t&&e(3,r=t.root),"rootMargin"in t&&e(4,i=t.rootMargin),"threshold"in t&&e(5,l=t.threshold),"entry"in t&&e(0,c=t.entry),"intersecting"in t&&e(1,p=t.intersecting),"$$scope"in t&&e(6,a=t.$$scope)},t.$$.update=()=>{56&t.$$.dirty&&(d=new IntersectionObserver((t=>{t.forEach((t=>{e(0,c=t),e(1,p=t.isIntersecting)}))}),{root:r,rootMargin:i,threshold:l}))},[c,p,o,r,i,l,a,s]}class R extends N{constructor(t){super(),D(this,t,G,z,o,{element:2,root:3,rootMargin:4,threshold:5,entry:0,intersecting:1})}}function W(n){let e,s;return{c(){e=u("div"),e.textContent="Hello world",s=f()},m(t,a){c(t,e,a),n[2](e),c(t,s,a)},p:t,d(t){t&&p(e),n[2](null),t&&p(s)}}}function B(t){let n,e,s,a,o,r,i,m,v,k,y,$,x,E,M,C,T,_,I,L,H,O,D,N,q,U,z,G,B,F,V,J,K,Q,X,Y,Z,tt,nt,et,st,at,ot,rt,it,lt,ct,pt,ut=t[1]?"Element is in view":"Element is not in view";function dt(n){t[3].call(null,n)}let ft={element:t[0],$$slots:{default:[W]},$$scope:{ctx:t}};return void 0!==t[1]&&(ft.intersecting=t[1]),D=new R({props:ft}),b.push((()=>function(t,n,e){const s=t.$$.props[n];void 0!==s&&(t.$$.bound[s]=e,e(t.$$.ctx[s]))}(D,"intersecting",dt))),{c(){var l;n=u("main"),e=u("h1"),e.textContent="svelte-intersection-observer",s=f(),a=u("p"),a.innerHTML='<a href="https://npmjs.com/package/svelte-intersection-observer"><img src="https://img.shields.io/npm/v/svelte-intersection-observer.svg?color=%23ff3e00&amp;style=for-the-badge" alt="NPM"/></a>',o=f(),r=u("blockquote"),r.innerHTML='<p>Detect if an element is in the viewport using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry">Intersection Observer API</a>.</p>',i=f(),m=u("p"),m.innerHTML='Try it in the <a href="https://svelte.dev/repl/8cd2327a580c4f429c71f7df999bd51d?version=3.29.7">Svelte REPL</a>.',v=f(),k=u("p"),k.innerHTML="<strong>Table of Contents</strong>",y=u("ul"),y.innerHTML='<li><a href="#install">Install</a></li> \n<li><a href="#usage">Usage</a></li> \n<li><a href="#api">API</a></li> \n<ul><li><a href="#props">Props</a></li> \n<li><a href="#dispatched-events">Dispatched events</a></li> \n</ul><li><a href="#typescript-support">TypeScript support</a></li> \n<li><a href="#changelog">Changelog</a></li> \n<li><a href="#license">License</a></li>',$=f(),x=u("h2"),x.textContent="Install",E=f(),M=u("pre"),C=f(),T=u("h2"),T.textContent="Usage",_=f(),I=u("div"),L=u("header"),H=d(ut),O=f(),(l=D.$$.fragment)&&l.c(),q=u("pre"),U=f(),z=u("h2"),z.textContent="API",G=f(),B=u("h3"),B.textContent="Props",F=f(),V=u("table"),V.innerHTML='<thead><tr><th style="text-align:left">Prop name</th> \n<th style="text-align:left">Description</th> \n<th style="text-align:left">Value</th></tr></thead> \n<tbody><tr><td style="text-align:left">element</td> \n<td style="text-align:left">Element observed for intersection</td> \n<td style="text-align:left"><code>HTMLElement</code></td></tr> \n<tr><td style="text-align:left">root</td> \n<td style="text-align:left">Containing element</td> \n<td style="text-align:left"><code>null</code> or <code>HTMLElement</code> (default: <code>null</code>)</td></tr> \n<tr><td style="text-align:left">rootMargin</td> \n<td style="text-align:left">Offset of the containing element</td> \n<td style="text-align:left"><code>string</code> (default: <code>&quot;0px&quot;</code>)</td></tr> \n<tr><td style="text-align:left">threshold</td> \n<td style="text-align:left">Percentage of element to trigger an event</td> \n<td style="text-align:left"><code>number</code> between 0 and 1 (default: <code>0</code>)</td></tr> \n<tr><td style="text-align:left">entry</td> \n<td style="text-align:left">Observed element metadata</td> \n<td style="text-align:left"><a href="https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry"><code>IntersectionObserverEntry</code></a></td></tr> \n<tr><td style="text-align:left">intersecting</td> \n<td style="text-align:left"><code>true</code> if the observed element is intersecting the viewport</td> \n<td style="text-align:left"><code>boolean</code></td></tr></tbody>',J=f(),K=u("h3"),K.textContent="Dispatched events",Q=f(),X=u("ul"),X.innerHTML="<li><strong>on:observe</strong>: fired when an intersection change occurs (type <code>IntersectionObserverEntry</code>)</li>",Y=f(),Z=u("h2"),Z.textContent="TypeScript support",tt=f(),nt=u("p"),nt.textContent="Svelte version 3.31.0 or greater is required to use this module with TypeScript.",et=f(),st=u("h2"),st.textContent="Changelog",at=f(),ot=u("p"),ot.innerHTML='<a href="https://github.com/metonym/svelte-intersection-observer/tree/master/CHANGELOG.md">Changelog</a>',rt=f(),it=u("h2"),it.textContent="License",lt=f(),ct=u("p"),ct.innerHTML='<a href="https://github.com/metonym/svelte-intersection-observer/tree/master/LICENSE">MIT</a>',g(e,"id","svelte-intersection-observer"),g(x,"id","install"),g(M,"class","language-bash"),g(T,"id","usage"),h(L,"intersecting",t[1]),g(I,"class","code-fence"),g(q,"class","language-svelte"),g(q,"data-svelte",""),g(z,"id","api"),g(B,"id","props"),g(K,"id","dispatched-events"),g(Z,"id","typescript-support"),g(st,"id","changelog"),g(it,"id","license"),g(n,"class","markdown-body")},m(t,p){c(t,n,p),l(n,e),l(n,s),l(n,a),l(n,o),l(n,r),l(n,i),l(n,m),l(n,v),l(n,k),l(n,y),l(n,$),l(n,x),l(n,E),l(n,M),M.innerHTML='<span class="token function">yarn</span> <span class="token function">add</span> -D svelte-intersection-observer\n<span class="token comment"># OR</span>\n<span class="token function">npm</span> i -D svelte-intersection-observer\n',l(n,C),l(n,T),l(n,_),l(n,I),l(I,L),l(L,H),l(I,O),S(D,I,null),l(n,q),q.innerHTML='<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">\n  <span class="token keyword">import</span> IntersectionObserver <span class="token keyword">from</span> <span class="token string">"svelte-intersection-observer"</span><span class="token punctuation">;</span>\n\n  <span class="token keyword">let</span> element<span class="token punctuation">;</span>\n  <span class="token keyword">let</span> intersecting<span class="token punctuation">;</span>\n</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span>\n\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>header</span> <span class="token attr-name"><span class="token namespace">class:</span>intersecting</span><span class="token punctuation">></span></span>\n  <span class="token language-javascript"><span class="token punctuation">{</span>intersecting <span class="token operator">?</span> <span class="token string">\'Element is in view\'</span> <span class="token operator">:</span> <span class="token string">\'Element is not in view\'</span><span class="token punctuation">}</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span><span class="token punctuation">></span></span>\n\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>IntersectionObserver</span> <span class="token language-javascript"><span class="token punctuation">{</span>element<span class="token punctuation">}</span></span> <span class="token attr-name"><span class="token namespace">bind:</span>intersecting</span><span class="token punctuation">></span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name"><span class="token namespace">bind:</span>this=</span><span class="token language-javascript"><span class="token punctuation">{</span>element<span class="token punctuation">}</span></span><span class="token punctuation">></span></span>Hello world<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>IntersectionObserver</span><span class="token punctuation">></span></span>\n',l(n,U),l(n,z),l(n,G),l(n,B),l(n,F),l(n,V),l(n,J),l(n,K),l(n,Q),l(n,X),l(n,Y),l(n,Z),l(n,tt),l(n,nt),l(n,et),l(n,st),l(n,at),l(n,ot),l(n,rt),l(n,it),l(n,lt),l(n,ct),pt=!0},p(t,[n]){(!pt||2&n)&&ut!==(ut=t[1]?"Element is in view":"Element is not in view")&&function(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}(H,ut),2&n&&h(L,"intersecting",t[1]);const e={};var s;1&n&&(e.element=t[0]),17&n&&(e.$$scope={dirty:n,ctx:t}),!N&&2&n&&(N=!0,e.intersecting=t[1],s=()=>N=!1,w.push(s)),D.$set(e)},i(t){pt||(P(D.$$.fragment,t),pt=!0)},o(t){A(D.$$.fragment,t),pt=!1},d(t){t&&p(n),j(D)}}}function F(t,n,e){let s,a;return[s,a,function(t){b[t?"unshift":"push"]((()=>{s=t,e(0,s)}))},function(t){a=t,e(1,a)}]}return new class extends N{constructor(t){super(),D(this,t,F,B,o,{})}}({target:document.body})}();
