var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/IntersectionObserver.svelte generated by Svelte v3.31.0 */

    const get_default_slot_changes = dirty => ({
    	intersecting: dirty & /*intersecting*/ 2,
    	entry: dirty & /*entry*/ 1
    });

    const get_default_slot_context = ctx => ({
    	intersecting: /*intersecting*/ ctx[1],
    	entry: /*entry*/ ctx[0]
    });

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, intersecting, entry*/ 67) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let observer = undefined;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IntersectionObserver", slots, ['default']);
    	let { element = null } = $$props;
    	let { root = null } = $$props;
    	let { rootMargin = "0px" } = $$props;
    	let { threshold = 0 } = $$props;
    	let { entry = null } = $$props;
    	const dispatch = createEventDispatcher();
    	let intersecting = false;
    	let prevElement = null;

    	afterUpdate(async () => {
    		if (entry != null) dispatch("observe", entry);
    		await tick();

    		if (element != null && element != prevElement) {
    			observer.observe(element);
    			if (prevElement != null) observer.unobserve(prevElement);
    			prevElement = element;
    		}
    	});

    	onDestroy(() => {
    		observer.disconnect();
    	});

    	const writable_props = ["element", "root", "rootMargin", "threshold", "entry"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(2, element = $$props.element);
    		if ("root" in $$props) $$invalidate(3, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(4, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(5, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		observer,
    		element,
    		root,
    		rootMargin,
    		threshold,
    		entry,
    		tick,
    		createEventDispatcher,
    		onDestroy,
    		afterUpdate,
    		dispatch,
    		intersecting,
    		prevElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(2, element = $$props.element);
    		if ("root" in $$props) $$invalidate(3, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(4, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(5, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("prevElement" in $$props) prevElement = $$props.prevElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*root, rootMargin, threshold*/ 56) {
    			 observer = new IntersectionObserver(entries => {
    					entries.forEach(_entry => {
    						$$invalidate(0, entry = _entry);
    						$$invalidate(1, intersecting = _entry.isIntersecting);
    					});
    				},
    			{ root, rootMargin, threshold });
    		}
    	};

    	return [entry, intersecting, element, root, rootMargin, threshold, $$scope, slots];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, not_equal, {
    			element: 2,
    			root: 3,
    			rootMargin: 4,
    			threshold: 5,
    			entry: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get element() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rootMargin() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootMargin(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entry() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* README.md generated by Svelte v3.31.0 */
    const file = "README.md";

    // (34:4) {#if inView}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Element is in view");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:4) {#if inView}",
    		ctx
    	});

    	return block;
    }

    // (32:0) <IntersectionObserver {element} bind:entry>
    function create_default_slot(ctx) {
    	let div;
    	let t;
    	let if_block = /*inView*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(div, "class", "element");
    			add_location(div, file, 32, 2, 1472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[3](div);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*inView*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[3](null);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:0) <IntersectionObserver {element} bind:entry>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let blockquote;
    	let p1;
    	let t4;
    	let a2;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let a3;
    	let t10;
    	let t11;
    	let h20;
    	let t13;
    	let pre0;

    	let raw0_value = `<span class="token function">yarn</span> <span class="token function">add</span> -D svelte-intersection-observer
<span class="token comment"># OR</span>
<span class="token function">npm</span> i -D svelte-intersection-observer
` + "";

    	let t14;
    	let h21;
    	let t16;
    	let div1;
    	let header;
    	let strong0;
    	let t18;
    	let div0;
    	let t19;
    	let strong1;
    	let t20_value = (/*inView*/ ctx[2] ? "Yes" : "No") + "";
    	let t20;
    	let t21;
    	let intersectionobserver;
    	let updating_entry;
    	let pre1;

    	let raw1_value = `<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">></span></span><span class="token script"><span class="token language-javascript">
  <span class="token keyword">import</span> IntersectionObserver <span class="token keyword">from</span> <span class="token string">"svelte-intersection-observer"</span><span class="token punctuation">;</span>

  <span class="token keyword">let</span> entry<span class="token punctuation">;</span>
  <span class="token keyword">let</span> element<span class="token punctuation">;</span>

  $<span class="token operator">:</span> inView <span class="token operator">=</span> entry <span class="token operator">&amp;&amp;</span> entry<span class="token punctuation">.</span>isIntersecting<span class="token punctuation">;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>header</span><span class="token punctuation">></span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">></span></span>Scroll down.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">></span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span>
    Element in view?
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">"</span>answer<span class="token punctuation">"</span></span> <span class="token attr-name"><span class="token namespace">class:</span>inView</span><span class="token punctuation">></span></span><span class="token language-javascript"><span class="token punctuation">{</span>inView <span class="token operator">?</span> <span class="token string">'Yes'</span> <span class="token operator">:</span> <span class="token string">'No'</span><span class="token punctuation">}</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">></span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>header</span><span class="token punctuation">></span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>IntersectionObserver</span> <span class="token language-javascript"><span class="token punctuation">{</span>element<span class="token punctuation">}</span></span> <span class="token attr-name"><span class="token namespace">bind:</span>entry</span><span class="token punctuation">></span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">"</span>element<span class="token punctuation">"</span></span> <span class="token attr-name"><span class="token namespace">bind:</span>this=</span><span class="token language-javascript"><span class="token punctuation">{</span>element<span class="token punctuation">}</span></span><span class="token punctuation">></span></span>
    <span class="token language-javascript"><span class="token punctuation">{</span>#<span class="token keyword">if</span> inView<span class="token punctuation">}</span></span>Element is in view<span class="token language-javascript"><span class="token punctuation">{</span><span class="token operator">/</span><span class="token keyword">if</span><span class="token punctuation">}</span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>IntersectionObserver</span><span class="token punctuation">></span></span>
` + "";

    	let t22;
    	let h22;
    	let t24;
    	let h30;
    	let t26;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t28;
    	let th1;
    	let t30;
    	let th2;
    	let t32;
    	let tbody;
    	let tr1;
    	let td0;
    	let t34;
    	let td1;
    	let t36;
    	let td2;
    	let code0;
    	let t38;
    	let tr2;
    	let td3;
    	let t40;
    	let td4;
    	let t42;
    	let td5;
    	let code1;
    	let t44;
    	let code2;
    	let t46;
    	let code3;
    	let t48;
    	let t49;
    	let tr3;
    	let td6;
    	let t51;
    	let td7;
    	let t53;
    	let td8;
    	let code4;
    	let t55;
    	let code5;
    	let t57;
    	let t58;
    	let tr4;
    	let td9;
    	let t60;
    	let td10;
    	let t62;
    	let td11;
    	let code6;
    	let t64;
    	let code7;
    	let t66;
    	let t67;
    	let tr5;
    	let td12;
    	let t69;
    	let td13;
    	let t71;
    	let td14;
    	let code8;
    	let t73;
    	let tr6;
    	let td15;
    	let t75;
    	let td16;
    	let t77;
    	let td17;
    	let a4;
    	let code9;
    	let t79;
    	let h31;
    	let t81;
    	let ul;
    	let li;
    	let strong2;
    	let t83;
    	let code10;
    	let t85;
    	let t86;
    	let h23;
    	let t88;
    	let p3;
    	let t90;
    	let h24;
    	let a5;
    	let t92;
    	let h25;
    	let t94;
    	let p4;
    	let a6;
    	let current;

    	function intersectionobserver_entry_binding(value) {
    		/*intersectionobserver_entry_binding*/ ctx[4].call(null, value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[1],
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*entry*/ ctx[0] !== void 0) {
    		intersectionobserver_props.entry = /*entry*/ ctx[0];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "entry", intersectionobserver_entry_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "svelte-intersection-observer";
    			t1 = space();
    			p0 = element("p");
    			a0 = element("a");
    			img0 = element("img");
    			t2 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t3 = space();
    			blockquote = element("blockquote");
    			p1 = element("p");
    			t4 = text("Detect if an element is in the viewport using the ");
    			a2 = element("a");
    			a2.textContent = "Intersection Observer API";
    			t6 = text(".");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Try it in the ");
    			a3 = element("a");
    			a3.textContent = "Svelte REPL";
    			t10 = text(".");
    			t11 = space();
    			h20 = element("h2");
    			h20.textContent = "Install";
    			t13 = space();
    			pre0 = element("pre");
    			t14 = space();
    			h21 = element("h2");
    			h21.textContent = "Usage";
    			t16 = space();
    			div1 = element("div");
    			header = element("header");
    			strong0 = element("strong");
    			strong0.textContent = "Scroll down.";
    			t18 = space();
    			div0 = element("div");
    			t19 = text("Element in view?\n    ");
    			strong1 = element("strong");
    			t20 = text(t20_value);
    			t21 = space();
    			create_component(intersectionobserver.$$.fragment);
    			pre1 = element("pre");
    			t22 = space();
    			h22 = element("h2");
    			h22.textContent = "API";
    			t24 = space();
    			h30 = element("h3");
    			h30.textContent = "Props";
    			t26 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Prop name";
    			t28 = space();
    			th1 = element("th");
    			th1.textContent = "Description";
    			t30 = space();
    			th2 = element("th");
    			th2.textContent = "Value";
    			t32 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "element";
    			t34 = space();
    			td1 = element("td");
    			td1.textContent = "Element observed for intersection";
    			t36 = space();
    			td2 = element("td");
    			code0 = element("code");
    			code0.textContent = "HTMLElement";
    			t38 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "root";
    			t40 = space();
    			td4 = element("td");
    			td4.textContent = "Containing element";
    			t42 = space();
    			td5 = element("td");
    			code1 = element("code");
    			code1.textContent = "null";
    			t44 = text(" or ");
    			code2 = element("code");
    			code2.textContent = "HTMLElement";
    			t46 = text(" (default: ");
    			code3 = element("code");
    			code3.textContent = "null";
    			t48 = text(")");
    			t49 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "rootMargin";
    			t51 = space();
    			td7 = element("td");
    			td7.textContent = "Offset of the containing element";
    			t53 = space();
    			td8 = element("td");
    			code4 = element("code");
    			code4.textContent = "string";
    			t55 = text(" (default: ");
    			code5 = element("code");
    			code5.textContent = "\"0px\"";
    			t57 = text(")");
    			t58 = space();
    			tr4 = element("tr");
    			td9 = element("td");
    			td9.textContent = "threshold";
    			t60 = space();
    			td10 = element("td");
    			td10.textContent = "Percentage of element to trigger an event";
    			t62 = space();
    			td11 = element("td");
    			code6 = element("code");
    			code6.textContent = "number";
    			t64 = text(" between 0 and 1 (default: ");
    			code7 = element("code");
    			code7.textContent = "0";
    			t66 = text(")");
    			t67 = space();
    			tr5 = element("tr");
    			td12 = element("td");
    			td12.textContent = "intersecting";
    			t69 = space();
    			td13 = element("td");
    			td13.textContent = "If the element is intersecting";
    			t71 = space();
    			td14 = element("td");
    			code8 = element("code");
    			code8.textContent = "boolean";
    			t73 = space();
    			tr6 = element("tr");
    			td15 = element("td");
    			td15.textContent = "entry";
    			t75 = space();
    			td16 = element("td");
    			td16.textContent = "Observed element metadata";
    			t77 = space();
    			td17 = element("td");
    			a4 = element("a");
    			code9 = element("code");
    			code9.textContent = "IntersectionObserverEntry";
    			t79 = space();
    			h31 = element("h3");
    			h31.textContent = "Dispatched events";
    			t81 = space();
    			ul = element("ul");
    			li = element("li");
    			strong2 = element("strong");
    			strong2.textContent = "on:observe";
    			t83 = text(": fired when an intersection change occurs (type ");
    			code10 = element("code");
    			code10.textContent = "IntersectionObserverEntry";
    			t85 = text(")");
    			t86 = space();
    			h23 = element("h2");
    			h23.textContent = "TypeScript support";
    			t88 = space();
    			p3 = element("p");
    			p3.textContent = "Svelte version 3.31.0 or greater is required to use this module with TypeScript.";
    			t90 = space();
    			h24 = element("h2");
    			a5 = element("a");
    			a5.textContent = "Changelog";
    			t92 = space();
    			h25 = element("h2");
    			h25.textContent = "License";
    			t94 = space();
    			p4 = element("p");
    			a6 = element("a");
    			a6.textContent = "MIT";
    			add_location(h1, file, 10, 40, 228);
    			if (img0.src !== (img0_src_value = "https://img.shields.io/npm/v/svelte-intersection-observer.svg?color=%235832c9")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "NPM");
    			add_location(img0, file, 11, 68, 334);
    			attr_dev(a0, "href", "https://npmjs.com/package/svelte-intersection-observer");
    			add_location(a0, file, 11, 3, 269);
    			if (img1.src !== (img1_src_value = "https://travis-ci.com/metonym/svelte-intersection-observer.svg?branch=master")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Build");
    			add_location(img1, file, 12, 69, 507);
    			attr_dev(a1, "href", "https://travis-ci.com/metonym/svelte-intersection-observer");
    			add_location(a1, file, 12, 0, 438);
    			add_location(p0, file, 11, 0, 266);
    			attr_dev(a2, "href", "https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry");
    			add_location(a2, file, 14, 53, 682);
    			add_location(p1, file, 14, 0, 629);
    			add_location(blockquote, file, 13, 0, 616);
    			attr_dev(a3, "href", "https://svelte.dev/repl/8cd2327a580c4f429c71f7df999bd51d?version=3.29.7");
    			add_location(a3, file, 16, 17, 833);
    			add_location(p2, file, 16, 0, 816);
    			add_location(h20, file, 17, 0, 936);
    			attr_dev(pre0, "class", "language-bash");
    			add_location(pre0, file, 18, 0, 953);
    			add_location(h21, file, 22, 0, 1224);
    			add_location(strong0, file, 24, 2, 1274);
    			attr_dev(strong1, "class", "answer");
    			toggle_class(strong1, "inView", /*inView*/ ctx[2]);
    			add_location(strong1, file, 27, 4, 1337);
    			add_location(div0, file, 25, 2, 1306);
    			add_location(header, file, 23, 24, 1263);
    			attr_dev(div1, "class", "code-fence");
    			add_location(div1, file, 23, 0, 1239);
    			attr_dev(pre1, "class", "language-svelte");
    			attr_dev(pre1, "data-svelte", "");
    			add_location(pre1, file, 37, 29, 1606);
    			add_location(h22, file, 60, 0, 6198);
    			add_location(h30, file, 61, 0, 6211);
    			set_style(th0, "text-align", "left");
    			add_location(th0, file, 65, 0, 6247);
    			set_style(th1, "text-align", "left");
    			add_location(th1, file, 66, 0, 6290);
    			set_style(th2, "text-align", "left");
    			add_location(th2, file, 67, 0, 6335);
    			add_location(tr0, file, 64, 0, 6242);
    			add_location(thead, file, 63, 0, 6234);
    			set_style(td0, "text-align", "left");
    			add_location(td0, file, 72, 0, 6402);
    			set_style(td1, "text-align", "left");
    			add_location(td1, file, 73, 0, 6443);
    			add_location(code0, file, 74, 28, 6538);
    			set_style(td2, "text-align", "left");
    			add_location(td2, file, 74, 0, 6510);
    			add_location(tr1, file, 71, 0, 6397);
    			set_style(td3, "text-align", "left");
    			add_location(td3, file, 77, 0, 6579);
    			set_style(td4, "text-align", "left");
    			add_location(td4, file, 78, 0, 6617);
    			add_location(code1, file, 79, 28, 6697);
    			add_location(code2, file, 79, 49, 6718);
    			add_location(code3, file, 79, 84, 6753);
    			set_style(td5, "text-align", "left");
    			add_location(td5, file, 79, 0, 6669);
    			add_location(tr2, file, 76, 0, 6574);
    			set_style(td6, "text-align", "left");
    			add_location(td6, file, 82, 0, 6788);
    			set_style(td7, "text-align", "left");
    			add_location(td7, file, 83, 0, 6832);
    			add_location(code4, file, 84, 28, 6926);
    			add_location(code5, file, 84, 58, 6956);
    			set_style(td8, "text-align", "left");
    			add_location(td8, file, 84, 0, 6898);
    			add_location(tr3, file, 81, 0, 6783);
    			set_style(td9, "text-align", "left");
    			add_location(td9, file, 87, 0, 7002);
    			set_style(td10, "text-align", "left");
    			add_location(td10, file, 88, 0, 7045);
    			add_location(code6, file, 89, 28, 7148);
    			add_location(code7, file, 89, 74, 7194);
    			set_style(td11, "text-align", "left");
    			add_location(td11, file, 89, 0, 7120);
    			add_location(tr4, file, 86, 0, 6997);
    			set_style(td12, "text-align", "left");
    			add_location(td12, file, 92, 0, 7226);
    			set_style(td13, "text-align", "left");
    			add_location(td13, file, 93, 0, 7272);
    			add_location(code8, file, 94, 28, 7364);
    			set_style(td14, "text-align", "left");
    			add_location(td14, file, 94, 0, 7336);
    			add_location(tr5, file, 91, 0, 7221);
    			set_style(td15, "text-align", "left");
    			add_location(td15, file, 97, 0, 7401);
    			set_style(td16, "text-align", "left");
    			add_location(td16, file, 98, 0, 7440);
    			add_location(code9, file, 99, 113, 7612);
    			attr_dev(a4, "href", "https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry");
    			add_location(a4, file, 99, 28, 7527);
    			set_style(td17, "text-align", "left");
    			add_location(td17, file, 99, 0, 7499);
    			add_location(tr6, file, 96, 0, 7396);
    			add_location(tbody, file, 70, 0, 6389);
    			add_location(table, file, 62, 0, 6226);
    			add_location(h31, file, 103, 0, 7684);
    			add_location(strong2, file, 105, 4, 7720);
    			add_location(code10, file, 105, 80, 7796);
    			add_location(li, file, 105, 0, 7716);
    			add_location(ul, file, 104, 0, 7711);
    			add_location(h23, file, 107, 0, 7847);
    			add_location(p3, file, 108, 0, 7875);
    			attr_dev(a5, "href", "https://github.com/metonym/svelte-intersection-observer/tree/master/CHANGELOG.md");
    			add_location(a5, file, 109, 4, 7967);
    			add_location(h24, file, 109, 0, 7963);
    			add_location(h25, file, 110, 0, 8077);
    			attr_dev(a6, "href", "https://github.com/metonym/svelte-intersection-observer/tree/master/LICENSE");
    			add_location(a6, file, 111, 3, 8097);
    			add_location(p4, file, 111, 0, 8094);
    			attr_dev(main, "class", "markdown-body");
    			add_location(main, file, 10, 12, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(p0, a0);
    			append_dev(a0, img0);
    			append_dev(p0, t2);
    			append_dev(p0, a1);
    			append_dev(a1, img1);
    			append_dev(main, t3);
    			append_dev(main, blockquote);
    			append_dev(blockquote, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a2);
    			append_dev(p1, t6);
    			append_dev(main, t7);
    			append_dev(main, p2);
    			append_dev(p2, t8);
    			append_dev(p2, a3);
    			append_dev(p2, t10);
    			append_dev(main, t11);
    			append_dev(main, h20);
    			append_dev(main, t13);
    			append_dev(main, pre0);
    			pre0.innerHTML = raw0_value;
    			append_dev(main, t14);
    			append_dev(main, h21);
    			append_dev(main, t16);
    			append_dev(main, div1);
    			append_dev(div1, header);
    			append_dev(header, strong0);
    			append_dev(header, t18);
    			append_dev(header, div0);
    			append_dev(div0, t19);
    			append_dev(div0, strong1);
    			append_dev(strong1, t20);
    			append_dev(div1, t21);
    			mount_component(intersectionobserver, div1, null);
    			append_dev(main, pre1);
    			pre1.innerHTML = raw1_value;
    			append_dev(main, t22);
    			append_dev(main, h22);
    			append_dev(main, t24);
    			append_dev(main, h30);
    			append_dev(main, t26);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t28);
    			append_dev(tr0, th1);
    			append_dev(tr0, t30);
    			append_dev(tr0, th2);
    			append_dev(table, t32);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t34);
    			append_dev(tr1, td1);
    			append_dev(tr1, t36);
    			append_dev(tr1, td2);
    			append_dev(td2, code0);
    			append_dev(tbody, t38);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t40);
    			append_dev(tr2, td4);
    			append_dev(tr2, t42);
    			append_dev(tr2, td5);
    			append_dev(td5, code1);
    			append_dev(td5, t44);
    			append_dev(td5, code2);
    			append_dev(td5, t46);
    			append_dev(td5, code3);
    			append_dev(td5, t48);
    			append_dev(tbody, t49);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t51);
    			append_dev(tr3, td7);
    			append_dev(tr3, t53);
    			append_dev(tr3, td8);
    			append_dev(td8, code4);
    			append_dev(td8, t55);
    			append_dev(td8, code5);
    			append_dev(td8, t57);
    			append_dev(tbody, t58);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td9);
    			append_dev(tr4, t60);
    			append_dev(tr4, td10);
    			append_dev(tr4, t62);
    			append_dev(tr4, td11);
    			append_dev(td11, code6);
    			append_dev(td11, t64);
    			append_dev(td11, code7);
    			append_dev(td11, t66);
    			append_dev(tbody, t67);
    			append_dev(tbody, tr5);
    			append_dev(tr5, td12);
    			append_dev(tr5, t69);
    			append_dev(tr5, td13);
    			append_dev(tr5, t71);
    			append_dev(tr5, td14);
    			append_dev(td14, code8);
    			append_dev(tbody, t73);
    			append_dev(tbody, tr6);
    			append_dev(tr6, td15);
    			append_dev(tr6, t75);
    			append_dev(tr6, td16);
    			append_dev(tr6, t77);
    			append_dev(tr6, td17);
    			append_dev(td17, a4);
    			append_dev(a4, code9);
    			append_dev(main, t79);
    			append_dev(main, h31);
    			append_dev(main, t81);
    			append_dev(main, ul);
    			append_dev(ul, li);
    			append_dev(li, strong2);
    			append_dev(li, t83);
    			append_dev(li, code10);
    			append_dev(li, t85);
    			append_dev(main, t86);
    			append_dev(main, h23);
    			append_dev(main, t88);
    			append_dev(main, p3);
    			append_dev(main, t90);
    			append_dev(main, h24);
    			append_dev(h24, a5);
    			append_dev(main, t92);
    			append_dev(main, h25);
    			append_dev(main, t94);
    			append_dev(main, p4);
    			append_dev(p4, a6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*inView*/ 4) && t20_value !== (t20_value = (/*inView*/ ctx[2] ? "Yes" : "No") + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*inView*/ 4) {
    				toggle_class(strong1, "inView", /*inView*/ ctx[2]);
    			}

    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 2) intersectionobserver_changes.element = /*element*/ ctx[1];

    			if (dirty & /*$$scope, element, inView*/ 38) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_entry && dirty & /*entry*/ 1) {
    				updating_entry = true;
    				intersectionobserver_changes.entry = /*entry*/ ctx[0];
    				add_flush_callback(() => updating_entry = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(intersectionobserver);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("README", slots, []);
    	let entry;
    	let element;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<README> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	function intersectionobserver_entry_binding(value) {
    		entry = value;
    		$$invalidate(0, entry);
    	}

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		entry,
    		element,
    		inView
    	});

    	$$self.$inject_state = $$props => {
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("element" in $$props) $$invalidate(1, element = $$props.element);
    		if ("inView" in $$props) $$invalidate(2, inView = $$props.inView);
    	};

    	let inView;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*entry*/ 1) {
    			 $$invalidate(2, inView = entry && entry.isIntersecting);
    		}
    	};

    	return [entry, element, inView, div_binding, intersectionobserver_entry_binding];
    }

    class README extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "README",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new README({ target: document.body });

    return app;

}());
