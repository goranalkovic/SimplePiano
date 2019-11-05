
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = cb => requestAnimationFrame(cb);

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now$$1 => {
            if (!started && now$$1 >= start_time) {
                started = true;
            }
            if (started && now$$1 >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now$$1 - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick: tick$$1 = noop, css } = config;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.remaining += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick$$1(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now$$1 => {
                    if (pending_program && now$$1 > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now$$1 >= running_program.end) {
                            tick$$1(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.remaining)
                                        run_all(running_program.group.callbacks);
                                }
                            }
                            running_program = null;
                        }
                        else if (now$$1 >= running_program.start) {
                            const p = now$$1 - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick$$1(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\components\Button.svelte generated by Svelte v3.6.4 */

    const file = "src\\components\\Button.svelte";

    function create_fragment(ctx) {
    	var button, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			button = element("button");

    			if (default_slot) default_slot.c();

    			attr(button, "style", ctx.style);
    			attr(button, "class", "svelte-3qaunt");
    			toggle_class(button, "spaced", ctx.spaced);
    			toggle_class(button, "outline", ctx.outline);
    			add_location(button, file, 45, 0, 990);
    			dispose = listen(button, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(button_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.style) {
    				attr(button, "style", ctx.style);
    			}

    			if (changed.spaced) {
    				toggle_class(button, "spaced", ctx.spaced);
    			}

    			if (changed.outline) {
    				toggle_class(button, "outline", ctx.outline);
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
    			if (detaching) {
    				detach(button);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { spaced = false, style = null, outline = false } = $$props;

    	const writable_props = ['spaced', 'style', 'outline'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('spaced' in $$props) $$invalidate('spaced', spaced = $$props.spaced);
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('outline' in $$props) $$invalidate('outline', outline = $$props.outline);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		spaced,
    		style,
    		outline,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["spaced", "style", "outline"]);
    	}

    	get spaced() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spaced(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TitleBar.svelte generated by Svelte v3.6.4 */

    const file$1 = "src\\components\\TitleBar.svelte";

    const get_left_slot_changes = () => ({});
    const get_left_slot_context = () => ({});

    function create_fragment$1(ctx) {
    	var div1, t, div0, current;

    	const left_slot_1 = ctx.$$slots.left;
    	const left_slot = create_slot(left_slot_1, ctx, get_left_slot_context);

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div1 = element("div");

    			if (left_slot) left_slot.c();
    			t = space();
    			div0 = element("div");

    			if (default_slot) default_slot.c();

    			attr(div0, "class", "right svelte-16m5xgj");
    			add_location(div0, file$1, 20, 4, 318);
    			attr(div1, "class", "titlebar svelte-16m5xgj");
    			add_location(div1, file$1, 18, 0, 264);
    		},

    		l: function claim(nodes) {
    			if (left_slot) left_slot.l(div1_nodes);

    			if (default_slot) default_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);

    			if (left_slot) {
    				left_slot.m(div1, null);
    			}

    			append(div1, t);
    			append(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (left_slot && left_slot.p && changed.$$scope) {
    				left_slot.p(get_slot_changes(left_slot_1, ctx, changed, get_left_slot_changes), get_slot_context(left_slot_1, ctx, get_left_slot_context));
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(left_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(left_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (left_slot) left_slot.d(detaching);

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class TitleBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const soundFont = {
        fluid: 'FluidR3_GM',
        mk: 'MusyngKite',
        fatboy: 'FatBoy'
    };

    const keyCodes = {
        20: "⇪",
        65: "A",
        83: "S",
        68: "D",
        70: "F",
        71: "G",
        72: "H",
        74: "J",
        75: "K",
        76: "L",
        186: "Č",
        222: "Ć",
        220: "Ž",
        13: "↵",
        81: "Q",
        87: "W",
        69: "E",
        84: "T",
        90: "Z",
        73: "I",
        79: "O",
        80: "P",
        221: "Đ",
        8: "⌫"
    };

    const keyNotes = {
        20: "52",
        65: "55",
        83: "57",
        68: "59",
        70: "60",
        71: "62",
        72: "64",
        74: "65",
        75: "67",
        76: "69",
        186: "71",
        222: "72",
        220: "74",
        13: "76",
        81: "54",
        87: "56",
        69: "58",
        84: "61",
        90: "63",
        73: "66",
        79: "68",
        80: "70",
        221: "73",
        8: "75"
    };

    const keysPressed = writable({
        20: [],
        65: [],
        83: [],
        68: [],
        70: [],
        71: [],
        72: [],
        74: [],
        75: [],
        76: [],
        186: [],
        222: [],
        220: [],
        13: [],
        81: [],
        87: [],
        69: [],
        84: [],
        90: [],
        73: [],
        79: [],
        80: [],
        221: [],
        8: []
    });

    const defaultAdsr = [0.005, 0.395, 0.8, 1.2];

    const keysDown = writable(
        {
            20: false,
            65: false,
            83: false,
            68: false,
            70: false,
            71: false,
            72: false,
            74: false,
            75: false,
            76: false,
            186: false,
            222: false,
            220: false,
            13: false,
            81: false,
            87: false,
            69: false,
            84: false,
            90: false,
            73: false,
            79: false,
            80: false,
            221: false,
            8: false
        }
    );

    let ac = new AudioContext();

    const currentSoundFont = writable(soundFont.fatboy);
    const activeSet = writable(0);
    const volume = writable(25);
    const octaveShift = writable(0);
    const showAdsr = writable(false);

    const instrumentSets = writable(
        [
            {
                name: 'Set 1',
                instruments: []
            },
            {
                name: 'Set 2',
                instruments: []
            },
            {
                name: 'Set 3',
                instruments: []
            },
            {
                name: 'Set 4',
                instruments: []
            },
            {
                name: 'Set 5',
                instruments: []
            },
            {
                name: 'Set 6',
                instruments: []
            },
            {
                name: 'Set 7',
                instruments: []
            },
            {
                name: 'Set 8',
                instruments: []
            },
            {
                name: 'Set 9',
                instruments: []
            },
            {
                name: 'Set 10',
                instruments: []
            }
        ]
    );

    /* src\components\KeyboardKey.svelte generated by Svelte v3.6.4 */

    const file$2 = "src\\components\\KeyboardKey.svelte";

    // (57:2) {#if label}
    function create_if_block(ctx) {
    	var span, t;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.label);
    			attr(span, "class", "label svelte-1xzgary");
    			add_location(span, file$2, 57, 4, 1004);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.label) {
    				set_data(t, ctx.label);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var div, t, span;

    	var if_block = (ctx.label) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			span = element("span");
    			attr(span, "class", "keyboard-key svelte-1xzgary");
    			toggle_class(span, "square", ctx.square);
    			add_location(span, file$2, 59, 2, 1051);
    			attr(div, "class", "container svelte-1xzgary");
    			add_location(div, file$2, 55, 0, 960);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, t);
    			append(div, span);
    			span.innerHTML = ctx.key;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.label) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.key) {
    				span.innerHTML = ctx.key;
    			}

    			if (changed.square) {
    				toggle_class(span, "square", ctx.square);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { label = null, key, square = true } = $$props;

    	const writable_props = ['label', 'key', 'square'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<KeyboardKey> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    		if ('key' in $$props) $$invalidate('key', key = $$props.key);
    		if ('square' in $$props) $$invalidate('square', square = $$props.square);
    	};

    	return { label, key, square };
    }

    class KeyboardKey extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["label", "key", "square"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.key === undefined && !('key' in props)) {
    			console.warn("<KeyboardKey> was created without expected prop 'key'");
    		}
    	}

    	get label() {
    		throw new Error("<KeyboardKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<KeyboardKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<KeyboardKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<KeyboardKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get square() {
    		throw new Error("<KeyboardKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set square(value) {
    		throw new Error("<KeyboardKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SlideControl.svelte generated by Svelte v3.6.4 */

    const file$3 = "src\\components\\SlideControl.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.kbKey = list[i];
    	return child_ctx;
    }

    // (94:2) {#if keyboardKeys && hovering}
    function create_if_block$1(ctx) {
    	var div, current;

    	var each_value = ctx.keyboardKeys;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "hints svelte-aqi3n7");
    			add_location(div, file$3, 94, 4, 1970);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.keyboardKeys) {
    				each_value = ctx.keyboardKeys;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (96:6) {#each keyboardKeys as kbKey}
    function create_each_block(ctx) {
    	var current;

    	var keyboardkey_spread_levels = [
    		ctx.kbKey
    	];

    	let keyboardkey_props = {};
    	for (var i = 0; i < keyboardkey_spread_levels.length; i += 1) {
    		keyboardkey_props = assign(keyboardkey_props, keyboardkey_spread_levels[i]);
    	}
    	var keyboardkey = new KeyboardKey({ props: keyboardkey_props, $$inline: true });

    	return {
    		c: function create() {
    			keyboardkey.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(keyboardkey, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var keyboardkey_changes = changed.keyboardKeys ? get_spread_update(keyboardkey_spread_levels, [
    				ctx.kbKey
    			]) : {};
    			keyboardkey.$set(keyboardkey_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboardkey.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(keyboardkey.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(keyboardkey, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var div, label, span0, t0, t1, input, t2, span1, t3, t4, current, dispose;

    	var if_block = (ctx.keyboardKeys && hovering) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			span0 = element("span");
    			t0 = text(ctx.title);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(ctx.formattedValue);
    			t4 = space();
    			if (if_block) if_block.c();
    			attr(span0, "class", "title svelte-aqi3n7");
    			add_location(span0, file$3, 88, 4, 1765);
    			attr(input, "type", "range");
    			attr(input, "min", ctx.min);
    			attr(input, "max", ctx.max);
    			attr(input, "step", ctx.step);
    			attr(input, "class", "svelte-aqi3n7");
    			add_location(input, file$3, 89, 4, 1805);
    			attr(span1, "class", "value svelte-aqi3n7");
    			add_location(span1, file$3, 90, 4, 1873);
    			add_location(label, file$3, 87, 2, 1750);
    			attr(div, "class", "slide-ctrl svelte-aqi3n7");
    			add_location(div, file$3, 86, 0, 1721);

    			dispose = [
    				listen(input, "change", ctx.input_change_input_handler),
    				listen(input, "input", ctx.input_change_input_handler),
    				listen(input, "change", ctx.change_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, label);
    			append(label, span0);
    			append(span0, t0);
    			append(label, t1);
    			append(label, input);

    			input.value = ctx.value;

    			append(label, t2);
    			append(label, span1);
    			append(span1, t3);
    			append(div, t4);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.title) {
    				set_data(t0, ctx.title);
    			}

    			if (changed.value) input.value = ctx.value;

    			if (!current || changed.min) {
    				attr(input, "min", ctx.min);
    			}

    			if (!current || changed.max) {
    				attr(input, "max", ctx.max);
    			}

    			if (!current || changed.step) {
    				attr(input, "step", ctx.step);
    			}

    			if (!current || changed.formattedValue) {
    				set_data(t3, ctx.formattedValue);
    			}

    			if (ctx.keyboardKeys && hovering) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    let hovering = false;

    function instance$3($$self, $$props, $$invalidate) {
    	let { title, min, max, step, value, keyboardKeys = null, customValueDisplay = null } = $$props;

    	const writable_props = ['title', 'min', 'max', 'step', 'value', 'keyboardKeys', 'customValueDisplay'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SlideControl> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('min' in $$props) $$invalidate('min', min = $$props.min);
    		if ('max' in $$props) $$invalidate('max', max = $$props.max);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('keyboardKeys' in $$props) $$invalidate('keyboardKeys', keyboardKeys = $$props.keyboardKeys);
    		if ('customValueDisplay' in $$props) $$invalidate('customValueDisplay', customValueDisplay = $$props.customValueDisplay);
    	};

    	let formattedValue;

    	$$self.$$.update = ($$dirty = { customValueDisplay: 1, value: 1 }) => {
    		if ($$dirty.customValueDisplay || $$dirty.value) { $$invalidate('formattedValue', formattedValue = (customValueDisplay != null && customValueDisplay[value] != null) ? customValueDisplay[value] : value); }
    	};

    	return {
    		title,
    		min,
    		max,
    		step,
    		value,
    		keyboardKeys,
    		customValueDisplay,
    		formattedValue,
    		change_handler,
    		input_change_input_handler
    	};
    }

    class SlideControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["title", "min", "max", "step", "value", "keyboardKeys", "customValueDisplay"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<SlideControl> was created without expected prop 'title'");
    		}
    		if (ctx.min === undefined && !('min' in props)) {
    			console.warn("<SlideControl> was created without expected prop 'min'");
    		}
    		if (ctx.max === undefined && !('max' in props)) {
    			console.warn("<SlideControl> was created without expected prop 'max'");
    		}
    		if (ctx.step === undefined && !('step' in props)) {
    			console.warn("<SlideControl> was created without expected prop 'step'");
    		}
    		if (ctx.value === undefined && !('value' in props)) {
    			console.warn("<SlideControl> was created without expected prop 'value'");
    		}
    	}

    	get title() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyboardKeys() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyboardKeys(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customValueDisplay() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customValueDisplay(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Controls.svelte generated by Svelte v3.6.4 */

    const file$4 = "src\\components\\Controls.svelte";

    function create_fragment$4(ctx) {
    	var div1, updating_value, t0, div0, t1, updating_value_1, current;

    	var slidecontrol0_spread_levels = [
    		ctx.volumeControl
    	];

    	function slidecontrol0_value_binding(value) {
    		ctx.slidecontrol0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let slidecontrol0_props = {};
    	for (var i = 0; i < slidecontrol0_spread_levels.length; i += 1) {
    		slidecontrol0_props = assign(slidecontrol0_props, slidecontrol0_spread_levels[i]);
    	}
    	if (ctx.$volume !== void 0) {
    		slidecontrol0_props.value = ctx.$volume;
    	}
    	var slidecontrol0 = new SlideControl({
    		props: slidecontrol0_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol0, 'value', slidecontrol0_value_binding));

    	var slidecontrol1_spread_levels = [
    		ctx.octaveControl
    	];

    	function slidecontrol1_value_binding(value_1) {
    		ctx.slidecontrol1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let slidecontrol1_props = {};
    	for (var i = 0; i < slidecontrol1_spread_levels.length; i += 1) {
    		slidecontrol1_props = assign(slidecontrol1_props, slidecontrol1_spread_levels[i]);
    	}
    	if (ctx.$octaveShift !== void 0) {
    		slidecontrol1_props.value = ctx.$octaveShift;
    	}
    	var slidecontrol1 = new SlideControl({
    		props: slidecontrol1_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol1, 'value', slidecontrol1_value_binding));

    	return {
    		c: function create() {
    			div1 = element("div");
    			slidecontrol0.$$.fragment.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			slidecontrol1.$$.fragment.c();
    			attr(div0, "class", "spacer svelte-11xn1wc");
    			add_location(div0, file$4, 46, 4, 1022);
    			attr(div1, "class", "flex svelte-11xn1wc");
    			add_location(div1, file$4, 44, 0, 935);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(slidecontrol0, div1, null);
    			append(div1, t0);
    			append(div1, div0);
    			append(div1, t1);
    			mount_component(slidecontrol1, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var slidecontrol0_changes = changed.volumeControl ? get_spread_update(slidecontrol0_spread_levels, [
    				ctx.volumeControl
    			]) : {};
    			if (!updating_value && changed.$volume) {
    				slidecontrol0_changes.value = ctx.$volume;
    			}
    			slidecontrol0.$set(slidecontrol0_changes);

    			var slidecontrol1_changes = changed.octaveControl ? get_spread_update(slidecontrol1_spread_levels, [
    				ctx.octaveControl
    			]) : {};
    			if (!updating_value_1 && changed.$octaveShift) {
    				slidecontrol1_changes.value = ctx.$octaveShift;
    			}
    			slidecontrol1.$set(slidecontrol1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidecontrol0.$$.fragment, local);

    			transition_in(slidecontrol1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(slidecontrol0.$$.fragment, local);
    			transition_out(slidecontrol1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_component(slidecontrol0, );

    			destroy_component(slidecontrol1, );
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $volume, $octaveShift;

    	validate_store(volume, 'volume');
    	subscribe($$self, volume, $$value => { $volume = $$value; $$invalidate('$volume', $volume); });
    	validate_store(octaveShift, 'octaveShift');
    	subscribe($$self, octaveShift, $$value => { $octaveShift = $$value; $$invalidate('$octaveShift', $octaveShift); });

    	

        let volumeControl = {
            title: 'Volume',
            min: 0,
            max: 100,
            step: 1,
            keyboardKeys: [
                {label: '-1', key: '←'},
                {label: '+1', key: '→'},
                {label: '+10', key: '↑'},
                {label: '-10', key: '↓'},
            ]
        };

        let octaveControl = {
            title: 'Octave shift',
            min: -3,
            max: 3,
            step: 0.5,
            keyboardKeys: [
                {label: 'Up', key: '⇧', square: false},
                {label: 'Dn', key: '<small>Ctrl</small>', square: false}
            ]
        };

    	function slidecontrol0_value_binding(value) {
    		$volume = value;
    		volume.set($volume);
    	}

    	function slidecontrol1_value_binding(value_1) {
    		$octaveShift = value_1;
    		octaveShift.set($octaveShift);
    	}

    	return {
    		volumeControl,
    		octaveControl,
    		$volume,
    		$octaveShift,
    		slidecontrol0_value_binding,
    		slidecontrol1_value_binding
    	};
    }

    class Controls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src\components\PianoGrid.svelte generated by Svelte v3.6.4 */

    const file$5 = "src\\components\\PianoGrid.svelte";

    function create_fragment$5(ctx) {
    	var div29, div14, div0, t1, div1, t3, div2, t5, div3, t7, div4, t9, div5, t11, div6, t13, div7, t15, div8, t17, div9, t19, div10, t21, div11, t23, div12, t25, div13, t27, div28, div15, t29, div16, t31, div17, t33, div18, t34, div19, t36, div20, t38, div21, t39, div22, t41, div23, t43, div24, t45, div25, t46, div26, t48, div27;

    	return {
    		c: function create() {
    			div29 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			div0.textContent = "⇪";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "A";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "S";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "D";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "F";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "G";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "H";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "J";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "K";
    			t17 = space();
    			div9 = element("div");
    			div9.textContent = "L";
    			t19 = space();
    			div10 = element("div");
    			div10.textContent = "Č";
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "Ć";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "Ž";
    			t25 = space();
    			div13 = element("div");
    			div13.textContent = "↵";
    			t27 = space();
    			div28 = element("div");
    			div15 = element("div");
    			div15.textContent = "Q";
    			t29 = space();
    			div16 = element("div");
    			div16.textContent = "W";
    			t31 = space();
    			div17 = element("div");
    			div17.textContent = "E";
    			t33 = space();
    			div18 = element("div");
    			t34 = space();
    			div19 = element("div");
    			div19.textContent = "T";
    			t36 = space();
    			div20 = element("div");
    			div20.textContent = "Z";
    			t38 = space();
    			div21 = element("div");
    			t39 = space();
    			div22 = element("div");
    			div22.textContent = "I";
    			t41 = space();
    			div23 = element("div");
    			div23.textContent = "O";
    			t43 = space();
    			div24 = element("div");
    			div24.textContent = "P";
    			t45 = space();
    			div25 = element("div");
    			t46 = space();
    			div26 = element("div");
    			div26.textContent = "Đ";
    			t48 = space();
    			div27 = element("div");
    			div27.textContent = "⌫";
    			attr(div0, "id", "⇪");
    			attr(div0, "class", "white-key svelte-13grzto");
    			add_location(div0, file$5, 66, 4, 1230);
    			attr(div1, "id", "A");
    			attr(div1, "class", "white-key svelte-13grzto");
    			add_location(div1, file$5, 67, 4, 1273);
    			attr(div2, "id", "S");
    			attr(div2, "class", "white-key svelte-13grzto");
    			add_location(div2, file$5, 68, 4, 1316);
    			attr(div3, "id", "D");
    			attr(div3, "class", "white-key svelte-13grzto");
    			add_location(div3, file$5, 69, 4, 1359);
    			attr(div4, "id", "F");
    			attr(div4, "class", "white-key svelte-13grzto");
    			add_location(div4, file$5, 70, 4, 1402);
    			attr(div5, "id", "G");
    			attr(div5, "class", "white-key svelte-13grzto");
    			add_location(div5, file$5, 71, 4, 1445);
    			attr(div6, "id", "H");
    			attr(div6, "class", "white-key svelte-13grzto");
    			add_location(div6, file$5, 72, 4, 1488);
    			attr(div7, "id", "J");
    			attr(div7, "class", "white-key svelte-13grzto");
    			add_location(div7, file$5, 73, 4, 1531);
    			attr(div8, "id", "K");
    			attr(div8, "class", "white-key svelte-13grzto");
    			add_location(div8, file$5, 74, 4, 1574);
    			attr(div9, "id", "L");
    			attr(div9, "class", "white-key svelte-13grzto");
    			add_location(div9, file$5, 75, 4, 1617);
    			attr(div10, "id", "Č");
    			attr(div10, "class", "white-key svelte-13grzto");
    			add_location(div10, file$5, 76, 4, 1660);
    			attr(div11, "id", "Ć");
    			attr(div11, "class", "white-key svelte-13grzto");
    			add_location(div11, file$5, 77, 4, 1703);
    			attr(div12, "id", "Ž");
    			attr(div12, "class", "white-key svelte-13grzto");
    			add_location(div12, file$5, 78, 4, 1746);
    			attr(div13, "id", "↵");
    			attr(div13, "class", "white-key svelte-13grzto");
    			add_location(div13, file$5, 79, 4, 1789);
    			attr(div14, "class", "piano-grid svelte-13grzto");
    			add_location(div14, file$5, 65, 2, 1200);
    			attr(div15, "id", "Q");
    			attr(div15, "class", "black-key svelte-13grzto");
    			add_location(div15, file$5, 83, 4, 1872);
    			attr(div16, "id", "W");
    			attr(div16, "class", "black-key svelte-13grzto");
    			add_location(div16, file$5, 84, 4, 1915);
    			attr(div17, "id", "E");
    			attr(div17, "class", "black-key svelte-13grzto");
    			add_location(div17, file$5, 85, 4, 1958);
    			attr(div18, "class", "blank-black-key svelte-13grzto");
    			add_location(div18, file$5, 86, 4, 2001);
    			attr(div19, "id", "T");
    			attr(div19, "class", "black-key svelte-13grzto");
    			add_location(div19, file$5, 87, 4, 2038);
    			attr(div20, "id", "Z");
    			attr(div20, "class", "black-key svelte-13grzto");
    			add_location(div20, file$5, 88, 4, 2081);
    			attr(div21, "class", "blank-black-key svelte-13grzto");
    			add_location(div21, file$5, 89, 4, 2124);
    			attr(div22, "id", "I");
    			attr(div22, "class", "black-key svelte-13grzto");
    			add_location(div22, file$5, 90, 4, 2161);
    			attr(div23, "id", "O");
    			attr(div23, "class", "black-key svelte-13grzto");
    			add_location(div23, file$5, 91, 4, 2204);
    			attr(div24, "id", "P");
    			attr(div24, "class", "black-key svelte-13grzto");
    			add_location(div24, file$5, 92, 4, 2247);
    			attr(div25, "class", "blank-black-key svelte-13grzto");
    			add_location(div25, file$5, 93, 4, 2290);
    			attr(div26, "id", "Đ");
    			attr(div26, "class", "black-key svelte-13grzto");
    			add_location(div26, file$5, 94, 4, 2327);
    			attr(div27, "id", "⌫");
    			attr(div27, "class", "black-key svelte-13grzto");
    			add_location(div27, file$5, 95, 4, 2370);
    			attr(div28, "class", "piano-grid svelte-13grzto");
    			add_location(div28, file$5, 82, 2, 1842);
    			attr(div29, "class", "piano-grid-container svelte-13grzto");
    			add_location(div29, file$5, 64, 0, 1162);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div29, anchor);
    			append(div29, div14);
    			append(div14, div0);
    			append(div14, t1);
    			append(div14, div1);
    			append(div14, t3);
    			append(div14, div2);
    			append(div14, t5);
    			append(div14, div3);
    			append(div14, t7);
    			append(div14, div4);
    			append(div14, t9);
    			append(div14, div5);
    			append(div14, t11);
    			append(div14, div6);
    			append(div14, t13);
    			append(div14, div7);
    			append(div14, t15);
    			append(div14, div8);
    			append(div14, t17);
    			append(div14, div9);
    			append(div14, t19);
    			append(div14, div10);
    			append(div14, t21);
    			append(div14, div11);
    			append(div14, t23);
    			append(div14, div12);
    			append(div14, t25);
    			append(div14, div13);
    			append(div29, t27);
    			append(div29, div28);
    			append(div28, div15);
    			append(div28, t29);
    			append(div28, div16);
    			append(div28, t31);
    			append(div28, div17);
    			append(div28, t33);
    			append(div28, div18);
    			append(div28, t34);
    			append(div28, div19);
    			append(div28, t36);
    			append(div28, div20);
    			append(div28, t38);
    			append(div28, div21);
    			append(div28, t39);
    			append(div28, div22);
    			append(div28, t41);
    			append(div28, div23);
    			append(div28, t43);
    			append(div28, div24);
    			append(div28, t45);
    			append(div28, div25);
    			append(div28, t46);
    			append(div28, div26);
    			append(div28, t48);
    			append(div28, div27);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div29);
    			}
    		}
    	};
    }

    class PianoGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const dx = animation.from.left - animation.to.left;
        const dy = animation.from.top - animation.to.top;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = d => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src\components\Card.svelte generated by Svelte v3.6.4 */

    const file$6 = "src\\components\\Card.svelte";

    // (55:0) {:else}
    function create_else_block(ctx) {
    	var div, div_transition, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "animation:flip", { duration: 300 });
    			attr(div, "class", "card svelte-kgtaad");
    			toggle_class(div, "active", ctx.active);
    			toggle_class(div, "disabled", ctx.disabled && !ctx.active);
    			toggle_class(div, "selectable", ctx.selectable);
    			add_location(div, file$6, 55, 2, 1072);

    			dispose = [
    				listen(div, "click", ctx.click_handler),
    				listen(div, "mouseover", ctx.mouseover_handler_1),
    				listen(div, "mouseleave", ctx.mouseleave_handler_1)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (changed.active) {
    				toggle_class(div, "active", ctx.active);
    			}

    			if ((changed.disabled || changed.active)) {
    				toggle_class(div, "disabled", ctx.disabled && !ctx.active);
    			}

    			if (changed.selectable) {
    				toggle_class(div, "selectable", ctx.selectable);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (detaching) {
    				if (div_transition) div_transition.end();
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (43:0) {#if passive}
    function create_if_block$2(ctx) {
    	var div, div_transition, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "animation:flip", { duration: 300 });
    			attr(div, "class", "card passive svelte-kgtaad");
    			toggle_class(div, "active", ctx.active);
    			toggle_class(div, "disabled", ctx.disabled);
    			toggle_class(div, "selectable", ctx.selectable);
    			add_location(div, file$6, 43, 2, 845);

    			dispose = [
    				listen(div, "mouseover", ctx.mouseover_handler),
    				listen(div, "mouseleave", ctx.mouseleave_handler)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (changed.active) {
    				toggle_class(div, "active", ctx.active);
    			}

    			if (changed.disabled) {
    				toggle_class(div, "disabled", ctx.disabled);
    			}

    			if (changed.selectable) {
    				toggle_class(div, "selectable", ctx.selectable);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (detaching) {
    				if (div_transition) div_transition.end();
    			}

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.passive) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      let { disabled = false, active = false, selectable = false, passive = true } = $$props;

    	const writable_props = ['disabled', 'active', 'selectable', 'passive'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('selectable' in $$props) $$invalidate('selectable', selectable = $$props.selectable);
    		if ('passive' in $$props) $$invalidate('passive', passive = $$props.passive);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		disabled,
    		active,
    		selectable,
    		passive,
    		mouseover_handler,
    		mouseleave_handler,
    		click_handler,
    		mouseover_handler_1,
    		mouseleave_handler_1,
    		$$slots,
    		$$scope
    	};
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["disabled", "active", "selectable", "passive"]);
    	}

    	get disabled() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get passive() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set passive(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\InstrumentCard.svelte generated by Svelte v3.6.4 */

    const file$7 = "src\\components\\InstrumentCard.svelte";

    // (176:6) {#if volume > -1}
    function create_if_block_2(ctx) {
    	var span, t, span_transition, current;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.volTxt);
    			add_location(span, file$7, 176, 8, 3990);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.volTxt) {
    				set_data(t, ctx.volTxt);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, slide, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, slide, {}, false);
    			span_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    				if (span_transition) span_transition.end();
    			}
    		}
    	};
    }

    // (182:4) <Button style="height: 1.6rem; width: 1.6rem; padding: 0; margin: 0.2rem;" outline on:click={removeInstrument}>
    function create_default_slot_4(ctx) {
    	var span;

    	return {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✗";
    			set_style(span, "font-family", "'Inter'");
    			set_style(span, "font-size", "1.2rem");
    			add_location(span, file$7, 181, 115, 4174);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    // (185:2) {#if optionsVisible}
    function create_if_block$3(ctx) {
    	var div3, p, t0, t1_value = normalizedName(ctx.soundfont), t1, t2, div0, t3, t4, div2, div1, updating_value, t5, t6, div3_transition, current;

    	var button0 = new Button({
    		props: {
    		outline: true,
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button0.$on("click", ctx.octavePlus);

    	var button1 = new Button({
    		props: {
    		outline: true,
    		spaced: true,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button1.$on("click", ctx.octaveMinus);

    	function slidecontrol_value_binding(value) {
    		ctx.slidecontrol_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let slidecontrol_props = {
    		min: -1,
    		max: 100,
    		step: 1,
    		title: 'Volume',
    		customValueDisplay: { '-1': 'Default', '0': 'Muted' }
    	};
    	if (ctx.volume !== void 0) {
    		slidecontrol_props.value = ctx.volume;
    	}
    	var slidecontrol = new SlideControl({
    		props: slidecontrol_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol, 'value', slidecontrol_value_binding));
    	slidecontrol.$on("change", ctx.setVolume);

    	var button2 = new Button({
    		props: {
    		outline: true,
    		spaced: true,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button2.$on("click", ctx.toggleAbsoluteVolume);

    	var if_block = (ctx.$showAdsr) && create_if_block_1(ctx);

    	return {
    		c: function create() {
    			div3 = element("div");
    			p = element("p");
    			t0 = text("Sound font: ");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			button0.$$.fragment.c();
    			t3 = space();
    			button1.$$.fragment.c();
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			slidecontrol.$$.fragment.c();
    			t5 = space();
    			button2.$$.fragment.c();
    			t6 = space();
    			if (if_block) if_block.c();
    			attr(p, "class", "info-txt svelte-1regomg");
    			add_location(p, file$7, 188, 6, 4338);
    			set_style(div0, "margin", "0.6rem 0");
    			attr(div0, "class", "row svelte-1regomg");
    			add_location(div0, file$7, 189, 6, 4409);
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$7, 195, 8, 4640);
    			attr(div2, "class", "row svelte-1regomg");
    			add_location(div2, file$7, 194, 6, 4613);
    			attr(div3, "class", "toolbar svelte-1regomg");
    			add_location(div3, file$7, 186, 4, 4290);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, p);
    			append(p, t0);
    			append(p, t1);
    			append(div3, t2);
    			append(div3, div0);
    			mount_component(button0, div0, null);
    			append(div0, t3);
    			mount_component(button1, div0, null);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, div1);
    			mount_component(slidecontrol, div1, null);
    			append(div2, t5);
    			mount_component(button2, div2, null);
    			append(div3, t6);
    			if (if_block) if_block.m(div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.soundfont) && t1_value !== (t1_value = normalizedName(ctx.soundfont))) {
    				set_data(t1, t1_value);
    			}

    			var button0_changes = {};
    			if (changed.$$scope) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.$$scope) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);

    			var slidecontrol_changes = {};
    			if (!updating_value && changed.volume) {
    				slidecontrol_changes.value = ctx.volume;
    			}
    			slidecontrol.$set(slidecontrol_changes);

    			var button2_changes = {};
    			if (changed.$$scope || changed.absoluteVolume) button2_changes.$$scope = { changed, ctx };
    			button2.$set(button2_changes);

    			if (ctx.$showAdsr) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);

    			transition_in(button1.$$.fragment, local);

    			transition_in(slidecontrol.$$.fragment, local);

    			transition_in(button2.$$.fragment, local);

    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(slidecontrol.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(if_block);

    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			destroy_component(button0, );

    			destroy_component(button1, );

    			destroy_component(slidecontrol, );

    			destroy_component(button2, );

    			if (if_block) if_block.d();

    			if (detaching) {
    				if (div3_transition) div3_transition.end();
    			}
    		}
    	};
    }

    // (191:8) <Button outline on:click={octavePlus}>
    function create_default_slot_3(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Octave +");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (192:8) <Button outline on:click={octaveMinus} spaced>
    function create_default_slot_2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Octave -");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (206:8) <Button outline on:click={toggleAbsoluteVolume} spaced>
    function create_default_slot_1(ctx) {
    	var t_value = ctx.absoluteVolume ? '% current' : 'Absolute', t;

    	return {
    		c: function create() {
    			t = text(t_value);
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.absoluteVolume) && t_value !== (t_value = ctx.absoluteVolume ? '% current' : 'Absolute')) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (210:8) {#if $showAdsr}
    function create_if_block_1(ctx) {
    	var updating_value, t0, updating_value_1, t1, updating_value_2, t2, updating_value_3, current;

    	function slidecontrol0_value_binding(value) {
    		ctx.slidecontrol0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let slidecontrol0_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: 'Attack',
    		customValueDisplay: { '-0.01': 'Default', '0.005': 'Default' }
    	};
    	if (ctx.adsr[0] !== void 0) {
    		slidecontrol0_props.value = ctx.adsr[0];
    	}
    	var slidecontrol0 = new SlideControl({
    		props: slidecontrol0_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol0, 'value', slidecontrol0_value_binding));
    	slidecontrol0.$on("change", ctx.setAdsr);

    	function slidecontrol1_value_binding(value_1) {
    		ctx.slidecontrol1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let slidecontrol1_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: 'Delay',
    		customValueDisplay: { '-0.01': 'Default', '0.395': 'Default' }
    	};
    	if (ctx.adsr[1] !== void 0) {
    		slidecontrol1_props.value = ctx.adsr[1];
    	}
    	var slidecontrol1 = new SlideControl({
    		props: slidecontrol1_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol1, 'value', slidecontrol1_value_binding));
    	slidecontrol1.$on("change", ctx.setAdsr);

    	function slidecontrol2_value_binding(value_2) {
    		ctx.slidecontrol2_value_binding.call(null, value_2);
    		updating_value_2 = true;
    		add_flush_callback(() => updating_value_2 = false);
    	}

    	let slidecontrol2_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: 'Sustain',
    		customValueDisplay: { '-0.01': 'Default', '0.8': 'Default' }
    	};
    	if (ctx.adsr[2] !== void 0) {
    		slidecontrol2_props.value = ctx.adsr[2];
    	}
    	var slidecontrol2 = new SlideControl({
    		props: slidecontrol2_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol2, 'value', slidecontrol2_value_binding));
    	slidecontrol2.$on("change", ctx.setAdsr);

    	function slidecontrol3_value_binding(value_3) {
    		ctx.slidecontrol3_value_binding.call(null, value_3);
    		updating_value_3 = true;
    		add_flush_callback(() => updating_value_3 = false);
    	}

    	let slidecontrol3_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: 'Release',
    		customValueDisplay: { '-0.01': 'Default', '1.2': 'Default' }
    	};
    	if (ctx.adsr[3] !== void 0) {
    		slidecontrol3_props.value = ctx.adsr[3];
    	}
    	var slidecontrol3 = new SlideControl({
    		props: slidecontrol3_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(slidecontrol3, 'value', slidecontrol3_value_binding));
    	slidecontrol3.$on("change", ctx.setAdsr);

    	return {
    		c: function create() {
    			slidecontrol0.$$.fragment.c();
    			t0 = space();
    			slidecontrol1.$$.fragment.c();
    			t1 = space();
    			slidecontrol2.$$.fragment.c();
    			t2 = space();
    			slidecontrol3.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(slidecontrol0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(slidecontrol1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(slidecontrol2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(slidecontrol3, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var slidecontrol0_changes = {};
    			if (!updating_value && changed.adsr) {
    				slidecontrol0_changes.value = ctx.adsr[0];
    			}
    			slidecontrol0.$set(slidecontrol0_changes);

    			var slidecontrol1_changes = {};
    			if (!updating_value_1 && changed.adsr) {
    				slidecontrol1_changes.value = ctx.adsr[1];
    			}
    			slidecontrol1.$set(slidecontrol1_changes);

    			var slidecontrol2_changes = {};
    			if (!updating_value_2 && changed.adsr) {
    				slidecontrol2_changes.value = ctx.adsr[2];
    			}
    			slidecontrol2.$set(slidecontrol2_changes);

    			var slidecontrol3_changes = {};
    			if (!updating_value_3 && changed.adsr) {
    				slidecontrol3_changes.value = ctx.adsr[3];
    			}
    			slidecontrol3.$set(slidecontrol3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidecontrol0.$$.fragment, local);

    			transition_in(slidecontrol1.$$.fragment, local);

    			transition_in(slidecontrol2.$$.fragment, local);

    			transition_in(slidecontrol3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(slidecontrol0.$$.fragment, local);
    			transition_out(slidecontrol1.$$.fragment, local);
    			transition_out(slidecontrol2.$$.fragment, local);
    			transition_out(slidecontrol3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(slidecontrol0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(slidecontrol1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(slidecontrol2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(slidecontrol3, detaching);
    		}
    	};
    }

    // (167:0) <Card    on:mouseover={() => (optionsVisible = true)}    on:mouseleave={() => (optionsVisible = false)}>
    function create_default_slot(ctx) {
    	var div1, div0, h4, t0_value = normalizedName(ctx.name), t0, t1, span, t2, t3, t4, t5, if_block1_anchor, current;

    	var if_block0 = (ctx.volume > -1) && create_if_block_2(ctx);

    	var button = new Button({
    		props: {
    		style: "height: 1.6rem; width: 1.6rem; padding: 0; margin: 0.2rem;",
    		outline: true,
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button.$on("click", ctx.removeInstrument);

    	var if_block1 = (ctx.optionsVisible) && create_if_block$3(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(ctx.octShift);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			button.$$.fragment.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr(h4, "class", "uppercase svelte-1regomg");
    			add_location(h4, file$7, 173, 6, 3858);
    			attr(span, "class", "info-txt svelte-1regomg");
    			add_location(span, file$7, 174, 6, 3915);
    			attr(div0, "class", "status svelte-1regomg");
    			add_location(div0, file$7, 172, 4, 3830);
    			attr(div1, "class", "row svelte-1regomg");
    			add_location(div1, file$7, 171, 2, 3807);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h4);
    			append(h4, t0);
    			append(div0, t1);
    			append(div0, span);
    			append(span, t2);
    			append(div0, t3);
    			if (if_block0) if_block0.m(div0, null);
    			append(div1, t4);
    			mount_component(button, div1, null);
    			insert(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.name) && t0_value !== (t0_value = normalizedName(ctx.name))) {
    				set_data(t0, t0_value);
    			}

    			if (!current || changed.octShift) {
    				set_data(t2, ctx.octShift);
    			}

    			if (ctx.volume > -1) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			var button_changes = {};
    			if (changed.$$scope) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);

    			if (ctx.optionsVisible) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			transition_in(button.$$.fragment, local);

    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block0) if_block0.d();

    			destroy_component(button, );

    			if (detaching) {
    				detach(t5);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(if_block1_anchor);
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var current;

    	var card = new Card({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	card.$on("mouseover", ctx.mouseover_handler);
    	card.$on("mouseleave", ctx.mouseleave_handler);

    	return {
    		c: function create() {
    			card.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var card_changes = {};
    			if (changed.$$scope || changed.optionsVisible || changed.$showAdsr || changed.adsr || changed.absoluteVolume || changed.volume || changed.soundfont || changed.volTxt || changed.octShift || changed.name) card_changes.$$scope = { changed, ctx };
    			card.$set(card_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};
    }

    function normalizedName(name) {
      name = name.replace(/_/g, " ");

      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function clamp(value, min, max) {
      if (value <= min) return min;
      if (value >= max) return max;
      return value;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $instrumentSets, $activeSet, $showAdsr;

    	validate_store(instrumentSets, 'instrumentSets');
    	subscribe($$self, instrumentSets, $$value => { $instrumentSets = $$value; $$invalidate('$instrumentSets', $instrumentSets); });
    	validate_store(activeSet, 'activeSet');
    	subscribe($$self, activeSet, $$value => { $activeSet = $$value; $$invalidate('$activeSet', $activeSet); });
    	validate_store(showAdsr, 'showAdsr');
    	subscribe($$self, showAdsr, $$value => { $showAdsr = $$value; $$invalidate('$showAdsr', $showAdsr); });

    	

      let { id, name, volume, octave, data, soundfont, adsr, absoluteVolume } = $$props;

      let optionsVisible = false;

      function octavePlus() {
        let currentSets = $instrumentSets;

        let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

        let currentShift = currentSets[$activeSet].instruments[index].octave;
        currentSets[$activeSet].instruments[index].octave = clamp(
          currentShift + 1,
          -3,
          3
        );

        instrumentSets.set(currentSets);
      }

      function octaveMinus() {
        let currentSets = $instrumentSets;

        let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

        let currentShift = currentSets[$activeSet].instruments[index].octave;
        currentSets[$activeSet].instruments[index].octave = clamp(
          currentShift - 1,
          -3,
          3
        );

        instrumentSets.set(currentSets);
      }

      function removeInstrument() {
        let currentSets = $instrumentSets;

        currentSets[$activeSet].instruments = currentSets[
          $activeSet
        ].instruments.filter(i => i.id !== id);

        instrumentSets.set(currentSets);
      }

      function setVolume() {
        let currentSets = $instrumentSets;

        let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

        currentSets[$activeSet].instruments[index].volume = volume;

        instrumentSets.set(currentSets);
      }

      function toggleAbsoluteVolume() {
        let currentSets = $instrumentSets;

        let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

        currentSets[$activeSet].instruments[index].absoluteVolume = !currentSets[$activeSet].instruments[index].absoluteVolume;

        instrumentSets.set(currentSets);
      }

      function setAdsr() {
        let currentSets = $instrumentSets;

        let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

        currentSets[$activeSet].instruments[index].adsr = adsr;

        instrumentSets.set(currentSets);
      }

    	const writable_props = ['id', 'name', 'volume', 'octave', 'data', 'soundfont', 'adsr', 'absoluteVolume'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<InstrumentCard> was created with unknown prop '${key}'`);
    	});

    	function slidecontrol_value_binding(value) {
    		volume = value;
    		$$invalidate('volume', volume);
    	}

    	function slidecontrol0_value_binding(value) {
    		adsr[0] = value;
    		$$invalidate('adsr', adsr);
    	}

    	function slidecontrol1_value_binding(value_1) {
    		adsr[1] = value_1;
    		$$invalidate('adsr', adsr);
    	}

    	function slidecontrol2_value_binding(value_2) {
    		adsr[2] = value_2;
    		$$invalidate('adsr', adsr);
    	}

    	function slidecontrol3_value_binding(value_3) {
    		adsr[3] = value_3;
    		$$invalidate('adsr', adsr);
    	}

    	function mouseover_handler() {
    		const $$result = (optionsVisible = true);
    		$$invalidate('optionsVisible', optionsVisible);
    		return $$result;
    	}

    	function mouseleave_handler() {
    		const $$result = (optionsVisible = false);
    		$$invalidate('optionsVisible', optionsVisible);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('volume' in $$props) $$invalidate('volume', volume = $$props.volume);
    		if ('octave' in $$props) $$invalidate('octave', octave = $$props.octave);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    		if ('soundfont' in $$props) $$invalidate('soundfont', soundfont = $$props.soundfont);
    		if ('adsr' in $$props) $$invalidate('adsr', adsr = $$props.adsr);
    		if ('absoluteVolume' in $$props) $$invalidate('absoluteVolume', absoluteVolume = $$props.absoluteVolume);
    	};

    	let octShift, volTxt;

    	$$self.$$.update = ($$dirty = { octave: 1, volume: 1, absoluteVolume: 1 }) => {
    		if ($$dirty.octave) { $$invalidate('octShift', octShift =
            octave == 0
              ? "No octave shift"
              : octave < 0
              ? `Octave ${octave}`
              : `Octave +${octave}`); }
    		if ($$dirty.volume || $$dirty.absoluteVolume) { $$invalidate('volTxt', volTxt =
            volume > -1
              ? volume < 1
                ? "Muted"
                : `Volume ${volume}${absoluteVolume ? '%' : ''}`
              : "Custom volume not set"); }
    	};

    	return {
    		id,
    		name,
    		volume,
    		octave,
    		data,
    		soundfont,
    		adsr,
    		absoluteVolume,
    		optionsVisible,
    		octavePlus,
    		octaveMinus,
    		removeInstrument,
    		setVolume,
    		toggleAbsoluteVolume,
    		setAdsr,
    		octShift,
    		volTxt,
    		$showAdsr,
    		slidecontrol_value_binding,
    		slidecontrol0_value_binding,
    		slidecontrol1_value_binding,
    		slidecontrol2_value_binding,
    		slidecontrol3_value_binding,
    		mouseover_handler,
    		mouseleave_handler
    	};
    }

    class InstrumentCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, ["id", "name", "volume", "octave", "data", "soundfont", "adsr", "absoluteVolume"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'id'");
    		}
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'name'");
    		}
    		if (ctx.volume === undefined && !('volume' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'volume'");
    		}
    		if (ctx.octave === undefined && !('octave' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'octave'");
    		}
    		if (ctx.data === undefined && !('data' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'data'");
    		}
    		if (ctx.soundfont === undefined && !('soundfont' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'soundfont'");
    		}
    		if (ctx.adsr === undefined && !('adsr' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'adsr'");
    		}
    		if (ctx.absoluteVolume === undefined && !('absoluteVolume' in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'absoluteVolume'");
    		}
    	}

    	get id() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get volume() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set volume(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get octave() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set octave(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get soundfont() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set soundfont(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get adsr() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set adsr(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absoluteVolume() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absoluteVolume(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SetEditor.svelte generated by Svelte v3.6.4 */

    const file$8 = "src\\components\\SetEditor.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.instrument = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (37:4) {:else}
    function create_else_block$1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "🕳 No instruments";
    			attr(p, "class", "error svelte-1yw2g1e");
    			add_location(p, file$8, 37, 6, 636);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (35:4) {#each $instrumentSets[$activeSet].instruments as instrument, i (instrument.id)}
    function create_each_block$1(key_1, ctx) {
    	var first, current;

    	var instrumentcard_spread_levels = [
    		ctx.instrument
    	];

    	let instrumentcard_props = {};
    	for (var i_1 = 0; i_1 < instrumentcard_spread_levels.length; i_1 += 1) {
    		instrumentcard_props = assign(instrumentcard_props, instrumentcard_spread_levels[i_1]);
    	}
    	var instrumentcard = new InstrumentCard({
    		props: instrumentcard_props,
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			instrumentcard.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(instrumentcard, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var instrumentcard_changes = (changed.$instrumentSets || changed.$activeSet) ? get_spread_update(instrumentcard_spread_levels, [
    				ctx.instrument
    			]) : {};
    			instrumentcard.$set(instrumentcard_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(instrumentcard.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(instrumentcard.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(instrumentcard, detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var div1, h4, t0_value = ctx.$instrumentSets[ctx.$activeSet].name, t0, t1, div0, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.$instrumentSets[ctx.$activeSet].instruments;

    	const get_key = ctx => ctx.instrument.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	var each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1();
    		each_1_else.c();
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(h4, "class", "svelte-1yw2g1e");
    			add_location(h4, file$8, 29, 2, 414);
    			attr(div0, "class", "list svelte-1yw2g1e");
    			add_location(div0, file$8, 33, 2, 469);
    			set_style(div1, "width", "22rem");
    			add_location(div1, file$8, 27, 0, 381);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h4);
    			append(h4, t0);
    			append(div1, t1);
    			append(div1, div0);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div0, null);

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.$instrumentSets || changed.$activeSet) && t0_value !== (t0_value = ctx.$instrumentSets[ctx.$activeSet].name)) {
    				set_data(t0, t0_value);
    			}

    			const each_value = ctx.$instrumentSets[ctx.$activeSet].instruments;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$1();
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			if (each_1_else) each_1_else.d();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $instrumentSets, $activeSet;

    	validate_store(instrumentSets, 'instrumentSets');
    	subscribe($$self, instrumentSets, $$value => { $instrumentSets = $$value; $$invalidate('$instrumentSets', $instrumentSets); });
    	validate_store(activeSet, 'activeSet');
    	subscribe($$self, activeSet, $$value => { $activeSet = $$value; $$invalidate('$activeSet', $activeSet); });

    	return { $instrumentSets, $activeSet };
    }

    class SetEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, []);
    	}
    }

    /* src\components\SetList.svelte generated by Svelte v3.6.4 */

    const file$9 = "src\\components\\SetList.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.i = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.set = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (106:4) {:else}
    function create_else_block$2(ctx) {
    	var p, t0, br, t1;

    	return {
    		c: function create() {
    			p = element("p");
    			t0 = text("🕳 No instrument sets.\r\n        ");
    			br = element("br");
    			t1 = text("\r\n        This is an error.\r\n      ");
    			add_location(br, file$9, 108, 8, 2174);
    			add_location(p, file$9, 106, 6, 2129);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t0);
    			append(p, br);
    			append(p, t1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (93:12) {#each set.instruments as i (i.id)}
    function create_each_block_1(key_1, ctx) {
    	var span, t0_value = normalizedName$1(ctx.i.name), t0, t1, span_transition, rect, stop_animation = noop, current;

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(span, "class", "instrument svelte-hrcdkc");
    			add_location(span, file$9, 93, 14, 1797);
    			this.first = span;
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.$instrumentSets) && t0_value !== (t0_value = normalizedName$1(ctx.i.name))) {
    				set_data(t0, t0_value);
    			}
    		},

    		r: function measure_1() {
    			rect = span.getBoundingClientRect();
    		},

    		f: function fix() {
    			fix_position(span);
    			stop_animation();
    			add_transform(span, rect);
    		},

    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(span, rect, flip, {});
    		},

    		i: function intro(local) {
    			if (current) return;
    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, slide, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, slide, {}, false);
    			span_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    				if (span_transition) span_transition.end();
    			}
    		}
    	};
    }

    // (82:6) <Card          disabled={set.instruments.length < 1}          passive={false}          active={$activeSet === i}          on:click={() => {            activeSet.set(i);          }}>
    function create_default_slot$1(ctx) {
    	var div2, div0, h5, t0_value = ctx.set.name, t0, t1, each_blocks = [], each_1_lookup = new Map(), t2, div1, t3, current;

    	var each_value_1 = ctx.set.instruments;

    	const get_key = ctx => ctx.i.id;

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	var keyboardkey = new KeyboardKey({
    		props: { square: true, key: ctx.i + 1 < 10 ? ctx.i + 1 : 0 },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t2 = space();
    			div1 = element("div");
    			keyboardkey.$$.fragment.c();
    			t3 = space();
    			attr(h5, "class", "uppercase svelte-hrcdkc");
    			toggle_class(h5, "act", ctx.$activeSet === ctx.i);
    			add_location(h5, file$9, 90, 12, 1664);
    			attr(div0, "class", "f-grow svelte-hrcdkc");
    			add_location(div0, file$9, 89, 10, 1630);
    			attr(div1, "class", "f-shrink svelte-hrcdkc");
    			add_location(div1, file$9, 99, 10, 1970);
    			attr(div2, "class", "fixed-card svelte-hrcdkc");
    			add_location(div2, file$9, 88, 8, 1594);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, h5);
    			append(h5, t0);
    			append(div0, t1);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div0, null);

    			append(div2, t2);
    			append(div2, div1);
    			mount_component(keyboardkey, div1, null);
    			insert(target, t3, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.$instrumentSets) && t0_value !== (t0_value = ctx.set.name)) {
    				set_data(t0, t0_value);
    			}

    			if (changed.$activeSet) {
    				toggle_class(h5, "act", ctx.$activeSet === ctx.i);
    			}

    			const each_value_1 = ctx.set.instruments;

    			group_outros();
    			for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, div0, fix_and_outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    			for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_1.length; i += 1) transition_in(each_blocks[i]);

    			transition_in(keyboardkey.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			transition_out(keyboardkey.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			destroy_component(keyboardkey, );

    			if (detaching) {
    				detach(t3);
    			}
    		}
    	};
    }

    // (81:4) {#each $instrumentSets as set, i}
    function create_each_block$2(ctx) {
    	var current;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	var card = new Card({
    		props: {
    		disabled: ctx.set.instruments.length < 1,
    		passive: false,
    		active: ctx.$activeSet === ctx.i,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	card.$on("click", click_handler);

    	return {
    		c: function create() {
    			card.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var card_changes = {};
    			if (changed.$instrumentSets) card_changes.disabled = ctx.set.instruments.length < 1;
    			if (changed.$activeSet) card_changes.active = ctx.$activeSet === ctx.i;
    			if (changed.$$scope || changed.$instrumentSets || changed.$activeSet) card_changes.$$scope = { changed, ctx };
    			card.$set(card_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var div1, h4, t_1, div0, current;

    	var each_value = ctx.$instrumentSets;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	var each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$2();
    		each_1_else.c();
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Instrument sets";
    			t_1 = space();
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			set_style(h4, "font-weight", "600");
    			attr(h4, "class", "svelte-hrcdkc");
    			add_location(h4, file$9, 78, 2, 1285);
    			attr(div0, "class", "list svelte-hrcdkc");
    			add_location(div0, file$9, 79, 2, 1338);
    			attr(div1, "class", "container svelte-hrcdkc");
    			add_location(div1, file$9, 76, 0, 1256);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h4);
    			append(div1, t_1);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.$instrumentSets || changed.$activeSet || changed.normalizedName) {
    				each_value = ctx.$instrumentSets;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$2();
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    }

    function normalizedName$1(name) {
      name = name.replace(/_/g, " ");

      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $instrumentSets, $activeSet;

    	validate_store(instrumentSets, 'instrumentSets');
    	subscribe($$self, instrumentSets, $$value => { $instrumentSets = $$value; $$invalidate('$instrumentSets', $instrumentSets); });
    	validate_store(activeSet, 'activeSet');
    	subscribe($$self, activeSet, $$value => { $activeSet = $$value; $$invalidate('$activeSet', $activeSet); });

    	function click_handler({ i }) {
    	          activeSet.set(i);
    	        }

    	return {
    		$instrumentSets,
    		$activeSet,
    		click_handler
    	};
    }

    class SetList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src\components\InstrumentList.svelte generated by Svelte v3.6.4 */

    const file$a = "src\\components\\InstrumentList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (182:10) <Button style="width: 12rem; height: 2rem; margin-bottom: 0.4rem; text-align: left;" on:click={e => addPickedInstrument(item)}>
    function create_default_slot_2$1(ctx) {
    	var t0_value = normalizeInstrumentName(ctx.item), t0, t1;

    	return {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.filteredList) && t0_value !== (t0_value = normalizeInstrumentName(ctx.item))) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    			}
    		}
    	};
    }

    // (181:6) {#each filteredList as item (item)}
    function create_each_block$3(key_1, ctx) {
    	var first, current;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	var button = new Button({
    		props: {
    		style: "width: 12rem; height: 2rem; margin-bottom: 0.4rem; text-align: left;",
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button.$on("click", click_handler);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			button.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var button_changes = {};
    			if (changed.$$scope || changed.filteredList) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(button, detaching);
    		}
    	};
    }

    // (193:12) <Button on:click={switchSf}>
    function create_default_slot_1$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text(ctx.$currentSoundFont);
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$currentSoundFont) {
    				set_data(t, ctx.$currentSoundFont);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (198:12) <Button style="font-family: 'Inter', sans-serif;" on:click={switchAdsrOpt}>
    function create_default_slot$2(ctx) {
    	var t_value = ctx.$showAdsr ? '✓' : '✗', t;

    	return {
    		c: function create() {
    			t = text(t_value);
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$showAdsr) && t_value !== (t_value = ctx.$showAdsr ? '✓' : '✗')) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var div5, h4, t1, div1, input, t2, div0, each_blocks = [], each_1_lookup = new Map(), t3, div4, div2, span0, t5, t6, div3, span1, t8, current, dispose;

    	var each_value = ctx.filteredList;

    	const get_key = ctx => ctx.item;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	var button0 = new Button({
    		props: {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button0.$on("click", ctx.switchSf);

    	var button1 = new Button({
    		props: {
    		style: "font-family: 'Inter', sans-serif;",
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button1.$on("click", ctx.switchAdsrOpt);

    	return {
    		c: function create() {
    			div5 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Instruments";
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			div0 = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t3 = space();
    			div4 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Sound font";
    			t5 = space();
    			button0.$$.fragment.c();
    			t6 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "Show ADSR controls";
    			t8 = space();
    			button1.$$.fragment.c();
    			attr(h4, "class", "svelte-1l33ung");
    			add_location(h4, file$a, 173, 0, 4172);
    			attr(input, "class", "search-box svelte-1l33ung");
    			attr(input, "placeholder", "Search...");
    			attr(input, "type", "search");
    			add_location(input, file$a, 177, 6, 4230);
    			attr(div0, "class", "scrollList svelte-1l33ung");
    			add_location(div0, file$a, 179, 6, 4332);
    			attr(div1, "class", "selector");
    			add_location(div1, file$a, 175, 2, 4198);
    			attr(span0, "class", "svelte-1l33ung");
    			add_location(span0, file$a, 191, 12, 4719);
    			attr(div2, "class", "row svelte-1l33ung");
    			add_location(div2, file$a, 190, 8, 4688);
    			set_style(span1, "margin-top", "0.8rem");
    			attr(span1, "class", "svelte-1l33ung");
    			add_location(span1, file$a, 196, 12, 4872);
    			attr(div3, "class", "row svelte-1l33ung");
    			add_location(div3, file$a, 195, 8, 4841);
    			attr(div4, "class", "mini-column svelte-1l33ung");
    			add_location(div4, file$a, 189, 2, 4653);
    			attr(div5, "class", "column svelte-1l33ung");
    			add_location(div5, file$a, 172, 0, 4150);
    			dispose = listen(input, "input", ctx.input_input_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, h4);
    			append(div5, t1);
    			append(div5, div1);
    			append(div1, input);

    			input.value = ctx.filterString;

    			append(div1, t2);
    			append(div1, div0);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div0, null);

    			append(div5, t3);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, span0);
    			append(div2, t5);
    			mount_component(button0, div2, null);
    			append(div4, t6);
    			append(div4, div3);
    			append(div3, span1);
    			append(div3, t8);
    			mount_component(button1, div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filterString) input.value = ctx.filterString;

    			const each_value = ctx.filteredList;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    			check_outros();

    			var button0_changes = {};
    			if (changed.$$scope || changed.$currentSoundFont) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.$$scope || changed.$showAdsr) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			transition_in(button0.$$.fragment, local);

    			transition_in(button1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			destroy_component(button0, );

    			destroy_component(button1, );

    			dispose();
    		}
    	};
    }

    function normalizeInstrumentName(input) {
          input = input.replace(/_/g, " ");

          return input.charAt(0).toUpperCase() + input.slice(1);
      }

    function randId() {
          return Math.random()
                  .toString(36)
                  .replace(/[^a-z]+/g, "")
                  .substr(2, 10);
      }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentSoundFont, $instrumentSets, $activeSet, $showAdsr;

    	validate_store(currentSoundFont, 'currentSoundFont');
    	subscribe($$self, currentSoundFont, $$value => { $currentSoundFont = $$value; $$invalidate('$currentSoundFont', $currentSoundFont); });
    	validate_store(instrumentSets, 'instrumentSets');
    	subscribe($$self, instrumentSets, $$value => { $instrumentSets = $$value; $$invalidate('$instrumentSets', $instrumentSets); });
    	validate_store(activeSet, 'activeSet');
    	subscribe($$self, activeSet, $$value => { $activeSet = $$value; $$invalidate('$activeSet', $activeSet); });
    	validate_store(showAdsr, 'showAdsr');
    	subscribe($$self, showAdsr, $$value => { $showAdsr = $$value; $$invalidate('$showAdsr', $showAdsr); });

    	

        let selectedInstrument;
        let availInstruments = [];

        let filterString = "";

        async function getInstruments() {
            let data = await fetch(
                    `https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`
            );
            $$invalidate('availInstruments', availInstruments = await data.json());
            selectedInstrument = availInstruments[0];
        }

        getInstruments();

        function addPickedInstrument(instrument) {
            if(instrument == null) return;

            selectedInstrument = instrument;
            addInstrument();
        }

        function addInstrument() {
            if (selectedInstrument == null) return;

            let instrumentData = Soundfont.instrument(ac, selectedInstrument, {
                soundfont: $currentSoundFont
            });

            let newInstr = {
                id: randId(),
                name: selectedInstrument,
                volume: -1,
                octave: 0,
                absoluteVolume: false,
                data: instrumentData,
                soundfont: $currentSoundFont,
                adsr: [-0.01, -0.01, -0.01, -0.01]
            };

            let currentSets = $instrumentSets;

            currentSets[$activeSet].instruments.push(newInstr);

            instrumentSets.set(currentSets);
        }

        function switchSf() {
            let curr = $currentSoundFont;

            if (curr == soundFont.fluid) currentSoundFont.set(soundFont.mk);
            if (curr == soundFont.mk) currentSoundFont.set(soundFont.fatboy);
            if (curr == soundFont.fatboy) currentSoundFont.set(soundFont.fluid);

            getInstruments();
            // resetInstrumentSets();
        }

        function switchAdsrOpt(){
            let curr = $showAdsr;

            showAdsr.set(!curr);
        }

    	function input_input_handler() {
    		filterString = this.value;
    		$$invalidate('filterString', filterString);
    	}

    	function click_handler({ item }, e) {
    		return addPickedInstrument(item);
    	}

    	let filteredList;

    	$$self.$$.update = ($$dirty = { filterString: 1, availInstruments: 1 }) => {
    		if ($$dirty.filterString || $$dirty.availInstruments) { $$invalidate('filteredList', filteredList = filterString.trim() === '' ? availInstruments : availInstruments.filter(item => item.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)); }
    	};

    	return {
    		filterString,
    		addPickedInstrument,
    		switchSf,
    		switchAdsrOpt,
    		filteredList,
    		$currentSoundFont,
    		$showAdsr,
    		input_input_handler,
    		click_handler
    	};
    }

    class InstrumentList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, []);
    	}
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    // DECODE UTILITIES
    function b64ToUint6 (nChr) {
      return nChr > 64 && nChr < 91 ? nChr - 65
        : nChr > 96 && nChr < 123 ? nChr - 71
        : nChr > 47 && nChr < 58 ? nChr + 4
        : nChr === 43 ? 62
        : nChr === 47 ? 63
        : 0
    }

    // Decode Base64 to Uint8Array
    // ---------------------------
    function decode (sBase64, nBlocksSize) {
      var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '');
      var nInLen = sB64Enc.length;
      var nOutLen = nBlocksSize
        ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize
        : nInLen * 3 + 1 >> 2;
      var taBytes = new Uint8Array(nOutLen);

      for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
          for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
            taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
          }
          nUint24 = 0;
        }
      }
      return taBytes
    }

    var base64 = { decode: decode };

    /* global XMLHttpRequest */

    /**
     * Given a url and a return type, returns a promise to the content of the url
     * Basically it wraps a XMLHttpRequest into a Promise
     *
     * @param {String} url
     * @param {String} type - can be 'text' or 'arraybuffer'
     * @return {Promise}
     */
    var fetch$1 = function (url, type) {
      return new Promise(function (done, reject) {
        var req = new XMLHttpRequest();
        if (type) req.responseType = type;

        req.open('GET', url);
        req.onload = function () {
          req.status === 200 ? done(req.response) : reject(Error(req.statusText));
        };
        req.onerror = function () { reject(Error('Network Error')); };
        req.send();
      })
    };

    var lib = createCommonjsModule(function (module) {




    // Given a regex, return a function that test if against a string
    function fromRegex (r) {
      return function (o) { return typeof o === 'string' && r.test(o) }
    }
    // Try to apply a prefix to a name
    function prefix (pre, name) {
      return typeof pre === 'string' ? pre + name
        : typeof pre === 'function' ? pre(name)
        : name
    }

    /**
     * Load one or more audio files
     *
     *
     * Possible option keys:
     *
     * - __from__ {Function|String}: a function or string to convert from file names to urls.
     * If is a string it will be prefixed to the name:
     * `load(ac, 'snare.mp3', { from: 'http://audio.net/samples/' })`
     * If it's a function it receives the file name and should return the url as string.
     * - __only__ {Array} - when loading objects, if provided, only the given keys
     * will be included in the decoded object:
     * `load(ac, 'piano.json', { only: ['C2', 'D2'] })`
     *
     * @param {AudioContext} ac - the audio context
     * @param {Object} source - the object to be loaded
     * @param {Object} options - (Optional) the load options for that object
     * @param {Object} defaultValue - (Optional) the default value to return as
     * in a promise if not valid loader found
     */
    function load (ac, source, options, defVal) {
      var loader =
        // Basic audio loading
          isArrayBuffer(source) ? loadArrayBuffer
        : isAudioFileName(source) ? loadAudioFile
        : isPromise(source) ? loadPromise
        // Compound objects
        : isArray(source) ? loadArrayData
        : isObject(source) ? loadObjectData
        : isJsonFileName(source) ? loadJsonFile
        // Base64 encoded audio
        : isBase64Audio(source) ? loadBase64Audio
        : isJsFileName(source) ? loadMidiJSFile
        : null;

      var opts = options || {};
      return loader ? loader(ac, source, opts)
        : defVal ? Promise.resolve(defVal)
        : Promise.reject('Source not valid (' + source + ')')
    }
    load.fetch = fetch$1;

    // BASIC AUDIO LOADING
    // ===================

    // Load (decode) an array buffer
    function isArrayBuffer (o) { return o instanceof ArrayBuffer }
    function loadArrayBuffer (ac, array, options) {
      return new Promise(function (done, reject) {
        ac.decodeAudioData(array,
          function (buffer) { done(buffer); },
          function () { reject("Can't decode audio data (" + array.slice(0, 30) + '...)'); }
        );
      })
    }

    // Load an audio filename
    var isAudioFileName = fromRegex(/\.(mp3|wav|ogg)(\?.*)?$/i);
    function loadAudioFile (ac, name, options) {
      var url = prefix(options.from, name);
      return load(ac, load.fetch(url, 'arraybuffer'), options)
    }

    // Load the result of a promise
    function isPromise (o) { return o && typeof o.then === 'function' }
    function loadPromise (ac, promise, options) {
      return promise.then(function (value) {
        return load(ac, value, options)
      })
    }

    // COMPOUND OBJECTS
    // ================

    // Try to load all the items of an array
    var isArray = Array.isArray;
    function loadArrayData (ac, array, options) {
      return Promise.all(array.map(function (data) {
        return load(ac, data, options, data)
      }))
    }

    // Try to load all the values of a key/value object
    function isObject (o) { return o && typeof o === 'object' }
    function loadObjectData (ac, obj, options) {
      var dest = {};
      var promises = Object.keys(obj).map(function (key) {
        if (options.only && options.only.indexOf(key) === -1) return null
        var value = obj[key];
        return load(ac, value, options, value).then(function (audio) {
          dest[key] = audio;
        })
      });
      return Promise.all(promises).then(function () { return dest })
    }

    // Load the content of a JSON file
    var isJsonFileName = fromRegex(/\.json(\?.*)?$/i);
    function loadJsonFile (ac, name, options) {
      var url = prefix(options.from, name);
      return load(ac, load.fetch(url, 'text').then(JSON.parse), options)
    }

    // BASE64 ENCODED FORMATS
    // ======================

    // Load strings with Base64 encoded audio
    var isBase64Audio = fromRegex(/^data:audio/);
    function loadBase64Audio (ac, source, options) {
      var i = source.indexOf(',');
      return load(ac, base64.decode(source.slice(i + 1)).buffer, options)
    }

    // Load .js files with MidiJS soundfont prerendered audio
    var isJsFileName = fromRegex(/\.js(\?.*)?$/i);
    function loadMidiJSFile (ac, name, options) {
      var url = prefix(options.from, name);
      return load(ac, load.fetch(url, 'text').then(midiJsToJson), options)
    }

    // convert a MIDI.js javascript soundfont file to json
    function midiJsToJson (data) {
      var begin = data.indexOf('MIDI.Soundfont.');
      if (begin < 0) throw Error('Invalid MIDI.js Soundfont format')
      begin = data.indexOf('=', begin) + 2;
      var end = data.lastIndexOf(',');
      return JSON.parse(data.slice(begin, end) + '}')
    }

    if ( module.exports) module.exports = load;
    if (typeof window !== 'undefined') window.loadAudio = load;
    });

    var adsr = ADSR;

    function ADSR(audioContext){
      var node = audioContext.createGain();

      var voltage = node._voltage = getVoltage(audioContext);
      var value = scale(voltage);
      var startValue = scale(voltage);
      var endValue = scale(voltage);

      node._startAmount = scale(startValue);
      node._endAmount = scale(endValue);

      node._multiplier = scale(value);
      node._multiplier.connect(node);
      node._startAmount.connect(node);
      node._endAmount.connect(node);

      node.value = value.gain;
      node.startValue = startValue.gain;
      node.endValue = endValue.gain;

      node.startValue.value = 0;
      node.endValue.value = 0;

      Object.defineProperties(node, props);
      return node
    }

    var props = {

      attack: { value: 0, writable: true },
      decay: { value: 0, writable: true },
      sustain: { value: 1, writable: true },
      release: {value: 0, writable: true },

      getReleaseDuration: {
        value: function(){
          return this.release
        }
      },

      start: {
        value: function(at){
          var target = this._multiplier.gain;
          var startAmount = this._startAmount.gain;
          var endAmount = this._endAmount.gain;

          this._voltage.start(at);
          this._decayFrom = this._decayFrom = at+this.attack;
          this._startedAt = at;

          var sustain = this.sustain;

          target.cancelScheduledValues(at);
          startAmount.cancelScheduledValues(at);
          endAmount.cancelScheduledValues(at);

          endAmount.setValueAtTime(0, at);

          if (this.attack){
            target.setValueAtTime(0, at);
            target.linearRampToValueAtTime(1, at + this.attack);

            startAmount.setValueAtTime(1, at);
            startAmount.linearRampToValueAtTime(0, at + this.attack);
          } else {
            target.setValueAtTime(1, at);
            startAmount.setValueAtTime(0, at);
          }

          if (this.decay){
            target.setTargetAtTime(sustain, this._decayFrom, getTimeConstant(this.decay));
          }
        }
      },

      stop: {
        value: function(at, isTarget){
          if (isTarget){
            at = at - this.release;
          }

          var endTime = at + this.release;
          if (this.release){

            var target = this._multiplier.gain;
            var startAmount = this._startAmount.gain;
            var endAmount = this._endAmount.gain;

            target.cancelScheduledValues(at);
            startAmount.cancelScheduledValues(at);
            endAmount.cancelScheduledValues(at);

            var expFalloff = getTimeConstant(this.release);

            // truncate attack (required as linearRamp is removed by cancelScheduledValues)
            if (this.attack && at < this._decayFrom){
              var valueAtTime = getValue(0, 1, this._startedAt, this._decayFrom, at);
              target.linearRampToValueAtTime(valueAtTime, at);
              startAmount.linearRampToValueAtTime(1-valueAtTime, at);
              startAmount.setTargetAtTime(0, at, expFalloff);
            }

            endAmount.setTargetAtTime(1, at, expFalloff);
            target.setTargetAtTime(0, at, expFalloff);
          }

          this._voltage.stop(endTime);
          return endTime
        }
      },

      onended: {
        get: function(){
          return this._voltage.onended
        },
        set: function(value){
          this._voltage.onended = value;
        }
      }

    };

    var flat = new Float32Array([1,1]);
    function getVoltage(context){
      var voltage = context.createBufferSource();
      var buffer = context.createBuffer(1, 2, context.sampleRate);
      buffer.getChannelData(0).set(flat);
      voltage.buffer = buffer;
      voltage.loop = true;
      return voltage
    }

    function scale(node){
      var gain = node.context.createGain();
      node.connect(gain);
      return gain
    }

    function getTimeConstant(time){
      return Math.log(time+1)/Math.log(100)
    }

    function getValue(start, end, fromTime, toTime, at){
      var difference = end - start;
      var time = toTime - fromTime;
      var truncateTime = at - fromTime;
      var phase = truncateTime / time;
      var value = start + phase * difference;

      if (value <= start) {
          value = start;
      }
      if (value >= end) {
          value = end;
      }

      return value
    }

    var EMPTY = {};
    var DEFAULTS = {
      gain: 1,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.3,
      loop: false,
      cents: 0,
      loopStart: 0,
      loopEnd: 0
    };

    /**
     * Create a sample player.
     *
     * @param {AudioContext} ac - the audio context
     * @param {ArrayBuffer|Object<String,ArrayBuffer>} source
     * @param {Onject} options - (Optional) an options object
     * @return {player} the player
     * @example
     * var SamplePlayer = require('sample-player')
     * var ac = new AudioContext()
     * var snare = SamplePlayer(ac, <AudioBuffer>)
     * snare.play()
     */
    function SamplePlayer (ac, source, options) {
      var connected = false;
      var nextId = 0;
      var tracked = {};
      var out = ac.createGain();
      out.gain.value = 1;

      var opts = Object.assign({}, DEFAULTS, options);

      /**
       * @namespace
       */
      var player = { context: ac, out: out, opts: opts };
      if (source instanceof AudioBuffer) player.buffer = source;
      else player.buffers = source;

      /**
       * Start a sample buffer.
       *
       * The returned object has a function `stop(when)` to stop the sound.
       *
       * @param {String} name - the name of the buffer. If the source of the
       * SamplePlayer is one sample buffer, this parameter is not required
       * @param {Float} when - (Optional) when to start (current time if by default)
       * @param {Object} options - additional sample playing options
       * @return {AudioNode} an audio node with a `stop` function
       * @example
       * var sample = player(ac, <AudioBuffer>).connect(ac.destination)
       * sample.start()
       * sample.start(5, { gain: 0.7 }) // name not required since is only one AudioBuffer
       * @example
       * var drums = player(ac, { snare: <AudioBuffer>, kick: <AudioBuffer>, ... }).connect(ac.destination)
       * drums.start('snare')
       * drums.start('snare', 0, { gain: 0.3 })
       */
      player.start = function (name, when, options) {
        // if only one buffer, reorder arguments
        if (player.buffer && name !== null) return player.start(null, name, when)

        var buffer = name ? player.buffers[name] : player.buffer;
        if (!buffer) {
          console.warn('Buffer ' + name + ' not found.');
          return
        } else if (!connected) {
          console.warn('SamplePlayer not connected to any node.');
          return
        }

        var opts = options || EMPTY;
        when = Math.max(ac.currentTime, when || 0);
        player.emit('start', when, name, opts);
        var node = createNode(name, buffer, opts);
        node.id = track(name, node);
        node.env.start(when);
        node.source.start(when);
        player.emit('started', when, node.id, node);
        if (opts.duration) node.stop(when + opts.duration);
        return node
      };

      // NOTE: start will be override so we can't copy the function reference
      // this is obviously not a good design, so this code will be gone soon.
      /**
       * An alias for `player.start`
       * @see player.start
       * @since 0.3.0
       */
      player.play = function (name, when, options) {
        return player.start(name, when, options)
      };

      /**
       * Stop some or all samples
       *
       * @param {Float} when - (Optional) an absolute time in seconds (or currentTime
       * if not specified)
       * @param {Array} nodes - (Optional) an array of nodes or nodes ids to stop
       * @return {Array} an array of ids of the stoped samples
       *
       * @example
       * var longSound = player(ac, <AudioBuffer>).connect(ac.destination)
       * longSound.start(ac.currentTime)
       * longSound.start(ac.currentTime + 1)
       * longSound.start(ac.currentTime + 2)
       * longSound.stop(ac.currentTime + 3) // stop the three sounds
       */
      player.stop = function (when, ids) {
        var node;
        ids = ids || Object.keys(tracked);
        return ids.map(function (id) {
          node = tracked[id];
          if (!node) return null
          node.stop(when);
          return node.id
        })
      };
      /**
       * Connect the player to a destination node
       *
       * @param {AudioNode} destination - the destination node
       * @return {AudioPlayer} the player
       * @chainable
       * @example
       * var sample = player(ac, <AudioBuffer>).connect(ac.destination)
       */
      player.connect = function (dest) {
        connected = true;
        out.connect(dest);
        return player
      };

      player.emit = function (event, when, obj, opts) {
        if (player.onevent) player.onevent(event, when, obj, opts);
        var fn = player['on' + event];
        if (fn) fn(when, obj, opts);
      };

      return player

      // =============== PRIVATE FUNCTIONS ============== //

      function track (name, node) {
        node.id = nextId++;
        tracked[node.id] = node;
        node.source.onended = function () {
          var now = ac.currentTime;
          node.source.disconnect();
          node.env.disconnect();
          node.disconnect();
          player.emit('ended', now, node.id, node);
        };
        return node.id
      }

      function createNode (name, buffer, options) {
        var node = ac.createGain();
        node.gain.value = 0; // the envelope will control the gain
        node.connect(out);

        node.env = envelope(ac, options, opts);
        node.env.connect(node.gain);

        node.source = ac.createBufferSource();
        node.source.buffer = buffer;
        node.source.connect(node);
        node.source.loop = options.loop || opts.loop;
        node.source.playbackRate.value = centsToRate(options.cents || opts.cents);
        node.source.loopStart = options.loopStart || opts.loopStart;
        node.source.loopEnd = options.loopEnd || opts.loopEnd;
        node.stop = function (when) {
          var time = when || ac.currentTime;
          player.emit('stop', time, name);
          var stopAt = node.env.stop(time);
          node.source.stop(stopAt);
        };
        return node
      }
    }

    function isNum (x) { return typeof x === 'number' }
    var PARAMS = ['attack', 'decay', 'sustain', 'release'];
    function envelope (ac, options, opts) {
      var env = adsr(ac);
      var adsr$1 = options.adsr || opts.adsr;
      PARAMS.forEach(function (name, i) {
        if (adsr$1) env[name] = adsr$1[i];
        else env[name] = options[name] || opts[name];
      });
      env.value.value = isNum(options.gain) ? options.gain
        : isNum(opts.gain) ? opts.gain : 1;
      return env
    }

    /*
     * Get playback rate for a given pitch change (in cents)
     * Basic [math](http://www.birdsoft.demon.co.uk/music/samplert.htm):
     * f2 = f1 * 2^( C / 1200 )
     */
    function centsToRate (cents) { return cents ? Math.pow(2, cents / 1200) : 1 }

    var player = SamplePlayer;

    var events = function (player) {
      /**
       * Adds a listener of an event
       * @chainable
       * @param {String} event - the event name
       * @param {Function} callback - the event handler
       * @return {SamplePlayer} the player
       * @example
       * player.on('start', function(time, note) {
       *   console.log(time, note)
       * })
       */
      player.on = function (event, cb) {
        if (arguments.length === 1 && typeof event === 'function') return player.on('event', event)
        var prop = 'on' + event;
        var old = player[prop];
        player[prop] = old ? chain(old, cb) : cb;
        return player
      };
      return player
    };

    function chain (fn1, fn2) {
      return function (a, b, c, d) { fn1(a, b, c, d); fn2(a, b, c, d); }
    }

    var REGEX = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/;
    /**
     * A regex for matching note strings in scientific notation.
     *
     * @name regex
     * @function
     * @return {RegExp} the regexp used to parse the note name
     *
     * The note string should have the form `letter[accidentals][octave][element]`
     * where:
     *
     * - letter: (Required) is a letter from A to G either upper or lower case
     * - accidentals: (Optional) can be one or more `b` (flats), `#` (sharps) or `x` (double sharps).
     * They can NOT be mixed.
     * - octave: (Optional) a positive or negative integer
     * - element: (Optional) additionally anything after the duration is considered to
     * be the element name (for example: 'C2 dorian')
     *
     * The executed regex contains (by array index):
     *
     * - 0: the complete string
     * - 1: the note letter
     * - 2: the optional accidentals
     * - 3: the optional octave
     * - 4: the rest of the string (trimmed)
     *
     * @example
     * var parser = require('note-parser')
     * parser.regex.exec('c#4')
     * // => ['c#4', 'c', '#', '4', '']
     * parser.regex.exec('c#4 major')
     * // => ['c#4major', 'c', '#', '4', 'major']
     * parser.regex().exec('CMaj7')
     * // => ['CMaj7', 'C', '', '', 'Maj7']
     */
    function regex () { return REGEX }

    var SEMITONES = [0, 2, 4, 5, 7, 9, 11];
    /**
     * Parse a note name in scientific notation an return it's components,
     * and some numeric properties including midi number and frequency.
     *
     * @name parse
     * @function
     * @param {String} note - the note string to be parsed
     * @param {Boolean} isTonic - true if the note is the tonic of something.
     * If true, en extra tonicOf property is returned. It's false by default.
     * @param {Float} tunning - The frequency of A4 note to calculate frequencies.
     * By default it 440.
     * @return {Object} the parsed note name or null if not a valid note
     *
     * The parsed note name object will ALWAYS contains:
     * - letter: the uppercase letter of the note
     * - acc: the accidentals of the note (only sharps or flats)
     * - pc: the pitch class (letter + acc)
     * - step: s a numeric representation of the letter. It's an integer from 0 to 6
     * where 0 = C, 1 = D ... 6 = B
     * - alt: a numeric representation of the accidentals. 0 means no alteration,
     * positive numbers are for sharps and negative for flats
     * - chroma: a numeric representation of the pitch class. It's like midi for
     * pitch classes. 0 = C, 1 = C#, 2 = D ... It can have negative values: -1 = Cb.
     * Can detect pitch class enhramonics.
     *
     * If the note has octave, the parser object will contain:
     * - oct: the octave number (as integer)
     * - midi: the midi number
     * - freq: the frequency (using tuning parameter as base)
     *
     * If the parameter `isTonic` is set to true, the parsed object will contain:
     * - tonicOf: the rest of the string that follows note name (left and right trimmed)
     *
     * @example
     * var parse = require('note-parser').parse
     * parse('Cb4')
     * // => { letter: 'C', acc: 'b', pc: 'Cb', step: 0, alt: -1, chroma: -1,
     *         oct: 4, midi: 59, freq: 246.94165062806206 }
     * // if no octave, no midi, no freq
     * parse('fx')
     * // => { letter: 'F', acc: '##', pc: 'F##', step: 3, alt: 2, chroma: 7 })
     */
    function parse (str, isTonic, tuning) {
      if (typeof str !== 'string') return null
      var m = REGEX.exec(str);
      if (!m || !isTonic && m[4]) return null

      var p = { letter: m[1].toUpperCase(), acc: m[2].replace(/x/g, '##') };
      p.pc = p.letter + p.acc;
      p.step = (p.letter.charCodeAt(0) + 3) % 7;
      p.alt = p.acc[0] === 'b' ? -p.acc.length : p.acc.length;
      p.chroma = SEMITONES[p.step] + p.alt;
      if (m[3]) {
        p.oct = +m[3];
        p.midi = p.chroma + 12 * (p.oct + 1);
        p.freq = midiToFreq(p.midi, tuning);
      }
      if (isTonic) p.tonicOf = m[4];
      return p
    }

    /**
     * Given a midi number, return its frequency
     * @param {Integer} midi - midi note number
     * @param {Float} tuning - (Optional) the A4 tuning (440Hz by default)
     * @return {Float} frequency in hertzs
     */
    function midiToFreq (midi, tuning) {
      return Math.pow(2, (midi - 69) / 12) * (tuning || 440)
    }

    var parser = { parse: parse, regex: regex, midiToFreq: midiToFreq };
    var FNS = ['letter', 'acc', 'pc', 'step', 'alt', 'chroma', 'oct', 'midi', 'freq'];
    FNS.forEach(function (name) {
      parser[name] = function (src) {
        var p = parse(src);
        return p && (typeof p[name] !== 'undefined') ? p[name] : null
      };
    });

    var noteParser = parser;

    var isMidi = function (n) { return n !== null && n !== [] && n >= 0 && n < 129 };
    var toMidi = function (n) { return isMidi(n) ? +n : noteParser.midi(n) };

    // Adds note name to midi conversion
    var notes = function (player) {
      if (player.buffers) {
        var map = player.opts.map;
        var toKey = typeof map === 'function' ? map : toMidi;
        var mapper = function (name) {
          return name ? toKey(name) || name : null
        };

        player.buffers = mapBuffers(player.buffers, mapper);
        var start = player.start;
        player.start = function (name, when, options) {
          var key = mapper(name);
          var dec = key % 1;
          if (dec) {
            key = Math.floor(key);
            options = Object.assign(options || {}, { cents: Math.floor(dec * 100) });
          }
          return start(key, when, options)
        };
      }
      return player
    };

    function mapBuffers (buffers, toKey) {
      return Object.keys(buffers).reduce(function (mapped, name) {
        mapped[toKey(name)] = buffers[name];
        return mapped
      }, {})
    }

    var isArr = Array.isArray;
    var isObj = function (o) { return o && typeof o === 'object' };
    var OPTS = {};

    var scheduler = function (player) {
      /**
       * Schedule a list of events to be played at specific time.
       *
       * It supports three formats of events for the events list:
       *
       * - An array with [time, note]
       * - An array with [time, object]
       * - An object with { time: ?, [name|note|midi|key]: ? }
       *
       * @param {Float} time - an absolute time to start (or AudioContext's
       * currentTime if provided number is 0)
       * @param {Array} events - the events list.
       * @return {Array} an array of ids
       *
       * @example
       * // Event format: [time, note]
       * var piano = player(ac, ...).connect(ac.destination)
       * piano.schedule(0, [ [0, 'C2'], [0.5, 'C3'], [1, 'C4'] ])
       *
       * @example
       * // Event format: an object { time: ?, name: ? }
       * var drums = player(ac, ...).connect(ac.destination)
       * drums.schedule(0, [
       *   { name: 'kick', time: 0 },
       *   { name: 'snare', time: 0.5 },
       *   { name: 'kick', time: 1 },
       *   { name: 'snare', time: 1.5 }
       * ])
       */
      player.schedule = function (time, events) {
        var now = player.context.currentTime;
        var when = time < now ? now : time;
        player.emit('schedule', when, events);
        var t, o, note, opts;
        return events.map(function (event) {
          if (!event) return null
          else if (isArr(event)) {
            t = event[0]; o = event[1];
          } else {
            t = event.time; o = event;
          }

          if (isObj(o)) {
            note = o.name || o.key || o.note || o.midi || null;
            opts = o;
          } else {
            note = o;
            opts = OPTS;
          }

          return player.start(note, when + (t || 0), opts)
        })
      };
      return player
    };

    var index_min = createCommonjsModule(function (module, exports) {
    (function(e){{module.exports=e();}})(function(){return function o(e,t,s){function a(n,i){if(!t[n]){if(!e[n]){var l=typeof commonjsRequire=="function"&&commonjsRequire;if(!i&&l)return l(n,!0);if(r)return r(n,!0);var h=new Error("Cannot find module '"+n+"'");throw h.code="MODULE_NOT_FOUND",h}var c=t[n]={exports:{}};e[n][0].call(c.exports,function(t){var s=e[n][1][t];return a(s?s:t)},c,c.exports,o,e,t,s);}return t[n].exports}var r=typeof commonjsRequire=="function"&&commonjsRequire;for(var n=0;n<s.length;n++)a(s[n]);return a}({1:[function(e,t,s){Object.defineProperty(s,"__esModule",{value:true});s["default"]=function(e){function t(e){this._event=e;this._data=e.data;this.receivedTime=e.receivedTime;if(this._data&&this._data.length<2){console.warn("Illegal MIDI message of length",this._data.length);return}this._messageCode=e.data[0]&240;this.channel=e.data[0]&15;switch(this._messageCode){case 128:this.messageType="noteoff";this.key=e.data[1]&127;this.velocity=e.data[2]&127;break;case 144:this.messageType="noteon";this.key=e.data[1]&127;this.velocity=e.data[2]&127;break;case 160:this.messageType="keypressure";this.key=e.data[1]&127;this.pressure=e.data[2]&127;break;case 176:this.messageType="controlchange";this.controllerNumber=e.data[1]&127;this.controllerValue=e.data[2]&127;if(this.controllerNumber===120&&this.controllerValue===0){this.channelModeMessage="allsoundoff";}else if(this.controllerNumber===121){this.channelModeMessage="resetallcontrollers";}else if(this.controllerNumber===122){if(this.controllerValue===0){this.channelModeMessage="localcontroloff";}else{this.channelModeMessage="localcontrolon";}}else if(this.controllerNumber===123&&this.controllerValue===0){this.channelModeMessage="allnotesoff";}else if(this.controllerNumber===124&&this.controllerValue===0){this.channelModeMessage="omnimodeoff";}else if(this.controllerNumber===125&&this.controllerValue===0){this.channelModeMessage="omnimodeon";}else if(this.controllerNumber===126){this.channelModeMessage="monomodeon";}else if(this.controllerNumber===127){this.channelModeMessage="polymodeon";}break;case 192:this.messageType="programchange";this.program=e.data[1];break;case 208:this.messageType="channelpressure";this.pressure=e.data[1]&127;break;case 224:this.messageType="pitchbendchange";var t=e.data[2]&127;var s=e.data[1]&127;this.pitchBend=(t<<8)+s;break}}return new t(e)};t.exports=s["default"];},{}]},{},[1])(1)});
    //# sourceMappingURL=dist/index.js.map
    });

    unwrapExports(index_min);

    var midi = function (player) {
      /**
      * Connect a player to a midi input
      *
      * The options accepts:
      *
      * - channel: the channel to listen to. Listen to all channels by default.
      *
      * @param {MIDIInput} input
      * @param {Object} options - (Optional)
      * @return {SamplePlayer} the player
      * @example
      * var piano = player(...)
      * window.navigator.requestMIDIAccess().then(function (midiAccess) {
      *   midiAccess.inputs.forEach(function (midiInput) {
      *     piano.listenToMidi(midiInput)
      *   })
      * })
      */
      player.listenToMidi = function (input, options) {
        var started = {};
        var opts = options || {};
        var gain = opts.gain || function (vel) { return vel / 127 };

        input.onmidimessage = function (msg) {
          var mm = msg.messageType ? msg : index_min(msg);
          if (mm.messageType === 'noteon' && mm.velocity === 0) {
            mm.messageType = 'noteoff';
          }
          if (opts.channel && mm.channel !== opts.channel) return

          switch (mm.messageType) {
            case 'noteon':
              started[mm.key] = player.play(mm.key, 0, { gain: gain(mm.velocity) });
              break
            case 'noteoff':
              if (started[mm.key]) {
                started[mm.key].stop();
                delete started[mm.key];
              }
              break
          }
        };
        return player
      };
      return player
    };

    var lib$1 = createCommonjsModule(function (module) {







    function SamplePlayer (ac, source, options) {
      return midi(scheduler(notes(events(player(ac, source, options)))))
    }

    if ( module.exports) module.exports = SamplePlayer;
    if (typeof window !== 'undefined') window.SamplePlayer = SamplePlayer;
    });

    // util
    function fillStr (s, num) { return Array(num + 1).join(s) }
    function isNum$1 (x) { return typeof x === 'number' }
    function isStr (x) { return typeof x === 'string' }
    function isDef (x) { return typeof x !== 'undefined' }
    function midiToFreq$1 (midi, tuning) {
      return Math.pow(2, (midi - 69) / 12) * (tuning || 440)
    }

    var REGEX$1 = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/;
    /**
     * A regex for matching note strings in scientific notation.
     *
     * @name regex
     * @function
     * @return {RegExp} the regexp used to parse the note name
     *
     * The note string should have the form `letter[accidentals][octave][element]`
     * where:
     *
     * - letter: (Required) is a letter from A to G either upper or lower case
     * - accidentals: (Optional) can be one or more `b` (flats), `#` (sharps) or `x` (double sharps).
     * They can NOT be mixed.
     * - octave: (Optional) a positive or negative integer
     * - element: (Optional) additionally anything after the duration is considered to
     * be the element name (for example: 'C2 dorian')
     *
     * The executed regex contains (by array index):
     *
     * - 0: the complete string
     * - 1: the note letter
     * - 2: the optional accidentals
     * - 3: the optional octave
     * - 4: the rest of the string (trimmed)
     *
     * @example
     * var parser = require('note-parser')
     * parser.regex.exec('c#4')
     * // => ['c#4', 'c', '#', '4', '']
     * parser.regex.exec('c#4 major')
     * // => ['c#4major', 'c', '#', '4', 'major']
     * parser.regex().exec('CMaj7')
     * // => ['CMaj7', 'C', '', '', 'Maj7']
     */
    function regex$1 () { return REGEX$1 }

    var SEMITONES$1 = [0, 2, 4, 5, 7, 9, 11];
    /**
     * Parse a note name in scientific notation an return it's components,
     * and some numeric properties including midi number and frequency.
     *
     * @name parse
     * @function
     * @param {String} note - the note string to be parsed
     * @param {Boolean} isTonic - true the strings it's supposed to contain a note number
     * and some category (for example an scale: 'C# major'). It's false by default,
     * but when true, en extra tonicOf property is returned with the category ('major')
     * @param {Float} tunning - The frequency of A4 note to calculate frequencies.
     * By default it 440.
     * @return {Object} the parsed note name or null if not a valid note
     *
     * The parsed note name object will ALWAYS contains:
     * - letter: the uppercase letter of the note
     * - acc: the accidentals of the note (only sharps or flats)
     * - pc: the pitch class (letter + acc)
     * - step: s a numeric representation of the letter. It's an integer from 0 to 6
     * where 0 = C, 1 = D ... 6 = B
     * - alt: a numeric representation of the accidentals. 0 means no alteration,
     * positive numbers are for sharps and negative for flats
     * - chroma: a numeric representation of the pitch class. It's like midi for
     * pitch classes. 0 = C, 1 = C#, 2 = D ... 11 = B. Can be used to find enharmonics
     * since, for example, chroma of 'Cb' and 'B' are both 11
     *
     * If the note has octave, the parser object will contain:
     * - oct: the octave number (as integer)
     * - midi: the midi number
     * - freq: the frequency (using tuning parameter as base)
     *
     * If the parameter `isTonic` is set to true, the parsed object will contain:
     * - tonicOf: the rest of the string that follows note name (left and right trimmed)
     *
     * @example
     * var parse = require('note-parser').parse
     * parse('Cb4')
     * // => { letter: 'C', acc: 'b', pc: 'Cb', step: 0, alt: -1, chroma: -1,
     *         oct: 4, midi: 59, freq: 246.94165062806206 }
     * // if no octave, no midi, no freq
     * parse('fx')
     * // => { letter: 'F', acc: '##', pc: 'F##', step: 3, alt: 2, chroma: 7 })
     */
    function parse$1 (str, isTonic, tuning) {
      if (typeof str !== 'string') return null
      var m = REGEX$1.exec(str);
      if (!m || (!isTonic && m[4])) return null

      var p = { letter: m[1].toUpperCase(), acc: m[2].replace(/x/g, '##') };
      p.pc = p.letter + p.acc;
      p.step = (p.letter.charCodeAt(0) + 3) % 7;
      p.alt = p.acc[0] === 'b' ? -p.acc.length : p.acc.length;
      var pos = SEMITONES$1[p.step] + p.alt;
      p.chroma = pos < 0 ? 12 + pos : pos % 12;
      if (m[3]) { // has octave
        p.oct = +m[3];
        p.midi = pos + 12 * (p.oct + 1);
        p.freq = midiToFreq$1(p.midi, tuning);
      }
      if (isTonic) p.tonicOf = m[4];
      return p
    }

    var LETTERS = 'CDEFGAB';
    function accStr (n) { return !isNum$1(n) ? '' : n < 0 ? fillStr('b', -n) : fillStr('#', n) }
    function octStr (n) { return !isNum$1(n) ? '' : '' + n }

    /**
     * Create a string from a parsed object or `step, alteration, octave` parameters
     * @param {Object} obj - the parsed data object
     * @return {String} a note string or null if not valid parameters
     * @since 1.2
     * @example
     * parser.build(parser.parse('cb2')) // => 'Cb2'
     *
     * @example
     * // it accepts (step, alteration, octave) parameters:
     * parser.build(3) // => 'F'
     * parser.build(3, -1) // => 'Fb'
     * parser.build(3, -1, 4) // => 'Fb4'
     */
    function build (s, a, o) {
      if (s === null || typeof s === 'undefined') return null
      if (s.step) return build(s.step, s.alt, s.oct)
      if (s < 0 || s > 6) return null
      return LETTERS.charAt(s) + accStr(a) + octStr(o)
    }

    /**
     * Get midi of a note
     *
     * @name midi
     * @function
     * @param {String|Integer} note - the note name or midi number
     * @return {Integer} the midi number of the note or null if not a valid note
     * or the note does NOT contains octave
     * @example
     * var parser = require('note-parser')
     * parser.midi('A4') // => 69
     * parser.midi('A') // => null
     * @example
     * // midi numbers are bypassed (even as strings)
     * parser.midi(60) // => 60
     * parser.midi('60') // => 60
     */
    function midi$1 (note) {
      if ((isNum$1(note) || isStr(note)) && note >= 0 && note < 128) return +note
      var p = parse$1(note);
      return p && isDef(p.midi) ? p.midi : null
    }

    /**
     * Get freq of a note in hertzs (in a well tempered 440Hz A4)
     *
     * @name freq
     * @function
     * @param {String} note - the note name or note midi number
     * @param {String} tuning - (Optional) the A4 frequency (440 by default)
     * @return {Float} the freq of the number if hertzs or null if not valid note
     * @example
     * var parser = require('note-parser')
     * parser.freq('A4') // => 440
     * parser.freq('A') // => null
     * @example
     * // can change tuning (440 by default)
     * parser.freq('A4', 444) // => 444
     * parser.freq('A3', 444) // => 222
     * @example
     * // it accepts midi numbers (as numbers and as strings)
     * parser.freq(69) // => 440
     * parser.freq('69', 442) // => 442
     */
    function freq (note, tuning) {
      var m = midi$1(note);
      return m === null ? null : midiToFreq$1(m, tuning)
    }

    function letter (src) { return (parse$1(src) || {}).letter }
    function acc (src) { return (parse$1(src) || {}).acc }
    function pc (src) { return (parse$1(src) || {}).pc }
    function step (src) { return (parse$1(src) || {}).step }
    function alt (src) { return (parse$1(src) || {}).alt }
    function chroma (src) { return (parse$1(src) || {}).chroma }
    function oct (src) { return (parse$1(src) || {}).oct }

    var noteParser$1 = /*#__PURE__*/Object.freeze({
        regex: regex$1,
        parse: parse$1,
        build: build,
        midi: midi$1,
        freq: freq,
        letter: letter,
        acc: acc,
        pc: pc,
        step: step,
        alt: alt,
        chroma: chroma,
        oct: oct
    });

    /**
     * Create a Soundfont object
     *
     * @param {AudioContext} context - the [audio context](https://developer.mozilla.org/en/docs/Web/API/AudioContext)
     * @param {Function} nameToUrl - (Optional) a function that maps the sound font name to the url
     * @return {Soundfont} a soundfont object
     */
    function Soundfont$1 (ctx, nameToUrl) {
      console.warn('new Soundfont() is deprected');
      console.log('Please use Soundfont.instrument() instead of new Soundfont().instrument()');
      if (!(this instanceof Soundfont$1)) return new Soundfont$1(ctx)

      this.nameToUrl = nameToUrl || Soundfont$1.nameToUrl;
      this.ctx = ctx;
      this.instruments = {};
      this.promises = [];
    }

    Soundfont$1.prototype.onready = function (callback) {
      console.warn('deprecated API');
      console.log('Please use Promise.all(Soundfont.instrument(), Soundfont.instrument()).then() instead of new Soundfont().onready()');
      Promise.all(this.promises).then(callback);
    };

    Soundfont$1.prototype.instrument = function (name, options) {
      console.warn('new Soundfont().instrument() is deprecated.');
      console.log('Please use Soundfont.instrument() instead.');
      var ctx = this.ctx;
      name = name || 'default';
      if (name in this.instruments) return this.instruments[name]
      var inst = {name: name, play: oscillatorPlayer(ctx, options)};
      this.instruments[name] = inst;
      if (name !== 'default') {
        var promise = Soundfont$1.instrument(ctx, name, options).then(function (instrument) {
          inst.play = instrument.play;
          return inst
        });
        this.promises.push(promise);
        inst.onready = function (cb) {
          console.warn('onready is deprecated. Use Soundfont.instrument().then()');
          promise.then(cb);
        };
      } else {
        inst.onready = function (cb) {
          console.warn('onready is deprecated. Use Soundfont.instrument().then()');
          cb();
        };
      }
      return inst
    };

    /*
     * Load the buffers of a given instrument name. It returns a promise that resolves
     * to a hash with midi note numbers as keys, and audio buffers as values.
     *
     * @param {AudioContext} ac - the audio context
     * @param {String} name - the instrument name (it accepts an url if starts with "http")
     * @param {Object} options - (Optional) options object
     * @return {Promise} a promise that resolves to a Hash of { midiNoteNum: <AudioBuffer> }
     *
     * The options object accepts the following keys:
     *
     * - nameToUrl {Function}: a function to convert from instrument names to urls.
     * By default it uses Benjamin Gleitzman's package of
     * [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts)
     * - notes {Array}: the list of note names to be decoded (all by default)
     *
     * @example
     * var Soundfont = require('soundfont-player')
     * Soundfont.loadBuffers(ctx, 'acoustic_grand_piano').then(function(buffers) {
     *  buffers[60] // => An <AudioBuffer> corresponding to note C4
     * })
     */
    function loadBuffers (ac, name, options) {
      console.warn('Soundfont.loadBuffers is deprecate.');
      console.log('Use Soundfont.instrument(..) and get buffers properties from the result.');
      return Soundfont$1.instrument(ac, name, options).then(function (inst) {
        return inst.buffers
      })
    }
    Soundfont$1.loadBuffers = loadBuffers;

    /**
     * Returns a function that plays an oscillator
     *
     * @param {AudioContext} ac - the audio context
     * @param {Hash} defaultOptions - (Optional) a hash of options:
     * - vcoType: the oscillator type (default: 'sine')
     * - gain: the output gain value (default: 0.4)
      * - destination: the player destination (default: ac.destination)
     */
    function oscillatorPlayer (ctx, defaultOptions) {
      defaultOptions = defaultOptions || {};
      return function (note, time, duration, options) {
        console.warn('The oscillator player is deprecated.');
        console.log('Starting with version 0.9.0 you will have to wait until the soundfont is loaded to play sounds.');
        var midi = note > 0 && note < 129 ? +note : noteParser$1.midi(note);
        var freq = midi ? noteParser$1.midiToFreq(midi, 440) : null;
        if (!freq) return

        duration = duration || 0.2;

        options = options || {};
        var destination = options.destination || defaultOptions.destination || ctx.destination;
        var vcoType = options.vcoType || defaultOptions.vcoType || 'sine';
        var gain = options.gain || defaultOptions.gain || 0.4;

        var vco = ctx.createOscillator();
        vco.type = vcoType;
        vco.frequency.value = freq;

        /* VCA */
        var vca = ctx.createGain();
        vca.gain.value = gain;

        /* Connections */
        vco.connect(vca);
        vca.connect(destination);

        vco.start(time);
        if (duration > 0) vco.stop(time + duration);
        return vco
      }
    }

    /**
     * Given a note name, return the note midi number
     *
     * @name noteToMidi
     * @function
     * @param {String} noteName
     * @return {Integer} the note midi number or null if not a valid note name
     */
    Soundfont$1.noteToMidi = noteParser$1.midi;

    var legacy = Soundfont$1;

    var lib$2 = createCommonjsModule(function (module) {




    /**
     * Load a soundfont instrument. It returns a promise that resolves to a
     * instrument object.
     *
     * The instrument object returned by the promise has the following properties:
     *
     * - name: the instrument name
     * - play: A function to play notes from the buffer with the signature
     * `play(note, time, duration, options)`
     *
     *
     * The valid options are:
     *
     * - `format`: the soundfont format. 'mp3' by default. Can be 'ogg'
     * - `soundfont`: the soundfont name. 'MusyngKite' by default. Can be 'FluidR3_GM'
     * - `nameToUrl` <Function>: a function to convert from instrument names to URL
     * - `destination`: by default Soundfont uses the `audioContext.destination` but you can override it.
     * - `gain`: the gain of the player (1 by default)
     * - `notes`: an array of the notes to decode. It can be an array of strings
     * with note names or an array of numbers with midi note numbers. This is a
     * performance option: since decoding mp3 is a cpu intensive process, you can limit
     * limit the number of notes you want and reduce the time to load the instrument.
     *
     * @param {AudioContext} ac - the audio context
     * @param {String} name - the instrument name. For example: 'acoustic_grand_piano'
     * @param {Object} options - (Optional) the same options as Soundfont.loadBuffers
     * @return {Promise}
     *
     * @example
     * var Soundfont = require('sounfont-player')
     * Soundfont.instrument('marimba').then(function (marimba) {
     *   marimba.play('C4')
     * })
     */
    function instrument (ac, name, options) {
      if (arguments.length === 1) return function (n, o) { return instrument(ac, n, o) }
      var opts = options || {};
      var isUrl = opts.isSoundfontURL || isSoundfontURL;
      var toUrl = opts.nameToUrl || nameToUrl;
      var url = isUrl(name) ? name : toUrl(name, opts.soundfont, opts.format);

      return lib(ac, url, { only: opts.only || opts.notes }).then(function (buffers) {
        var p = lib$1(ac, buffers, opts).connect(opts.destination ? opts.destination : ac.destination);
        p.url = url;
        p.name = name;
        return p
      })
    }

    function isSoundfontURL (name) {
      return /\.js(\?.*)?$/i.test(name)
    }

    /**
     * Given an instrument name returns a URL to to the Benjamin Gleitzman's
     * package of [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts)
     *
     * @param {String} name - instrument name
     * @param {String} soundfont - (Optional) the soundfont name. One of 'FluidR3_GM'
     * or 'MusyngKite' ('MusyngKite' by default)
     * @param {String} format - (Optional) Can be 'mp3' or 'ogg' (mp3 by default)
     * @returns {String} the Soundfont file url
     * @example
     * var Soundfont = require('soundfont-player')
     * Soundfont.nameToUrl('marimba', 'mp3')
     */
    function nameToUrl (name, sf, format) {
      format = format === 'ogg' ? format : 'mp3';
      sf = sf === 'FluidR3_GM' ? sf : 'MusyngKite';
      return 'https://gleitz.github.io/midi-js-soundfonts/' + sf + '/' + name + '-' + format + '.js'
    }

    // In the 1.0.0 release it will be:
    // var Soundfont = {}

    legacy.instrument = instrument;
    legacy.nameToUrl = nameToUrl;

    if ( module.exports) module.exports = legacy;
    if (typeof window !== 'undefined') window.Soundfont = legacy;
    });

    /* src\App.svelte generated by Svelte v3.6.4 */
    const { window: window_1 } = globals;

    const file$b = "src\\App.svelte";

    // (227:4) <h3 slot="left">
    function create_left_slot(ctx) {
    	var h3;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Piano";
    			attr(h3, "slot", "left");
    			attr(h3, "class", "svelte-14ara1v");
    			add_location(h3, file$b, 226, 4, 5483);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    			}
    		}
    	};
    }

    // (229:4) <Button outline on:click={stopAllSounds}>
    function create_default_slot_2$2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Stop all sounds");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (230:4) <Button spaced outline on:click={switchDark}>
    function create_default_slot_1$2(ctx) {
    	var t0, t1;

    	return {
    		c: function create() {
    			t0 = text(ctx.themeName);
    			t1 = text(" theme");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.themeName) {
    				set_data(t0, ctx.themeName);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    			}
    		}
    	};
    }

    // (226:2) <TitleBar>
    function create_default_slot$3(ctx) {
    	var t0, t1, current;

    	var button0 = new Button({
    		props: {
    		outline: true,
    		$$slots: { default: [create_default_slot_2$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button0.$on("click", ctx.stopAllSounds);

    	var button1 = new Button({
    		props: {
    		spaced: true,
    		outline: true,
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button1.$on("click", ctx.switchDark);

    	return {
    		c: function create() {
    			t0 = space();
    			button0.$$.fragment.c();
    			t1 = space();
    			button1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			mount_component(button0, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button0_changes = {};
    			if (changed.$$scope) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.$$scope || changed.themeName) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);

    			transition_in(button1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(button0, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(button1, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var div1, t0, t1, t2, div0, t3, t4, current, dispose;

    	var titlebar = new TitleBar({
    		props: {
    		$$slots: {
    		default: [create_default_slot$3],
    		left: [create_left_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var controls = new Controls({ $$inline: true });

    	var pianogrid = new PianoGrid({ $$inline: true });

    	var instrumentlist = new InstrumentList({ $$inline: true });

    	var seteditor = new SetEditor({ $$inline: true });

    	var setlist = new SetList({ $$inline: true });

    	return {
    		c: function create() {
    			div1 = element("div");
    			titlebar.$$.fragment.c();
    			t0 = space();
    			controls.$$.fragment.c();
    			t1 = space();
    			pianogrid.$$.fragment.c();
    			t2 = space();
    			div0 = element("div");
    			instrumentlist.$$.fragment.c();
    			t3 = space();
    			seteditor.$$.fragment.c();
    			t4 = space();
    			setlist.$$.fragment.c();
    			attr(div0, "class", "split svelte-14ara1v");
    			add_location(div0, file$b, 236, 2, 5717);
    			attr(div1, "class", "container");
    			add_location(div1, file$b, 223, 0, 5438);

    			dispose = [
    				listen(window_1, "keydown", prevent_default(ctx.handleKeyDown)),
    				listen(window_1, "keyup", prevent_default(ctx.handleKeyUp))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(titlebar, div1, null);
    			append(div1, t0);
    			mount_component(controls, div1, null);
    			append(div1, t1);
    			mount_component(pianogrid, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(instrumentlist, div0, null);
    			append(div0, t3);
    			mount_component(seteditor, div0, null);
    			append(div0, t4);
    			mount_component(setlist, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var titlebar_changes = {};
    			if (changed.$$scope || changed.themeName) titlebar_changes.$$scope = { changed, ctx };
    			titlebar.$set(titlebar_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);

    			transition_in(controls.$$.fragment, local);

    			transition_in(pianogrid.$$.fragment, local);

    			transition_in(instrumentlist.$$.fragment, local);

    			transition_in(seteditor.$$.fragment, local);

    			transition_in(setlist.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(controls.$$.fragment, local);
    			transition_out(pianogrid.$$.fragment, local);
    			transition_out(instrumentlist.$$.fragment, local);
    			transition_out(seteditor.$$.fragment, local);
    			transition_out(setlist.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_component(titlebar, );

    			destroy_component(controls, );

    			destroy_component(pianogrid, );

    			destroy_component(instrumentlist, );

    			destroy_component(seteditor, );

    			destroy_component(setlist, );

    			run_all(dispose);
    		}
    	};
    }

    function clamp$1(value, min, max) {
      if (value <= min) return min;
      if (value >= max) return max;
      return value;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $instrumentSets, $activeSet, $keysPressed, $keysDown, $volume, $octaveShift;

    	validate_store(instrumentSets, 'instrumentSets');
    	subscribe($$self, instrumentSets, $$value => { $instrumentSets = $$value; $$invalidate('$instrumentSets', $instrumentSets); });
    	validate_store(activeSet, 'activeSet');
    	subscribe($$self, activeSet, $$value => { $activeSet = $$value; $$invalidate('$activeSet', $activeSet); });
    	validate_store(keysPressed, 'keysPressed');
    	subscribe($$self, keysPressed, $$value => { $keysPressed = $$value; $$invalidate('$keysPressed', $keysPressed); });
    	validate_store(keysDown, 'keysDown');
    	subscribe($$self, keysDown, $$value => { $keysDown = $$value; $$invalidate('$keysDown', $keysDown); });
    	validate_store(volume, 'volume');
    	subscribe($$self, volume, $$value => { $volume = $$value; $$invalidate('$volume', $volume); });
    	validate_store(octaveShift, 'octaveShift');
    	subscribe($$self, octaveShift, $$value => { $octaveShift = $$value; $$invalidate('$octaveShift', $octaveShift); });

    	

      let theme = 0;

      function stopAllSounds() {
        if ($instrumentSets[$activeSet].instruments.length < 1) return;

        for (let instr of $instrumentSets[$activeSet].instruments) {
          instr.data.then(k => {
            k.stop();
          });
        }

        for (let i in keyCodes) {
          document
                  .querySelector("#" + keyCodes[i])
                  .classList.remove("piano-key-highlight");
        }
      }

      function switchDark() {
        theme++; $$invalidate('theme', theme);

        if (theme === 3) {
          $$invalidate('theme', theme = 0);
        }

        applyTheme();
      }

      function applyTheme() {
        if ((theme === 0 && window.matchMedia("(prefers-color-scheme: dark)").matches) || theme === 2) {
          document.querySelector("html").className = "dark";
        } else {
          document.querySelector("html").className = "";
        }

        // console.log(`Current theme: ${themeName}`);
      }

      function handleKeyDown(e) {
        let kCode = e.keyCode;

        if ($instrumentSets[$activeSet].instruments.length < 1) return;
        if (keyCodes[kCode] == null) return;
        if (keyNotes[kCode] == null) return;
        if ($keysPressed[kCode] === null) return;
        if ($keysDown[kCode] === true) return;

        document
                .querySelector("#" + keyCodes[kCode])
                .classList.add("piano-key-highlight");

        keysDown.update(kd => {
          kd[kCode] = true;
          return kd;
        });

        for (let instrument of $instrumentSets[$activeSet].instruments) {

          let vol =
                  instrument.volume > -1 ? (instrument.absoluteVolume ? ($volume * (instrument.volume / 100)) / 100 : instrument.volume / 100)  : $volume / 100;

          let adjustedOctShift = clamp$1($octaveShift + instrument.octave, -3, 3);

          instrument.data.then(instr => {
            let newAdsr = instrument.adsr;

            if (newAdsr[0] < 0) newAdsr[0] = defaultAdsr[0];
            if (newAdsr[1] < 0) newAdsr[1] = defaultAdsr[1];
            if (newAdsr[2] < 0) newAdsr[2] = defaultAdsr[2];
            if (newAdsr[3] < 0) newAdsr[3] = defaultAdsr[3];

            let note = (
                    parseInt(keyNotes[kCode]) +
                    12 * adjustedOctShift
            ).toString();

            let inst = instr.play(note, ac.currentTime, {
              loop: true,
              adsr: newAdsr,
              gain: vol
            });
            if ($keysPressed[kCode].indexOf(inst) === -1) {
              let currentPressed = $keysPressed[kCode];

              keysPressed.update(kp => {
                kp[kCode] = [...currentPressed, inst];
                return kp;
              });
            }
          });
        }

      }

      function handleKeyUp(e) {
        let kCode = e.keyCode;

        if (kCode >= 48 && kCode <= 58) {
          stopAllSounds();

          let newCode = kCode - 49;

          if (kCode == 48) {
            newCode = 9;
          }

          activeSet.set(newCode);
        }

        if (kCode === 16) {
          if ($octaveShift <= 2) {
            octaveShift.update(os => os + 1);
          }
          return;
        }

        if (kCode === 17) {
          if ($octaveShift >= -2) {
            octaveShift.update(os => os - 1);
          }
          return;
        }

        if (kCode === 37) {
          if ($volume >= 1) volume.update(v => v - 1);
          return;
        }

        if (kCode === 40) {
          if ($volume >= 10) volume.update(v => v - 10);
          if ($volume - 10 < 0) volume.update(v => v = 0);
          return;
        }

        if (kCode === 39) {
          if ($volume < 99) volume.update(v => v + 1);
          return;
        }

        if (kCode === 38) {
          if ($volume <= 90) volume.update(v => v + 10);
          if($volume + 10 > 100) volume.update(v => v = 100);
          return;
        }

        if ($instrumentSets[$activeSet].instruments.length < 1) return;
        if (keyCodes[kCode] == null) return;
        if (keyNotes[kCode] == null) return;
        if ($keysPressed[kCode] === null) return;
        if ($keysDown[kCode] === false) return;

        document
                .querySelector("#" + keyCodes[kCode])
                .classList.remove("piano-key-highlight");

        keysDown.update(kd => {
          kd[kCode] = false;
          return kd;
        });

        for (var i of $keysPressed[kCode]) {
          try {
            i.stop();
          } catch (err) {
            console.error("Errored stop, stopping all.");
            console.error("Error: ", err.message);
            stopAllSounds();
          }
        }

        keysPressed.update(kp => {
          kp[kCode] = [];
          return kp;
        });

      }

      applyTheme();

    	let themeName;

    	$$self.$$.update = ($$dirty = { theme: 1 }) => {
    		if ($$dirty.theme) { $$invalidate('themeName', themeName = theme === 0 ? 'Auto' : (theme === 1 ? 'Light' : 'Dark')); }
    	};

    	return {
    		stopAllSounds,
    		switchDark,
    		handleKeyDown,
    		handleKeyUp,
    		themeName
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map