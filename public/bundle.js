
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
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
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
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
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
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
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
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
                block.p(child_ctx, dirty);
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
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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
        $capture_state() { }
        $inject_state() { }
    }

    function backOut(t) {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
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
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    /* src\components\Icon.svelte generated by Svelte v3.24.1 */

    const file = "src\\components\\Icon.svelte";

    // (635:25) 
    function create_if_block_17(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M20 9.50195V8.74985C20 7.50721 18.9926 6.49985 17.75\r\n      6.49985H12.0247L9.64368 4.51995C9.23959 4.18393 8.73063 3.99997 8.20509\r\n      3.99997H4.24957C3.00724 3.99997 2 5.00686 1.99957 6.24919L1.99561\r\n      17.7492C1.99518 18.9921 3.00266 20 4.24561 20H4.27196C4.27607 20 4.28019\r\n      20 4.28431 20H18.4693C19.2723 20 19.9723 19.4535 20.167 18.6745L21.9169\r\n      11.6765C22.1931 10.5719 21.3577 9.50195 20.2192 9.50195H20ZM4.24957\r\n      5.49997H8.20509C8.38027 5.49997 8.54993 5.56129 8.68462 5.6733L11.2741\r\n      7.82652C11.4088 7.93852 11.5784 7.99985 11.7536 7.99985H17.75C18.1642\r\n      7.99985 18.5 8.33563 18.5 8.74985V9.50195H6.42385C5.39136 9.50195 4.49137\r\n      10.2047 4.241 11.2064L3.49684 14.1837L3.49957 6.24971C3.49971 5.8356\r\n      3.83546 5.49997 4.24957 5.49997ZM5.69623 11.5701C5.77969 11.2362 6.07969\r\n      11.002 6.42385 11.002H20.2192C20.3819 11.002 20.5012 11.1548 20.4617\r\n      11.3126L18.7119 18.3107C18.684 18.4219 18.584 18.5 18.4693\r\n      18.5H4.28431C4.12167 18.5 4.00233 18.3472 4.04177 18.1894L5.69623 11.5701Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file, 641, 4, 33755);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 635, 2, 33629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(635:25) ",
    		ctx
    	});

    	return block;
    }

    // (612:25) 
    function create_if_block_16(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M3 5.75C3 4.23122 4.23122 3 5.75 3H15.7145C16.5764 3 17.4031 3.34241\r\n      18.0126 3.9519L20.0481 5.98744C20.6576 6.59693 21 7.42358 21\r\n      8.28553V18.25C21 19.7688 19.7688 21 18.25 21H5.75C4.23122 21 3 19.7688 3\r\n      18.25V5.75ZM5.75 4.5C5.05964 4.5 4.5 5.05964 4.5 5.75V18.25C4.5 18.9404\r\n      5.05964 19.5 5.75 19.5H6V14.25C6 13.0074 7.00736 12 8.25 12H15.75C16.9926\r\n      12 18 13.0074 18 14.25V19.5H18.25C18.9404 19.5 19.5 18.9404 19.5\r\n      18.25V8.28553C19.5 7.8214 19.3156 7.37629 18.9874 7.0481L16.9519\r\n      5.01256C16.6918 4.75246 16.3582 4.58269 16 4.52344V7.25C16 8.49264 14.9926\r\n      9.5 13.75 9.5H9.25C8.00736 9.5 7 8.49264 7 7.25V4.5H5.75ZM16.5\r\n      19.5V14.25C16.5 13.8358 16.1642 13.5 15.75 13.5H8.25C7.83579 13.5 7.5\r\n      13.8358 7.5 14.25V19.5H16.5ZM8.5 4.5V7.25C8.5 7.66421 8.83579 8 9.25\r\n      8H13.75C14.1642 8 14.5 7.66421 14.5 7.25V4.5H8.5Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file, 619, 4, 32659);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 612, 2, 32520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(612:25) ",
    		ctx
    	});

    	return block;
    }

    // (588:25) 
    function create_if_block_15(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M11.7498476,3 C12.1295434,3 12.4433959,3.28201302\r\n        12.4931327,3.64807848 L12.5,3.74984765 L12.5012052,11 L19.7542949,11\r\n        C20.1685084,11 20.5042949,11.3357864 20.5042949,11.75\r\n        C20.5042949,12.1296958 20.222141,12.443491 19.8560654,12.4931534\r\n        L19.7542949,12.5 L12.5012052,12.5 L12.50325,19.7491118\r\n        C12.5033342,20.1633254 12.1676159,20.4992642 11.7534024,20.4992642\r\n        C11.3737066,20.4992642 11.0598541,20.2172511 11.0101173,19.8511857\r\n        L11.0032501,19.7494165 L11.0012052,12.5 L3.75220519,12.5\r\n        C3.33799163,12.5 3.00220519,12.1642136 3.00220519,11.75\r\n        C3.00220519,11.3703042 3.28435907,11.056509 3.65043463,11.0068466\r\n        L3.75220519,11 L11.0012052,11 L11,3.75015235 C10.9999159,3.3359388\r\n        11.3356341,3 11.7498476,3 Z");
    			add_location(path, file, 596, 6, 31648);
    			attr_dev(g, "id", "ic_fluent_add_24_regular");
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 595, 4, 31567);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 588, 2, 31393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(588:25) ",
    		ctx
    	});

    	return block;
    }

    // (541:28) 
    function create_if_block_14(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12.4462117,8.14932898 L12.5303301,8.22194713 L16.4553927,12.1470097\r\n        C16.7482859,12.439903 16.7482859,12.9147767 16.4553927,13.2076699\r\n        C16.1891261,13.4739365 15.7724624,13.4981425 15.478851,13.2802881\r\n        L15.3947325,13.2076699 L12.7383007,10.5480854 L12.7397098,20.2561629\r\n        C12.7397098,20.6703765 12.4039234,21.0061629 11.9897098,21.0061629\r\n        C11.5754962,21.0061629 11.2397098,20.6703765 11.2397098,20.2561629\r\n        L11.2409374,10.5712772 L8.60526748,13.2076699 C8.33900092,13.4739365\r\n        7.92233723,13.4981425 7.62872574,13.2802881 L7.54460731,13.2076699\r\n        C7.27834074,12.9414033 7.25413469,12.5247397 7.47198915,12.2311282\r\n        L7.54460731,12.1470097 L11.4696699,8.22194713 C11.7359365,7.95568057\r\n        12.1526002,7.93147452 12.4462117,8.14932898 Z M12,4 C15.5201237,4\r\n        17.5170299,6.27297767 17.807452,9.01798605 L17.8962916,9.01798324\r\n        C20.1616355,9.01798324 21.9980596,10.8048186 21.9980596,13.0089916\r\n        C21.9980596,15.2131647 20.1616355,17 17.8962916,17 L14.7412788,17\r\n        L14.6467723,16.9931688 C14.2815196,16.943618 14,16.6305282 14,16.2516859\r\n        C14,15.8728437 14.2815196,15.5597539 14.6467723,15.5102031\r\n        L14.7479404,15.503 L17.8962916,15.5033719 L18.0648493,15.4980661\r\n        C19.4021163,15.4136128 20.4598966,14.3314955 20.4598966,13.0089916\r\n        C20.4598966,11.6864878 19.4021163,10.6043705 18.0648714,10.5199171\r\n        L17.8963166,10.5146114 L17.1209388,10.5146359 L17.0196832,10.5082527\r\n        C16.65368,10.4619122 16.3527628,10.1685819 16.3527628,9.80312182\r\n        C16.3527628,7.25466713 14.3256778,5.46532885 12,5.46532885\r\n        C9.67432221,5.46532885 7.64723717,7.28694446 7.64723717,9.80312182\r\n        C7.64723717,10.1685819 7.34632004,10.4619122 6.98031678,10.5082527\r\n        L6.87906119,10.5146359 L6.10370842,10.5146114 L5.93515069,10.5199171\r\n        C4.65360314,10.6008516 3.62873697,11.5980434 3.54555636,12.8449854\r\n        L3.54010339,13.0089916 L3.54555636,13.1729978 C3.62873697,14.4199398\r\n        4.65360314,15.4171316 5.93515069,15.4980661 L6.10370842,15.5033719\r\n        L9.24194037,15.504 C9.63052817,15.5033719 9.94361799,15.7848915\r\n        9.99316877,16.1501441 L10,16.2516859 C10,16.6305282 9.71848037,16.943618\r\n        9.35322772,16.9931688 L9.24234988,17 L6.10370842,17 C3.83836448,17\r\n        2.00194037,15.2131647 2.00194037,13.0089916 C2.00194037,10.8048186\r\n        3.83836448,9.01798324 6.10373343,9.01798324 L6.19254802,9.01798605\r\n        C6.48465951,6.25493547 8.47987632,4 12,4 Z");
    			add_location(path, file, 550, 6, 28772);
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 549, 4, 28721);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 541, 2, 28545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(541:28) ",
    		ctx
    	});

    	return block;
    }

    // (489:27) 
    function create_if_block_13(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M11.9897098,8.00227722 C12.3694056,8.00227722 12.6832008,8.2844311\r\n        12.7328632,8.65050666 L12.7397098,8.75227722 L12.7383007,18.4603548\r\n        L15.3947325,15.8007702 L15.478851,15.7281521 C15.7724624,15.5102976\r\n        16.1891261,15.5345037 16.4553927,15.8007702 C16.7216593,16.0670368\r\n        16.7458653,16.4837005 16.5280108,16.777312 L16.4553927,16.8614304\r\n        L12.5303301,20.786493 L12.4462117,20.8591112 C12.1852237,21.0527596\r\n        11.8270092,21.0551503 11.5636206,20.8662833 L11.4696699,20.786493\r\n        L7.54460731,16.8614304 L7.47198915,16.777312 C7.27834074,16.516324\r\n        7.27595002,16.1581096 7.46481699,15.8947209 L7.54460731,15.8007702\r\n        L7.62872574,15.7281521 C7.88971373,15.5345037 8.24792815,15.532113\r\n        8.5113168,15.7209799 L8.60526748,15.8007702 L11.2409374,18.4371629\r\n        L11.2397098,8.75227722 C11.2397098,8.33806365 11.5754962,8.00227722\r\n        11.9897098,8.00227722 Z M11.75,2 C14.3627474,2 16.6315143,3.68233619\r\n        17.4389187,6.08563057 L17.543951,6.08164422 C19.7311302,6.08164422\r\n        21.5041894,7.85470333 21.5041894,10.0418826 C21.5041894,12.2290619\r\n        19.7311302,14.002121 17.543951,14.002121 L14.7469481,14.002121\r\n        C14.3327346,14.002121 13.9969481,13.6663345 13.9969481,13.252121\r\n        C13.9969481,12.8379074 14.3327346,12.502121 14.7469481,12.502121\r\n        L17.543951,12.502121 C18.9027031,12.502121 20.0041894,11.4006347\r\n        20.0041894,10.0418826 C20.0041894,8.68313046 18.9027031,7.58164422\r\n        17.543951,7.58164422 C17.3717981,7.58164422 17.2023844,7.59921086\r\n        17.037304,7.63371294 C16.665639,7.71139158 16.3007573,7.49940199\r\n        16.1772531,7.15122908 L16.149,7.047 L16.1010982,6.84368924\r\n        C15.5849026,4.89448945 13.8096221,3.5 11.75,3.5 C9.69098559,3.5\r\n        7.91608291,4.89367677 7.39932449,6.84209619 L7.354,7.029\r\n        L7.35181201,7.04826791 C7.30233155,7.28674112 7.14468952,7.47507997\r\n        6.9407409,7.57268716 L6.842039,7.61092891 L6.80081847,7.6232244\r\n        L6.80081847,7.6232244 L6.73950741,7.63571199 C6.71563689,7.64006643\r\n        6.69081151,7.64292757 6.66574652,7.64453002 L6.56612111,7.64422778\r\n        L6.46409351,7.63005087 C6.29491784,7.59559055 6.1295715,7.57888029\r\n        5.96162034,7.57888029 C4.60210497,7.57888029 3.5,8.68098525\r\n        3.5,10.0405006 C3.5,11.3456354 4.51569994,12.4135407\r\n        5.79976813,12.4968849 L5.96162034,12.502121 L8.75127754,12.502121\r\n        C9.1654911,12.502121 9.50127754,12.8379074 9.50127754,13.252121\r\n        C9.50127754,13.6318167 9.21912366,13.9456119 8.8530481,13.9952744\r\n        L8.75127754,14.002121 L5.96162034,14.002121 C3.77367784,14.002121\r\n        2,12.2284431 2,10.0405006 C2,7.85255813 3.77367784,6.07888029\r\n        5.96162034,6.07888029 L6.06268443,6.08014899 L6.06268443,6.08014899\r\n        C6.8703752,3.6808929 9.13838371,2 11.75,2 Z");
    			add_location(path, file, 498, 6, 25600);
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 497, 4, 25549);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 489, 2, 25373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(489:27) ",
    		ctx
    	});

    	return block;
    }

    // (459:29) 
    function create_if_block_12(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M3.28034 2.21968C2.98745 1.92678 2.51257 1.92677 2.21968\r\n      2.21966C1.92678 2.51255 1.92677 2.98743 2.21966 3.28032L6.72545\r\n      7.7862L3.60908 8.71228C2.65455 8.99594 2 9.87328 2 10.8691V13.131C2\r\n      14.1267 2.65446 15.004 3.60891 15.2877L5.999 15.9984L6 16.4992L6.0049\r\n      16.6988C6.10892 18.8152 7.8578 20.4992 10 20.4992C11.5584 20.4992 12.9378\r\n      19.6005 13.595 18.2555L18.7179 19.7789L20.7194 21.7805C21.0123 22.0734\r\n      21.4872 22.0734 21.7801 21.7805C22.073 21.4876 22.073 21.0127 21.7801\r\n      20.7198L3.28034 2.21968ZM16.4912 17.5522L4.0363 13.8499C3.71815 13.7553\r\n      3.5 13.4629 3.5 13.131V10.8691C3.5 10.5371 3.71818 10.2447 4.03636\r\n      10.1501L7.93178 8.99256L16.4912 17.5522ZM7.499 16.4444L12.1238\r\n      17.8197C11.6783 18.535 10.8852 18.9992 10 18.9992C8.61929 18.9992 7.5\r\n      17.8799 7.5 16.4992L7.499 16.4444Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file, 466, 4, 24040);
    			attr_dev(path1, "d", "M20.5 6.263V17.3183L21.815 18.6333C21.934 18.3591 22 18.0564 22\r\n      17.7384V6.263C22 6.04599 21.9686 5.83011 21.9068 5.62208C21.5528 4.43092\r\n      20.3002 3.75225 19.1091 4.10622L9.99616 6.81426L11.2025 8.02061L19.5364\r\n      5.54408C19.9334 5.42609 20.3509 5.65231 20.4689 6.04936C20.4895 6.11871\r\n      20.5 6.19066 20.5 6.263Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file, 480, 4, 24950);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 459, 2, 23901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(459:29) ",
    		ctx
    	});

    	return block;
    }

    // (429:33) 
    function create_if_block_11(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "M13.7197 6.78033C14.0126 7.07322 14.4874 7.07322 14.7803\r\n      6.78033C15.0732 6.48744 15.0732 6.01256 14.7803 5.71967L12.2803\r\n      3.21967C11.9874 2.92678 11.5126 2.92678 11.2197 3.21967L8.71967\r\n      5.71967C8.42678 6.01256 8.42678 6.48744 8.71967 6.78033C9.01256 7.07322\r\n      9.48744 7.07322 9.78033 6.78033L11 5.56066L11 9.25C11 9.66421 11.3358 10\r\n      11.75 10C12.1642 10 12.5 9.66421 12.5 9.25L12.5 5.56066L13.7197 6.78033Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file, 436, 4, 22666);
    			attr_dev(path1, "d", "M12.5 15.25C12.5 14.8358 12.1642 14.5 11.75 14.5C11.3358 14.5 11\r\n      14.8358 11 15.25V18.9393L9.78033 17.7197C9.48744 17.4268 9.01256 17.4268\r\n      8.71967 17.7197C8.42678 18.0126 8.42678 18.4874 8.71967 18.7803L11.2197\r\n      21.2803C11.5126 21.5732 11.9874 21.5732 12.2803 21.2803L14.7803\r\n      18.7803C15.0732 18.4874 15.0732 18.0126 14.7803 17.7197C14.4874 17.4268\r\n      14.0126 17.4268 13.7197 17.7197L12.5 18.9393V15.25Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file, 444, 4, 23156);
    			attr_dev(path2, "d", "M5.75 11.5C5.33579 11.5 5 11.8358 5 12.25C5 12.6642 5.33579 13 5.75\r\n      13H17.75C18.1642 13 18.5 12.6642 18.5 12.25C18.5 11.8358 18.1642 11.5\r\n      17.75 11.5H5.75Z");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file, 452, 4, 23641);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 429, 2, 22527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(429:33) ",
    		ctx
    	});

    	return block;
    }

    // (385:25) 
    function create_if_block_10(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "M11.0656 8.00389L11.25 7.99875H18.75C20.483 7.99875 21.8992 9.3552\r\n      21.9949 11.0643L22 11.2487V12.8096C21.5557 12.3832 21.051 12.0194 20.5\r\n      11.7322V11.2487C20.5 10.2822 19.7165 9.49875 18.75 9.49875H11.25C10.3318\r\n      9.49875 9.57881 10.2059 9.5058 11.1052L9.5 11.2487V18.7487C9.5 19.6669\r\n      10.2071 20.4199 11.1065 20.4929L11.25 20.4987H11.7316C12.0186 21.0497\r\n      12.3822 21.5544 12.8084 21.9987H11.25C9.51697 21.9987 8.10075 20.6423\r\n      8.00514 18.9332L8 18.7487V11.2487C8 9.51571 9.35645 8.0995 11.0656\r\n      8.00389Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file, 392, 4, 20297);
    			attr_dev(path1, "d", "M15.5818 4.23284L15.6345 4.40964L16.327 6.998H14.774L14.1856\r\n      4.79787C13.9355 3.86431 12.9759 3.31029 12.0423 3.56044L4.79787\r\n      5.50158C3.91344 5.73856 3.36966 6.61227 3.52756 7.49737L3.56044\r\n      7.64488L5.50158 14.8893C5.69372 15.6064 6.30445 16.0996 7.00045\r\n      16.1764L7.00056 17.6816C5.69932 17.6051 4.52962 16.7445 4.10539\r\n      15.4544L4.05269 15.2776L2.11155 8.03311C1.66301 6.35913 2.6067 4.6401\r\n      4.23284 4.10539L4.40964 4.05269L11.6541 2.11155C13.3281 1.66301 15.0471\r\n      2.6067 15.5818 4.23284Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file, 402, 4, 20896);
    			attr_dev(path2, "d", "M23 17.5C23 14.4624 20.5376 12 17.5 12C14.4624 12 12 14.4624 12 17.5C12\r\n      20.5376 14.4624 23 17.5 23C20.5376 23 23 20.5376 23 17.5ZM17.4101\r\n      14.0073L17.5 13.9992L17.5899 14.0073C17.794 14.0443 17.9549 14.2053\r\n      17.9919 14.4094L18 14.4992L17.9996 16.9992L20.5046 17L20.5944\r\n      17.0081C20.7985 17.0451 20.9595 17.206 20.9965 17.4101L21.0046\r\n      17.5L20.9965 17.5899C20.9595 17.794 20.7985 17.9549 20.5944\r\n      17.9919L20.5046 18L18.0007 17.9992L18.0011 20.5035L17.9931 20.5934C17.956\r\n      20.7975 17.7951 20.9584 17.591 20.9954L17.5011 21.0035L17.4112\r\n      20.9954C17.2071 20.9584 17.0462 20.7975 17.0092 20.5934L17.0011\r\n      20.5035L17.0007 17.9992L14.4977 18L14.4078 17.9919C14.2037 17.9549 14.0427\r\n      17.794 14.0057 17.5899L13.9977 17.5L14.0057 17.4101C14.0427 17.206 14.2037\r\n      17.0451 14.4078 17.0081L14.4977 17L16.9996 16.9992L17 14.4992L17.0081\r\n      14.4094C17.0451 14.2053 17.206 14.0443 17.4101 14.0073Z");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file, 412, 4, 21480);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 385, 2, 20158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(385:25) ",
    		ctx
    	});

    	return block;
    }

    // (353:24) 
    function create_if_block_9(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M11.0656 8.00389L11.25 7.99875H18.75C20.483 7.99875 21.8992 9.3552\r\n      21.9949 11.0643L22 11.2487V18.7487C22 20.4818 20.6435 21.898 18.9344\r\n      21.9936L18.75 21.9987H11.25C9.51697 21.9987 8.10075 20.6423 8.00515\r\n      18.9332L8 18.7487V11.2487C8 9.51571 9.35646 8.0995 11.0656 8.00389ZM18.75\r\n      9.49875H11.25C10.3318 9.49875 9.57881 10.2059 9.5058 11.1052L9.5\r\n      11.2487V18.7487C9.5 19.6669 10.2071 20.4199 11.1065 20.4929L11.25\r\n      20.4987H18.75C19.6682 20.4987 20.4212 19.7916 20.4942 18.8923L20.5\r\n      18.7487V11.2487C20.5 10.2822 19.7165 9.49875 18.75 9.49875ZM15 11C15.4142\r\n      11 15.75 11.3358 15.75 11.75V14.248L18.25 14.2487C18.6642 14.2487 19\r\n      14.5845 19 14.9987C19 15.413 18.6642 15.7487 18.25 15.7487L15.75\r\n      15.748V18.25C15.75 18.6642 15.4142 19 15 19C14.5858 19 14.25 18.6642 14.25\r\n      18.25V15.748L11.75 15.7487C11.3358 15.7487 11 15.413 11 14.9987C11 14.5845\r\n      11.3358 14.2487 11.75 14.2487L14.25 14.248V11.75C14.25 11.3358 14.5858 11\r\n      15 11ZM15.5818 4.23284L15.6345 4.40964L16.327 6.998H14.774L14.1856\r\n      4.79787C13.9355 3.86431 12.9759 3.31029 12.0423 3.56044L4.79787\r\n      5.50158C3.91344 5.73856 3.36966 6.61227 3.52756 7.49737L3.56044\r\n      7.64488L5.50158 14.8893C5.69372 15.6064 6.30445 16.0996 7.00045\r\n      16.1764L7.00056 17.6816C5.69932 17.6051 4.52962 16.7445 4.10539\r\n      15.4544L4.05269 15.2776L2.11155 8.03311C1.66301 6.35913 2.6067 4.6401\r\n      4.23284 4.10539L4.40964 4.05269L11.6541 2.11155C13.3281 1.66301 15.0471\r\n      2.6067 15.5818 4.23284Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file, 360, 4, 18534);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 353, 2, 18395);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(353:24) ",
    		ctx
    	});

    	return block;
    }

    // (312:28) 
    function create_if_block_8(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M2.21965261,9.21968721 L6.71441333,4.72463325 C6.9804724,4.45855682\r\n        7.39676029,4.43414822 7.69038012,4.65156046 L7.77451313,4.72403891\r\n        L12.279365,9.21909288 C12.5725769,9.51166706 12.5730939,9.98654051\r\n        12.2805197,10.2797524 C12.0145431,10.5463087 11.5979061,10.5709683\r\n        11.3040576,10.3534337 L11.2198601,10.2809071 L7.997,7.06405396\r\n        L7.99766092,18.7598921 C7.99766092,19.1395878 7.71550704,19.453383\r\n        7.34943148,19.5030455 L7.24766092,19.5098921 C6.86796516,19.5098921\r\n        6.55416996,19.2277382 6.50450754,18.8616626 L6.49766092,18.7598921\r\n        L6.497,7.06205396 L3.28034739,10.2803128 C3.01408951,10.546588\r\n        2.59742662,10.5708077 2.30380802,10.3529628 L2.21968721,10.2803474\r\n        C1.95341197,10.0140895 1.92919232,9.59742662 2.14703721,9.30380802\r\n        L2.21965261,9.21968721 L6.71441333,4.72463325 L2.21965261,9.21968721 Z\r\n        M16.6490901,4.50190058 L16.7508607,4.49505396 C17.1305564,4.49505396\r\n        17.4443516,4.77720785 17.4940141,5.14328341 L17.5008607,5.24505396\r\n        L17.5,16.941054 L20.7194483,13.7198917 C20.9856035,13.4535138\r\n        21.402257,13.4291336 21.6959596,13.6468653 L21.7801083,13.7194483\r\n        C22.0464862,13.9856035 22.0708664,14.402257 21.8531347,14.6959596\r\n        L21.7805517,14.7801083 L17.2843126,19.2801083 C17.0181573,19.5464863\r\n        16.6015037,19.5708664 16.3078012,19.3531346 L16.2236524,19.2805516\r\n        L11.7198915,14.7805516 C11.4268759,14.4877807 11.4266776,14.012907\r\n        11.7194484,13.7198915 C11.9856038,13.4535137 12.4022573,13.4291336\r\n        12.6959598,13.6468654 L12.7801085,13.7194484 L16,16.937054\r\n        L16.0008607,5.24505396 C16.0008607,4.8653582 16.2830146,4.551563\r\n        16.6490901,4.50190058 L16.7508607,4.49505396 L16.6490901,4.50190058 Z");
    			add_location(path, file, 324, 6, 16519);
    			attr_dev(g, "id", "ic_fluent_arrow_sort_24_regular");
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 320, 4, 16410);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 312, 2, 16234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(312:28) ",
    		ctx
    	});

    	return block;
    }

    // (262:33) 
    function create_if_block_7(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M16.5,11 C16.7930736,11 17.0806075,11.024542 17.3607867,11.0717481\r\n        L17.5341163,11.7877987 C17.7930873,12.8615807 18.8734971,13.5221156\r\n        19.9472791,13.2631446 L20.0450624,13.2369258 L20.0450624,13.2369258\r\n        L20.6461665,13.0580331 C21.0087308,13.5250263 21.2991223,14.0545692\r\n        21.4998264,14.6285394 L21.0525916,15.0588054 C20.2566418,15.8246629\r\n        20.2322472,17.0907579 20.9981047,17.8867077 L21.0525916,17.9411946\r\n        L21.4998264,18.3714606 C21.2992653,18.9450217 21.0091447,19.4742188\r\n        20.6469416,19.9409683 L20.0450624,19.7630742 C18.9857606,19.4500989\r\n        17.8733103,20.0551161 17.5603351,21.1144179 L17.5341163,21.2122013\r\n        L17.5341163,21.2122013 L17.3607867,21.9282519 C17.0806075,21.975458\r\n        16.7930736,22 16.5,22 C16.2066096,22 15.918771,21.9754049\r\n        15.6383049,21.9280988 L15.4658837,21.2122013 C15.2069127,20.1384193\r\n        14.1265029,19.4778844 13.0527209,19.7368554 L12.9549376,19.7630742\r\n        L12.9549376,19.7630742 L12.3530584,19.9409683 C11.9908553,19.4742188\r\n        11.7007347,18.9450217 11.5001736,18.3714606 L11.9474084,17.9411946\r\n        C12.7433582,17.1753371 12.7677528,15.9092421 12.0018953,15.1132923\r\n        L11.9474084,15.0588054 L11.5001736,14.6285394 C11.7007347,14.0549783\r\n        11.9908553,13.5257812 12.3530584,13.0590317 L12.9549376,13.2369258\r\n        C14.0142394,13.5499011 15.1266897,12.9448839 15.4396649,11.8855821\r\n        L15.4658837,11.7877987 L15.4658837,11.7877987 L15.6383049,11.0719012\r\n        C15.918771,11.0245951 16.2066096,11 16.5,11 Z M16.5,15 C15.6993682,15\r\n        15.0503279,15.6715729 15.0503279,16.5 C15.0503279,17.3284271\r\n        15.6993682,18 16.5,18 C17.3006318,18 17.9496721,17.3284271\r\n        17.9496721,16.5 C17.9496721,15.6715729 17.3006318,15 16.5,15 Z\r\n        M12.6270133,2.50171522 C12.8656325,2.73666759 13,3.05754013\r\n        13,3.39241584 L12.9997937,11.02195 C12.4338592,11.3843065\r\n        11.9277864,11.8319595 11.4997113,12.3467732 L11.5,4.00264048\r\n        L7.56406736,8 L4.25,8 C3.83578644,8 3.5,8.33578644 3.5,8.75 L3.5,11.25\r\n        C3.5,11.6642136 3.83578644,12 4.25,12 L7.56416666,12\r\n        L10.2454931,14.724382 C10.0855804,15.2887675 10,15.8843896 10,16.5\r\n        L10.002,16.6144156 L6.93583334,13.5 L4.25,13.5 C3.00735931,13.5\r\n        2,12.4926407 2,11.25 L2,8.75 C2,7.50735931 3.00735931,6.5 4.25,6.5\r\n        L6.93593264,6.5 L10.8592994,2.51540249 C11.3436605,2.02348212\r\n        12.135093,2.01735412 12.6270133,2.50171522 Z");
    			add_location(path, file, 274, 6, 13656);
    			attr_dev(g, "id", "ic_fluent_speaker_settings_24_regular");
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 270, 4, 13541);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 262, 2, 13365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(262:33) ",
    		ctx
    	});

    	return block;
    }

    // (225:27) 
    function create_if_block_6(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12,1.75 C13.7330315,1.75 15.1492459,3.10645477 15.2448552,4.81557609\r\n        L15.25,5 L20.5,5 C20.9142136,5 21.25,5.33578644 21.25,5.75\r\n        C21.25,6.12969577 20.9678461,6.44349096 20.6017706,6.49315338 L20.5,6.5\r\n        L19.704,6.5 L18.4238627,19.5191927 C18.2911666,20.8682696\r\n        17.1984309,21.9099961 15.8626249,21.9944645 L15.6870698,22\r\n        L8.31293022,22 C6.95734302,22 5.81365352,21.0144851\r\n        5.59883106,19.6933629 L5.57613734,19.5191927 L4.295,6.5 L3.5,6.5\r\n        C3.12030423,6.5 2.80650904,6.21784612 2.75684662,5.85177056 L2.75,5.75\r\n        C2.75,5.37030423 3.03215388,5.05650904 3.39822944,5.00684662 L3.5,5\r\n        L8.75,5 C8.75,3.20507456 10.2050746,1.75 12,1.75 Z M18.197,6.5\r\n        L5.802,6.5 L7.06893346,19.3723603 C7.12767639,19.9695801\r\n        7.60033019,20.4342891 8.18584501,20.493596 L8.31293022,20.5\r\n        L15.6870698,20.5 C16.2871716,20.5 16.795916,20.0751057\r\n        16.9122531,19.4982083 L16.9310665,19.3723603 L18.197,6.5 Z M13.75,9.25\r\n        C14.1296958,9.25 14.443491,9.53215388 14.4931534,9.89822944 L14.5,10\r\n        L14.5,17 C14.5,17.4142136 14.1642136,17.75 13.75,17.75 C13.3703042,17.75\r\n        13.056509,17.4678461 13.0068466,17.1017706 L13,17 L13,10 C13,9.58578644\r\n        13.3357864,9.25 13.75,9.25 Z M10.25,9.25 C10.6296958,9.25\r\n        10.943491,9.53215388 10.9931534,9.89822944 L11,10 L11,17 C11,17.4142136\r\n        10.6642136,17.75 10.25,17.75 C9.87030423,17.75 9.55650904,17.4678461\r\n        9.50684662,17.1017706 L9.5,17 L9.5,10 C9.5,9.58578644 9.83578644,9.25\r\n        10.25,9.25 Z M12,3.25 C11.0818266,3.25 10.3288077,3.95711027\r\n        10.2558012,4.85647279 L10.25,5 L13.75,5 C13.75,4.03350169\r\n        12.9664983,3.25 12,3.25 Z");
    			add_location(path, file, 234, 6, 11570);
    			attr_dev(g, "id", "ic_fluent_delete_24_regular");
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 233, 4, 11486);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 225, 2, 11310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(225:27) ",
    		ctx
    	});

    	return block;
    }

    // (189:25) 
    function create_if_block_5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M8.75 13.5C10.2862 13.5 11.5735 14.5658 11.9126 15.9983L21.25\r\n      16C21.6642 16 22 16.3358 22 16.75C22 17.1297 21.7178 17.4435 21.3518\r\n      17.4932L21.25 17.5L11.9129 17.5007C11.5741 18.9337 10.2866 20 8.75\r\n      20C7.21345 20 5.92594 18.9337 5.58712 17.5007L2.75 17.5C2.33579 17.5 2\r\n      17.1642 2 16.75C2 16.3703 2.28215 16.0565 2.64823 16.0068L2.75 16L5.58712\r\n      15.9993C5.92594 14.5663 7.21345 13.5 8.75 13.5ZM8.75 15C7.98586 15 7.33611\r\n      15.4898 7.09753 16.1725L7.07696 16.2352L7.03847 16.3834C7.01326 16.5016 7\r\n      16.6242 7 16.75C7 16.9048 7.02011 17.055 7.05785 17.1979L7.09766\r\n      17.3279L7.12335 17.3966C7.38055 18.0431 8.01191 18.5 8.75 18.5C9.51376\r\n      18.5 10.1632 18.0107 10.4021 17.3285L10.4422 17.1978L10.4251\r\n      17.2581C10.4738 17.0973 10.5 16.9267 10.5 16.75C10.5 16.6452 10.4908\r\n      16.5425 10.4731 16.4428L10.4431 16.3057L10.4231 16.2353L10.3763\r\n      16.1024C10.1188 15.4565 9.48771 15 8.75 15ZM15.25 4C16.7866 4 18.0741\r\n      5.06632 18.4129 6.49934L21.25 6.5C21.6642 6.5 22 6.83579 22 7.25C22 7.6297\r\n      21.7178 7.94349 21.3518 7.99315L21.25 8L18.4129 8.00066C18.0741 9.43368\r\n      16.7866 10.5 15.25 10.5C13.7134 10.5 12.4259 9.43368 12.0871 8.00066L2.75\r\n      8C2.33579 8 2 7.66421 2 7.25C2 6.8703 2.28215 6.55651 2.64823 6.50685L2.75\r\n      6.5L12.0874 6.49833C12.4265 5.06582 13.7138 4 15.25 4ZM15.25 5.5C14.4859\r\n      5.5 13.8361 5.98976 13.5975 6.6725L13.577 6.73515L13.5385 6.88337C13.5133\r\n      7.0016 13.5 7.12425 13.5 7.25C13.5 7.40483 13.5201 7.55497 13.5579\r\n      7.69794L13.5977 7.82787L13.6234 7.89664C13.8805 8.54307 14.5119 9 15.25\r\n      9C16.0138 9 16.6632 8.51073 16.9021 7.82852L16.9422 7.69781L16.9251\r\n      7.75808C16.9738 7.59729 17 7.4267 17 7.25C17 7.14518 16.9908 7.0425\r\n      16.9731 6.94275L16.9431 6.80565L16.9231 6.73529L16.8763 6.60236C16.6188\r\n      5.95647 15.9877 5.5 15.25 5.5Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file, 196, 4, 9340);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 189, 2, 9201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(189:25) ",
    		ctx
    	});

    	return block;
    }

    // (145:27) 
    function create_if_block_4(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12.9195,3.31581 C13.6945,2.62669462 14.9026546,3.12925822\r\n        14.9944431,4.12782562 L15,4.24999 L15,19.7456 C15,20.7827154\r\n        13.8216531,21.351728 13.0143911,20.7567314 L12.9194,20.6797\r\n        L8.42793,16.686 C8.31809,16.58832 8.1826244,16.525648\r\n        8.038762,16.5044864 L7.92956,16.4965 L4.25,16.4965 C3.05913667,16.4965\r\n        2.08435514,15.571301 2.00519082,14.4005441 L2,14.2465 L2,9.74857\r\n        C2,8.55770667 2.92516222,7.58292514 4.09595127,7.50376082 L4.25,7.49857\r\n        L7.92961,7.49857 C8.076586,7.49857 8.219466,7.4554148\r\n        8.34103144,7.375658 L8.42794,7.30908 L12.9195,3.31581 Z M13.5,4.80677\r\n        L9.4246,8.43009 C9.05848444,8.75560111 8.59748296,8.95159519\r\n        8.1124749,8.99113077 L7.92961,8.99857 L4.25,8.99857 C3.8703075,8.99857\r\n        3.55650958,9.28072688 3.50684668,9.64680019 L3.5,9.74857 L3.5,14.2465\r\n        C3.5,14.6261833 3.78215688,14.9399889 4.14823019,14.9896531\r\n        L4.25,14.9965 L7.92956,14.9965 C8.41949778,14.9965 8.89428889,15.156342\r\n        9.28303995,15.4490564 L9.42465,15.565 L13.5,19.1888 L13.5,4.80677 Z\r\n        M20.0407,6.05361 C21.2717,7.71569 22,9.77388 22,12 C22,14.2261\r\n        21.2717,16.2843 20.0407,17.9464 C19.7941,18.2793 19.3244,18.3492\r\n        18.9916,18.1027 C18.6587,17.8562 18.5888,17.3865 18.8353,17.0536\r\n        C19.8815,15.6411 20.5,13.8938 20.5,12 C20.5,10.1062 19.8815,8.35895\r\n        18.8353,6.9464 C18.5888,6.61354 18.6587,6.14385 18.9916,5.89731\r\n        C19.3244,5.65078 19.7941,5.72075 20.0407,6.05361 Z M18.1596,8.67182\r\n        C18.6958,9.66243 19,10.7968 19,12 C19,13.2032 18.6958,14.3375\r\n        18.1596,15.3281 C17.9624,15.6924 17.5072,15.8279 17.143,15.6307\r\n        C16.7787,15.4335 16.6432,14.9783 16.8404,14.6141 C17.2609,13.8373\r\n        17.5,12.9477 17.5,12 C17.5,11.0523 17.2609,10.1627 16.8404,9.38592\r\n        C16.6432,9.02165 16.7787,8.5665 17.143,8.36931 C17.5072,8.17212\r\n        17.9624,8.30756 18.1596,8.67182 Z");
    			add_location(path, file, 157, 6, 7175);
    			attr_dev(g, "id", "ic_fluent_speaker_24_regular");
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 153, 4, 7069);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 145, 2, 6893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(145:27) ",
    		ctx
    	});

    	return block;
    }

    // (128:26) 
    function create_if_block_3(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2\r\n        12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z\r\n        M12,20.5 L12,3.5 C16.6944204,3.5 20.5,7.30557963 20.5,12\r\n        C20.5,16.6944204 16.6944204,20.5 12,20.5 Z");
    			add_location(path, file, 137, 6, 6553);
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 136, 4, 6502);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 128, 2, 6326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(128:26) ",
    		ctx
    	});

    	return block;
    }

    // (90:25) 
    function create_if_block_2(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M3.28034 2.21968C2.98745 1.92678 2.51257 1.92677 2.21968\r\n      2.21966C1.92678 2.51255 1.92677 2.98743 2.21966 3.28032L6.43782\r\n      7.49856H4.25C3.00736 7.49856 2 8.50592 2 9.74856V14.2465C2 15.4891 3.00736\r\n      16.4965 4.25 16.4965H7.92956C8.11329 16.4965 8.29063 16.5639 8.42793\r\n      16.686L12.9194 20.6797C13.7255 21.3965 15 20.8242 15\r\n      19.7456V16.0609L20.7194 21.7805C21.0123 22.0734 21.4872 22.0734 21.7801\r\n      21.7805C22.073 21.4876 22.073 21.0127 21.7801 20.7198L3.28034\r\n      2.21968ZM13.5 14.5609V19.1888L9.42465 15.565C9.01275 15.1988 8.48074\r\n      14.9965 7.92956 14.9965H4.25C3.83579 14.9965 3.5 14.6607 3.5\r\n      14.2465V9.74856C3.5 9.33435 3.83579 8.99856 4.25 8.99856H7.92961C7.93233\r\n      8.99856 7.93505 8.99856 7.93777 8.99855L13.5 14.5609Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file, 97, 4, 4556);
    			attr_dev(path1, "d", "M13.5 4.80677V10.3182L15 11.8182V4.24998C15 3.17136 13.7255 2.59913\r\n      12.9195 3.3158L9.52003 6.33813L10.5825 7.40062L13.5 4.80677Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file, 110, 4, 5387);
    			attr_dev(path2, "d", "M17.141 13.9592L18.279 15.0973C18.7408 14.1628 19 13.1107 19 12C19\r\n      10.7968 18.6958 9.66243 18.1596 8.67182C17.9624 8.30755 17.5072 8.17211\r\n      17.143 8.36931C16.7787 8.5665 16.6432 9.02165 16.8404 9.38591C17.2609\r\n      10.1627 17.5 11.0523 17.5 12C17.5 12.691 17.3729 13.3512 17.141 13.9592Z");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file, 114, 4, 5575);
    			attr_dev(path3, "d", "M19.3881 16.2064L20.4815 17.2998C21.4437 15.7631 22 13.9457 22 12C22\r\n      9.77388 21.2717 7.71568 20.0407 6.0536C19.7941 5.72075 19.3244 5.65077\r\n      18.9916 5.89731C18.6587 6.14384 18.5888 6.61353 18.8353 6.94639C19.8815\r\n      8.35894 20.5 10.1062 20.5 12C20.5 13.5311 20.0958 14.9663 19.3881 16.2064Z");
    			attr_dev(path3, "fill", "currentColor");
    			add_location(path3, file, 120, 4, 5930);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 90, 2, 4417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(90:25) ",
    		ctx
    	});

    	return block;
    }

    // (42:30) 
    function create_if_block_1(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M6.75,6 C7.12969577,6 7.44349096,6.28215388 7.49315338,6.64822944\r\n        L7.5,6.75 L7.5,19.439 L9.71966991,17.2196699 C9.98593648,16.9534034\r\n        10.4026002,16.9291973 10.6962117,17.1470518 L10.7803301,17.2196699\r\n        C11.0465966,17.4859365 11.0708027,17.9026002 10.8529482,18.1962117\r\n        L10.7803301,18.2803301 L7.28033009,21.7803301 C7.01406352,22.0465966\r\n        6.59739984,22.0708027 6.30378835,21.8529482 L6.21966991,21.7803301\r\n        L2.71966991,18.2803301 C2.4267767,17.9874369 2.4267767,17.5125631\r\n        2.71966991,17.2196699 C2.98593648,16.9534034 3.40260016,16.9291973\r\n        3.69621165,17.1470518 L3.78033009,17.2196699 L6,19.439 L6,6.75\r\n        C6,6.33578644 6.33578644,6 6.75,6 Z M17.24768,6 C17.6273757,6\r\n        17.9411709,6.28215388 17.9908334,6.64822944 L17.99768,6.75\r\n        L17.99768,19.439 L20.2173499,17.2196699 C20.4836164,16.9534034\r\n        20.9002801,16.9291973 21.1938916,17.1470518 L21.2780101,17.2196699\r\n        C21.5442766,17.4859365 21.5684827,17.9026002 21.3506282,18.1962117\r\n        L21.2780101,18.2803301 L17.7780101,21.7803301 C17.5117435,22.0465966\r\n        17.0950798,22.0708027 16.8014683,21.8529482 L16.7173499,21.7803301\r\n        L13.2173499,18.2803301 C12.9244567,17.9874369 12.9244567,17.5125631\r\n        13.2173499,17.2196699 C13.4836164,16.9534034 13.9002801,16.9291973\r\n        14.1938916,17.1470518 L14.2780101,17.2196699 L16.49768,19.439\r\n        L16.49768,6.75 C16.49768,6.33578644 16.8334664,6 17.24768,6 Z M6.75,2\r\n        C9.37335256,2 11.5,4.12664744 11.5,6.75 C11.5,8.75490368\r\n        10.2578638,10.4696909 8.50117496,11.1667783 L8.50154453,9.48810158\r\n        C9.40276063,8.91040222 10,7.89994747 10,6.75 C10,4.95507456\r\n        8.54492544,3.5 6.75,3.5 C4.95507456,3.5 3.5,4.95507456 3.5,6.75\r\n        C3.5,7.90037433 4.09768284,8.91115235 4.99945917,9.48874472\r\n        L4.99982796,11.1671761 C3.24260894,10.4703435 2,8.7552852 2,6.75\r\n        C2,4.12664744 4.12664744,2 6.75,2 Z M17.24768,2 C19.8710325,2\r\n        21.99768,4.12664744 21.99768,6.75 C21.99768,8.75490368\r\n        20.7555438,10.4696909 18.9988549,11.1667783 L18.9992245,9.48810158\r\n        C19.9004406,8.91040222 20.49768,7.89994747 20.49768,6.75\r\n        C20.49768,4.95507456 19.0426054,3.5 17.24768,3.5 C15.4527545,3.5\r\n        13.99768,4.95507456 13.99768,6.75 C13.99768,7.90037433\r\n        14.5953628,8.91115235 15.4971391,9.48874472 L15.4975079,11.1671761\r\n        C13.7402889,10.4703435 12.49768,8.7552852 12.49768,6.75\r\n        C12.49768,4.12664744 14.6243274,2 17.24768,2 Z");
    			add_location(path, file, 51, 6, 1814);
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 50, 4, 1763);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 42, 2, 1587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(42:30) ",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if icon == 'edit'}
    function create_if_block(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M21.0303301,2.96966991 C22.4277928,4.36713263 22.4277928,6.63286737\r\n        21.0303301,8.03033009 L9.06200371,19.9986565 C8.78512854,20.2755316\r\n        8.44079112,20.4753584 8.06302761,20.5783848 L2.94733805,21.9735729\r\n        C2.38746387,22.1262658 1.87373417,21.6125361 2.02642713,21.0526619\r\n        L3.4216152,15.9369724 C3.52464161,15.5592089 3.72446837,15.2148715\r\n        4.00134354,14.9379963 L15.9696699,2.96966991 C17.3671326,1.5722072\r\n        19.6328674,1.5722072 21.0303301,2.96966991 Z M15.0001717,6.06057288\r\n        L5.06200371,15.9986565 C4.96971199,16.0909482 4.90310306,16.2057273\r\n        4.86876093,16.3316485 L3.81891446,20.1810855 L7.6683515,19.1312391\r\n        C7.79427267,19.0968969 7.90905181,19.030288 8.00134354,18.9379963\r\n        L17.9391717,8.99957288 L15.0001717,6.06057288 Z M17.0303301,4.03033009\r\n        L16.0601717,4.99957288 L18.9991717,7.93957288 L19.9696699,6.96966991\r\n        C20.7813462,6.15799363 20.7813462,4.84200637 19.9696699,4.03033009\r\n        C19.1579936,3.21865381 17.8420064,3.21865381 17.0303301,4.03033009 Z");
    			attr_dev(path, "id", "🎨-Color");
    			add_location(path, file, 23, 6, 421);
    			attr_dev(g, "fill", "currentColor");
    			attr_dev(g, "fill-rule", "nonzero");
    			add_location(g, file, 22, 4, 370);
    			attr_dev(svg, "style", /*style*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "24px");
    			attr_dev(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-s362ey");
    			add_location(svg, file, 14, 2, 194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2) {
    				attr_dev(svg, "style", /*style*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(14:0) {#if icon == 'edit'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[0] == "edit") return create_if_block;
    		if (/*icon*/ ctx[0] == "chordMode") return create_if_block_1;
    		if (/*icon*/ ctx[0] == "mute") return create_if_block_2;
    		if (/*icon*/ ctx[0] == "theme") return create_if_block_3;
    		if (/*icon*/ ctx[0] == "volume") return create_if_block_4;
    		if (/*icon*/ ctx[0] == "adsr") return create_if_block_5;
    		if (/*icon*/ ctx[0] == "delete") return create_if_block_6;
    		if (/*icon*/ ctx[0] == "audioOptions") return create_if_block_7;
    		if (/*icon*/ ctx[0] == "reorder") return create_if_block_8;
    		if (/*icon*/ ctx[0] == "add") return create_if_block_9;
    		if (/*icon*/ ctx[0] == "add2") return create_if_block_10;
    		if (/*icon*/ ctx[0] == "octaveAdjust") return create_if_block_11;
    		if (/*icon*/ ctx[0] == "stopAll2") return create_if_block_12;
    		if (/*icon*/ ctx[0] == "backup") return create_if_block_13;
    		if (/*icon*/ ctx[0] == "restore") return create_if_block_14;
    		if (/*icon*/ ctx[0] == "add3") return create_if_block_15;
    		if (/*icon*/ ctx[0] == "save") return create_if_block_16;
    		if (/*icon*/ ctx[0] == "open") return create_if_block_17;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
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

    function instance($$self, $$props, $$invalidate) {
    	let { icon } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["icon", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Icon", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ icon, style });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon, style];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { icon: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<Icon> was created without expected prop 'icon'");
    		}
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Button.svelte generated by Svelte v3.24.1 */
    const file$1 = "src\\components\\Button.svelte";

    // (49:2) {:else}
    function create_else_block(ctx) {
    	let icon_1;
    	let t0;
    	let span;
    	let t1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				style: /*iconStyle*/ ctx[11],
    				icon: /*icon*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*label*/ ctx[7]);
    			attr_dev(span, "class", "label svelte-h8tftr");
    			add_location(span, file$1, 50, 4, 1294);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconStyle*/ 2048) icon_1_changes.style = /*iconStyle*/ ctx[11];
    			if (dirty & /*icon*/ 64) icon_1_changes.icon = /*icon*/ ctx[6];
    			icon_1.$set(icon_1_changes);
    			if (!current || dirty & /*label*/ 128) set_data_dev(t1, /*label*/ ctx[7]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(49:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:42) 
    function create_if_block_3$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*label*/ ctx[7]);
    			attr_dev(span, "class", "label svelte-h8tftr");
    			add_location(span, file$1, 47, 4, 1204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 128) set_data_dev(t, /*label*/ ctx[7]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(47:42) ",
    		ctx
    	});

    	return block;
    }

    // (45:42) 
    function create_if_block_2$1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				style: /*iconStyle*/ ctx[11],
    				icon: /*icon*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconStyle*/ 2048) icon_1_changes.style = /*iconStyle*/ ctx[11];
    			if (dirty & /*icon*/ 64) icon_1_changes.icon = /*icon*/ ctx[6];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(45:42) ",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if icon == null && label == null}
    function create_if_block_1$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(43:2) {#if icon == null && label == null}",
    		ctx
    	});

    	return block;
    }

    // (54:2) {#if isHovering}
    function create_if_block$1(ctx) {
    	let span;
    	let t;
    	let span_intro;
    	let span_outro;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*tooltip*/ ctx[12]);
    			attr_dev(span, "class", "inline-tooltip svelte-h8tftr");
    			add_location(span, file$1, 54, 4, 1365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*tooltip*/ 4096) set_data_dev(t, /*tooltip*/ ctx[12]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (span_outro) span_outro.end(1);
    				if (!span_intro) span_intro = create_in_transition(span, fly, { duration: 300, x: -20, opacity: 0 });
    				span_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (span_intro) span_intro.invalidate();
    			span_outro = create_out_transition(span, fly, { duration: 200, x: -20, opacity: 0 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_outro) span_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(54:2) {#if isHovering}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let button_data_tooltip_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_if_block_3$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[6] == null && /*label*/ ctx[7] == null) return 0;
    		if (/*label*/ ctx[7] == null && /*icon*/ ctx[6] != null) return 1;
    		if (/*label*/ ctx[7] != null && /*icon*/ ctx[6] == null) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*isHovering*/ ctx[14] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(button, "data-tooltip", button_data_tooltip_value = /*tooltip*/ ctx[12] ?? /*label*/ ctx[7] ?? "");
    			attr_dev(button, "style", /*style*/ ctx[1]);
    			button.disabled = /*disabled*/ ctx[10];
    			attr_dev(button, "class", "svelte-h8tftr");
    			toggle_class(button, "tooltip", !/*inlineTooltip*/ ctx[13] && /*tooltip*/ ctx[12] != null);
    			toggle_class(button, "inline", /*inline*/ ctx[9]);
    			toggle_class(button, "spaced", /*spaced*/ ctx[0]);
    			toggle_class(button, "square", /*square*/ ctx[8]);
    			toggle_class(button, "outline", /*outline*/ ctx[2]);
    			toggle_class(button, "toggled", /*toggled*/ ctx[3]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			toggle_class(button, "rectangular", /*rectangular*/ ctx[5]);
    			add_location(button, file$1, 22, 0, 566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_blocks[current_block_type_index].m(button, null);
    			append_dev(button, t);
    			if (if_block1) if_block1.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button,
    						"mouseover",
    						function () {
    							if (is_function(/*tooltip*/ ctx[12] != null && /*inlineTooltip*/ ctx[13]
    							? /*mouseover_handler*/ ctx[18]
    							: null)) (/*tooltip*/ ctx[12] != null && /*inlineTooltip*/ ctx[13]
    							? /*mouseover_handler*/ ctx[18]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button,
    						"mouseout",
    						function () {
    							if (is_function(/*tooltip*/ ctx[12] != null && /*inlineTooltip*/ ctx[13]
    							? /*mouseout_handler*/ ctx[19]
    							: null)) (/*tooltip*/ ctx[12] != null && /*inlineTooltip*/ ctx[13]
    							? /*mouseout_handler*/ ctx[19]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button, "click", /*click_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(button, t);
    			}

    			if (/*isHovering*/ ctx[14]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isHovering*/ 16384) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*tooltip, label*/ 4224 && button_data_tooltip_value !== (button_data_tooltip_value = /*tooltip*/ ctx[12] ?? /*label*/ ctx[7] ?? "")) {
    				attr_dev(button, "data-tooltip", button_data_tooltip_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(button, "style", /*style*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 1024) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[10]);
    			}

    			if (dirty & /*inlineTooltip, tooltip*/ 12288) {
    				toggle_class(button, "tooltip", !/*inlineTooltip*/ ctx[13] && /*tooltip*/ ctx[12] != null);
    			}

    			if (dirty & /*inline*/ 512) {
    				toggle_class(button, "inline", /*inline*/ ctx[9]);
    			}

    			if (dirty & /*spaced*/ 1) {
    				toggle_class(button, "spaced", /*spaced*/ ctx[0]);
    			}

    			if (dirty & /*square*/ 256) {
    				toggle_class(button, "square", /*square*/ ctx[8]);
    			}

    			if (dirty & /*outline*/ 4) {
    				toggle_class(button, "outline", /*outline*/ ctx[2]);
    			}

    			if (dirty & /*toggled*/ 8) {
    				toggle_class(button, "toggled", /*toggled*/ ctx[3]);
    			}

    			if (dirty & /*active*/ 16) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}

    			if (dirty & /*rectangular*/ 32) {
    				toggle_class(button, "rectangular", /*rectangular*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	let { spaced = false } = $$props;
    	let { style = null } = $$props;
    	let { outline = false } = $$props;
    	let { toggled = false } = $$props;
    	let { active = false } = $$props;
    	let { rectangular = false } = $$props;
    	let { icon = null } = $$props;
    	let { label = null } = $$props;
    	let { square = false } = $$props;
    	let { inline = false } = $$props;
    	let { disabled = false } = $$props;
    	let { iconStyle = null } = $$props;
    	let { tooltip = null } = $$props;
    	let { inlineTooltip = false } = $$props;
    	let isHovering = false;

    	const writable_props = [
    		"spaced",
    		"style",
    		"outline",
    		"toggled",
    		"active",
    		"rectangular",
    		"icon",
    		"label",
    		"square",
    		"inline",
    		"disabled",
    		"iconStyle",
    		"tooltip",
    		"inlineTooltip"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	const mouseover_handler = () => $$invalidate(14, isHovering = true);
    	const mouseout_handler = () => $$invalidate(14, isHovering = false);

    	$$self.$$set = $$props => {
    		if ("spaced" in $$props) $$invalidate(0, spaced = $$props.spaced);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(2, outline = $$props.outline);
    		if ("toggled" in $$props) $$invalidate(3, toggled = $$props.toggled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("rectangular" in $$props) $$invalidate(5, rectangular = $$props.rectangular);
    		if ("icon" in $$props) $$invalidate(6, icon = $$props.icon);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("square" in $$props) $$invalidate(8, square = $$props.square);
    		if ("inline" in $$props) $$invalidate(9, inline = $$props.inline);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("iconStyle" in $$props) $$invalidate(11, iconStyle = $$props.iconStyle);
    		if ("tooltip" in $$props) $$invalidate(12, tooltip = $$props.tooltip);
    		if ("inlineTooltip" in $$props) $$invalidate(13, inlineTooltip = $$props.inlineTooltip);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		fly,
    		spaced,
    		style,
    		outline,
    		toggled,
    		active,
    		rectangular,
    		icon,
    		label,
    		square,
    		inline,
    		disabled,
    		iconStyle,
    		tooltip,
    		inlineTooltip,
    		isHovering
    	});

    	$$self.$inject_state = $$props => {
    		if ("spaced" in $$props) $$invalidate(0, spaced = $$props.spaced);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(2, outline = $$props.outline);
    		if ("toggled" in $$props) $$invalidate(3, toggled = $$props.toggled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("rectangular" in $$props) $$invalidate(5, rectangular = $$props.rectangular);
    		if ("icon" in $$props) $$invalidate(6, icon = $$props.icon);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("square" in $$props) $$invalidate(8, square = $$props.square);
    		if ("inline" in $$props) $$invalidate(9, inline = $$props.inline);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("iconStyle" in $$props) $$invalidate(11, iconStyle = $$props.iconStyle);
    		if ("tooltip" in $$props) $$invalidate(12, tooltip = $$props.tooltip);
    		if ("inlineTooltip" in $$props) $$invalidate(13, inlineTooltip = $$props.inlineTooltip);
    		if ("isHovering" in $$props) $$invalidate(14, isHovering = $$props.isHovering);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		spaced,
    		style,
    		outline,
    		toggled,
    		active,
    		rectangular,
    		icon,
    		label,
    		square,
    		inline,
    		disabled,
    		iconStyle,
    		tooltip,
    		inlineTooltip,
    		isHovering,
    		$$scope,
    		$$slots,
    		click_handler,
    		mouseover_handler,
    		mouseout_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			spaced: 0,
    			style: 1,
    			outline: 2,
    			toggled: 3,
    			active: 4,
    			rectangular: 5,
    			icon: 6,
    			label: 7,
    			square: 8,
    			inline: 9,
    			disabled: 10,
    			iconStyle: 11,
    			tooltip: 12,
    			inlineTooltip: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
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

    	get toggled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rectangular() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rectangular(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get square() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set square(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconStyle() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconStyle(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltip() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inlineTooltip() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inlineTooltip(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
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
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var assign$1 = make_assign();
    var create = make_create();
    var trim = make_trim();
    var Global = (typeof window !== 'undefined' ? window : commonjsGlobal);

    var util = {
    	assign: assign$1,
    	create: create,
    	trim: trim,
    	bind: bind$1,
    	slice: slice,
    	each: each,
    	map: map,
    	pluck: pluck,
    	isList: isList,
    	isFunction: isFunction,
    	isObject: isObject,
    	Global: Global
    };

    function make_assign() {
    	if (Object.assign) {
    		return Object.assign
    	} else {
    		return function shimAssign(obj, props1, props2, etc) {
    			for (var i = 1; i < arguments.length; i++) {
    				each(Object(arguments[i]), function(val, key) {
    					obj[key] = val;
    				});
    			}			
    			return obj
    		}
    	}
    }

    function make_create() {
    	if (Object.create) {
    		return function create(obj, assignProps1, assignProps2, etc) {
    			var assignArgsList = slice(arguments, 1);
    			return assign$1.apply(this, [Object.create(obj)].concat(assignArgsList))
    		}
    	} else {
    		function F() {} // eslint-disable-line no-inner-declarations
    		return function create(obj, assignProps1, assignProps2, etc) {
    			var assignArgsList = slice(arguments, 1);
    			F.prototype = obj;
    			return assign$1.apply(this, [new F()].concat(assignArgsList))
    		}
    	}
    }

    function make_trim() {
    	if (String.prototype.trim) {
    		return function trim(str) {
    			return String.prototype.trim.call(str)
    		}
    	} else {
    		return function trim(str) {
    			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    		}
    	}
    }

    function bind$1(obj, fn) {
    	return function() {
    		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
    	}
    }

    function slice(arr, index) {
    	return Array.prototype.slice.call(arr, index || 0)
    }

    function each(obj, fn) {
    	pluck(obj, function(val, key) {
    		fn(val, key);
    		return false
    	});
    }

    function map(obj, fn) {
    	var res = (isList(obj) ? [] : {});
    	pluck(obj, function(v, k) {
    		res[k] = fn(v, k);
    		return false
    	});
    	return res
    }

    function pluck(obj, fn) {
    	if (isList(obj)) {
    		for (var i=0; i<obj.length; i++) {
    			if (fn(obj[i], i)) {
    				return obj[i]
    			}
    		}
    	} else {
    		for (var key in obj) {
    			if (obj.hasOwnProperty(key)) {
    				if (fn(obj[key], key)) {
    					return obj[key]
    				}
    			}
    		}
    	}
    }

    function isList(val) {
    	return (val != null && typeof val != 'function' && typeof val.length == 'number')
    }

    function isFunction(val) {
    	return val && {}.toString.call(val) === '[object Function]'
    }

    function isObject(val) {
    	return val && {}.toString.call(val) === '[object Object]'
    }

    var slice$1 = util.slice;
    var pluck$1 = util.pluck;
    var each$1 = util.each;
    var bind$2 = util.bind;
    var create$1 = util.create;
    var isList$1 = util.isList;
    var isFunction$1 = util.isFunction;
    var isObject$1 = util.isObject;

    var storeEngine = {
    	createStore: createStore
    };

    var storeAPI = {
    	version: '2.0.12',
    	enabled: false,
    	
    	// get returns the value of the given key. If that value
    	// is undefined, it returns optionalDefaultValue instead.
    	get: function(key, optionalDefaultValue) {
    		var data = this.storage.read(this._namespacePrefix + key);
    		return this._deserialize(data, optionalDefaultValue)
    	},

    	// set will store the given value at key and returns value.
    	// Calling set with value === undefined is equivalent to calling remove.
    	set: function(key, value) {
    		if (value === undefined) {
    			return this.remove(key)
    		}
    		this.storage.write(this._namespacePrefix + key, this._serialize(value));
    		return value
    	},

    	// remove deletes the key and value stored at the given key.
    	remove: function(key) {
    		this.storage.remove(this._namespacePrefix + key);
    	},

    	// each will call the given callback once for each key-value pair
    	// in this store.
    	each: function(callback) {
    		var self = this;
    		this.storage.each(function(val, namespacedKey) {
    			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''));
    		});
    	},

    	// clearAll will remove all the stored key-value pairs in this store.
    	clearAll: function() {
    		this.storage.clearAll();
    	},

    	// additional functionality that can't live in plugins
    	// ---------------------------------------------------

    	// hasNamespace returns true if this store instance has the given namespace.
    	hasNamespace: function(namespace) {
    		return (this._namespacePrefix == '__storejs_'+namespace+'_')
    	},

    	// createStore creates a store.js instance with the first
    	// functioning storage in the list of storage candidates,
    	// and applies the the given mixins to the instance.
    	createStore: function() {
    		return createStore.apply(this, arguments)
    	},
    	
    	addPlugin: function(plugin) {
    		this._addPlugin(plugin);
    	},
    	
    	namespace: function(namespace) {
    		return createStore(this.storage, this.plugins, namespace)
    	}
    };

    function _warn() {
    	var _console = (typeof console == 'undefined' ? null : console);
    	if (!_console) { return }
    	var fn = (_console.warn ? _console.warn : _console.log);
    	fn.apply(_console, arguments);
    }

    function createStore(storages, plugins, namespace) {
    	if (!namespace) {
    		namespace = '';
    	}
    	if (storages && !isList$1(storages)) {
    		storages = [storages];
    	}
    	if (plugins && !isList$1(plugins)) {
    		plugins = [plugins];
    	}

    	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '');
    	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null);
    	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/; // alpha-numeric + underscore and dash
    	if (!legalNamespaces.test(namespace)) {
    		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
    	}
    	
    	var _privateStoreProps = {
    		_namespacePrefix: namespacePrefix,
    		_namespaceRegexp: namespaceRegexp,

    		_testStorage: function(storage) {
    			try {
    				var testStr = '__storejs__test__';
    				storage.write(testStr, testStr);
    				var ok = (storage.read(testStr) === testStr);
    				storage.remove(testStr);
    				return ok
    			} catch(e) {
    				return false
    			}
    		},

    		_assignPluginFnProp: function(pluginFnProp, propName) {
    			var oldFn = this[propName];
    			this[propName] = function pluginFn() {
    				var args = slice$1(arguments, 0);
    				var self = this;

    				// super_fn calls the old function which was overwritten by
    				// this mixin.
    				function super_fn() {
    					if (!oldFn) { return }
    					each$1(arguments, function(arg, i) {
    						args[i] = arg;
    					});
    					return oldFn.apply(self, args)
    				}

    				// Give mixing function access to super_fn by prefixing all mixin function
    				// arguments with super_fn.
    				var newFnArgs = [super_fn].concat(args);

    				return pluginFnProp.apply(self, newFnArgs)
    			};
    		},

    		_serialize: function(obj) {
    			return JSON.stringify(obj)
    		},

    		_deserialize: function(strVal, defaultVal) {
    			if (!strVal) { return defaultVal }
    			// It is possible that a raw string value has been previously stored
    			// in a storage without using store.js, meaning it will be a raw
    			// string value instead of a JSON serialized string. By defaulting
    			// to the raw string value in case of a JSON parse error, we allow
    			// for past stored values to be forwards-compatible with store.js
    			var val = '';
    			try { val = JSON.parse(strVal); }
    			catch(e) { val = strVal; }

    			return (val !== undefined ? val : defaultVal)
    		},
    		
    		_addStorage: function(storage) {
    			if (this.enabled) { return }
    			if (this._testStorage(storage)) {
    				this.storage = storage;
    				this.enabled = true;
    			}
    		},

    		_addPlugin: function(plugin) {
    			var self = this;

    			// If the plugin is an array, then add all plugins in the array.
    			// This allows for a plugin to depend on other plugins.
    			if (isList$1(plugin)) {
    				each$1(plugin, function(plugin) {
    					self._addPlugin(plugin);
    				});
    				return
    			}

    			// Keep track of all plugins we've seen so far, so that we
    			// don't add any of them twice.
    			var seenPlugin = pluck$1(this.plugins, function(seenPlugin) {
    				return (plugin === seenPlugin)
    			});
    			if (seenPlugin) {
    				return
    			}
    			this.plugins.push(plugin);

    			// Check that the plugin is properly formed
    			if (!isFunction$1(plugin)) {
    				throw new Error('Plugins must be function values that return objects')
    			}

    			var pluginProperties = plugin.call(this);
    			if (!isObject$1(pluginProperties)) {
    				throw new Error('Plugins must return an object of function properties')
    			}

    			// Add the plugin function properties to this store instance.
    			each$1(pluginProperties, function(pluginFnProp, propName) {
    				if (!isFunction$1(pluginFnProp)) {
    					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
    				}
    				self._assignPluginFnProp(pluginFnProp, propName);
    			});
    		},
    		
    		// Put deprecated properties in the private API, so as to not expose it to accidential
    		// discovery through inspection of the store object.
    		
    		// Deprecated: addStorage
    		addStorage: function(storage) {
    			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])');
    			this._addStorage(storage);
    		}
    	};

    	var store = create$1(_privateStoreProps, storeAPI, {
    		plugins: []
    	});
    	store.raw = {};
    	each$1(store, function(prop, propName) {
    		if (isFunction$1(prop)) {
    			store.raw[propName] = bind$2(store, prop);			
    		}
    	});
    	each$1(storages, function(storage) {
    		store._addStorage(storage);
    	});
    	each$1(plugins, function(plugin) {
    		store._addPlugin(plugin);
    	});
    	return store
    }

    var Global$1 = util.Global;

    var localStorage_1 = {
    	name: 'localStorage',
    	read: read,
    	write: write,
    	each: each$2,
    	remove: remove,
    	clearAll: clearAll,
    };

    function localStorage() {
    	return Global$1.localStorage
    }

    function read(key) {
    	return localStorage().getItem(key)
    }

    function write(key, data) {
    	return localStorage().setItem(key, data)
    }

    function each$2(fn) {
    	for (var i = localStorage().length - 1; i >= 0; i--) {
    		var key = localStorage().key(i);
    		fn(read(key), key);
    	}
    }

    function remove(key) {
    	return localStorage().removeItem(key)
    }

    function clearAll() {
    	return localStorage().clear()
    }

    // oldFF-globalStorage provides storage for Firefox
    // versions 6 and 7, where no localStorage, etc
    // is available.


    var Global$2 = util.Global;

    var oldFFGlobalStorage = {
    	name: 'oldFF-globalStorage',
    	read: read$1,
    	write: write$1,
    	each: each$3,
    	remove: remove$1,
    	clearAll: clearAll$1,
    };

    var globalStorage = Global$2.globalStorage;

    function read$1(key) {
    	return globalStorage[key]
    }

    function write$1(key, data) {
    	globalStorage[key] = data;
    }

    function each$3(fn) {
    	for (var i = globalStorage.length - 1; i >= 0; i--) {
    		var key = globalStorage.key(i);
    		fn(globalStorage[key], key);
    	}
    }

    function remove$1(key) {
    	return globalStorage.removeItem(key)
    }

    function clearAll$1() {
    	each$3(function(key, _) {
    		delete globalStorage[key];
    	});
    }

    // oldIE-userDataStorage provides storage for Internet Explorer
    // versions 6 and 7, where no localStorage, sessionStorage, etc
    // is available.


    var Global$3 = util.Global;

    var oldIEUserDataStorage = {
    	name: 'oldIE-userDataStorage',
    	write: write$2,
    	read: read$2,
    	each: each$4,
    	remove: remove$2,
    	clearAll: clearAll$2,
    };

    var storageName = 'storejs';
    var doc = Global$3.document;
    var _withStorageEl = _makeIEStorageElFunction();
    var disable = (Global$3.navigator ? Global$3.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./); // MSIE 9.x, MSIE 10.x

    function write$2(unfixedKey, data) {
    	if (disable) { return }
    	var fixedKey = fixKey(unfixedKey);
    	_withStorageEl(function(storageEl) {
    		storageEl.setAttribute(fixedKey, data);
    		storageEl.save(storageName);
    	});
    }

    function read$2(unfixedKey) {
    	if (disable) { return }
    	var fixedKey = fixKey(unfixedKey);
    	var res = null;
    	_withStorageEl(function(storageEl) {
    		res = storageEl.getAttribute(fixedKey);
    	});
    	return res
    }

    function each$4(callback) {
    	_withStorageEl(function(storageEl) {
    		var attributes = storageEl.XMLDocument.documentElement.attributes;
    		for (var i=attributes.length-1; i>=0; i--) {
    			var attr = attributes[i];
    			callback(storageEl.getAttribute(attr.name), attr.name);
    		}
    	});
    }

    function remove$2(unfixedKey) {
    	var fixedKey = fixKey(unfixedKey);
    	_withStorageEl(function(storageEl) {
    		storageEl.removeAttribute(fixedKey);
    		storageEl.save(storageName);
    	});
    }

    function clearAll$2() {
    	_withStorageEl(function(storageEl) {
    		var attributes = storageEl.XMLDocument.documentElement.attributes;
    		storageEl.load(storageName);
    		for (var i=attributes.length-1; i>=0; i--) {
    			storageEl.removeAttribute(attributes[i].name);
    		}
    		storageEl.save(storageName);
    	});
    }

    // Helpers
    //////////

    // In IE7, keys cannot start with a digit or contain certain chars.
    // See https://github.com/marcuswestin/store.js/issues/40
    // See https://github.com/marcuswestin/store.js/issues/83
    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
    function fixKey(key) {
    	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
    }

    function _makeIEStorageElFunction() {
    	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
    		return null
    	}
    	var scriptTag = 'script',
    		storageOwner,
    		storageContainer,
    		storageEl;

    	// Since #userData storage applies only to specific paths, we need to
    	// somehow link our data to a specific path.  We choose /favicon.ico
    	// as a pretty safe option, since all browsers already make a request to
    	// this URL anyway and being a 404 will not hurt us here.  We wrap an
    	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
    	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
    	// since the iframe access rules appear to allow direct access and
    	// manipulation of the document element, even for a 404 page.  This
    	// document can be used instead of the current document (which would
    	// have been limited to the current path) to perform #userData storage.
    	try {
    		/* global ActiveXObject */
    		storageContainer = new ActiveXObject('htmlfile');
    		storageContainer.open();
    		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
    		storageContainer.close();
    		storageOwner = storageContainer.w.frames[0].document;
    		storageEl = storageOwner.createElement('div');
    	} catch(e) {
    		// somehow ActiveXObject instantiation failed (perhaps some special
    		// security settings or otherwse), fall back to per-path storage
    		storageEl = doc.createElement('div');
    		storageOwner = doc.body;
    	}

    	return function(storeFunction) {
    		var args = [].slice.call(arguments, 0);
    		args.unshift(storageEl);
    		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
    		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
    		storageOwner.appendChild(storageEl);
    		storageEl.addBehavior('#default#userData');
    		storageEl.load(storageName);
    		storeFunction.apply(this, args);
    		storageOwner.removeChild(storageEl);
    		return
    	}
    }

    // cookieStorage is useful Safari private browser mode, where localStorage
    // doesn't work but cookies do. This implementation is adopted from
    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage


    var Global$4 = util.Global;
    var trim$1 = util.trim;

    var cookieStorage = {
    	name: 'cookieStorage',
    	read: read$3,
    	write: write$3,
    	each: each$5,
    	remove: remove$3,
    	clearAll: clearAll$3,
    };

    var doc$1 = Global$4.document;

    function read$3(key) {
    	if (!key || !_has(key)) { return null }
    	var regexpStr = "(?:^|.*;\\s*)" +
    		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
    		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";
    	return unescape(doc$1.cookie.replace(new RegExp(regexpStr), "$1"))
    }

    function each$5(callback) {
    	var cookies = doc$1.cookie.split(/; ?/g);
    	for (var i = cookies.length - 1; i >= 0; i--) {
    		if (!trim$1(cookies[i])) {
    			continue
    		}
    		var kvp = cookies[i].split('=');
    		var key = unescape(kvp[0]);
    		var val = unescape(kvp[1]);
    		callback(val, key);
    	}
    }

    function write$3(key, data) {
    	if(!key) { return }
    	doc$1.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
    }

    function remove$3(key) {
    	if (!key || !_has(key)) {
    		return
    	}
    	doc$1.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

    function clearAll$3() {
    	each$5(function(_, key) {
    		remove$3(key);
    	});
    }

    function _has(key) {
    	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc$1.cookie)
    }

    var Global$5 = util.Global;

    var sessionStorage_1 = {
    	name: 'sessionStorage',
    	read: read$4,
    	write: write$4,
    	each: each$6,
    	remove: remove$4,
    	clearAll: clearAll$4
    };

    function sessionStorage() {
    	return Global$5.sessionStorage
    }

    function read$4(key) {
    	return sessionStorage().getItem(key)
    }

    function write$4(key, data) {
    	return sessionStorage().setItem(key, data)
    }

    function each$6(fn) {
    	for (var i = sessionStorage().length - 1; i >= 0; i--) {
    		var key = sessionStorage().key(i);
    		fn(read$4(key), key);
    	}
    }

    function remove$4(key) {
    	return sessionStorage().removeItem(key)
    }

    function clearAll$4() {
    	return sessionStorage().clear()
    }

    // memoryStorage is a useful last fallback to ensure that the store
    // is functions (meaning store.get(), store.set(), etc will all function).
    // However, stored values will not persist when the browser navigates to
    // a new page or reloads the current page.

    var memoryStorage_1 = {
    	name: 'memoryStorage',
    	read: read$5,
    	write: write$5,
    	each: each$7,
    	remove: remove$5,
    	clearAll: clearAll$5,
    };

    var memoryStorage = {};

    function read$5(key) {
    	return memoryStorage[key]
    }

    function write$5(key, data) {
    	memoryStorage[key] = data;
    }

    function each$7(callback) {
    	for (var key in memoryStorage) {
    		if (memoryStorage.hasOwnProperty(key)) {
    			callback(memoryStorage[key], key);
    		}
    	}
    }

    function remove$5(key) {
    	delete memoryStorage[key];
    }

    function clearAll$5(key) {
    	memoryStorage = {};
    }

    var all = [
    	// Listed in order of usage preference
    	localStorage_1,
    	oldFFGlobalStorage,
    	oldIEUserDataStorage,
    	cookieStorage,
    	sessionStorage_1,
    	memoryStorage_1
    ];

    /* eslint-disable */

    //  json2.js
    //  2016-10-28
    //  Public Domain.
    //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    //  See http://www.JSON.org/js.html
    //  This code should be minified before deployment.
    //  See http://javascript.crockford.com/jsmin.html

    //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    //  NOT CONTROL.

    //  This file creates a global JSON object containing two methods: stringify
    //  and parse. This file provides the ES5 JSON capability to ES3 systems.
    //  If a project might run on IE8 or earlier, then this file should be included.
    //  This file does nothing on ES5 systems.

    //      JSON.stringify(value, replacer, space)
    //          value       any JavaScript value, usually an object or array.
    //          replacer    an optional parameter that determines how object
    //                      values are stringified for objects. It can be a
    //                      function or an array of strings.
    //          space       an optional parameter that specifies the indentation
    //                      of nested structures. If it is omitted, the text will
    //                      be packed without extra whitespace. If it is a number,
    //                      it will specify the number of spaces to indent at each
    //                      level. If it is a string (such as "\t" or "&nbsp;"),
    //                      it contains the characters used to indent at each level.
    //          This method produces a JSON text from a JavaScript value.
    //          When an object value is found, if the object contains a toJSON
    //          method, its toJSON method will be called and the result will be
    //          stringified. A toJSON method does not serialize: it returns the
    //          value represented by the name/value pair that should be serialized,
    //          or undefined if nothing should be serialized. The toJSON method
    //          will be passed the key associated with the value, and this will be
    //          bound to the value.

    //          For example, this would serialize Dates as ISO strings.

    //              Date.prototype.toJSON = function (key) {
    //                  function f(n) {
    //                      // Format integers to have at least two digits.
    //                      return (n < 10)
    //                          ? "0" + n
    //                          : n;
    //                  }
    //                  return this.getUTCFullYear()   + "-" +
    //                       f(this.getUTCMonth() + 1) + "-" +
    //                       f(this.getUTCDate())      + "T" +
    //                       f(this.getUTCHours())     + ":" +
    //                       f(this.getUTCMinutes())   + ":" +
    //                       f(this.getUTCSeconds())   + "Z";
    //              };

    //          You can provide an optional replacer method. It will be passed the
    //          key and value of each member, with this bound to the containing
    //          object. The value that is returned from your method will be
    //          serialized. If your method returns undefined, then the member will
    //          be excluded from the serialization.

    //          If the replacer parameter is an array of strings, then it will be
    //          used to select the members to be serialized. It filters the results
    //          such that only members with keys listed in the replacer array are
    //          stringified.

    //          Values that do not have JSON representations, such as undefined or
    //          functions, will not be serialized. Such values in objects will be
    //          dropped; in arrays they will be replaced with null. You can use
    //          a replacer function to replace those with JSON values.

    //          JSON.stringify(undefined) returns undefined.

    //          The optional space parameter produces a stringification of the
    //          value that is filled with line breaks and indentation to make it
    //          easier to read.

    //          If the space parameter is a non-empty string, then that string will
    //          be used for indentation. If the space parameter is a number, then
    //          the indentation will be that many spaces.

    //          Example:

    //          text = JSON.stringify(["e", {pluribus: "unum"}]);
    //          // text is '["e",{"pluribus":"unum"}]'

    //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
    //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

    //          text = JSON.stringify([new Date()], function (key, value) {
    //              return this[key] instanceof Date
    //                  ? "Date(" + this[key] + ")"
    //                  : value;
    //          });
    //          // text is '["Date(---current time---)"]'

    //      JSON.parse(text, reviver)
    //          This method parses a JSON text to produce an object or array.
    //          It can throw a SyntaxError exception.

    //          The optional reviver parameter is a function that can filter and
    //          transform the results. It receives each of the keys and values,
    //          and its return value is used instead of the original value.
    //          If it returns what it received, then the structure is not modified.
    //          If it returns undefined then the member is deleted.

    //          Example:

    //          // Parse the text. Values that look like ISO date strings will
    //          // be converted to Date objects.

    //          myData = JSON.parse(text, function (key, value) {
    //              var a;
    //              if (typeof value === "string") {
    //                  a =
    //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    //                  if (a) {
    //                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
    //                          +a[5], +a[6]));
    //                  }
    //              }
    //              return value;
    //          });

    //          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
    //              var d;
    //              if (typeof value === "string" &&
    //                      value.slice(0, 5) === "Date(" &&
    //                      value.slice(-1) === ")") {
    //                  d = new Date(value.slice(5, -1));
    //                  if (d) {
    //                      return d;
    //                  }
    //              }
    //              return value;
    //          });

    //  This is a reference implementation. You are free to copy, modify, or
    //  redistribute.

    /*jslint
        eval, for, this
    */

    /*property
        JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
        getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
        lastIndex, length, parse, prototype, push, replace, slice, stringify,
        test, toJSON, toString, valueOf
    */


    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

    if (typeof JSON !== "object") {
        JSON = {};
    }

    (function () {

        var rx_one = /^[\],:{}\s]*$/;
        var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
        var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10
                ? "0" + n
                : n;
        }

        function this_value() {
            return this.valueOf();
        }

        if (typeof Date.prototype.toJSON !== "function") {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + "-" +
                            f(this.getUTCMonth() + 1) + "-" +
                            f(this.getUTCDate()) + "T" +
                            f(this.getUTCHours()) + ":" +
                            f(this.getUTCMinutes()) + ":" +
                            f(this.getUTCSeconds()) + "Z"
                    : null;
            };

            Boolean.prototype.toJSON = this_value;
            Number.prototype.toJSON = this_value;
            String.prototype.toJSON = this_value;
        }

        var gap;
        var indent;
        var meta;
        var rep;


        function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

            rx_escapable.lastIndex = 0;
            return rx_escapable.test(string)
                ? "\"" + string.replace(rx_escapable, function (a) {
                    var c = meta[a];
                    return typeof c === "string"
                        ? c
                        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                }) + "\""
                : "\"" + string + "\"";
        }


        function str(key, holder) {

    // Produce a string from holder[key].

            var i;          // The loop counter.
            var k;          // The member key.
            var v;          // The member value.
            var length;
            var mind = gap;
            var partial;
            var value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === "object" &&
                    typeof value.toJSON === "function") {
                value = value.toJSON(key);
            }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

            if (typeof rep === "function") {
                value = rep.call(holder, key, value);
            }

    // What happens next depends on the value's type.

            switch (typeof value) {
            case "string":
                return quote(value);

            case "number":

    // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value)
                    ? String(value)
                    : "null";

            case "boolean":
            case "null":

    // If the value is a boolean or null, convert it to a string. Note:
    // typeof null does not produce "null". The case is included here in
    // the remote chance that this gets fixed someday.

                return String(value);

    // If the type is "object", we might be dealing with an object or an array or
    // null.

            case "object":

    // Due to a specification blunder in ECMAScript, typeof null is "object",
    // so watch out for that case.

                if (!value) {
                    return "null";
                }

    // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

    // Is the value an array?

                if (Object.prototype.toString.apply(value) === "[object Array]") {

    // The value is an array. Stringify every element. Use null as a placeholder
    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

    // Join all of the elements together, separated with commas, and wrap them in
    // brackets.

                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

    // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                } else {

    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                }

    // Join all of the member texts together, separated with commas,
    // and wrap them in braces.

                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
            }
        }

    // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== "function") {
            meta = {    // table of character substitutions
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                "\"": "\\\"",
                "\\": "\\\\"
            };
            JSON.stringify = function (value, replacer, space) {

    // The stringify method takes a value and an optional replacer, and an optional
    // space parameter, and returns a JSON text. The replacer can be a function
    // that can replace values, or an array of strings that will select the keys.
    // A default replacer method can be provided. Use of the space parameter can
    // produce text that is more easily readable.

                var i;
                gap = "";
                indent = "";

    // If the space parameter is a number, make an indent string containing that
    // many spaces.

                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " ";
                    }

    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === "string") {
                    indent = space;
                }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== "function" &&
                        (typeof replacer !== "object" ||
                        typeof replacer.length !== "number")) {
                    throw new Error("JSON.stringify");
                }

    // Make a fake root object containing our value under the key of "".
    // Return the result of stringifying the value.

                return str("", {"": value});
            };
        }


    // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== "function") {
            JSON.parse = function (text, reviver) {

    // The parse method takes a text and an optional reviver function, and returns
    // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

    // The walk method is used to recursively walk the resulting structure so
    // that modifications can be made.

                    var k;
                    var v;
                    var value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                rx_dangerous.lastIndex = 0;
                if (rx_dangerous.test(text)) {
                    text = text.replace(rx_dangerous, function (a) {
                        return "\\u" +
                                ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with "()" and "new"
    // because they can cause invocation, and "=" because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
    // replace all simple value tokens with "]" characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or "]" or
    // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

                if (
                    rx_one.test(
                        text
                            .replace(rx_two, "@")
                            .replace(rx_three, "]")
                            .replace(rx_four, "")
                    )
                ) {

    // In the third stage we use the eval function to compile the text into a
    // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

                    j = eval("(" + text + ")");

    // In the optional fourth stage, we recursively walk the new structure, passing
    // each name/value pair to a reviver function for possible transformation.

                    return (typeof reviver === "function")
                        ? walk({"": j}, "")
                        : j;
                }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError("JSON.parse");
            };
        }
    }());

    var json2 = json2Plugin;

    function json2Plugin() {
    	
    	return {}
    }

    var plugins = [json2];

    var store_legacy = storeEngine.createStore(all, plugins);

    var lodash_clonedeep = createCommonjsModule(function (module, exports) {
    /**
     * lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] =
    cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
    cloneableTags[boolTag] = cloneableTags[dateTag] =
    cloneableTags[float32Tag] = cloneableTags[float64Tag] =
    cloneableTags[int8Tag] = cloneableTags[int16Tag] =
    cloneableTags[int32Tag] = cloneableTags[mapTag] =
    cloneableTags[numberTag] = cloneableTags[objectTag] =
    cloneableTags[regexpTag] = cloneableTags[setTag] =
    cloneableTags[stringTag] = cloneableTags[symbolTag] =
    cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
    cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] =
    cloneableTags[weakMapTag] = false;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /**
     * Adds the key-value `pair` to `map`.
     *
     * @private
     * @param {Object} map The map to modify.
     * @param {Array} pair The key-value pair to add.
     * @returns {Object} Returns `map`.
     */
    function addMapEntry(map, pair) {
      // Don't return `map.set` because it's not chainable in IE 11.
      map.set(pair[0], pair[1]);
      return map;
    }

    /**
     * Adds `value` to `set`.
     *
     * @private
     * @param {Object} set The set to modify.
     * @param {*} value The value to add.
     * @returns {Object} Returns `set`.
     */
    function addSetEntry(set, value) {
      // Don't return `set.add` because it's not chainable in IE 11.
      set.add(value);
      return set;
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initAccum] Specify using the first element of `array` as
     *  the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
          length = array ? array.length : 0;

      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeKeys = overArg(Object.keys, Object);

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView'),
        Map = getNative(root, 'Map'),
        Promise = getNative(root, 'Promise'),
        Set = getNative(root, 'Set'),
        WeakMap = getNative(root, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      return this.__data__['delete'](key);
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache) {
        var pairs = cache.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          return this;
        }
        cache = this.__data__ = new MapCache(pairs);
      }
      cache.set(key, value);
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      // Safari 9 makes `arguments.length` enumerable in strict mode.
      var result = (isArray(value) || isArguments(value))
        ? baseTimes(value.length, String)
        : [];

      var length = result.length,
          skipIndexes = !!length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        object[key] = value;
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {boolean} [isFull] Specify a clone including symbols.
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
      var result;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value),
            isFunc = tag == funcTag || tag == genTag;

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          if (isHostObject(value)) {
            return object ? value : {};
          }
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, baseClone, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (!isArr) {
        var props = isFull ? getAllKeys(value) : keys(value);
      }
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
      });
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(proto) {
      return isObject(proto) ? objectCreate(proto) : {};
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * The base implementation of `getTag`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      return objectToString.call(value);
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var result = new buffer.constructor(buffer.length);
      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /**
     * Creates a clone of `map`.
     *
     * @private
     * @param {Object} map The map to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned map.
     */
    function cloneMap(map, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
      return arrayReduce(array, addMapEntry, new map.constructor);
    }

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /**
     * Creates a clone of `set`.
     *
     * @private
     * @param {Object} set The set to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned set.
     */
    function cloneSet(set, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
      return arrayReduce(array, addSetEntry, new set.constructor);
    }

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        assignValue(object, key, newValue === undefined ? source[key] : newValue);
      }
      return object;
    }

    /**
     * Copies own symbol properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * Creates an array of the own enumerable symbol properties of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11,
    // for data views in Edge < 14, and promises in Node.js.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = objectToString.call(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, cloneFunc, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case dataViewTag:
          return cloneDataView(object, isDeep);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          return cloneTypedArray(object, isDeep);

        case mapTag:
          return cloneMap(object, isDeep, cloneFunc);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          return cloneRegExp(object);

        case setTag:
          return cloneSet(object, isDeep, cloneFunc);

        case symbolTag:
          return cloneSymbol(object);
      }
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return baseClone(value, true, true);
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
        (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8-9 which returns 'object' for typed array and other constructors.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = cloneDeep;
    });

    const createWritableStore = (key, startValue) => {
        const { subscribe, set, update } = writable(startValue);

        return {
            subscribe,
            set,
            useLocalStorage: () => {
                const json = store_legacy.get(key);

                if (key === 'instruments' && json) {
                    let updateable = [...json];

                    for (let instrSet of updateable) {
                        if (instrSet.instruments.length < 1) continue;
                        for (let instr of instrSet.instruments) {

                            let instrumentData = Soundfont.instrument(ac, instr.name, {
                                soundfont: instr.soundfont
                            });

                            instr.data = instrumentData;

                        }
                    }

                    set(updateable);
                }

                // const json = localStorage.getItem(key);
                if (json) {
                    set(json);
                }

                subscribe(current => {
                    store_legacy.set(key, lodash_clonedeep(current));
                    // localStorage.setItem(key, JSON.stringify(current));
                });
            }
        };
    };

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
        65: ["55"],
        83: ["57"],
        68: ["59"],
        70: ["60"],
        71: ["62"],
        72: ["64"],
        74: ["65"],
        75: ["67"],
        76: ["69"],
        186: ["71"],
        222: ["72"],
        220: ["74"],
        13: ["76"],
        81: ["54"],
        87: ["56"],
        69: ["58"],
        84: ["61"],
        90: ["63"],
        73: ["66"],
        79: ["68"],
        80: ["70"],
        221: ["73"],
        8: ["75"],
        20: ["53"]
    };

    const chordNotes = createWritableStore('chordNotes', {
        65: "Gm",
        83: "Am",
        68: "Hm",
        70: "C",
        71: "D",
        72: "E",
        74: "F",
        75: "G",
        76: "A",
        186: "H",
        222: "Cm",
        220: "Dm",
        13: "Em",
        81: "F#m<br>Gbm",
        87: "G#m<br>Abm",
        69: "Bm",
        84: "C#<br>Db",
        90: "D#<br>Eb",
        73: "F#<br>Gb",
        79: "G#<br>Ab",
        80: "B",
        221: "C#m<br>Dbm",
        8: "D#m<br>Ebm",
        20: "Fm"
    });

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

    const currentSoundFont = createWritableStore('currentSoundFont', soundFont.fatboy);
    const activeSet = createWritableStore('activeSet', 0);
    const volume = createWritableStore('volume', 25);
    const octaveShift = createWritableStore('octaveShift', 0);
    const showAdsr = createWritableStore('showAdsr', false);
    const editMode = createWritableStore('editMode', false);
    const chordMode = createWritableStore('chordMode', false);
    const theme = createWritableStore('theme', 0);
    const isReordering = createWritableStore('isReordering', false);
    const isFocused = writable(false);

    const instrumentSets = createWritableStore('instruments',
        [
            {
                name: 'Set 1',
                instruments: []
            }
        ]
    );

    const defaultChords = {
        65: "Gm",
        83: "Am",
        68: "Hm",
        70: "C",
        71: "D",
        72: "E",
        74: "F",
        75: "G",
        76: "A",
        186: "H",
        222: "Cm",
        220: "Dm",
        13: "Em",
        81: "F#m<br>Gbm",
        87: "G#m<br>Abm",
        69: "Bm",
        84: "C#<br>Db",
        90: "D#<br>Eb",
        73: "F#<br>Gb",
        79: "G#<br>Ab",
        80: "B",
        221: "C#m<br>Dbm",
        8: "D#m<br>Ebm",
        20: "Fm"
    };

    const chords = {
        "C": ["70", "72", "75"],
        "C#<br>Db": ["84", "74", "79"],
        "D": ["71", "73", "76"],
        "D#<br>Eb": ["90", "75", "80"],
        "E": ["72", "79", "186"],
        "F": ["70", "74", "76"],
        "F#<br>Gb": ["84", "73", "80"],
        "G": ["71", "75", "186"],
        "G#<br>Ab": ["70", "90", "79"],
        "A": ["84", "72", "76"],
        "B": ["71", "74", "80"],
        "H": ["90", "73", "186"],
        "Cm": ["70", "90", "75"],
        "C#m<br>Dbm": ["84", "72", "79"],
        "Dm": ["71", "74", "76"],
        "D#m<br>Ebm": ["90", "73", "80"],
        "Em": ["72", "75", "186"],
        "Fm": ["70", "74", "79"],
        "F#m<br>Gbm": ["84", "73", "76"],
        "Gm": ["71", "75", "80"],
        "G#m<br>Abm": ["90", "79", "186"],
        "Am": ["70", "72", "76"],
        "Hm": ["71", "73", "186"],
        "Bm": ["84", "74", "80"],
        "C7": ["70", "72", "75", "80"],
        "C#7<br>Db7": ["84", "74", "79", "186"],
        "D7": ["70", "71", "73", "76"],
        "D#7<br>Eb7": ["84", "90", "75", "80"],
        "E7": ["71", "72", "79", "186"],
        "F7": ["70", "90", "74", "76"],
        "F#7<br>Gb7": ["84", "72", "73", "80"],
        "G7": ["71", "74", "75", "186"],
        "G#7<br>Ab7": ["70", "90", "73", "79"],
        "A7": ["84", "72", "75", "76"],
        "B7": ["71", "74", "79", "80"],
        "H7": ["90", "73", "76", "186"],
        "Cdim": ["70", "90", "73", "76"],
        "C#dim<br>Dbdim": ["84", "72", "75", "80"],
        "Ddim": ["71", "74", "79", "186"],
        "D#dim<br>Ebdim": ["70", "90", "73", "75"],
        "Edim": ["84", "72", "75", "80"],
        "Fdim": ["71", "74", "79", "186"],
        "F#dim<br>Gbdim": ["70", "90", "73", "76"],
        "Gdim": ["84", "72", "75", "80"],
        "G#dim<br>Abdim": ["71", "74", "79", "186"],
        "Adim": ["70", "90", "73", "76"],
        "Bdim": ["84", "72", "75", "80"],
        "Hdim": ["71", "74", "79", "186"],
        "Cm7": ["70", "90", "75", "80"],
        "C#m7<br>Dbm7": ["84", "72", "79", "186"],
        "Dm7": ["70", "71", "74", "76"],
        "D#m7<br>Ebm7": ["84", "90", "73", "80"],
        "Em7": ["71", "72", "75", "186"],
        "Fm7": ["70", "90", "74", "79"],
        "F#m7<br>Gbm7": ["84", "72", "73", "76"],
        "Gm7": ["71", "74", "75", "80"],
        "G#m7<br>Abm7": ["90", "73", "79", "186"],
        "Am7": ["70", "72", "75", "76"],
        "Bm7": ["84", "74", "79", "80"],
        "Hm7": ["71", "73", "76", "186"],
        "Cm6": ["70", "90", "75", "76"],
        "C#m6<br>Dbm6": ["84", "72", "79", "80"],
        "Dm6": ["71", "74", "76", "186"],
        "D#m6<br>Ebm6": ["70", "90", "73", "80"],
        "Em6": ["84", "72", "75", "186"],
        "Fm6": ["70", "71", "74", "79"],
        "F#m6<br>Gbm6": ["84", "90", "73", "76"],
        "Gm6": ["71", "72", "75", "80"],
        "G#m6<br>Abm6": ["90", "74", "79", "186"],
        "Am6": ["70", "72", "73", "76"],
        "Bm6": ["84", "74", "75", "80"],
        "Hm6": ["71", "73", "79", "186"],
        "Cm9": ["70", "71", "90", "75"],
        "C#m9<br>Dbm9": ["84", "90", "72", "79"],
        "Dm9": ["71", "72", "74", "76"],
        "D#m9<br>Ebm9": ["90", "74", "73", "80"],
        "Em9": ["72", "73", "75", "186"],
        "Fm9": ["70", "74", "75", "79"],
        "F#m9<br>Gbm9": ["84", "73", "79", "76"],
        "Gm9": ["71", "75", "76", "80"],
        "G#m9<br>Abm9": ["90", "79", "80", "186"],
        "Am9": ["70", "72", "76", "186"],
        "Bm9": ["70", "84", "74", "80"],
        "Hm9": ["84", "71", "73", "186"],
        "C6": ["70", "72", "75", "76"],
        "C#6<br>Db6": ["84", "74", "79", "80"],
        "D6": ["71", "73", "76", "186"],
        "D#6<br>Eb6": ["70", "90", "75", "80"],
        "E6": ["84", "72", "79", "186"],
        "F6": ["70", "71", "74", "76"],
        "F#6<br>Gb6": ["84", "90", "73", "80"],
        "G6": ["71", "72", "75", "186"],
        "G#6<br>Ab6": ["70", "90", "74", "79"],
        "A6": ["84", "72", "73", "76"],
        "B6": ["71", "74", "75", "80"],
        "H6": ["90", "73", "79", "186"],
        "C9": ["70", "71", "72", "75"],
        "C#9<br>Db9": ["84", "90", "74", "79"],
        "D9": ["71", "72", "73", "76"],
        "D#9<br>Eb9": ["90", "74", "75", "80"],
        "E9": ["72", "73", "79", "186"],
        "F9": ["70", "74", "75", "76"],
        "F#9<br>Gb9": ["84", "73", "79", "80"],
        "G9": ["71", "75", "76", "186"],
        "G#9<br>Ab9": ["70", "90", "79", "80"],
        "A9": ["84", "72", "76", "186"],
        "B9": ["70", "71", "74", "80"],
        "H9": ["84", "90", "73", "186"],
        "Csus4": ["70", "74", "75"],
        "C#sus4<br>Dbsus4": ["84", "73", "79"],
        "Dsus4": ["71", "75", "76"],
        "D#sus4<br>Ebsus4": ["90", "79", "80"],
        "Esus4": ["72", "76", "186"],
        "Fsus4": ["70", "74", "80"],
        "F#sus4<br>Gbsus4": ["84", "73", "186"],
        "Gsus4": ["70", "71", "75"],
        "G#sus4<br>Absus4": ["84", "90", "79"],
        "Asus4": ["71", "72", "76"],
        "Bsus4": ["90", "74", "80"],
        "Hsus4": ["72", "73", "186"],
    };

    /* src\components\KeyboardKey.svelte generated by Svelte v3.24.1 */

    const file$2 = "src\\components\\KeyboardKey.svelte";

    // (73:2) {#if label}
    function create_if_block$2(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(span, "class", "label svelte-1twqo6l");
    			add_location(span, file$2, 73, 4, 1416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(73:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t;
    	let span;
    	let raw_value = /*convertToInter*/ ctx[2](/*key*/ ctx[1]) + "";
    	let if_block = /*label*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			span = element("span");
    			attr_dev(span, "class", "inter-key svelte-1twqo6l");
    			add_location(span, file$2, 75, 2, 1463);
    			attr_dev(div, "class", "container svelte-1twqo6l");
    			add_location(div, file$2, 71, 0, 1372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, span);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*key*/ 2 && raw_value !== (raw_value = /*convertToInter*/ ctx[2](/*key*/ ctx[1]) + "")) span.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { label = null } = $$props;
    	let { key } = $$props;
    	let { square = false } = $$props;

    	function convertToInter(key) {
    		switch (key) {
    			case 0:
    				return square ? "" : "⓪";
    			case 1:
    				return square ? "" : "①";
    			case 2:
    				return square ? "" : "②";
    			case 3:
    				return square ? "" : "③";
    			case 4:
    				return square ? "" : "④";
    			case 5:
    				return square ? "" : "⑤";
    			case 6:
    				return square ? "" : "⑥";
    			case 7:
    				return square ? "" : "⑦";
    			case 8:
    				return square ? "" : "⑧";
    			case 9:
    				return square ? "" : "⑨";
    			default:
    				return key;
    		}
    	}

    	const writable_props = ["label", "key", "square"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyboardKey> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyboardKey", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("square" in $$props) $$invalidate(3, square = $$props.square);
    	};

    	$$self.$capture_state = () => ({ label, key, square, convertToInter });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("square" in $$props) $$invalidate(3, square = $$props.square);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, key, convertToInter, square];
    }

    class KeyboardKey extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { label: 0, key: 1, square: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyboardKey",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
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

    /* src\components\SlideControl.svelte generated by Svelte v3.24.1 */
    const file$3 = "src\\components\\SlideControl.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (119:28) 
    function create_if_block_2$2(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*title*/ ctx[1]);
    			attr_dev(span, "class", "title svelte-1ec8ihr");
    			add_location(span, file$3, 119, 6, 2494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(119:28) ",
    		ctx
    	});

    	return block;
    }

    // (117:4) {#if icon != null}
    function create_if_block_1$2(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: { icon: /*icon*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 64) icon_1_changes.icon = /*icon*/ ctx[6];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(117:4) {#if icon != null}",
    		ctx
    	});

    	return block;
    }

    // (127:2) {#if keyboardKeys && hovering}
    function create_if_block$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*keyboardKeys*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "hints svelte-1ec8ihr");
    			add_location(div, file$3, 127, 4, 2713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*keyboardKeys*/ 32) {
    				each_value = /*keyboardKeys*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(127:2) {#if keyboardKeys && hovering}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each keyboardKeys as kbKey}
    function create_each_block(ctx) {
    	let keyboardkey;
    	let current;
    	const keyboardkey_spread_levels = [/*kbKey*/ ctx[13]];
    	let keyboardkey_props = {};

    	for (let i = 0; i < keyboardkey_spread_levels.length; i += 1) {
    		keyboardkey_props = assign(keyboardkey_props, keyboardkey_spread_levels[i]);
    	}

    	keyboardkey = new KeyboardKey({ props: keyboardkey_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(keyboardkey.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keyboardkey, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const keyboardkey_changes = (dirty & /*keyboardKeys*/ 32)
    			? get_spread_update(keyboardkey_spread_levels, [get_spread_object(/*kbKey*/ ctx[13])])
    			: {};

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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(129:6) {#each keyboardKeys as kbKey}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let label;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let input;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$2, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[6] != null) return 0;
    		if (/*title*/ ctx[1] != null) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*keyboardKeys*/ ctx[5] && /*hovering*/ ctx[9] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span = element("span");
    			t2 = text(/*formattedValue*/ ctx[8]);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", /*min*/ ctx[2]);
    			attr_dev(input, "max", /*max*/ ctx[3]);
    			attr_dev(input, "step", /*step*/ ctx[4]);
    			attr_dev(input, "class", "svelte-1ec8ihr");
    			add_location(input, file$3, 122, 4, 2547);
    			attr_dev(span, "class", "value svelte-1ec8ihr");
    			add_location(span, file$3, 123, 4, 2615);
    			attr_dev(label, "class", "svelte-1ec8ihr");
    			add_location(label, file$3, 114, 2, 2400);
    			attr_dev(div, "class", "slide-ctrl svelte-1ec8ihr");
    			toggle_class(div, "long-value", /*formattedValue*/ ctx[8].length > 3);
    			toggle_class(div, "darker", /*darker*/ ctx[7]);
    			add_location(div, file$3, 112, 0, 2312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(label, null);
    			}

    			append_dev(label, t0);
    			append_dev(label, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(label, t1);
    			append_dev(label, span);
    			append_dev(span, t2);
    			append_dev(div, t3);
    			if (if_block1) if_block1.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[12]),
    					listen_dev(input, "change", /*change_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(label, t0);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (!current || dirty & /*min*/ 4) {
    				attr_dev(input, "min", /*min*/ ctx[2]);
    			}

    			if (!current || dirty & /*max*/ 8) {
    				attr_dev(input, "max", /*max*/ ctx[3]);
    			}

    			if (!current || dirty & /*step*/ 16) {
    				attr_dev(input, "step", /*step*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (!current || dirty & /*formattedValue*/ 256) set_data_dev(t2, /*formattedValue*/ ctx[8]);

    			if (/*keyboardKeys*/ ctx[5] && /*hovering*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*keyboardKeys*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*formattedValue*/ 256) {
    				toggle_class(div, "long-value", /*formattedValue*/ ctx[8].length > 3);
    			}

    			if (dirty & /*darker*/ 128) {
    				toggle_class(div, "darker", /*darker*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { title = null } = $$props;
    	let { min } = $$props;
    	let { max } = $$props;
    	let { step } = $$props;
    	let { value } = $$props;
    	let { keyboardKeys = null } = $$props;
    	let { customValueDisplay = null } = $$props;
    	let { icon = null } = $$props;
    	let { darker = false } = $$props;
    	let hovering = false;

    	const writable_props = [
    		"title",
    		"min",
    		"max",
    		"step",
    		"value",
    		"keyboardKeys",
    		"customValueDisplay",
    		"icon",
    		"darker"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideControl> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SlideControl", $$slots, []);

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("min" in $$props) $$invalidate(2, min = $$props.min);
    		if ("max" in $$props) $$invalidate(3, max = $$props.max);
    		if ("step" in $$props) $$invalidate(4, step = $$props.step);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("keyboardKeys" in $$props) $$invalidate(5, keyboardKeys = $$props.keyboardKeys);
    		if ("customValueDisplay" in $$props) $$invalidate(10, customValueDisplay = $$props.customValueDisplay);
    		if ("icon" in $$props) $$invalidate(6, icon = $$props.icon);
    		if ("darker" in $$props) $$invalidate(7, darker = $$props.darker);
    	};

    	$$self.$capture_state = () => ({
    		KeyboardKey,
    		Icon,
    		title,
    		min,
    		max,
    		step,
    		value,
    		keyboardKeys,
    		customValueDisplay,
    		icon,
    		darker,
    		hovering,
    		formattedValue
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("min" in $$props) $$invalidate(2, min = $$props.min);
    		if ("max" in $$props) $$invalidate(3, max = $$props.max);
    		if ("step" in $$props) $$invalidate(4, step = $$props.step);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("keyboardKeys" in $$props) $$invalidate(5, keyboardKeys = $$props.keyboardKeys);
    		if ("customValueDisplay" in $$props) $$invalidate(10, customValueDisplay = $$props.customValueDisplay);
    		if ("icon" in $$props) $$invalidate(6, icon = $$props.icon);
    		if ("darker" in $$props) $$invalidate(7, darker = $$props.darker);
    		if ("hovering" in $$props) $$invalidate(9, hovering = $$props.hovering);
    		if ("formattedValue" in $$props) $$invalidate(8, formattedValue = $$props.formattedValue);
    	};

    	let formattedValue;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*customValueDisplay, value*/ 1025) {
    			 $$invalidate(8, formattedValue = customValueDisplay != null && customValueDisplay[value] != null
    			? customValueDisplay[value]
    			: value);
    		}
    	};

    	return [
    		value,
    		title,
    		min,
    		max,
    		step,
    		keyboardKeys,
    		icon,
    		darker,
    		formattedValue,
    		hovering,
    		customValueDisplay,
    		change_handler,
    		input_change_input_handler
    	];
    }

    class SlideControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			title: 1,
    			min: 2,
    			max: 3,
    			step: 4,
    			value: 0,
    			keyboardKeys: 5,
    			customValueDisplay: 10,
    			icon: 6,
    			darker: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideControl",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*min*/ ctx[2] === undefined && !("min" in props)) {
    			console.warn("<SlideControl> was created without expected prop 'min'");
    		}

    		if (/*max*/ ctx[3] === undefined && !("max" in props)) {
    			console.warn("<SlideControl> was created without expected prop 'max'");
    		}

    		if (/*step*/ ctx[4] === undefined && !("step" in props)) {
    			console.warn("<SlideControl> was created without expected prop 'step'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
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

    	get icon() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get darker() {
    		throw new Error("<SlideControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set darker(value) {
    		throw new Error("<SlideControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Controls.svelte generated by Svelte v3.24.1 */
    const file$4 = "src\\components\\Controls.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let slidecontrol0;
    	let updating_value;
    	let t0;
    	let div0;
    	let t1;
    	let slidecontrol1;
    	let updating_value_1;
    	let div1_transition;
    	let current;
    	const slidecontrol0_spread_levels = [/*volumeControl*/ ctx[3]];

    	function slidecontrol0_value_binding(value) {
    		/*slidecontrol0_value_binding*/ ctx[5].call(null, value);
    	}

    	let slidecontrol0_props = {};

    	for (let i = 0; i < slidecontrol0_spread_levels.length; i += 1) {
    		slidecontrol0_props = assign(slidecontrol0_props, slidecontrol0_spread_levels[i]);
    	}

    	if (/*$volume*/ ctx[1] !== void 0) {
    		slidecontrol0_props.value = /*$volume*/ ctx[1];
    	}

    	slidecontrol0 = new SlideControl({
    			props: slidecontrol0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol0, "value", slidecontrol0_value_binding));
    	const slidecontrol1_spread_levels = [/*octaveControl*/ ctx[4]];

    	function slidecontrol1_value_binding(value) {
    		/*slidecontrol1_value_binding*/ ctx[6].call(null, value);
    	}

    	let slidecontrol1_props = {};

    	for (let i = 0; i < slidecontrol1_spread_levels.length; i += 1) {
    		slidecontrol1_props = assign(slidecontrol1_props, slidecontrol1_spread_levels[i]);
    	}

    	if (/*$octaveShift*/ ctx[2] !== void 0) {
    		slidecontrol1_props.value = /*$octaveShift*/ ctx[2];
    	}

    	slidecontrol1 = new SlideControl({
    			props: slidecontrol1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol1, "value", slidecontrol1_value_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(slidecontrol0.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			create_component(slidecontrol1.$$.fragment);
    			attr_dev(div0, "class", "spacer svelte-dl6dnt");
    			add_location(div0, file$4, 59, 2, 1247);
    			attr_dev(div1, "class", "flex svelte-dl6dnt");
    			toggle_class(div1, "transparent", /*$editMode*/ ctx[0]);
    			add_location(div1, file$4, 57, 0, 1119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(slidecontrol0, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			mount_component(slidecontrol1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidecontrol0_changes = (dirty & /*volumeControl*/ 8)
    			? get_spread_update(slidecontrol0_spread_levels, [get_spread_object(/*volumeControl*/ ctx[3])])
    			: {};

    			if (!updating_value && dirty & /*$volume*/ 2) {
    				updating_value = true;
    				slidecontrol0_changes.value = /*$volume*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidecontrol0.$set(slidecontrol0_changes);

    			const slidecontrol1_changes = (dirty & /*octaveControl*/ 16)
    			? get_spread_update(slidecontrol1_spread_levels, [get_spread_object(/*octaveControl*/ ctx[4])])
    			: {};

    			if (!updating_value_1 && dirty & /*$octaveShift*/ 4) {
    				updating_value_1 = true;
    				slidecontrol1_changes.value = /*$octaveShift*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slidecontrol1.$set(slidecontrol1_changes);

    			if (dirty & /*$editMode*/ 1) {
    				toggle_class(div1, "transparent", /*$editMode*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidecontrol0.$$.fragment, local);
    			transition_in(slidecontrol1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidecontrol0.$$.fragment, local);
    			transition_out(slidecontrol1.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidecontrol0);
    			destroy_component(slidecontrol1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $editMode;
    	let $volume;
    	let $octaveShift;
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(0, $editMode = $$value));
    	validate_store(volume, "volume");
    	component_subscribe($$self, volume, $$value => $$invalidate(1, $volume = $$value));
    	validate_store(octaveShift, "octaveShift");
    	component_subscribe($$self, octaveShift, $$value => $$invalidate(2, $octaveShift = $$value));

    	let volumeControl = {
    		title: "Volume",
    		icon: "volume",
    		min: 0,
    		max: 100,
    		step: 1,
    		keyboardKeys: [
    			{ label: "-1", key: "←" },
    			{ label: "+1", key: "→" },
    			{ label: "+10", key: "↑" },
    			{ label: "-10", key: "↓" }
    		]
    	};

    	let octaveControl = {
    		title: "Octave shift",
    		icon: "octaveAdjust",
    		min: -3,
    		max: 3,
    		step: 0.5,
    		keyboardKeys: [
    			{ label: "Up", key: "⇧", square: false },
    			{
    				label: "Dn",
    				key: "<small>Ctrl</small>",
    				square: false
    			}
    		],
    		customValueDisplay: {
    			"0": "—",
    			"1": "+1",
    			"2": "+2",
    			"3": "+3"
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Controls> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Controls", $$slots, []);

    	function slidecontrol0_value_binding(value) {
    		$volume = value;
    		volume.set($volume);
    	}

    	function slidecontrol1_value_binding(value) {
    		$octaveShift = value;
    		octaveShift.set($octaveShift);
    	}

    	$$self.$capture_state = () => ({
    		volume,
    		octaveShift,
    		editMode,
    		fade,
    		SlideControl,
    		volumeControl,
    		octaveControl,
    		$editMode,
    		$volume,
    		$octaveShift
    	});

    	$$self.$inject_state = $$props => {
    		if ("volumeControl" in $$props) $$invalidate(3, volumeControl = $$props.volumeControl);
    		if ("octaveControl" in $$props) $$invalidate(4, octaveControl = $$props.octaveControl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$editMode,
    		$volume,
    		$octaveShift,
    		volumeControl,
    		octaveControl,
    		slidecontrol0_value_binding,
    		slidecontrol1_value_binding
    	];
    }

    class Controls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Controls",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\PianoGrid.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\components\\PianoGrid.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_14(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_15(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_16(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_17(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_18(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_19(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_20(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_21(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_22(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_23(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    // (173:27) 
    function create_if_block_47(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][20] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 173, 8, 3863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][20] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_47.name,
    		type: "if",
    		source: "(173:27) ",
    		ctx
    	});

    	return block;
    }

    // (166:6) {#if $editMode}
    function create_if_block_46(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_23 = Object.keys(chords);
    	validate_each_argument(each_value_23);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_23.length; i += 1) {
    		each_blocks[i] = create_each_block_23(get_each_context_23(ctx, each_value_23, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 167, 10, 3641);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][20] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$5, 166, 8, 3576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][20]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_23 = Object.keys(chords);
    				validate_each_argument(each_value_23);
    				let i;

    				for (i = 0; i < each_value_23.length; i += 1) {
    					const child_ctx = get_each_context_23(ctx, each_value_23, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_23(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_23.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][20]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_46.name,
    		type: "if",
    		source: "(166:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (169:10) {#each Object.keys(chords) as item}
    function create_each_block_23(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 169, 12, 3729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_23.name,
    		type: "each",
    		source: "(169:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (188:27) 
    function create_if_block_45(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][65] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 188, 8, 4374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][65] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_45.name,
    		type: "if",
    		source: "(188:27) ",
    		ctx
    	});

    	return block;
    }

    // (181:6) {#if $editMode}
    function create_if_block_44(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_22 = Object.keys(chords);
    	validate_each_argument(each_value_22);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_22.length; i += 1) {
    		each_blocks[i] = create_each_block_22(get_each_context_22(ctx, each_value_22, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 182, 10, 4152);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][65] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[5].call(select));
    			add_location(select, file$5, 181, 8, 4087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][65]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_22 = Object.keys(chords);
    				validate_each_argument(each_value_22);
    				let i;

    				for (i = 0; i < each_value_22.length; i += 1) {
    					const child_ctx = get_each_context_22(ctx, each_value_22, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_22(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_22.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][65]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_44.name,
    		type: "if",
    		source: "(181:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (184:10) {#each Object.keys(chords) as item}
    function create_each_block_22(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 184, 12, 4240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_22.name,
    		type: "each",
    		source: "(184:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (203:27) 
    function create_if_block_43(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][83] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 203, 8, 4885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][83] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_43.name,
    		type: "if",
    		source: "(203:27) ",
    		ctx
    	});

    	return block;
    }

    // (196:6) {#if $editMode}
    function create_if_block_42(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_21 = Object.keys(chords);
    	validate_each_argument(each_value_21);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_21.length; i += 1) {
    		each_blocks[i] = create_each_block_21(get_each_context_21(ctx, each_value_21, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 197, 10, 4663);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][83] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[6].call(select));
    			add_location(select, file$5, 196, 8, 4598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][83]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_2*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_21 = Object.keys(chords);
    				validate_each_argument(each_value_21);
    				let i;

    				for (i = 0; i < each_value_21.length; i += 1) {
    					const child_ctx = get_each_context_21(ctx, each_value_21, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_21(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_21.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][83]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_42.name,
    		type: "if",
    		source: "(196:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (199:10) {#each Object.keys(chords) as item}
    function create_each_block_21(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 199, 12, 4751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_21.name,
    		type: "each",
    		source: "(199:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (218:27) 
    function create_if_block_41(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][68] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 218, 8, 5396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][68] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_41.name,
    		type: "if",
    		source: "(218:27) ",
    		ctx
    	});

    	return block;
    }

    // (211:6) {#if $editMode}
    function create_if_block_40(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_20 = Object.keys(chords);
    	validate_each_argument(each_value_20);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_20.length; i += 1) {
    		each_blocks[i] = create_each_block_20(get_each_context_20(ctx, each_value_20, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 212, 10, 5174);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][68] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[7].call(select));
    			add_location(select, file$5, 211, 8, 5109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][68]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_3*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_20 = Object.keys(chords);
    				validate_each_argument(each_value_20);
    				let i;

    				for (i = 0; i < each_value_20.length; i += 1) {
    					const child_ctx = get_each_context_20(ctx, each_value_20, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_20(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_20.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][68]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_40.name,
    		type: "if",
    		source: "(211:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (214:10) {#each Object.keys(chords) as item}
    function create_each_block_20(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 214, 12, 5262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_20.name,
    		type: "each",
    		source: "(214:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (233:27) 
    function create_if_block_39(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][70] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 233, 8, 5907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][70] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_39.name,
    		type: "if",
    		source: "(233:27) ",
    		ctx
    	});

    	return block;
    }

    // (226:6) {#if $editMode}
    function create_if_block_38(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_19 = Object.keys(chords);
    	validate_each_argument(each_value_19);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_19.length; i += 1) {
    		each_blocks[i] = create_each_block_19(get_each_context_19(ctx, each_value_19, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 227, 10, 5685);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][70] === void 0) add_render_callback(() => /*select_change_handler_4*/ ctx[8].call(select));
    			add_location(select, file$5, 226, 8, 5620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][70]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_4*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_19 = Object.keys(chords);
    				validate_each_argument(each_value_19);
    				let i;

    				for (i = 0; i < each_value_19.length; i += 1) {
    					const child_ctx = get_each_context_19(ctx, each_value_19, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_19(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_19.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][70]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_38.name,
    		type: "if",
    		source: "(226:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (229:10) {#each Object.keys(chords) as item}
    function create_each_block_19(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 229, 12, 5773);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_19.name,
    		type: "each",
    		source: "(229:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (248:27) 
    function create_if_block_37(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][71] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 248, 8, 6418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][71] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_37.name,
    		type: "if",
    		source: "(248:27) ",
    		ctx
    	});

    	return block;
    }

    // (241:6) {#if $editMode}
    function create_if_block_36(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_18 = Object.keys(chords);
    	validate_each_argument(each_value_18);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_18.length; i += 1) {
    		each_blocks[i] = create_each_block_18(get_each_context_18(ctx, each_value_18, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 242, 10, 6196);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][71] === void 0) add_render_callback(() => /*select_change_handler_5*/ ctx[9].call(select));
    			add_location(select, file$5, 241, 8, 6131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][71]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_5*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_18 = Object.keys(chords);
    				validate_each_argument(each_value_18);
    				let i;

    				for (i = 0; i < each_value_18.length; i += 1) {
    					const child_ctx = get_each_context_18(ctx, each_value_18, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_18(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_18.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][71]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_36.name,
    		type: "if",
    		source: "(241:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (244:10) {#each Object.keys(chords) as item}
    function create_each_block_18(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 244, 12, 6284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_18.name,
    		type: "each",
    		source: "(244:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (263:27) 
    function create_if_block_35(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][72] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 263, 8, 6929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][72] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(263:27) ",
    		ctx
    	});

    	return block;
    }

    // (256:6) {#if $editMode}
    function create_if_block_34(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_17 = Object.keys(chords);
    	validate_each_argument(each_value_17);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_17.length; i += 1) {
    		each_blocks[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 257, 10, 6707);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][72] === void 0) add_render_callback(() => /*select_change_handler_6*/ ctx[10].call(select));
    			add_location(select, file$5, 256, 8, 6642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][72]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_6*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_17 = Object.keys(chords);
    				validate_each_argument(each_value_17);
    				let i;

    				for (i = 0; i < each_value_17.length; i += 1) {
    					const child_ctx = get_each_context_17(ctx, each_value_17, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_17(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_17.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][72]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(256:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (259:10) {#each Object.keys(chords) as item}
    function create_each_block_17(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 259, 12, 6795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_17.name,
    		type: "each",
    		source: "(259:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (278:27) 
    function create_if_block_33(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][74] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 278, 8, 7440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][74] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(278:27) ",
    		ctx
    	});

    	return block;
    }

    // (271:6) {#if $editMode}
    function create_if_block_32(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_16 = Object.keys(chords);
    	validate_each_argument(each_value_16);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_16.length; i += 1) {
    		each_blocks[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 272, 10, 7218);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][74] === void 0) add_render_callback(() => /*select_change_handler_7*/ ctx[11].call(select));
    			add_location(select, file$5, 271, 8, 7153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][74]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_7*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_16 = Object.keys(chords);
    				validate_each_argument(each_value_16);
    				let i;

    				for (i = 0; i < each_value_16.length; i += 1) {
    					const child_ctx = get_each_context_16(ctx, each_value_16, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_16(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_16.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][74]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(271:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (274:10) {#each Object.keys(chords) as item}
    function create_each_block_16(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 274, 12, 7306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_16.name,
    		type: "each",
    		source: "(274:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (293:27) 
    function create_if_block_31(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][75] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 293, 8, 7951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][75] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(293:27) ",
    		ctx
    	});

    	return block;
    }

    // (286:6) {#if $editMode}
    function create_if_block_30(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_15 = Object.keys(chords);
    	validate_each_argument(each_value_15);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_15.length; i += 1) {
    		each_blocks[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 287, 10, 7729);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][75] === void 0) add_render_callback(() => /*select_change_handler_8*/ ctx[12].call(select));
    			add_location(select, file$5, 286, 8, 7664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][75]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_8*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_15 = Object.keys(chords);
    				validate_each_argument(each_value_15);
    				let i;

    				for (i = 0; i < each_value_15.length; i += 1) {
    					const child_ctx = get_each_context_15(ctx, each_value_15, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_15(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_15.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][75]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(286:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (289:10) {#each Object.keys(chords) as item}
    function create_each_block_15(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 289, 12, 7817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_15.name,
    		type: "each",
    		source: "(289:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (308:27) 
    function create_if_block_29(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][76] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 308, 8, 8462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][76] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(308:27) ",
    		ctx
    	});

    	return block;
    }

    // (301:6) {#if $editMode}
    function create_if_block_28(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_14 = Object.keys(chords);
    	validate_each_argument(each_value_14);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_14.length; i += 1) {
    		each_blocks[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 302, 10, 8240);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][76] === void 0) add_render_callback(() => /*select_change_handler_9*/ ctx[13].call(select));
    			add_location(select, file$5, 301, 8, 8175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][76]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_9*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_14 = Object.keys(chords);
    				validate_each_argument(each_value_14);
    				let i;

    				for (i = 0; i < each_value_14.length; i += 1) {
    					const child_ctx = get_each_context_14(ctx, each_value_14, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_14(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_14.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][76]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(301:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (304:10) {#each Object.keys(chords) as item}
    function create_each_block_14(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 304, 12, 8328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_14.name,
    		type: "each",
    		source: "(304:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (323:27) 
    function create_if_block_27(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][186] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 323, 8, 8974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][186] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(323:27) ",
    		ctx
    	});

    	return block;
    }

    // (316:6) {#if $editMode}
    function create_if_block_26(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_13 = Object.keys(chords);
    	validate_each_argument(each_value_13);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 317, 10, 8752);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][186] === void 0) add_render_callback(() => /*select_change_handler_10*/ ctx[14].call(select));
    			add_location(select, file$5, 316, 8, 8686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][186]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_10*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_13 = Object.keys(chords);
    				validate_each_argument(each_value_13);
    				let i;

    				for (i = 0; i < each_value_13.length; i += 1) {
    					const child_ctx = get_each_context_13(ctx, each_value_13, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_13(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_13.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][186]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(316:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (319:10) {#each Object.keys(chords) as item}
    function create_each_block_13(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 319, 12, 8840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(319:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (338:27) 
    function create_if_block_25(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][222] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 338, 8, 9487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][222] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(338:27) ",
    		ctx
    	});

    	return block;
    }

    // (331:6) {#if $editMode}
    function create_if_block_24(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_12 = Object.keys(chords);
    	validate_each_argument(each_value_12);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 332, 10, 9265);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][222] === void 0) add_render_callback(() => /*select_change_handler_11*/ ctx[15].call(select));
    			add_location(select, file$5, 331, 8, 9199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][222]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_11*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_12 = Object.keys(chords);
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_12(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_12.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][222]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(331:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (334:10) {#each Object.keys(chords) as item}
    function create_each_block_12(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 334, 12, 9353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(334:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (353:27) 
    function create_if_block_23(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][220] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 353, 8, 10000);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][220] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(353:27) ",
    		ctx
    	});

    	return block;
    }

    // (346:6) {#if $editMode}
    function create_if_block_22(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_11 = Object.keys(chords);
    	validate_each_argument(each_value_11);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 347, 10, 9778);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][220] === void 0) add_render_callback(() => /*select_change_handler_12*/ ctx[16].call(select));
    			add_location(select, file$5, 346, 8, 9712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][220]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_12*/ ctx[16]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_11 = Object.keys(chords);
    				validate_each_argument(each_value_11);
    				let i;

    				for (i = 0; i < each_value_11.length; i += 1) {
    					const child_ctx = get_each_context_11(ctx, each_value_11, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_11(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_11.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][220]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(346:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (349:10) {#each Object.keys(chords) as item}
    function create_each_block_11(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 349, 12, 9866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(349:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (368:27) 
    function create_if_block_21(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][13] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 368, 8, 10512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][13] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(368:27) ",
    		ctx
    	});

    	return block;
    }

    // (361:6) {#if $editMode}
    function create_if_block_20(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_10 = Object.keys(chords);
    	validate_each_argument(each_value_10);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 362, 10, 10290);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][13] === void 0) add_render_callback(() => /*select_change_handler_13*/ ctx[17].call(select));
    			add_location(select, file$5, 361, 8, 10225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][13]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_13*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_10 = Object.keys(chords);
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_10(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_10.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][13]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(361:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (364:10) {#each Object.keys(chords) as item}
    function create_each_block_10(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 364, 12, 10378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(364:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (386:27) 
    function create_if_block_19(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][81] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 386, 8, 11063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][81] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(386:27) ",
    		ctx
    	});

    	return block;
    }

    // (379:6) {#if $editMode}
    function create_if_block_18(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_9 = Object.keys(chords);
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 380, 10, 10841);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][81] === void 0) add_render_callback(() => /*select_change_handler_14*/ ctx[18].call(select));
    			add_location(select, file$5, 379, 8, 10776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][81]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_14*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_9 = Object.keys(chords);
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][81]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(379:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (382:10) {#each Object.keys(chords) as item}
    function create_each_block_9(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 382, 12, 10929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(382:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (401:27) 
    function create_if_block_17$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][87] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 401, 8, 11574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][87] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(401:27) ",
    		ctx
    	});

    	return block;
    }

    // (394:6) {#if $editMode}
    function create_if_block_16$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_8 = Object.keys(chords);
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 395, 10, 11352);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][87] === void 0) add_render_callback(() => /*select_change_handler_15*/ ctx[19].call(select));
    			add_location(select, file$5, 394, 8, 11287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][87]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_15*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_8 = Object.keys(chords);
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_8.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][87]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(394:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (397:10) {#each Object.keys(chords) as item}
    function create_each_block_8(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 397, 12, 11440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(397:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (416:27) 
    function create_if_block_15$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][69] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 416, 8, 12085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][69] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(416:27) ",
    		ctx
    	});

    	return block;
    }

    // (409:6) {#if $editMode}
    function create_if_block_14$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_7 = Object.keys(chords);
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 410, 10, 11863);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][69] === void 0) add_render_callback(() => /*select_change_handler_16*/ ctx[20].call(select));
    			add_location(select, file$5, 409, 8, 11798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][69]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_16*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_7 = Object.keys(chords);
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][69]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(409:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (412:10) {#each Object.keys(chords) as item}
    function create_each_block_7(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 412, 12, 11951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(412:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (432:27) 
    function create_if_block_13$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][84] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 432, 8, 12633);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][84] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(432:27) ",
    		ctx
    	});

    	return block;
    }

    // (425:6) {#if $editMode}
    function create_if_block_12$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_6 = Object.keys(chords);
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 426, 10, 12411);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][84] === void 0) add_render_callback(() => /*select_change_handler_17*/ ctx[21].call(select));
    			add_location(select, file$5, 425, 8, 12346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][84]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_17*/ ctx[21]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_6 = Object.keys(chords);
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][84]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(425:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (428:10) {#each Object.keys(chords) as item}
    function create_each_block_6(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 428, 12, 12499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(428:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (447:27) 
    function create_if_block_11$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][90] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 447, 8, 13144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][90] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(447:27) ",
    		ctx
    	});

    	return block;
    }

    // (440:6) {#if $editMode}
    function create_if_block_10$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_5 = Object.keys(chords);
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 441, 10, 12922);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][90] === void 0) add_render_callback(() => /*select_change_handler_18*/ ctx[22].call(select));
    			add_location(select, file$5, 440, 8, 12857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][90]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_18*/ ctx[22]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_5 = Object.keys(chords);
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][90]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(440:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (443:10) {#each Object.keys(chords) as item}
    function create_each_block_5(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 443, 12, 13010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(443:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (463:27) 
    function create_if_block_9$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][73] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 463, 8, 13692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][73] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(463:27) ",
    		ctx
    	});

    	return block;
    }

    // (456:6) {#if $editMode}
    function create_if_block_8$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = Object.keys(chords);
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 457, 10, 13470);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][73] === void 0) add_render_callback(() => /*select_change_handler_19*/ ctx[23].call(select));
    			add_location(select, file$5, 456, 8, 13405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][73]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_19*/ ctx[23]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_4 = Object.keys(chords);
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][73]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(456:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (459:10) {#each Object.keys(chords) as item}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 459, 12, 13558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(459:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (478:27) 
    function create_if_block_7$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][79] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 478, 8, 14203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][79] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(478:27) ",
    		ctx
    	});

    	return block;
    }

    // (471:6) {#if $editMode}
    function create_if_block_6$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = Object.keys(chords);
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 472, 10, 13981);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][79] === void 0) add_render_callback(() => /*select_change_handler_20*/ ctx[24].call(select));
    			add_location(select, file$5, 471, 8, 13916);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][79]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_20*/ ctx[24]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_3 = Object.keys(chords);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][79]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(471:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (474:10) {#each Object.keys(chords) as item}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 474, 12, 14069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(474:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (493:27) 
    function create_if_block_5$1(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][80] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 493, 8, 14714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][80] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(493:27) ",
    		ctx
    	});

    	return block;
    }

    // (486:6) {#if $editMode}
    function create_if_block_4$1(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = Object.keys(chords);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 487, 10, 14492);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][80] === void 0) add_render_callback(() => /*select_change_handler_21*/ ctx[25].call(select));
    			add_location(select, file$5, 486, 8, 14427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][80]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_21*/ ctx[25]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_2 = Object.keys(chords);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][80]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(486:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (489:10) {#each Object.keys(chords) as item}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 489, 12, 14580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(489:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (509:27) 
    function create_if_block_3$2(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][221] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 509, 8, 15263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][221] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(509:27) ",
    		ctx
    	});

    	return block;
    }

    // (502:6) {#if $editMode}
    function create_if_block_2$3(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = Object.keys(chords);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 503, 10, 15041);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][221] === void 0) add_render_callback(() => /*select_change_handler_22*/ ctx[26].call(select));
    			add_location(select, file$5, 502, 8, 14975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][221]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_22*/ ctx[26]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value_1 = Object.keys(chords);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][221]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(502:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (505:10) {#each Object.keys(chords) as item}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 505, 12, 15129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(505:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    // (524:27) 
    function create_if_block_1$3(ctx) {
    	let span;
    	let raw_value = /*$chordNotes*/ ctx[2][8] + "";
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord svelte-1nlptl7");
    			add_location(span, file$5, 524, 8, 15774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$chordNotes*/ 4) && raw_value !== (raw_value = /*$chordNotes*/ ctx[2][8] + "")) span.innerHTML = raw_value;		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 200 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(524:27) ",
    		ctx
    	});

    	return block;
    }

    // (517:6) {#if $editMode}
    function create_if_block$4(ctx) {
    	let select;
    	let option;
    	let select_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(chords);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 518, 10, 15552);
    			attr_dev(select, "class", "svelte-1nlptl7");
    			if (/*$chordNotes*/ ctx[2][8] === void 0) add_render_callback(() => /*select_change_handler_23*/ ctx[27].call(select));
    			add_location(select, file$5, 517, 8, 15488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$chordNotes*/ ctx[2][8]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_23*/ ctx[27]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, chords*/ 0) {
    				each_value = Object.keys(chords);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*$chordNotes*/ 4) {
    				select_option(select, /*$chordNotes*/ ctx[2][8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, true);
    				select_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, fade, {}, false);
    			select_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching && select_transition) select_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(517:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (520:10) {#each Object.keys(chords) as item}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[28].replace("<br>", "/") + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[28];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1nlptl7");
    			add_location(option, file$5, 520, 12, 15640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(520:10) {#each Object.keys(chords) as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div29;
    	let div14;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let span0;
    	let t2;
    	let div1;
    	let current_block_type_index_1;
    	let if_block1;
    	let t3;
    	let span1;
    	let t5;
    	let div2;
    	let current_block_type_index_2;
    	let if_block2;
    	let t6;
    	let span2;
    	let t8;
    	let div3;
    	let current_block_type_index_3;
    	let if_block3;
    	let t9;
    	let span3;
    	let t11;
    	let div4;
    	let current_block_type_index_4;
    	let if_block4;
    	let t12;
    	let span4;
    	let t14;
    	let div5;
    	let current_block_type_index_5;
    	let if_block5;
    	let t15;
    	let span5;
    	let t17;
    	let div6;
    	let current_block_type_index_6;
    	let if_block6;
    	let t18;
    	let span6;
    	let t20;
    	let div7;
    	let current_block_type_index_7;
    	let if_block7;
    	let t21;
    	let span7;
    	let t23;
    	let div8;
    	let current_block_type_index_8;
    	let if_block8;
    	let t24;
    	let span8;
    	let t26;
    	let div9;
    	let current_block_type_index_9;
    	let if_block9;
    	let t27;
    	let span9;
    	let t29;
    	let div10;
    	let current_block_type_index_10;
    	let if_block10;
    	let t30;
    	let span10;
    	let t32;
    	let div11;
    	let current_block_type_index_11;
    	let if_block11;
    	let t33;
    	let span11;
    	let t35;
    	let div12;
    	let current_block_type_index_12;
    	let if_block12;
    	let t36;
    	let span12;
    	let t38;
    	let div13;
    	let current_block_type_index_13;
    	let if_block13;
    	let t39;
    	let span13;
    	let t41;
    	let div28;
    	let div15;
    	let current_block_type_index_14;
    	let if_block14;
    	let t42;
    	let span14;
    	let t44;
    	let div16;
    	let current_block_type_index_15;
    	let if_block15;
    	let t45;
    	let span15;
    	let t47;
    	let div17;
    	let current_block_type_index_16;
    	let if_block16;
    	let t48;
    	let span16;
    	let t50;
    	let div18;
    	let t51;
    	let div19;
    	let current_block_type_index_17;
    	let if_block17;
    	let t52;
    	let span17;
    	let t54;
    	let div20;
    	let current_block_type_index_18;
    	let if_block18;
    	let t55;
    	let span18;
    	let t57;
    	let div21;
    	let t58;
    	let div22;
    	let current_block_type_index_19;
    	let if_block19;
    	let t59;
    	let span19;
    	let t61;
    	let div23;
    	let current_block_type_index_20;
    	let if_block20;
    	let t62;
    	let span20;
    	let t64;
    	let div24;
    	let current_block_type_index_21;
    	let if_block21;
    	let t65;
    	let span21;
    	let t67;
    	let div25;
    	let t68;
    	let div26;
    	let current_block_type_index_22;
    	let if_block22;
    	let t69;
    	let span22;
    	let t71;
    	let div27;
    	let current_block_type_index_23;
    	let if_block23;
    	let t72;
    	let span23;
    	let div29_class_value;
    	let current;
    	const if_block_creators = [create_if_block_46, create_if_block_47];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const if_block_creators_1 = [create_if_block_44, create_if_block_45];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_1 = select_block_type_1(ctx))) {
    		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	}

    	const if_block_creators_2 = [create_if_block_42, create_if_block_43];
    	const if_blocks_2 = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_2 = select_block_type_2(ctx))) {
    		if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
    	}

    	const if_block_creators_3 = [create_if_block_40, create_if_block_41];
    	const if_blocks_3 = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_3 = select_block_type_3(ctx))) {
    		if_block3 = if_blocks_3[current_block_type_index_3] = if_block_creators_3[current_block_type_index_3](ctx);
    	}

    	const if_block_creators_4 = [create_if_block_38, create_if_block_39];
    	const if_blocks_4 = [];

    	function select_block_type_4(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_4 = select_block_type_4(ctx))) {
    		if_block4 = if_blocks_4[current_block_type_index_4] = if_block_creators_4[current_block_type_index_4](ctx);
    	}

    	const if_block_creators_5 = [create_if_block_36, create_if_block_37];
    	const if_blocks_5 = [];

    	function select_block_type_5(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_5 = select_block_type_5(ctx))) {
    		if_block5 = if_blocks_5[current_block_type_index_5] = if_block_creators_5[current_block_type_index_5](ctx);
    	}

    	const if_block_creators_6 = [create_if_block_34, create_if_block_35];
    	const if_blocks_6 = [];

    	function select_block_type_6(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_6 = select_block_type_6(ctx))) {
    		if_block6 = if_blocks_6[current_block_type_index_6] = if_block_creators_6[current_block_type_index_6](ctx);
    	}

    	const if_block_creators_7 = [create_if_block_32, create_if_block_33];
    	const if_blocks_7 = [];

    	function select_block_type_7(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_7 = select_block_type_7(ctx))) {
    		if_block7 = if_blocks_7[current_block_type_index_7] = if_block_creators_7[current_block_type_index_7](ctx);
    	}

    	const if_block_creators_8 = [create_if_block_30, create_if_block_31];
    	const if_blocks_8 = [];

    	function select_block_type_8(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_8 = select_block_type_8(ctx))) {
    		if_block8 = if_blocks_8[current_block_type_index_8] = if_block_creators_8[current_block_type_index_8](ctx);
    	}

    	const if_block_creators_9 = [create_if_block_28, create_if_block_29];
    	const if_blocks_9 = [];

    	function select_block_type_9(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_9 = select_block_type_9(ctx))) {
    		if_block9 = if_blocks_9[current_block_type_index_9] = if_block_creators_9[current_block_type_index_9](ctx);
    	}

    	const if_block_creators_10 = [create_if_block_26, create_if_block_27];
    	const if_blocks_10 = [];

    	function select_block_type_10(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_10 = select_block_type_10(ctx))) {
    		if_block10 = if_blocks_10[current_block_type_index_10] = if_block_creators_10[current_block_type_index_10](ctx);
    	}

    	const if_block_creators_11 = [create_if_block_24, create_if_block_25];
    	const if_blocks_11 = [];

    	function select_block_type_11(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_11 = select_block_type_11(ctx))) {
    		if_block11 = if_blocks_11[current_block_type_index_11] = if_block_creators_11[current_block_type_index_11](ctx);
    	}

    	const if_block_creators_12 = [create_if_block_22, create_if_block_23];
    	const if_blocks_12 = [];

    	function select_block_type_12(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_12 = select_block_type_12(ctx))) {
    		if_block12 = if_blocks_12[current_block_type_index_12] = if_block_creators_12[current_block_type_index_12](ctx);
    	}

    	const if_block_creators_13 = [create_if_block_20, create_if_block_21];
    	const if_blocks_13 = [];

    	function select_block_type_13(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_13 = select_block_type_13(ctx))) {
    		if_block13 = if_blocks_13[current_block_type_index_13] = if_block_creators_13[current_block_type_index_13](ctx);
    	}

    	const if_block_creators_14 = [create_if_block_18, create_if_block_19];
    	const if_blocks_14 = [];

    	function select_block_type_14(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_14 = select_block_type_14(ctx))) {
    		if_block14 = if_blocks_14[current_block_type_index_14] = if_block_creators_14[current_block_type_index_14](ctx);
    	}

    	const if_block_creators_15 = [create_if_block_16$1, create_if_block_17$1];
    	const if_blocks_15 = [];

    	function select_block_type_15(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_15 = select_block_type_15(ctx))) {
    		if_block15 = if_blocks_15[current_block_type_index_15] = if_block_creators_15[current_block_type_index_15](ctx);
    	}

    	const if_block_creators_16 = [create_if_block_14$1, create_if_block_15$1];
    	const if_blocks_16 = [];

    	function select_block_type_16(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_16 = select_block_type_16(ctx))) {
    		if_block16 = if_blocks_16[current_block_type_index_16] = if_block_creators_16[current_block_type_index_16](ctx);
    	}

    	const if_block_creators_17 = [create_if_block_12$1, create_if_block_13$1];
    	const if_blocks_17 = [];

    	function select_block_type_17(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_17 = select_block_type_17(ctx))) {
    		if_block17 = if_blocks_17[current_block_type_index_17] = if_block_creators_17[current_block_type_index_17](ctx);
    	}

    	const if_block_creators_18 = [create_if_block_10$1, create_if_block_11$1];
    	const if_blocks_18 = [];

    	function select_block_type_18(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_18 = select_block_type_18(ctx))) {
    		if_block18 = if_blocks_18[current_block_type_index_18] = if_block_creators_18[current_block_type_index_18](ctx);
    	}

    	const if_block_creators_19 = [create_if_block_8$1, create_if_block_9$1];
    	const if_blocks_19 = [];

    	function select_block_type_19(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_19 = select_block_type_19(ctx))) {
    		if_block19 = if_blocks_19[current_block_type_index_19] = if_block_creators_19[current_block_type_index_19](ctx);
    	}

    	const if_block_creators_20 = [create_if_block_6$1, create_if_block_7$1];
    	const if_blocks_20 = [];

    	function select_block_type_20(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_20 = select_block_type_20(ctx))) {
    		if_block20 = if_blocks_20[current_block_type_index_20] = if_block_creators_20[current_block_type_index_20](ctx);
    	}

    	const if_block_creators_21 = [create_if_block_4$1, create_if_block_5$1];
    	const if_blocks_21 = [];

    	function select_block_type_21(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_21 = select_block_type_21(ctx))) {
    		if_block21 = if_blocks_21[current_block_type_index_21] = if_block_creators_21[current_block_type_index_21](ctx);
    	}

    	const if_block_creators_22 = [create_if_block_2$3, create_if_block_3$2];
    	const if_blocks_22 = [];

    	function select_block_type_22(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_22 = select_block_type_22(ctx))) {
    		if_block22 = if_blocks_22[current_block_type_index_22] = if_block_creators_22[current_block_type_index_22](ctx);
    	}

    	const if_block_creators_23 = [create_if_block$4, create_if_block_1$3];
    	const if_blocks_23 = [];

    	function select_block_type_23(ctx, dirty) {
    		if (/*$editMode*/ ctx[1]) return 0;
    		if (/*$chordMode*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_23 = select_block_type_23(ctx))) {
    		if_block23 = if_blocks_23[current_block_type_index_23] = if_block_creators_23[current_block_type_index_23](ctx);
    	}

    	const block = {
    		c: function create() {
    			div29 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "⇪";
    			t2 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "A";
    			t5 = space();
    			div2 = element("div");
    			if (if_block2) if_block2.c();
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "S";
    			t8 = space();
    			div3 = element("div");
    			if (if_block3) if_block3.c();
    			t9 = space();
    			span3 = element("span");
    			span3.textContent = "D";
    			t11 = space();
    			div4 = element("div");
    			if (if_block4) if_block4.c();
    			t12 = space();
    			span4 = element("span");
    			span4.textContent = "F";
    			t14 = space();
    			div5 = element("div");
    			if (if_block5) if_block5.c();
    			t15 = space();
    			span5 = element("span");
    			span5.textContent = "G";
    			t17 = space();
    			div6 = element("div");
    			if (if_block6) if_block6.c();
    			t18 = space();
    			span6 = element("span");
    			span6.textContent = "H";
    			t20 = space();
    			div7 = element("div");
    			if (if_block7) if_block7.c();
    			t21 = space();
    			span7 = element("span");
    			span7.textContent = "J";
    			t23 = space();
    			div8 = element("div");
    			if (if_block8) if_block8.c();
    			t24 = space();
    			span8 = element("span");
    			span8.textContent = "K";
    			t26 = space();
    			div9 = element("div");
    			if (if_block9) if_block9.c();
    			t27 = space();
    			span9 = element("span");
    			span9.textContent = "L";
    			t29 = space();
    			div10 = element("div");
    			if (if_block10) if_block10.c();
    			t30 = space();
    			span10 = element("span");
    			span10.textContent = "Č";
    			t32 = space();
    			div11 = element("div");
    			if (if_block11) if_block11.c();
    			t33 = space();
    			span11 = element("span");
    			span11.textContent = "Ć";
    			t35 = space();
    			div12 = element("div");
    			if (if_block12) if_block12.c();
    			t36 = space();
    			span12 = element("span");
    			span12.textContent = "Ž";
    			t38 = space();
    			div13 = element("div");
    			if (if_block13) if_block13.c();
    			t39 = space();
    			span13 = element("span");
    			span13.textContent = "↵";
    			t41 = space();
    			div28 = element("div");
    			div15 = element("div");
    			if (if_block14) if_block14.c();
    			t42 = space();
    			span14 = element("span");
    			span14.textContent = "Q";
    			t44 = space();
    			div16 = element("div");
    			if (if_block15) if_block15.c();
    			t45 = space();
    			span15 = element("span");
    			span15.textContent = "W";
    			t47 = space();
    			div17 = element("div");
    			if (if_block16) if_block16.c();
    			t48 = space();
    			span16 = element("span");
    			span16.textContent = "E";
    			t50 = space();
    			div18 = element("div");
    			t51 = space();
    			div19 = element("div");
    			if (if_block17) if_block17.c();
    			t52 = space();
    			span17 = element("span");
    			span17.textContent = "T";
    			t54 = space();
    			div20 = element("div");
    			if (if_block18) if_block18.c();
    			t55 = space();
    			span18 = element("span");
    			span18.textContent = "Z";
    			t57 = space();
    			div21 = element("div");
    			t58 = space();
    			div22 = element("div");
    			if (if_block19) if_block19.c();
    			t59 = space();
    			span19 = element("span");
    			span19.textContent = "I";
    			t61 = space();
    			div23 = element("div");
    			if (if_block20) if_block20.c();
    			t62 = space();
    			span20 = element("span");
    			span20.textContent = "O";
    			t64 = space();
    			div24 = element("div");
    			if (if_block21) if_block21.c();
    			t65 = space();
    			span21 = element("span");
    			span21.textContent = "P";
    			t67 = space();
    			div25 = element("div");
    			t68 = space();
    			div26 = element("div");
    			if (if_block22) if_block22.c();
    			t69 = space();
    			span22 = element("span");
    			span22.textContent = "Đ";
    			t71 = space();
    			div27 = element("div");
    			if (if_block23) if_block23.c();
    			t72 = space();
    			span23 = element("span");
    			span23.textContent = "⌫";
    			attr_dev(span0, "class", "svelte-1nlptl7");
    			add_location(span0, file$5, 177, 6, 3992);
    			attr_dev(div0, "id", "⇪");
    			attr_dev(div0, "class", "white-key svelte-1nlptl7");
    			add_location(div0, file$5, 164, 4, 3513);
    			attr_dev(span1, "class", "svelte-1nlptl7");
    			add_location(span1, file$5, 192, 6, 4503);
    			attr_dev(div1, "id", "A");
    			attr_dev(div1, "class", "white-key svelte-1nlptl7");
    			add_location(div1, file$5, 179, 4, 4024);
    			attr_dev(span2, "class", "svelte-1nlptl7");
    			add_location(span2, file$5, 207, 6, 5014);
    			attr_dev(div2, "id", "S");
    			attr_dev(div2, "class", "white-key svelte-1nlptl7");
    			add_location(div2, file$5, 194, 4, 4535);
    			attr_dev(span3, "class", "svelte-1nlptl7");
    			add_location(span3, file$5, 222, 6, 5525);
    			attr_dev(div3, "id", "D");
    			attr_dev(div3, "class", "white-key svelte-1nlptl7");
    			add_location(div3, file$5, 209, 4, 5046);
    			attr_dev(span4, "class", "svelte-1nlptl7");
    			add_location(span4, file$5, 237, 6, 6036);
    			attr_dev(div4, "id", "F");
    			attr_dev(div4, "class", "white-key svelte-1nlptl7");
    			add_location(div4, file$5, 224, 4, 5557);
    			attr_dev(span5, "class", "svelte-1nlptl7");
    			add_location(span5, file$5, 252, 6, 6547);
    			attr_dev(div5, "id", "G");
    			attr_dev(div5, "class", "white-key svelte-1nlptl7");
    			add_location(div5, file$5, 239, 4, 6068);
    			attr_dev(span6, "class", "svelte-1nlptl7");
    			add_location(span6, file$5, 267, 6, 7058);
    			attr_dev(div6, "id", "H");
    			attr_dev(div6, "class", "white-key svelte-1nlptl7");
    			add_location(div6, file$5, 254, 4, 6579);
    			attr_dev(span7, "class", "svelte-1nlptl7");
    			add_location(span7, file$5, 282, 6, 7569);
    			attr_dev(div7, "id", "J");
    			attr_dev(div7, "class", "white-key svelte-1nlptl7");
    			add_location(div7, file$5, 269, 4, 7090);
    			attr_dev(span8, "class", "svelte-1nlptl7");
    			add_location(span8, file$5, 297, 6, 8080);
    			attr_dev(div8, "id", "K");
    			attr_dev(div8, "class", "white-key svelte-1nlptl7");
    			add_location(div8, file$5, 284, 4, 7601);
    			attr_dev(span9, "class", "svelte-1nlptl7");
    			add_location(span9, file$5, 312, 6, 8591);
    			attr_dev(div9, "id", "L");
    			attr_dev(div9, "class", "white-key svelte-1nlptl7");
    			add_location(div9, file$5, 299, 4, 8112);
    			attr_dev(span10, "class", "svelte-1nlptl7");
    			add_location(span10, file$5, 327, 6, 9104);
    			attr_dev(div10, "id", "Č");
    			attr_dev(div10, "class", "white-key svelte-1nlptl7");
    			add_location(div10, file$5, 314, 4, 8623);
    			attr_dev(span11, "class", "svelte-1nlptl7");
    			add_location(span11, file$5, 342, 6, 9617);
    			attr_dev(div11, "id", "Ć");
    			attr_dev(div11, "class", "white-key svelte-1nlptl7");
    			add_location(div11, file$5, 329, 4, 9136);
    			attr_dev(span12, "class", "svelte-1nlptl7");
    			add_location(span12, file$5, 357, 6, 10130);
    			attr_dev(div12, "id", "Ž");
    			attr_dev(div12, "class", "white-key svelte-1nlptl7");
    			add_location(div12, file$5, 344, 4, 9649);
    			attr_dev(span13, "class", "svelte-1nlptl7");
    			add_location(span13, file$5, 372, 6, 10641);
    			attr_dev(div13, "id", "↵");
    			attr_dev(div13, "class", "white-key svelte-1nlptl7");
    			add_location(div13, file$5, 359, 4, 10162);
    			attr_dev(div14, "class", "piano-grid svelte-1nlptl7");
    			add_location(div14, file$5, 163, 2, 3483);
    			attr_dev(span14, "class", "svelte-1nlptl7");
    			add_location(span14, file$5, 390, 6, 11192);
    			attr_dev(div15, "id", "Q");
    			attr_dev(div15, "class", "black-key svelte-1nlptl7");
    			add_location(div15, file$5, 377, 4, 10713);
    			attr_dev(span15, "class", "svelte-1nlptl7");
    			add_location(span15, file$5, 405, 6, 11703);
    			attr_dev(div16, "id", "W");
    			attr_dev(div16, "class", "black-key svelte-1nlptl7");
    			add_location(div16, file$5, 392, 4, 11224);
    			attr_dev(span16, "class", "svelte-1nlptl7");
    			add_location(span16, file$5, 420, 6, 12214);
    			attr_dev(div17, "id", "E");
    			attr_dev(div17, "class", "black-key svelte-1nlptl7");
    			add_location(div17, file$5, 407, 4, 11735);
    			attr_dev(div18, "class", "blank-black-key svelte-1nlptl7");
    			add_location(div18, file$5, 422, 4, 12246);
    			attr_dev(span17, "class", "svelte-1nlptl7");
    			add_location(span17, file$5, 436, 6, 12762);
    			attr_dev(div19, "id", "T");
    			attr_dev(div19, "class", "black-key svelte-1nlptl7");
    			add_location(div19, file$5, 423, 4, 12283);
    			attr_dev(span18, "class", "svelte-1nlptl7");
    			add_location(span18, file$5, 451, 6, 13273);
    			attr_dev(div20, "id", "Z");
    			attr_dev(div20, "class", "black-key svelte-1nlptl7");
    			add_location(div20, file$5, 438, 4, 12794);
    			attr_dev(div21, "class", "blank-black-key svelte-1nlptl7");
    			add_location(div21, file$5, 453, 4, 13305);
    			attr_dev(span19, "class", "svelte-1nlptl7");
    			add_location(span19, file$5, 467, 6, 13821);
    			attr_dev(div22, "id", "I");
    			attr_dev(div22, "class", "black-key svelte-1nlptl7");
    			add_location(div22, file$5, 454, 4, 13342);
    			attr_dev(span20, "class", "svelte-1nlptl7");
    			add_location(span20, file$5, 482, 6, 14332);
    			attr_dev(div23, "id", "O");
    			attr_dev(div23, "class", "black-key svelte-1nlptl7");
    			add_location(div23, file$5, 469, 4, 13853);
    			attr_dev(span21, "class", "svelte-1nlptl7");
    			add_location(span21, file$5, 497, 6, 14843);
    			attr_dev(div24, "id", "P");
    			attr_dev(div24, "class", "black-key svelte-1nlptl7");
    			add_location(div24, file$5, 484, 4, 14364);
    			attr_dev(div25, "class", "blank-black-key svelte-1nlptl7");
    			add_location(div25, file$5, 499, 4, 14875);
    			attr_dev(span22, "class", "svelte-1nlptl7");
    			add_location(span22, file$5, 513, 6, 15393);
    			attr_dev(div26, "id", "Đ");
    			attr_dev(div26, "class", "black-key svelte-1nlptl7");
    			add_location(div26, file$5, 500, 4, 14912);
    			attr_dev(span23, "class", "svelte-1nlptl7");
    			add_location(span23, file$5, 528, 6, 15902);
    			attr_dev(div27, "id", "⌫");
    			attr_dev(div27, "class", "black-key svelte-1nlptl7");
    			add_location(div27, file$5, 515, 4, 15425);
    			attr_dev(div28, "class", "piano-grid svelte-1nlptl7");
    			add_location(div28, file$5, 376, 2, 10683);

    			attr_dev(div29, "class", div29_class_value = "piano-grid-container " + (/*$isFocused*/ ctx[0] || /*$editMode*/ ctx[1]
    			? "transparent"
    			: "") + " svelte-1nlptl7");

    			add_location(div29, file$5, 161, 0, 3395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div29, anchor);
    			append_dev(div29, div14);
    			append_dev(div14, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div14, t2);
    			append_dev(div14, div1);

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			append_dev(div14, t5);
    			append_dev(div14, div2);

    			if (~current_block_type_index_2) {
    				if_blocks_2[current_block_type_index_2].m(div2, null);
    			}

    			append_dev(div2, t6);
    			append_dev(div2, span2);
    			append_dev(div14, t8);
    			append_dev(div14, div3);

    			if (~current_block_type_index_3) {
    				if_blocks_3[current_block_type_index_3].m(div3, null);
    			}

    			append_dev(div3, t9);
    			append_dev(div3, span3);
    			append_dev(div14, t11);
    			append_dev(div14, div4);

    			if (~current_block_type_index_4) {
    				if_blocks_4[current_block_type_index_4].m(div4, null);
    			}

    			append_dev(div4, t12);
    			append_dev(div4, span4);
    			append_dev(div14, t14);
    			append_dev(div14, div5);

    			if (~current_block_type_index_5) {
    				if_blocks_5[current_block_type_index_5].m(div5, null);
    			}

    			append_dev(div5, t15);
    			append_dev(div5, span5);
    			append_dev(div14, t17);
    			append_dev(div14, div6);

    			if (~current_block_type_index_6) {
    				if_blocks_6[current_block_type_index_6].m(div6, null);
    			}

    			append_dev(div6, t18);
    			append_dev(div6, span6);
    			append_dev(div14, t20);
    			append_dev(div14, div7);

    			if (~current_block_type_index_7) {
    				if_blocks_7[current_block_type_index_7].m(div7, null);
    			}

    			append_dev(div7, t21);
    			append_dev(div7, span7);
    			append_dev(div14, t23);
    			append_dev(div14, div8);

    			if (~current_block_type_index_8) {
    				if_blocks_8[current_block_type_index_8].m(div8, null);
    			}

    			append_dev(div8, t24);
    			append_dev(div8, span8);
    			append_dev(div14, t26);
    			append_dev(div14, div9);

    			if (~current_block_type_index_9) {
    				if_blocks_9[current_block_type_index_9].m(div9, null);
    			}

    			append_dev(div9, t27);
    			append_dev(div9, span9);
    			append_dev(div14, t29);
    			append_dev(div14, div10);

    			if (~current_block_type_index_10) {
    				if_blocks_10[current_block_type_index_10].m(div10, null);
    			}

    			append_dev(div10, t30);
    			append_dev(div10, span10);
    			append_dev(div14, t32);
    			append_dev(div14, div11);

    			if (~current_block_type_index_11) {
    				if_blocks_11[current_block_type_index_11].m(div11, null);
    			}

    			append_dev(div11, t33);
    			append_dev(div11, span11);
    			append_dev(div14, t35);
    			append_dev(div14, div12);

    			if (~current_block_type_index_12) {
    				if_blocks_12[current_block_type_index_12].m(div12, null);
    			}

    			append_dev(div12, t36);
    			append_dev(div12, span12);
    			append_dev(div14, t38);
    			append_dev(div14, div13);

    			if (~current_block_type_index_13) {
    				if_blocks_13[current_block_type_index_13].m(div13, null);
    			}

    			append_dev(div13, t39);
    			append_dev(div13, span13);
    			append_dev(div29, t41);
    			append_dev(div29, div28);
    			append_dev(div28, div15);

    			if (~current_block_type_index_14) {
    				if_blocks_14[current_block_type_index_14].m(div15, null);
    			}

    			append_dev(div15, t42);
    			append_dev(div15, span14);
    			append_dev(div28, t44);
    			append_dev(div28, div16);

    			if (~current_block_type_index_15) {
    				if_blocks_15[current_block_type_index_15].m(div16, null);
    			}

    			append_dev(div16, t45);
    			append_dev(div16, span15);
    			append_dev(div28, t47);
    			append_dev(div28, div17);

    			if (~current_block_type_index_16) {
    				if_blocks_16[current_block_type_index_16].m(div17, null);
    			}

    			append_dev(div17, t48);
    			append_dev(div17, span16);
    			append_dev(div28, t50);
    			append_dev(div28, div18);
    			append_dev(div28, t51);
    			append_dev(div28, div19);

    			if (~current_block_type_index_17) {
    				if_blocks_17[current_block_type_index_17].m(div19, null);
    			}

    			append_dev(div19, t52);
    			append_dev(div19, span17);
    			append_dev(div28, t54);
    			append_dev(div28, div20);

    			if (~current_block_type_index_18) {
    				if_blocks_18[current_block_type_index_18].m(div20, null);
    			}

    			append_dev(div20, t55);
    			append_dev(div20, span18);
    			append_dev(div28, t57);
    			append_dev(div28, div21);
    			append_dev(div28, t58);
    			append_dev(div28, div22);

    			if (~current_block_type_index_19) {
    				if_blocks_19[current_block_type_index_19].m(div22, null);
    			}

    			append_dev(div22, t59);
    			append_dev(div22, span19);
    			append_dev(div28, t61);
    			append_dev(div28, div23);

    			if (~current_block_type_index_20) {
    				if_blocks_20[current_block_type_index_20].m(div23, null);
    			}

    			append_dev(div23, t62);
    			append_dev(div23, span20);
    			append_dev(div28, t64);
    			append_dev(div28, div24);

    			if (~current_block_type_index_21) {
    				if_blocks_21[current_block_type_index_21].m(div24, null);
    			}

    			append_dev(div24, t65);
    			append_dev(div24, span21);
    			append_dev(div28, t67);
    			append_dev(div28, div25);
    			append_dev(div28, t68);
    			append_dev(div28, div26);

    			if (~current_block_type_index_22) {
    				if_blocks_22[current_block_type_index_22].m(div26, null);
    			}

    			append_dev(div26, t69);
    			append_dev(div26, span22);
    			append_dev(div28, t71);
    			append_dev(div28, div27);

    			if (~current_block_type_index_23) {
    				if_blocks_23[current_block_type_index_23].m(div27, null);
    			}

    			append_dev(div27, t72);
    			append_dev(div27, span23);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				} else {
    					if_block0 = null;
    				}
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if (~current_block_type_index_1) {
    					if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    						if_blocks_1[previous_block_index_1] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_1) {
    					if_block1 = if_blocks_1[current_block_type_index_1];

    					if (!if_block1) {
    						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div1, t3);
    				} else {
    					if_block1 = null;
    				}
    			}

    			let previous_block_index_2 = current_block_type_index_2;
    			current_block_type_index_2 = select_block_type_2(ctx);

    			if (current_block_type_index_2 === previous_block_index_2) {
    				if (~current_block_type_index_2) {
    					if_blocks_2[current_block_type_index_2].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks_2[previous_block_index_2], 1, 1, () => {
    						if_blocks_2[previous_block_index_2] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_2) {
    					if_block2 = if_blocks_2[current_block_type_index_2];

    					if (!if_block2) {
    						if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
    						if_block2.c();
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(div2, t6);
    				} else {
    					if_block2 = null;
    				}
    			}

    			let previous_block_index_3 = current_block_type_index_3;
    			current_block_type_index_3 = select_block_type_3(ctx);

    			if (current_block_type_index_3 === previous_block_index_3) {
    				if (~current_block_type_index_3) {
    					if_blocks_3[current_block_type_index_3].p(ctx, dirty);
    				}
    			} else {
    				if (if_block3) {
    					group_outros();

    					transition_out(if_blocks_3[previous_block_index_3], 1, 1, () => {
    						if_blocks_3[previous_block_index_3] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_3) {
    					if_block3 = if_blocks_3[current_block_type_index_3];

    					if (!if_block3) {
    						if_block3 = if_blocks_3[current_block_type_index_3] = if_block_creators_3[current_block_type_index_3](ctx);
    						if_block3.c();
    					}

    					transition_in(if_block3, 1);
    					if_block3.m(div3, t9);
    				} else {
    					if_block3 = null;
    				}
    			}

    			let previous_block_index_4 = current_block_type_index_4;
    			current_block_type_index_4 = select_block_type_4(ctx);

    			if (current_block_type_index_4 === previous_block_index_4) {
    				if (~current_block_type_index_4) {
    					if_blocks_4[current_block_type_index_4].p(ctx, dirty);
    				}
    			} else {
    				if (if_block4) {
    					group_outros();

    					transition_out(if_blocks_4[previous_block_index_4], 1, 1, () => {
    						if_blocks_4[previous_block_index_4] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_4) {
    					if_block4 = if_blocks_4[current_block_type_index_4];

    					if (!if_block4) {
    						if_block4 = if_blocks_4[current_block_type_index_4] = if_block_creators_4[current_block_type_index_4](ctx);
    						if_block4.c();
    					}

    					transition_in(if_block4, 1);
    					if_block4.m(div4, t12);
    				} else {
    					if_block4 = null;
    				}
    			}

    			let previous_block_index_5 = current_block_type_index_5;
    			current_block_type_index_5 = select_block_type_5(ctx);

    			if (current_block_type_index_5 === previous_block_index_5) {
    				if (~current_block_type_index_5) {
    					if_blocks_5[current_block_type_index_5].p(ctx, dirty);
    				}
    			} else {
    				if (if_block5) {
    					group_outros();

    					transition_out(if_blocks_5[previous_block_index_5], 1, 1, () => {
    						if_blocks_5[previous_block_index_5] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_5) {
    					if_block5 = if_blocks_5[current_block_type_index_5];

    					if (!if_block5) {
    						if_block5 = if_blocks_5[current_block_type_index_5] = if_block_creators_5[current_block_type_index_5](ctx);
    						if_block5.c();
    					}

    					transition_in(if_block5, 1);
    					if_block5.m(div5, t15);
    				} else {
    					if_block5 = null;
    				}
    			}

    			let previous_block_index_6 = current_block_type_index_6;
    			current_block_type_index_6 = select_block_type_6(ctx);

    			if (current_block_type_index_6 === previous_block_index_6) {
    				if (~current_block_type_index_6) {
    					if_blocks_6[current_block_type_index_6].p(ctx, dirty);
    				}
    			} else {
    				if (if_block6) {
    					group_outros();

    					transition_out(if_blocks_6[previous_block_index_6], 1, 1, () => {
    						if_blocks_6[previous_block_index_6] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_6) {
    					if_block6 = if_blocks_6[current_block_type_index_6];

    					if (!if_block6) {
    						if_block6 = if_blocks_6[current_block_type_index_6] = if_block_creators_6[current_block_type_index_6](ctx);
    						if_block6.c();
    					}

    					transition_in(if_block6, 1);
    					if_block6.m(div6, t18);
    				} else {
    					if_block6 = null;
    				}
    			}

    			let previous_block_index_7 = current_block_type_index_7;
    			current_block_type_index_7 = select_block_type_7(ctx);

    			if (current_block_type_index_7 === previous_block_index_7) {
    				if (~current_block_type_index_7) {
    					if_blocks_7[current_block_type_index_7].p(ctx, dirty);
    				}
    			} else {
    				if (if_block7) {
    					group_outros();

    					transition_out(if_blocks_7[previous_block_index_7], 1, 1, () => {
    						if_blocks_7[previous_block_index_7] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_7) {
    					if_block7 = if_blocks_7[current_block_type_index_7];

    					if (!if_block7) {
    						if_block7 = if_blocks_7[current_block_type_index_7] = if_block_creators_7[current_block_type_index_7](ctx);
    						if_block7.c();
    					}

    					transition_in(if_block7, 1);
    					if_block7.m(div7, t21);
    				} else {
    					if_block7 = null;
    				}
    			}

    			let previous_block_index_8 = current_block_type_index_8;
    			current_block_type_index_8 = select_block_type_8(ctx);

    			if (current_block_type_index_8 === previous_block_index_8) {
    				if (~current_block_type_index_8) {
    					if_blocks_8[current_block_type_index_8].p(ctx, dirty);
    				}
    			} else {
    				if (if_block8) {
    					group_outros();

    					transition_out(if_blocks_8[previous_block_index_8], 1, 1, () => {
    						if_blocks_8[previous_block_index_8] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_8) {
    					if_block8 = if_blocks_8[current_block_type_index_8];

    					if (!if_block8) {
    						if_block8 = if_blocks_8[current_block_type_index_8] = if_block_creators_8[current_block_type_index_8](ctx);
    						if_block8.c();
    					}

    					transition_in(if_block8, 1);
    					if_block8.m(div8, t24);
    				} else {
    					if_block8 = null;
    				}
    			}

    			let previous_block_index_9 = current_block_type_index_9;
    			current_block_type_index_9 = select_block_type_9(ctx);

    			if (current_block_type_index_9 === previous_block_index_9) {
    				if (~current_block_type_index_9) {
    					if_blocks_9[current_block_type_index_9].p(ctx, dirty);
    				}
    			} else {
    				if (if_block9) {
    					group_outros();

    					transition_out(if_blocks_9[previous_block_index_9], 1, 1, () => {
    						if_blocks_9[previous_block_index_9] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_9) {
    					if_block9 = if_blocks_9[current_block_type_index_9];

    					if (!if_block9) {
    						if_block9 = if_blocks_9[current_block_type_index_9] = if_block_creators_9[current_block_type_index_9](ctx);
    						if_block9.c();
    					}

    					transition_in(if_block9, 1);
    					if_block9.m(div9, t27);
    				} else {
    					if_block9 = null;
    				}
    			}

    			let previous_block_index_10 = current_block_type_index_10;
    			current_block_type_index_10 = select_block_type_10(ctx);

    			if (current_block_type_index_10 === previous_block_index_10) {
    				if (~current_block_type_index_10) {
    					if_blocks_10[current_block_type_index_10].p(ctx, dirty);
    				}
    			} else {
    				if (if_block10) {
    					group_outros();

    					transition_out(if_blocks_10[previous_block_index_10], 1, 1, () => {
    						if_blocks_10[previous_block_index_10] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_10) {
    					if_block10 = if_blocks_10[current_block_type_index_10];

    					if (!if_block10) {
    						if_block10 = if_blocks_10[current_block_type_index_10] = if_block_creators_10[current_block_type_index_10](ctx);
    						if_block10.c();
    					}

    					transition_in(if_block10, 1);
    					if_block10.m(div10, t30);
    				} else {
    					if_block10 = null;
    				}
    			}

    			let previous_block_index_11 = current_block_type_index_11;
    			current_block_type_index_11 = select_block_type_11(ctx);

    			if (current_block_type_index_11 === previous_block_index_11) {
    				if (~current_block_type_index_11) {
    					if_blocks_11[current_block_type_index_11].p(ctx, dirty);
    				}
    			} else {
    				if (if_block11) {
    					group_outros();

    					transition_out(if_blocks_11[previous_block_index_11], 1, 1, () => {
    						if_blocks_11[previous_block_index_11] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_11) {
    					if_block11 = if_blocks_11[current_block_type_index_11];

    					if (!if_block11) {
    						if_block11 = if_blocks_11[current_block_type_index_11] = if_block_creators_11[current_block_type_index_11](ctx);
    						if_block11.c();
    					}

    					transition_in(if_block11, 1);
    					if_block11.m(div11, t33);
    				} else {
    					if_block11 = null;
    				}
    			}

    			let previous_block_index_12 = current_block_type_index_12;
    			current_block_type_index_12 = select_block_type_12(ctx);

    			if (current_block_type_index_12 === previous_block_index_12) {
    				if (~current_block_type_index_12) {
    					if_blocks_12[current_block_type_index_12].p(ctx, dirty);
    				}
    			} else {
    				if (if_block12) {
    					group_outros();

    					transition_out(if_blocks_12[previous_block_index_12], 1, 1, () => {
    						if_blocks_12[previous_block_index_12] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_12) {
    					if_block12 = if_blocks_12[current_block_type_index_12];

    					if (!if_block12) {
    						if_block12 = if_blocks_12[current_block_type_index_12] = if_block_creators_12[current_block_type_index_12](ctx);
    						if_block12.c();
    					}

    					transition_in(if_block12, 1);
    					if_block12.m(div12, t36);
    				} else {
    					if_block12 = null;
    				}
    			}

    			let previous_block_index_13 = current_block_type_index_13;
    			current_block_type_index_13 = select_block_type_13(ctx);

    			if (current_block_type_index_13 === previous_block_index_13) {
    				if (~current_block_type_index_13) {
    					if_blocks_13[current_block_type_index_13].p(ctx, dirty);
    				}
    			} else {
    				if (if_block13) {
    					group_outros();

    					transition_out(if_blocks_13[previous_block_index_13], 1, 1, () => {
    						if_blocks_13[previous_block_index_13] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_13) {
    					if_block13 = if_blocks_13[current_block_type_index_13];

    					if (!if_block13) {
    						if_block13 = if_blocks_13[current_block_type_index_13] = if_block_creators_13[current_block_type_index_13](ctx);
    						if_block13.c();
    					}

    					transition_in(if_block13, 1);
    					if_block13.m(div13, t39);
    				} else {
    					if_block13 = null;
    				}
    			}

    			let previous_block_index_14 = current_block_type_index_14;
    			current_block_type_index_14 = select_block_type_14(ctx);

    			if (current_block_type_index_14 === previous_block_index_14) {
    				if (~current_block_type_index_14) {
    					if_blocks_14[current_block_type_index_14].p(ctx, dirty);
    				}
    			} else {
    				if (if_block14) {
    					group_outros();

    					transition_out(if_blocks_14[previous_block_index_14], 1, 1, () => {
    						if_blocks_14[previous_block_index_14] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_14) {
    					if_block14 = if_blocks_14[current_block_type_index_14];

    					if (!if_block14) {
    						if_block14 = if_blocks_14[current_block_type_index_14] = if_block_creators_14[current_block_type_index_14](ctx);
    						if_block14.c();
    					}

    					transition_in(if_block14, 1);
    					if_block14.m(div15, t42);
    				} else {
    					if_block14 = null;
    				}
    			}

    			let previous_block_index_15 = current_block_type_index_15;
    			current_block_type_index_15 = select_block_type_15(ctx);

    			if (current_block_type_index_15 === previous_block_index_15) {
    				if (~current_block_type_index_15) {
    					if_blocks_15[current_block_type_index_15].p(ctx, dirty);
    				}
    			} else {
    				if (if_block15) {
    					group_outros();

    					transition_out(if_blocks_15[previous_block_index_15], 1, 1, () => {
    						if_blocks_15[previous_block_index_15] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_15) {
    					if_block15 = if_blocks_15[current_block_type_index_15];

    					if (!if_block15) {
    						if_block15 = if_blocks_15[current_block_type_index_15] = if_block_creators_15[current_block_type_index_15](ctx);
    						if_block15.c();
    					}

    					transition_in(if_block15, 1);
    					if_block15.m(div16, t45);
    				} else {
    					if_block15 = null;
    				}
    			}

    			let previous_block_index_16 = current_block_type_index_16;
    			current_block_type_index_16 = select_block_type_16(ctx);

    			if (current_block_type_index_16 === previous_block_index_16) {
    				if (~current_block_type_index_16) {
    					if_blocks_16[current_block_type_index_16].p(ctx, dirty);
    				}
    			} else {
    				if (if_block16) {
    					group_outros();

    					transition_out(if_blocks_16[previous_block_index_16], 1, 1, () => {
    						if_blocks_16[previous_block_index_16] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_16) {
    					if_block16 = if_blocks_16[current_block_type_index_16];

    					if (!if_block16) {
    						if_block16 = if_blocks_16[current_block_type_index_16] = if_block_creators_16[current_block_type_index_16](ctx);
    						if_block16.c();
    					}

    					transition_in(if_block16, 1);
    					if_block16.m(div17, t48);
    				} else {
    					if_block16 = null;
    				}
    			}

    			let previous_block_index_17 = current_block_type_index_17;
    			current_block_type_index_17 = select_block_type_17(ctx);

    			if (current_block_type_index_17 === previous_block_index_17) {
    				if (~current_block_type_index_17) {
    					if_blocks_17[current_block_type_index_17].p(ctx, dirty);
    				}
    			} else {
    				if (if_block17) {
    					group_outros();

    					transition_out(if_blocks_17[previous_block_index_17], 1, 1, () => {
    						if_blocks_17[previous_block_index_17] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_17) {
    					if_block17 = if_blocks_17[current_block_type_index_17];

    					if (!if_block17) {
    						if_block17 = if_blocks_17[current_block_type_index_17] = if_block_creators_17[current_block_type_index_17](ctx);
    						if_block17.c();
    					}

    					transition_in(if_block17, 1);
    					if_block17.m(div19, t52);
    				} else {
    					if_block17 = null;
    				}
    			}

    			let previous_block_index_18 = current_block_type_index_18;
    			current_block_type_index_18 = select_block_type_18(ctx);

    			if (current_block_type_index_18 === previous_block_index_18) {
    				if (~current_block_type_index_18) {
    					if_blocks_18[current_block_type_index_18].p(ctx, dirty);
    				}
    			} else {
    				if (if_block18) {
    					group_outros();

    					transition_out(if_blocks_18[previous_block_index_18], 1, 1, () => {
    						if_blocks_18[previous_block_index_18] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_18) {
    					if_block18 = if_blocks_18[current_block_type_index_18];

    					if (!if_block18) {
    						if_block18 = if_blocks_18[current_block_type_index_18] = if_block_creators_18[current_block_type_index_18](ctx);
    						if_block18.c();
    					}

    					transition_in(if_block18, 1);
    					if_block18.m(div20, t55);
    				} else {
    					if_block18 = null;
    				}
    			}

    			let previous_block_index_19 = current_block_type_index_19;
    			current_block_type_index_19 = select_block_type_19(ctx);

    			if (current_block_type_index_19 === previous_block_index_19) {
    				if (~current_block_type_index_19) {
    					if_blocks_19[current_block_type_index_19].p(ctx, dirty);
    				}
    			} else {
    				if (if_block19) {
    					group_outros();

    					transition_out(if_blocks_19[previous_block_index_19], 1, 1, () => {
    						if_blocks_19[previous_block_index_19] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_19) {
    					if_block19 = if_blocks_19[current_block_type_index_19];

    					if (!if_block19) {
    						if_block19 = if_blocks_19[current_block_type_index_19] = if_block_creators_19[current_block_type_index_19](ctx);
    						if_block19.c();
    					}

    					transition_in(if_block19, 1);
    					if_block19.m(div22, t59);
    				} else {
    					if_block19 = null;
    				}
    			}

    			let previous_block_index_20 = current_block_type_index_20;
    			current_block_type_index_20 = select_block_type_20(ctx);

    			if (current_block_type_index_20 === previous_block_index_20) {
    				if (~current_block_type_index_20) {
    					if_blocks_20[current_block_type_index_20].p(ctx, dirty);
    				}
    			} else {
    				if (if_block20) {
    					group_outros();

    					transition_out(if_blocks_20[previous_block_index_20], 1, 1, () => {
    						if_blocks_20[previous_block_index_20] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_20) {
    					if_block20 = if_blocks_20[current_block_type_index_20];

    					if (!if_block20) {
    						if_block20 = if_blocks_20[current_block_type_index_20] = if_block_creators_20[current_block_type_index_20](ctx);
    						if_block20.c();
    					}

    					transition_in(if_block20, 1);
    					if_block20.m(div23, t62);
    				} else {
    					if_block20 = null;
    				}
    			}

    			let previous_block_index_21 = current_block_type_index_21;
    			current_block_type_index_21 = select_block_type_21(ctx);

    			if (current_block_type_index_21 === previous_block_index_21) {
    				if (~current_block_type_index_21) {
    					if_blocks_21[current_block_type_index_21].p(ctx, dirty);
    				}
    			} else {
    				if (if_block21) {
    					group_outros();

    					transition_out(if_blocks_21[previous_block_index_21], 1, 1, () => {
    						if_blocks_21[previous_block_index_21] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_21) {
    					if_block21 = if_blocks_21[current_block_type_index_21];

    					if (!if_block21) {
    						if_block21 = if_blocks_21[current_block_type_index_21] = if_block_creators_21[current_block_type_index_21](ctx);
    						if_block21.c();
    					}

    					transition_in(if_block21, 1);
    					if_block21.m(div24, t65);
    				} else {
    					if_block21 = null;
    				}
    			}

    			let previous_block_index_22 = current_block_type_index_22;
    			current_block_type_index_22 = select_block_type_22(ctx);

    			if (current_block_type_index_22 === previous_block_index_22) {
    				if (~current_block_type_index_22) {
    					if_blocks_22[current_block_type_index_22].p(ctx, dirty);
    				}
    			} else {
    				if (if_block22) {
    					group_outros();

    					transition_out(if_blocks_22[previous_block_index_22], 1, 1, () => {
    						if_blocks_22[previous_block_index_22] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_22) {
    					if_block22 = if_blocks_22[current_block_type_index_22];

    					if (!if_block22) {
    						if_block22 = if_blocks_22[current_block_type_index_22] = if_block_creators_22[current_block_type_index_22](ctx);
    						if_block22.c();
    					}

    					transition_in(if_block22, 1);
    					if_block22.m(div26, t69);
    				} else {
    					if_block22 = null;
    				}
    			}

    			let previous_block_index_23 = current_block_type_index_23;
    			current_block_type_index_23 = select_block_type_23(ctx);

    			if (current_block_type_index_23 === previous_block_index_23) {
    				if (~current_block_type_index_23) {
    					if_blocks_23[current_block_type_index_23].p(ctx, dirty);
    				}
    			} else {
    				if (if_block23) {
    					group_outros();

    					transition_out(if_blocks_23[previous_block_index_23], 1, 1, () => {
    						if_blocks_23[previous_block_index_23] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_23) {
    					if_block23 = if_blocks_23[current_block_type_index_23];

    					if (!if_block23) {
    						if_block23 = if_blocks_23[current_block_type_index_23] = if_block_creators_23[current_block_type_index_23](ctx);
    						if_block23.c();
    					}

    					transition_in(if_block23, 1);
    					if_block23.m(div27, t72);
    				} else {
    					if_block23 = null;
    				}
    			}

    			if (!current || dirty[0] & /*$isFocused, $editMode*/ 3 && div29_class_value !== (div29_class_value = "piano-grid-container " + (/*$isFocused*/ ctx[0] || /*$editMode*/ ctx[1]
    			? "transparent"
    			: "") + " svelte-1nlptl7")) {
    				attr_dev(div29, "class", div29_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			transition_in(if_block16);
    			transition_in(if_block17);
    			transition_in(if_block18);
    			transition_in(if_block19);
    			transition_in(if_block20);
    			transition_in(if_block21);
    			transition_in(if_block22);
    			transition_in(if_block23);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			transition_out(if_block16);
    			transition_out(if_block17);
    			transition_out(if_block18);
    			transition_out(if_block19);
    			transition_out(if_block20);
    			transition_out(if_block21);
    			transition_out(if_block22);
    			transition_out(if_block23);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div29);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].d();
    			}

    			if (~current_block_type_index_2) {
    				if_blocks_2[current_block_type_index_2].d();
    			}

    			if (~current_block_type_index_3) {
    				if_blocks_3[current_block_type_index_3].d();
    			}

    			if (~current_block_type_index_4) {
    				if_blocks_4[current_block_type_index_4].d();
    			}

    			if (~current_block_type_index_5) {
    				if_blocks_5[current_block_type_index_5].d();
    			}

    			if (~current_block_type_index_6) {
    				if_blocks_6[current_block_type_index_6].d();
    			}

    			if (~current_block_type_index_7) {
    				if_blocks_7[current_block_type_index_7].d();
    			}

    			if (~current_block_type_index_8) {
    				if_blocks_8[current_block_type_index_8].d();
    			}

    			if (~current_block_type_index_9) {
    				if_blocks_9[current_block_type_index_9].d();
    			}

    			if (~current_block_type_index_10) {
    				if_blocks_10[current_block_type_index_10].d();
    			}

    			if (~current_block_type_index_11) {
    				if_blocks_11[current_block_type_index_11].d();
    			}

    			if (~current_block_type_index_12) {
    				if_blocks_12[current_block_type_index_12].d();
    			}

    			if (~current_block_type_index_13) {
    				if_blocks_13[current_block_type_index_13].d();
    			}

    			if (~current_block_type_index_14) {
    				if_blocks_14[current_block_type_index_14].d();
    			}

    			if (~current_block_type_index_15) {
    				if_blocks_15[current_block_type_index_15].d();
    			}

    			if (~current_block_type_index_16) {
    				if_blocks_16[current_block_type_index_16].d();
    			}

    			if (~current_block_type_index_17) {
    				if_blocks_17[current_block_type_index_17].d();
    			}

    			if (~current_block_type_index_18) {
    				if_blocks_18[current_block_type_index_18].d();
    			}

    			if (~current_block_type_index_19) {
    				if_blocks_19[current_block_type_index_19].d();
    			}

    			if (~current_block_type_index_20) {
    				if_blocks_20[current_block_type_index_20].d();
    			}

    			if (~current_block_type_index_21) {
    				if_blocks_21[current_block_type_index_21].d();
    			}

    			if (~current_block_type_index_22) {
    				if_blocks_22[current_block_type_index_22].d();
    			}

    			if (~current_block_type_index_23) {
    				if_blocks_23[current_block_type_index_23].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $isFocused;
    	let $editMode;
    	let $chordNotes;
    	let $chordMode;
    	validate_store(isFocused, "isFocused");
    	component_subscribe($$self, isFocused, $$value => $$invalidate(0, $isFocused = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(1, $editMode = $$value));
    	validate_store(chordNotes, "chordNotes");
    	component_subscribe($$self, chordNotes, $$value => $$invalidate(2, $chordNotes = $$value));
    	validate_store(chordMode, "chordMode");
    	component_subscribe($$self, chordMode, $$value => $$invalidate(3, $chordMode = $$value));
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PianoGrid> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PianoGrid", $$slots, []);

    	function select_change_handler() {
    		$chordNotes[20] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_1() {
    		$chordNotes[65] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_2() {
    		$chordNotes[83] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_3() {
    		$chordNotes[68] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_4() {
    		$chordNotes[70] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_5() {
    		$chordNotes[71] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_6() {
    		$chordNotes[72] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_7() {
    		$chordNotes[74] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_8() {
    		$chordNotes[75] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_9() {
    		$chordNotes[76] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_10() {
    		$chordNotes[186] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_11() {
    		$chordNotes[222] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_12() {
    		$chordNotes[220] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_13() {
    		$chordNotes[13] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_14() {
    		$chordNotes[81] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_15() {
    		$chordNotes[87] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_16() {
    		$chordNotes[69] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_17() {
    		$chordNotes[84] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_18() {
    		$chordNotes[90] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_19() {
    		$chordNotes[73] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_20() {
    		$chordNotes[79] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_21() {
    		$chordNotes[80] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_22() {
    		$chordNotes[221] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	function select_change_handler_23() {
    		$chordNotes[8] = select_value(this);
    		chordNotes.set($chordNotes);
    	}

    	$$self.$capture_state = () => ({
    		isFocused,
    		editMode,
    		chordMode,
    		chords,
    		chordNotes,
    		fade,
    		$isFocused,
    		$editMode,
    		$chordNotes,
    		$chordMode
    	});

    	return [
    		$isFocused,
    		$editMode,
    		$chordNotes,
    		$chordMode,
    		select_change_handler,
    		select_change_handler_1,
    		select_change_handler_2,
    		select_change_handler_3,
    		select_change_handler_4,
    		select_change_handler_5,
    		select_change_handler_6,
    		select_change_handler_7,
    		select_change_handler_8,
    		select_change_handler_9,
    		select_change_handler_10,
    		select_change_handler_11,
    		select_change_handler_12,
    		select_change_handler_13,
    		select_change_handler_14,
    		select_change_handler_15,
    		select_change_handler_16,
    		select_change_handler_17,
    		select_change_handler_18,
    		select_change_handler_19,
    		select_change_handler_20,
    		select_change_handler_21,
    		select_change_handler_22,
    		select_change_handler_23
    	];
    }

    class PianoGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PianoGrid",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src\components\DragAndDropList.svelte generated by Svelte v3.24.1 */

    const file$6 = "src\\components\\DragAndDropList.svelte";

    const get_error_slot_changes = dirty => ({
    	item: dirty & /*list*/ 1,
    	index: dirty & /*list*/ 1
    });

    const get_error_slot_context = ctx => ({
    	item: /*item*/ ctx[17],
    	index: /*index*/ ctx[19]
    });

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*list*/ 1,
    	index: dirty & /*list*/ 1
    });

    const get_default_slot_context = ctx => ({
    	item: /*item*/ ctx[17],
    	index: /*index*/ ctx[19]
    });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (65:2) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const error_slot_template = /*$$slots*/ ctx[10].error;
    	const error_slot = create_slot(error_slot_template, ctx, /*$$scope*/ ctx[9], get_error_slot_context);
    	const error_slot_or_fallback = error_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (error_slot_or_fallback) error_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (error_slot_or_fallback) {
    				error_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (error_slot) {
    				if (error_slot.p && dirty & /*$$scope, list*/ 513) {
    					update_slot(error_slot, error_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_error_slot_changes, get_error_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (error_slot_or_fallback) error_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(65:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:23) No items
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No items");
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
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(66:23) No items",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#each list as item, index (item.id)}
    function create_each_block$2(key_2, ctx) {
    	let div;
    	let t;
    	let div_data_index_value;
    	let div_data_id_value;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			attr_dev(div, "data-index", div_data_index_value = /*index*/ ctx[19]);
    			attr_dev(div, "data-id", div_data_id_value = /*item*/ ctx[17].id);
    			attr_dev(div, "draggable", /*canReroder*/ ctx[1]);
    			attr_dev(div, "class", "svelte-j2j95m");
    			toggle_class(div, "reordering", /*canReroder*/ ctx[1]);
    			add_location(div, file$6, 51, 4, 1454);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "dragstart", /*start*/ ctx[4], false, false, false),
    					listen_dev(div, "dragover", /*over*/ ctx[5], false, false, false),
    					listen_dev(div, "dragleave", /*leave*/ ctx[6], false, false, false),
    					listen_dev(div, "drop", /*drop*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, list*/ 513) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty & /*list*/ 1 && div_data_index_value !== (div_data_index_value = /*index*/ ctx[19])) {
    				attr_dev(div, "data-index", div_data_index_value);
    			}

    			if (!current || dirty & /*list*/ 1 && div_data_id_value !== (div_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(div, "data-id", div_data_id_value);
    			}

    			if (!current || dirty & /*canReroder*/ 2) {
    				attr_dev(div, "draggable", /*canReroder*/ ctx[1]);
    			}

    			if (dirty & /*canReroder*/ 2) {
    				toggle_class(div, "reordering", /*canReroder*/ ctx[1]);
    			}
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(51:2) {#each list as item, index (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*list*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[17].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "list svelte-j2j95m");
    			toggle_class(div, "wrap", /*wrap*/ ctx[2]);
    			toggle_class(div, "column", /*column*/ ctx[3]);
    			add_location(div, file$6, 49, 0, 1365);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*list, canReroder, start, over, leave, drop, $$scope*/ 755) {
    				const each_value = /*list*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					transition_in(each_1_else, 1);
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					group_outros();

    					transition_out(each_1_else, 1, 1, () => {
    						each_1_else = null;
    					});

    					check_outros();
    				}
    			}

    			if (dirty & /*wrap*/ 4) {
    				toggle_class(div, "wrap", /*wrap*/ ctx[2]);
    			}

    			if (dirty & /*column*/ 8) {
    				toggle_class(div, "column", /*column*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { list } = $$props;
    	let { update } = $$props;
    	let { canReroder = false } = $$props;
    	let { wrap = false } = $$props;
    	let { column = false } = $$props;

    	// DRAG AND DROP
    	let isOver = false;

    	const getDraggedParent = node => node.dataset.index && node.dataset || getDraggedParent(node.parentNode);

    	const start = ev => {
    		ev.dataTransfer.setData("source", ev.target.dataset.index);
    	};

    	const over = ev => {
    		ev.preventDefault();
    		let dragged = getDraggedParent(ev.target);
    		if (isOver !== dragged.id) isOver = dragged.id;
    	};

    	const leave = ev => {
    		let dragged = getDraggedParent(ev.target);
    		if (isOver === dragged.id) isOver = false;
    	};

    	const drop = ev => {
    		isOver = false;
    		ev.preventDefault();
    		let dragged = getDraggedParent(ev.target);
    		let from = ev.dataTransfer.getData("source");
    		let to = dragged.index;
    		reorder({ from, to });
    	};

    	const dispatch = createEventDispatcher();

    	const reorder = ({ from, to }) => {
    		update(from, to);
    	};

    	// UTILS
    	let key = "id";

    	const getKey = item => key ? item[key] : item;
    	const writable_props = ["list", "update", "canReroder", "wrap", "column"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DragAndDropList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DragAndDropList", $$slots, ['default','error']);

    	$$self.$$set = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("update" in $$props) $$invalidate(8, update = $$props.update);
    		if ("canReroder" in $$props) $$invalidate(1, canReroder = $$props.canReroder);
    		if ("wrap" in $$props) $$invalidate(2, wrap = $$props.wrap);
    		if ("column" in $$props) $$invalidate(3, column = $$props.column);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		crossfade,
    		quintOut,
    		flip,
    		list,
    		update,
    		canReroder,
    		wrap,
    		column,
    		isOver,
    		getDraggedParent,
    		start,
    		over,
    		leave,
    		drop,
    		createEventDispatcher,
    		dispatch,
    		reorder,
    		key,
    		getKey
    	});

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    		if ("update" in $$props) $$invalidate(8, update = $$props.update);
    		if ("canReroder" in $$props) $$invalidate(1, canReroder = $$props.canReroder);
    		if ("wrap" in $$props) $$invalidate(2, wrap = $$props.wrap);
    		if ("column" in $$props) $$invalidate(3, column = $$props.column);
    		if ("isOver" in $$props) isOver = $$props.isOver;
    		if ("key" in $$props) key = $$props.key;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		list,
    		canReroder,
    		wrap,
    		column,
    		start,
    		over,
    		leave,
    		drop,
    		update,
    		$$scope,
    		$$slots
    	];
    }

    class DragAndDropList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			list: 0,
    			update: 8,
    			canReroder: 1,
    			wrap: 2,
    			column: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DragAndDropList",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*list*/ ctx[0] === undefined && !("list" in props)) {
    			console.warn("<DragAndDropList> was created without expected prop 'list'");
    		}

    		if (/*update*/ ctx[8] === undefined && !("update" in props)) {
    			console.warn("<DragAndDropList> was created without expected prop 'update'");
    		}
    	}

    	get list() {
    		throw new Error("<DragAndDropList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<DragAndDropList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get update() {
    		throw new Error("<DragAndDropList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set update(value) {
    		throw new Error("<DragAndDropList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canReroder() {
    		throw new Error("<DragAndDropList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canReroder(value) {
    		throw new Error("<DragAndDropList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrap() {
    		throw new Error("<DragAndDropList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrap(value) {
    		throw new Error("<DragAndDropList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get column() {
    		throw new Error("<DragAndDropList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set column(value) {
    		throw new Error("<DragAndDropList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toast.svelte generated by Svelte v3.24.1 */
    const file$7 = "src\\components\\Toast.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (81:2) {#each toasts as toast (toast._id)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*toast*/ ctx[6].msg + "";
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let t3;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*toast*/ ctx[6], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = `${getCurrentTime()}`;
    			t3 = space();
    			html_tag = new HtmlTag(t0);
    			add_location(br, file$7, 88, 6, 2052);
    			attr_dev(span, "class", "svelte-g7elbr");
    			add_location(span, file$7, 89, 6, 2066);
    			attr_dev(div, "class", "toast-item svelte-g7elbr");
    			toggle_class(div, "error", /*toast*/ ctx[6].type == "error");
    			add_location(div, file$7, 81, 4, 1772);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(div, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*toasts*/ 1) && raw_value !== (raw_value = /*toast*/ ctx[6].msg + "")) html_tag.p(raw_value);

    			if (dirty & /*toasts*/ 1) {
    				toggle_class(div, "error", /*toast*/ ctx[6].type == "error");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				if (!div_intro) div_intro = create_in_transition(div, fly, {
    					delay: 0,
    					duration: 200,
    					x: 0,
    					y: 50,
    					opacity: 0.1,
    					easing: backOut
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, slide, { duration: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(81:2) {#each toasts as toast (toast._id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*toasts*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*toast*/ ctx[6]._id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "toast-wrapper svelte-g7elbr");
    			add_location(div, file$7, 79, 0, 1700);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toasts, unshiftToast, getCurrentTime*/ 3) {
    				const each_value = /*toasts*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCurrentTime() {
    	let today = new Date();
    	let time = today.getHours() + ":" + today.getMinutes().toString().padStart(2, "0");
    	return time;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let toasts = [];
    	let retainMs = 2000;
    	let toastId = 0;

    	const pushToast = (msg = "", type) => {
    		let id = ++toastId;
    		$$invalidate(0, toasts = [...toasts, { _id: id, type, msg }]);

    		setTimeout(
    			() => {
    				unshiftToast();
    			},
    			retainMs
    		);
    	};

    	const unshiftToast = () => {
    		$$invalidate(0, toasts = toasts.filter((a, i) => i > 0));
    	};

    	onMount(() => {
    		window.pushToast = pushToast;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toast> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Toast", $$slots, []);
    	const click_handler = toast => unshiftToast(toast._id);

    	$$self.$capture_state = () => ({
    		onMount,
    		fly,
    		slide,
    		backOut,
    		toasts,
    		retainMs,
    		toastId,
    		pushToast,
    		unshiftToast,
    		getCurrentTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("toasts" in $$props) $$invalidate(0, toasts = $$props.toasts);
    		if ("retainMs" in $$props) retainMs = $$props.retainMs;
    		if ("toastId" in $$props) toastId = $$props.toastId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toasts, unshiftToast, click_handler];
    }

    class Toast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toast",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\InstrumentCard.svelte generated by Svelte v3.24.1 */
    const file$8 = "src\\components\\InstrumentCard.svelte";

    // (165:6) {#if optionsVisible}
    function create_if_block_6$2(ctx) {
    	let span;
    	let t_value = /*normalizedName*/ ctx[11](/*soundfont*/ ctx[4]) + "";
    	let t;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "soundfont svelte-1p5dau2");
    			add_location(span, file$8, 165, 6, 3607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*soundfont*/ 16) && t_value !== (t_value = /*normalizedName*/ ctx[11](/*soundfont*/ ctx[4]) + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(165:6) {#if optionsVisible}",
    		ctx
    	});

    	return block;
    }

    // (171:4) {#if !optionsVisible}
    function create_if_block_3$3(ctx) {
    	let div;
    	let t;
    	let div_transition;
    	let current;
    	let if_block0 = /*volume*/ ctx[0] > -1 && create_if_block_5$2(ctx);
    	let if_block1 = /*octave*/ ctx[1] != 0 && create_if_block_4$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			set_style(div, "opacity", "0.6");
    			set_style(div, "display", "flex");
    			set_style(div, "align-items", "center");
    			set_style(div, "justify-content", "center");
    			set_style(div, "gap", "4px");
    			add_location(div, file$8, 171, 6, 3756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*volume*/ ctx[0] > -1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*volume*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*octave*/ ctx[1] != 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*octave*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(171:4) {#if !optionsVisible}",
    		ctx
    	});

    	return block;
    }

    // (176:8) {#if volume > -1}
    function create_if_block_5$2(ctx) {
    	let icon;
    	let t0;
    	let span;
    	let t1;
    	let current;

    	icon = new Icon({
    			props: { style: "opacity: 0.5", icon: "volume" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*volTxt*/ ctx[8]);
    			attr_dev(span, "class", "info-txt svelte-1p5dau2");
    			add_location(span, file$8, 177, 10, 3988);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*volTxt*/ 256) set_data_dev(t1, /*volTxt*/ ctx[8]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(176:8) {#if volume > -1}",
    		ctx
    	});

    	return block;
    }

    // (180:8) {#if octave != 0}
    function create_if_block_4$2(ctx) {
    	let icon;
    	let t0;
    	let span;

    	let t1_value = (/*octave*/ ctx[1] == 0
    	? "—"
    	: /*octave*/ ctx[1] > 0
    		? `+${/*octave*/ ctx[1]}`
    		: /*octave*/ ctx[1]) + "";

    	let t1;
    	let current;

    	icon = new Icon({
    			props: {
    				style: "opacity: 0.5; margin-left: 8px",
    				icon: "octaveAdjust"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "info-txt svelte-1p5dau2");
    			add_location(span, file$8, 181, 10, 4159);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*octave*/ 2) && t1_value !== (t1_value = (/*octave*/ ctx[1] == 0
    			? "—"
    			: /*octave*/ ctx[1] > 0
    				? `+${/*octave*/ ctx[1]}`
    				: /*octave*/ ctx[1]) + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(180:8) {#if octave != 0}",
    		ctx
    	});

    	return block;
    }

    // (190:4) {#if $editMode}
    function create_if_block_2$4(ctx) {
    	let div;
    	let button;
    	let div_transition;
    	let current;

    	button = new Button({
    			props: {
    				square: true,
    				inline: true,
    				icon: "delete"
    			},
    			$$inline: true
    		});

    	button.$on("click", /*remove*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			set_style(div, "margin-left", "2px");
    			add_location(div, file$8, 191, 6, 4351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(190:4) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (200:2) {#if optionsVisible && $editMode}
    function create_if_block$5(ctx) {
    	let div1;
    	let slidecontrol0;
    	let updating_value;
    	let t0;
    	let div0;
    	let slidecontrol1;
    	let updating_value_1;
    	let t1;
    	let button;
    	let t2;
    	let div1_transition;
    	let current;

    	function slidecontrol0_value_binding(value) {
    		/*slidecontrol0_value_binding*/ ctx[20].call(null, value);
    	}

    	let slidecontrol0_props = {
    		darker: true,
    		min: "-3",
    		max: "3",
    		step: "1",
    		icon: "octaveAdjust",
    		customValueDisplay: {
    			"0": "—",
    			"1": "+1",
    			"2": "+2",
    			"3": "+3"
    		}
    	};

    	if (/*octave*/ ctx[1] !== void 0) {
    		slidecontrol0_props.value = /*octave*/ ctx[1];
    	}

    	slidecontrol0 = new SlideControl({
    			props: slidecontrol0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol0, "value", slidecontrol0_value_binding));
    	slidecontrol0.$on("change", /*setOctaveShift*/ ctx[13]);

    	function slidecontrol1_value_binding(value) {
    		/*slidecontrol1_value_binding*/ ctx[21].call(null, value);
    	}

    	let slidecontrol1_props = {
    		darker: true,
    		min: "-1",
    		max: "100",
    		step: "1",
    		icon: "volume",
    		customValueDisplay: {
    			"-1": /*absoluteVolume*/ ctx[5] ? "Current" : "Default",
    			"0": "Muted"
    		}
    	};

    	if (/*volume*/ ctx[0] !== void 0) {
    		slidecontrol1_props.value = /*volume*/ ctx[0];
    	}

    	slidecontrol1 = new SlideControl({
    			props: slidecontrol1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol1, "value", slidecontrol1_value_binding));
    	slidecontrol1.$on("change", /*setVolume*/ ctx[12]);

    	button = new Button({
    			props: {
    				inline: true,
    				spaced: true,
    				iconStyle: "opacity: 0.6",
    				icon: "audioOptions",
    				label: /*absoluteVolume*/ ctx[5] ? "% of current" : "Absolute"
    			},
    			$$inline: true
    		});

    	button.$on("click", /*toggleAbsoluteVolume*/ ctx[14]);
    	let if_block = /*$showAdsr*/ ctx[10] && /*$editMode*/ ctx[9] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(slidecontrol0.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(slidecontrol1.$$.fragment);
    			t1 = space();
    			create_component(button.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			set_style(div0, "justify-content", "space-between");
    			add_location(div0, file$8, 212, 6, 4861);
    			attr_dev(div1, "class", "toolbar svelte-1p5dau2");
    			add_location(div1, file$8, 200, 4, 4548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(slidecontrol0, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(slidecontrol1, div0, null);
    			append_dev(div0, t1);
    			mount_component(button, div0, null);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slidecontrol0_changes = {};

    			if (!updating_value && dirty & /*octave*/ 2) {
    				updating_value = true;
    				slidecontrol0_changes.value = /*octave*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidecontrol0.$set(slidecontrol0_changes);
    			const slidecontrol1_changes = {};

    			if (dirty & /*absoluteVolume*/ 32) slidecontrol1_changes.customValueDisplay = {
    				"-1": /*absoluteVolume*/ ctx[5] ? "Current" : "Default",
    				"0": "Muted"
    			};

    			if (!updating_value_1 && dirty & /*volume*/ 1) {
    				updating_value_1 = true;
    				slidecontrol1_changes.value = /*volume*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slidecontrol1.$set(slidecontrol1_changes);
    			const button_changes = {};
    			if (dirty & /*absoluteVolume*/ 32) button_changes.label = /*absoluteVolume*/ ctx[5] ? "% of current" : "Absolute";
    			button.$set(button_changes);

    			if (/*$showAdsr*/ ctx[10] && /*$editMode*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$showAdsr, $editMode*/ 1536) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidecontrol0.$$.fragment, local);
    			transition_in(slidecontrol1.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidecontrol0.$$.fragment, local);
    			transition_out(slidecontrol1.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidecontrol0);
    			destroy_component(slidecontrol1);
    			destroy_component(button);
    			if (if_block) if_block.d();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(200:2) {#if optionsVisible && $editMode}",
    		ctx
    	});

    	return block;
    }

    // (235:6) {#if $showAdsr && $editMode}
    function create_if_block_1$4(ctx) {
    	let slidecontrol0;
    	let updating_value;
    	let t0;
    	let slidecontrol1;
    	let updating_value_1;
    	let t1;
    	let slidecontrol2;
    	let updating_value_2;
    	let t2;
    	let slidecontrol3;
    	let updating_value_3;
    	let current;

    	function slidecontrol0_value_binding_1(value) {
    		/*slidecontrol0_value_binding_1*/ ctx[22].call(null, value);
    	}

    	let slidecontrol0_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: "A",
    		customValueDisplay: { "-0.01": "Default", "0.005": "Default" }
    	};

    	if (/*adsr*/ ctx[2][0] !== void 0) {
    		slidecontrol0_props.value = /*adsr*/ ctx[2][0];
    	}

    	slidecontrol0 = new SlideControl({
    			props: slidecontrol0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol0, "value", slidecontrol0_value_binding_1));
    	slidecontrol0.$on("change", /*setAdsr*/ ctx[15]);

    	function slidecontrol1_value_binding_1(value) {
    		/*slidecontrol1_value_binding_1*/ ctx[23].call(null, value);
    	}

    	let slidecontrol1_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: "D",
    		customValueDisplay: { "-0.01": "Default", "0.395": "Default" }
    	};

    	if (/*adsr*/ ctx[2][1] !== void 0) {
    		slidecontrol1_props.value = /*adsr*/ ctx[2][1];
    	}

    	slidecontrol1 = new SlideControl({
    			props: slidecontrol1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol1, "value", slidecontrol1_value_binding_1));
    	slidecontrol1.$on("change", /*setAdsr*/ ctx[15]);

    	function slidecontrol2_value_binding(value) {
    		/*slidecontrol2_value_binding*/ ctx[24].call(null, value);
    	}

    	let slidecontrol2_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: "S",
    		customValueDisplay: { "-0.01": "Default", "0.8": "Default" }
    	};

    	if (/*adsr*/ ctx[2][2] !== void 0) {
    		slidecontrol2_props.value = /*adsr*/ ctx[2][2];
    	}

    	slidecontrol2 = new SlideControl({
    			props: slidecontrol2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol2, "value", slidecontrol2_value_binding));
    	slidecontrol2.$on("change", /*setAdsr*/ ctx[15]);

    	function slidecontrol3_value_binding(value) {
    		/*slidecontrol3_value_binding*/ ctx[25].call(null, value);
    	}

    	let slidecontrol3_props = {
    		min: -0.01,
    		max: 1,
    		step: 0.01,
    		title: "R",
    		customValueDisplay: { "-0.01": "Default", "1.2": "Default" }
    	};

    	if (/*adsr*/ ctx[2][3] !== void 0) {
    		slidecontrol3_props.value = /*adsr*/ ctx[2][3];
    	}

    	slidecontrol3 = new SlideControl({
    			props: slidecontrol3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(slidecontrol3, "value", slidecontrol3_value_binding));
    	slidecontrol3.$on("change", /*setAdsr*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(slidecontrol0.$$.fragment);
    			t0 = space();
    			create_component(slidecontrol1.$$.fragment);
    			t1 = space();
    			create_component(slidecontrol2.$$.fragment);
    			t2 = space();
    			create_component(slidecontrol3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slidecontrol0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(slidecontrol1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(slidecontrol2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slidecontrol3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slidecontrol0_changes = {};

    			if (!updating_value && dirty & /*adsr*/ 4) {
    				updating_value = true;
    				slidecontrol0_changes.value = /*adsr*/ ctx[2][0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidecontrol0.$set(slidecontrol0_changes);
    			const slidecontrol1_changes = {};

    			if (!updating_value_1 && dirty & /*adsr*/ 4) {
    				updating_value_1 = true;
    				slidecontrol1_changes.value = /*adsr*/ ctx[2][1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slidecontrol1.$set(slidecontrol1_changes);
    			const slidecontrol2_changes = {};

    			if (!updating_value_2 && dirty & /*adsr*/ 4) {
    				updating_value_2 = true;
    				slidecontrol2_changes.value = /*adsr*/ ctx[2][2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slidecontrol2.$set(slidecontrol2_changes);
    			const slidecontrol3_changes = {};

    			if (!updating_value_3 && dirty & /*adsr*/ 4) {
    				updating_value_3 = true;
    				slidecontrol3_changes.value = /*adsr*/ ctx[2][3];
    				add_flush_callback(() => updating_value_3 = false);
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
    			if (detaching) detach_dev(t0);
    			destroy_component(slidecontrol1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(slidecontrol2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(slidecontrol3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(235:6) {#if $showAdsr && $editMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let h4;
    	let t0_value = /*normalizedName*/ ctx[11](/*name*/ ctx[3]) + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*optionsVisible*/ ctx[7] && create_if_block_6$2(ctx);
    	let if_block1 = !/*optionsVisible*/ ctx[7] && create_if_block_3$3(ctx);
    	let if_block2 = /*$editMode*/ ctx[9] && create_if_block_2$4(ctx);
    	let if_block3 = /*optionsVisible*/ ctx[7] && /*$editMode*/ ctx[9] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(h4, "class", "uppercase status svelte-1p5dau2");
    			add_location(h4, file$8, 162, 4, 3512);
    			attr_dev(div0, "class", "row svelte-1p5dau2");
    			add_location(div0, file$8, 161, 2, 3489);
    			attr_dev(div1, "class", "card svelte-1p5dau2");
    			toggle_class(div1, "nohover", /*nohover*/ ctx[6] || !/*$editMode*/ ctx[9]);
    			add_location(div1, file$8, 155, 0, 3287);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			if (if_block0) if_block0.m(h4, null);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div1, t4);
    			if (if_block3) if_block3.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseover", /*mouseover_handler*/ ctx[26], false, false, false),
    					listen_dev(div1, "mouseleave", /*mouseleave_handler*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*name*/ 8) && t0_value !== (t0_value = /*normalizedName*/ ctx[11](/*name*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (/*optionsVisible*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*optionsVisible*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(h4, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*optionsVisible*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*optionsVisible*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$editMode*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$editMode*/ 512) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*optionsVisible*/ ctx[7] && /*$editMode*/ ctx[9]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*optionsVisible, $editMode*/ 640) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$5(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*nohover, $editMode*/ 576) {
    				toggle_class(div1, "nohover", /*nohover*/ ctx[6] || !/*$editMode*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $instrumentSets;
    	let $activeSet;
    	let $editMode;
    	let $showAdsr;
    	validate_store(instrumentSets, "instrumentSets");
    	component_subscribe($$self, instrumentSets, $$value => $$invalidate(28, $instrumentSets = $$value));
    	validate_store(activeSet, "activeSet");
    	component_subscribe($$self, activeSet, $$value => $$invalidate(29, $activeSet = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(9, $editMode = $$value));
    	validate_store(showAdsr, "showAdsr");
    	component_subscribe($$self, showAdsr, $$value => $$invalidate(10, $showAdsr = $$value));
    	let { id } = $$props;
    	let { name } = $$props;
    	let { volume } = $$props;
    	let { octave } = $$props;
    	let { soundfont } = $$props;
    	let { adsr } = $$props;
    	let { absoluteVolume } = $$props;
    	let { nohover = false } = $$props;
    	let { index } = $$props;
    	let { data = null } = $$props;
    	let optionsVisible = false;
    	const dispatch = createEventDispatcher();

    	const normalizedName = name => {
    		name = name.replace(/_/g, " ");
    		return name.charAt(0).toUpperCase() + name.slice(1);
    	};

    	const setVolume = () => {
    		let currentSets = $instrumentSets;
    		currentSets[$activeSet].instruments[index].volume = volume;
    		instrumentSets.set(currentSets);
    	};

    	const setOctaveShift = () => {
    		let currentSets = $instrumentSets;
    		let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);
    		currentSets[$activeSet].instruments[index].octave = octave;
    		instrumentSets.set(currentSets);
    	};

    	const toggleAbsoluteVolume = () => {
    		let currentSets = $instrumentSets;
    		let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);
    		currentSets[$activeSet].instruments[index].absoluteVolume = !currentSets[$activeSet].instruments[index].absoluteVolume;
    		instrumentSets.set(currentSets);
    	};

    	const setAdsr = () => {
    		let currentSets = $instrumentSets;
    		let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);
    		currentSets[$activeSet].instruments[index].adsr = adsr;
    		instrumentSets.set(currentSets);
    	};

    	const remove = () => dispatch("remove");

    	const writable_props = [
    		"id",
    		"name",
    		"volume",
    		"octave",
    		"soundfont",
    		"adsr",
    		"absoluteVolume",
    		"nohover",
    		"index",
    		"data"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InstrumentCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InstrumentCard", $$slots, []);

    	function slidecontrol0_value_binding(value) {
    		octave = value;
    		$$invalidate(1, octave);
    	}

    	function slidecontrol1_value_binding(value) {
    		volume = value;
    		$$invalidate(0, volume);
    	}

    	function slidecontrol0_value_binding_1(value) {
    		adsr[0] = value;
    		$$invalidate(2, adsr);
    	}

    	function slidecontrol1_value_binding_1(value) {
    		adsr[1] = value;
    		$$invalidate(2, adsr);
    	}

    	function slidecontrol2_value_binding(value) {
    		adsr[2] = value;
    		$$invalidate(2, adsr);
    	}

    	function slidecontrol3_value_binding(value) {
    		adsr[3] = value;
    		$$invalidate(2, adsr);
    	}

    	const mouseover_handler = () => $$invalidate(7, optionsVisible = nohover ? false : true);
    	const mouseleave_handler = () => $$invalidate(7, optionsVisible = false);

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(17, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
    		if ("octave" in $$props) $$invalidate(1, octave = $$props.octave);
    		if ("soundfont" in $$props) $$invalidate(4, soundfont = $$props.soundfont);
    		if ("adsr" in $$props) $$invalidate(2, adsr = $$props.adsr);
    		if ("absoluteVolume" in $$props) $$invalidate(5, absoluteVolume = $$props.absoluteVolume);
    		if ("nohover" in $$props) $$invalidate(6, nohover = $$props.nohover);
    		if ("index" in $$props) $$invalidate(18, index = $$props.index);
    		if ("data" in $$props) $$invalidate(19, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		fade,
    		Button,
    		Icon,
    		SlideControl,
    		createEventDispatcher,
    		instrumentSets,
    		activeSet,
    		showAdsr,
    		editMode,
    		id,
    		name,
    		volume,
    		octave,
    		soundfont,
    		adsr,
    		absoluteVolume,
    		nohover,
    		index,
    		data,
    		optionsVisible,
    		dispatch,
    		normalizedName,
    		setVolume,
    		setOctaveShift,
    		toggleAbsoluteVolume,
    		setAdsr,
    		remove,
    		volTxt,
    		$instrumentSets,
    		$activeSet,
    		$editMode,
    		$showAdsr
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(17, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
    		if ("octave" in $$props) $$invalidate(1, octave = $$props.octave);
    		if ("soundfont" in $$props) $$invalidate(4, soundfont = $$props.soundfont);
    		if ("adsr" in $$props) $$invalidate(2, adsr = $$props.adsr);
    		if ("absoluteVolume" in $$props) $$invalidate(5, absoluteVolume = $$props.absoluteVolume);
    		if ("nohover" in $$props) $$invalidate(6, nohover = $$props.nohover);
    		if ("index" in $$props) $$invalidate(18, index = $$props.index);
    		if ("data" in $$props) $$invalidate(19, data = $$props.data);
    		if ("optionsVisible" in $$props) $$invalidate(7, optionsVisible = $$props.optionsVisible);
    		if ("volTxt" in $$props) $$invalidate(8, volTxt = $$props.volTxt);
    	};

    	let volTxt;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*volume, absoluteVolume*/ 33) {
    			 $$invalidate(8, volTxt = volume > -1
    			? volume < 1
    				? "Muted"
    				: `${volume}${absoluteVolume ? "%" : ""}`
    			: "Custom volume not set");
    		}
    	};

    	return [
    		volume,
    		octave,
    		adsr,
    		name,
    		soundfont,
    		absoluteVolume,
    		nohover,
    		optionsVisible,
    		volTxt,
    		$editMode,
    		$showAdsr,
    		normalizedName,
    		setVolume,
    		setOctaveShift,
    		toggleAbsoluteVolume,
    		setAdsr,
    		remove,
    		id,
    		index,
    		data,
    		slidecontrol0_value_binding,
    		slidecontrol1_value_binding,
    		slidecontrol0_value_binding_1,
    		slidecontrol1_value_binding_1,
    		slidecontrol2_value_binding,
    		slidecontrol3_value_binding,
    		mouseover_handler,
    		mouseleave_handler
    	];
    }

    class InstrumentCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			id: 17,
    			name: 3,
    			volume: 0,
    			octave: 1,
    			soundfont: 4,
    			adsr: 2,
    			absoluteVolume: 5,
    			nohover: 6,
    			index: 18,
    			data: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstrumentCard",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[17] === undefined && !("id" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'name'");
    		}

    		if (/*volume*/ ctx[0] === undefined && !("volume" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'volume'");
    		}

    		if (/*octave*/ ctx[1] === undefined && !("octave" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'octave'");
    		}

    		if (/*soundfont*/ ctx[4] === undefined && !("soundfont" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'soundfont'");
    		}

    		if (/*adsr*/ ctx[2] === undefined && !("adsr" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'adsr'");
    		}

    		if (/*absoluteVolume*/ ctx[5] === undefined && !("absoluteVolume" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'absoluteVolume'");
    		}

    		if (/*index*/ ctx[18] === undefined && !("index" in props)) {
    			console.warn("<InstrumentCard> was created without expected prop 'index'");
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

    	get nohover() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nohover(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<InstrumentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<InstrumentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\InstrumentAdder.svelte generated by Svelte v3.24.1 */
    const file$9 = "src\\components\\InstrumentAdder.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (64:2) {#each availableInstruments as instrument (instrument)}
    function create_each_block$4(key_1, ctx) {
    	let option;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			option.__value = option_value_value = normalizeInstrumentName(/*instrument*/ ctx[8]);
    			option.value = option.__value;
    			add_location(option, file$9, 64, 4, 1704);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*availableInstruments*/ 1 && option_value_value !== (option_value_value = normalizeInstrumentName(/*instrument*/ ctx[8]))) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(64:2) {#each availableInstruments as instrument (instrument)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let input;
    	let t0;
    	let datalist;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let toast;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*availableInstruments*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*instrument*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			datalist = element("datalist");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(toast.$$.fragment);
    			attr_dev(input, "placeholder", "Add instrument");
    			attr_dev(input, "list", "instruments");
    			attr_dev(input, "class", "svelte-b06ib4");
    			add_location(input, file$9, 56, 0, 1514);
    			attr_dev(datalist, "id", "instruments");
    			add_location(datalist, file$9, 62, 0, 1612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, datalist, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(datalist, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(toast, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*handleKeyPress*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*normalizeInstrumentName, availableInstruments*/ 1) {
    				const each_value = /*availableInstruments*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, datalist, destroy_block, create_each_block$4, null, get_each_context$4);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(datalist);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t1);
    			destroy_component(toast, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function normalizeInstrumentName(input) {
    	input = input.replace(/_/g, " ");
    	return input.charAt(0).toUpperCase() + input.slice(1);
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentSoundFont;
    	let $instrumentSets;
    	let $activeSet;
    	validate_store(currentSoundFont, "currentSoundFont");
    	component_subscribe($$self, currentSoundFont, $$value => $$invalidate(2, $currentSoundFont = $$value));
    	validate_store(instrumentSets, "instrumentSets");
    	component_subscribe($$self, instrumentSets, $$value => $$invalidate(3, $instrumentSets = $$value));
    	validate_store(activeSet, "activeSet");
    	component_subscribe($$self, activeSet, $$value => $$invalidate(4, $activeSet = $$value));
    	let { availableInstruments = [] } = $$props;

    	const denormalizeInstrumentName = input => {
    		input = input.replace(/ /g, "_");
    		return input.charAt(0).toLowerCase() + input.slice(1);
    	};

    	const getRandomId = () => Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);

    	const addInstrument = selectedInstrument => {
    		if (selectedInstrument == null) return;
    		let instrumentData = Soundfont.instrument(ac, selectedInstrument, { soundfont: $currentSoundFont });

    		let newInstr = {
    			id: getRandomId(),
    			name: selectedInstrument,
    			volume: -1,
    			octave: 0,
    			absoluteVolume: true,
    			data: instrumentData,
    			soundfont: $currentSoundFont,
    			adsr: [-0.01, -0.01, -0.01, -0.01]
    		};

    		$instrumentSets[$activeSet].instruments.push(newInstr);
    		instrumentSets.set([...$instrumentSets]);
    	};

    	const handleKeyPress = event => {
    		event.preventDefault();
    		const pickedInstrument = denormalizeInstrumentName(event.target.value);

    		if (availableInstruments.includes(pickedInstrument)) {
    			addInstrument(pickedInstrument);
    		}

    		event.target.value = "";
    	};

    	const writable_props = ["availableInstruments"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InstrumentAdder> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InstrumentAdder", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("availableInstruments" in $$props) $$invalidate(0, availableInstruments = $$props.availableInstruments);
    	};

    	$$self.$capture_state = () => ({
    		Toast,
    		currentSoundFont,
    		instrumentSets,
    		ac,
    		activeSet,
    		availableInstruments,
    		normalizeInstrumentName,
    		denormalizeInstrumentName,
    		getRandomId,
    		addInstrument,
    		handleKeyPress,
    		$currentSoundFont,
    		$instrumentSets,
    		$activeSet
    	});

    	$$self.$inject_state = $$props => {
    		if ("availableInstruments" in $$props) $$invalidate(0, availableInstruments = $$props.availableInstruments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [availableInstruments, handleKeyPress];
    }

    class InstrumentAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { availableInstruments: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstrumentAdder",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get availableInstruments() {
    		throw new Error("<InstrumentAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set availableInstruments(value) {
    		throw new Error("<InstrumentAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SetEditor.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$a = "src\\components\\SetEditor.svelte";

    // (111:2) {#if $instrumentSets[$activeSet] != null}
    function create_if_block$6(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let instrumentadder;
    	let t3;
    	let draganddroplist;
    	let current;
    	let if_block = /*$editMode*/ ctx[6] && create_if_block_1$5(ctx);

    	instrumentadder = new InstrumentAdder({
    			props: {
    				availableInstruments: /*availableInstruments*/ ctx[1]
    			},
    			$$inline: true
    		});

    	draganddroplist = new DragAndDropList({
    			props: {
    				list: /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].instruments,
    				canReroder: /*$isReordering*/ ctx[4],
    				column: true,
    				update: /*update*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ item, index }) => ({ 19: item, 20: index }),
    						({ item, index }) => (item ? 524288 : 0) | (index ? 1048576 : 0)
    					],
    					error: [
    						create_error_slot,
    						({ item, index }) => ({ 19: item, 20: index }),
    						({ item, index }) => (item ? 524288 : 0) | (index ? 1048576 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(instrumentadder.$$.fragment);
    			t3 = space();
    			create_component(draganddroplist.$$.fragment);
    			attr_dev(h4, "class", "svelte-1tg3z8f");
    			add_location(h4, file$a, 112, 6, 3102);
    			attr_dev(div, "class", "title-flex svelte-1tg3z8f");
    			add_location(div, file$a, 111, 4, 3070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			insert_dev(target, t2, anchor);
    			mount_component(instrumentadder, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(draganddroplist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$instrumentSets, $activeSet*/ 12) && t0_value !== (t0_value = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].name + "")) set_data_dev(t0, t0_value);

    			if (/*$editMode*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$editMode*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const instrumentadder_changes = {};
    			if (dirty & /*availableInstruments*/ 2) instrumentadder_changes.availableInstruments = /*availableInstruments*/ ctx[1];
    			instrumentadder.$set(instrumentadder_changes);
    			const draganddroplist_changes = {};
    			if (dirty & /*$instrumentSets, $activeSet*/ 12) draganddroplist_changes.list = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].instruments;
    			if (dirty & /*$isReordering*/ 16) draganddroplist_changes.canReroder = /*$isReordering*/ ctx[4];

    			if (dirty & /*$$scope, item, index, $isReordering*/ 3670032) {
    				draganddroplist_changes.$$scope = { dirty, ctx };
    			}

    			draganddroplist.$set(draganddroplist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(instrumentadder.$$.fragment, local);
    			transition_in(draganddroplist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(instrumentadder.$$.fragment, local);
    			transition_out(draganddroplist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t2);
    			destroy_component(instrumentadder, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(draganddroplist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(111:2) {#if $instrumentSets[$activeSet] != null}",
    		ctx
    	});

    	return block;
    }

    // (114:6) {#if $editMode}
    function create_if_block_1$5(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let t2;
    	let button3;
    	let div_transition;
    	let current;

    	button0 = new Button({
    			props: { outline: true, label: "Rename" },
    			$$inline: true
    		});

    	button0.$on("click", /*renameSet*/ ctx[12]);

    	button1 = new Button({
    			props: {
    				outline: true,
    				toggled: /*$showAdsr*/ ctx[5],
    				tooltip: "ADSR controls",
    				icon: "adsr"
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*switchAdsrOpt*/ ctx[11]);

    	button2 = new Button({
    			props: {
    				toggled: /*$isReordering*/ ctx[4],
    				tooltip: "Reorder",
    				icon: "reorder"
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*toggleReorder*/ ctx[8]);

    	button3 = new Button({
    			props: {
    				icon: "delete",
    				tooltip: "Delete set",
    				disabled: /*$instrumentSets*/ ctx[2].length < 2
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*click_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    			t2 = space();
    			create_component(button3.$$.fragment);
    			attr_dev(div, "class", "control-flex svelte-1tg3z8f");
    			add_location(div, file$a, 114, 8, 3178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t0);
    			mount_component(button1, div, null);
    			append_dev(div, t1);
    			mount_component(button2, div, null);
    			append_dev(div, t2);
    			mount_component(button3, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button1_changes = {};
    			if (dirty & /*$showAdsr*/ 32) button1_changes.toggled = /*$showAdsr*/ ctx[5];
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*$isReordering*/ 16) button2_changes.toggled = /*$isReordering*/ ctx[4];
    			button2.$set(button2_changes);
    			const button3_changes = {};
    			if (dirty & /*$instrumentSets*/ 4) button3_changes.disabled = /*$instrumentSets*/ ctx[2].length < 2;
    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(114:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (163:6) <p slot="error" style="font-size: 0.8rem;padding:0 var(--padding)">
    function create_error_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No instruments in this set";
    			attr_dev(p, "slot", "error");
    			set_style(p, "font-size", "0.8rem");
    			set_style(p, "padding", "0 var(--padding)");
    			add_location(p, file$a, 162, 6, 4319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_error_slot.name,
    		type: "slot",
    		source: "(163:6) <p slot=\\\"error\\\" style=\\\"font-size: 0.8rem;padding:0 var(--padding)\\\">",
    		ctx
    	});

    	return block;
    }

    // (148:4) <DragAndDropList        list={$instrumentSets[$activeSet].instruments}        canReroder={$isReordering}        let:item        let:index        column        {update}      >
    function create_default_slot(ctx) {
    	let instrumentcard;
    	let t;
    	let current;

    	const instrumentcard_spread_levels = [
    		/*item*/ ctx[19],
    		{ index: /*index*/ ctx[20] },
    		{ nohover: /*$isReordering*/ ctx[4] }
    	];

    	function remove_handler(...args) {
    		return /*remove_handler*/ ctx[14](/*index*/ ctx[20], ...args);
    	}

    	let instrumentcard_props = {};

    	for (let i = 0; i < instrumentcard_spread_levels.length; i += 1) {
    		instrumentcard_props = assign(instrumentcard_props, instrumentcard_spread_levels[i]);
    	}

    	instrumentcard = new InstrumentCard({
    			props: instrumentcard_props,
    			$$inline: true
    		});

    	instrumentcard.$on("remove", remove_handler);

    	const block = {
    		c: function create() {
    			create_component(instrumentcard.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(instrumentcard, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const instrumentcard_changes = (dirty & /*item, index, $isReordering*/ 1572880)
    			? get_spread_update(instrumentcard_spread_levels, [
    					dirty & /*item*/ 524288 && get_spread_object(/*item*/ ctx[19]),
    					dirty & /*index*/ 1048576 && { index: /*index*/ ctx[20] },
    					dirty & /*$isReordering*/ 16 && { nohover: /*$isReordering*/ ctx[4] }
    				])
    			: {};

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
    			destroy_component(instrumentcard, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(148:4) <DragAndDropList        list={$instrumentSets[$activeSet].instruments}        canReroder={$isReordering}        let:item        let:index        column        {update}      >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div0;
    	let t0;
    	let dialog;
    	let h4;
    	let t1;
    	let t2_value = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].name + "";
    	let t2;
    	let t3;
    	let div1;
    	let button0;
    	let t4;
    	let button1;
    	let t5;
    	let toast;
    	let current;
    	let if_block = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]] != null && create_if_block$6(ctx);

    	button0 = new Button({
    			props: { outline: true, label: "No" },
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler_1*/ ctx[15]);
    	button1 = new Button({ props: { label: "Yes" }, $$inline: true });
    	button1.$on("click", /*deleteSet*/ ctx[10]);
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			dialog = element("dialog");
    			h4 = element("h4");
    			t1 = text("Do you want to delete ");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			t5 = space();
    			create_component(toast.$$.fragment);
    			attr_dev(div0, "class", "container svelte-1tg3z8f");
    			add_location(div0, file$a, 109, 0, 2996);
    			attr_dev(h4, "class", "svelte-1tg3z8f");
    			add_location(h4, file$a, 170, 2, 4516);
    			attr_dev(div1, "class", "actions");
    			add_location(div1, file$a, 172, 2, 4587);
    			add_location(dialog, file$a, 169, 0, 4479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, dialog, anchor);
    			append_dev(dialog, h4);
    			append_dev(h4, t1);
    			append_dev(h4, t2);
    			append_dev(dialog, t3);
    			append_dev(dialog, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t4);
    			mount_component(button1, div1, null);
    			/*dialog_binding*/ ctx[16](dialog);
    			insert_dev(target, t5, anchor);
    			mount_component(toast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$instrumentSets, $activeSet*/ 12) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$instrumentSets, $activeSet*/ 12) && t2_value !== (t2_value = /*$instrumentSets*/ ctx[2][/*$activeSet*/ ctx[3]].name + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(dialog);
    			destroy_component(button0);
    			destroy_component(button1);
    			/*dialog_binding*/ ctx[16](null);
    			if (detaching) detach_dev(t5);
    			destroy_component(toast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $currentSoundFont;
    	let $instrumentSets;
    	let $activeSet;
    	let $isReordering;
    	let $showAdsr;
    	let $editMode;
    	validate_store(currentSoundFont, "currentSoundFont");
    	component_subscribe($$self, currentSoundFont, $$value => $$invalidate(17, $currentSoundFont = $$value));
    	validate_store(instrumentSets, "instrumentSets");
    	component_subscribe($$self, instrumentSets, $$value => $$invalidate(2, $instrumentSets = $$value));
    	validate_store(activeSet, "activeSet");
    	component_subscribe($$self, activeSet, $$value => $$invalidate(3, $activeSet = $$value));
    	validate_store(isReordering, "isReordering");
    	component_subscribe($$self, isReordering, $$value => $$invalidate(4, $isReordering = $$value));
    	validate_store(showAdsr, "showAdsr");
    	component_subscribe($$self, showAdsr, $$value => $$invalidate(5, $showAdsr = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(6, $editMode = $$value));
    	let deleteDialog;
    	let availableInstruments = [];

    	const getInstruments = async () => {
    		try {
    			let data = await fetch(`https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`);
    			$$invalidate(1, availableInstruments = await data.json());
    		} catch(error) {
    			// window.popToast("Error loading instruments: " + error.message);
    			console.log("Error loading instruments: " + error.message);
    		}
    	};

    	getInstruments();

    	const update = (from, to) => {
    		let newList = [...$instrumentSets[$activeSet].instruments];
    		newList[from] = [newList[to], newList[to] = newList[from]][0];
    		set_store_value(instrumentSets, $instrumentSets[$activeSet].instruments = [...newList], $instrumentSets);
    		instrumentSets.set($instrumentSets);
    	};

    	const toggleReorder = () => {
    		isReordering.set(!$isReordering);
    		window.pushToast("Reordering " + ($isReordering ? "on" : "off"));
    	};

    	onMount(() => {
    		if ($instrumentSets[$activeSet] == null || $instrumentSets[$activeSet] == undefined) {
    			activeSet.set(0);
    		}
    	});

    	afterUpdate(() => {
    		if ($instrumentSets[$activeSet] == null || $instrumentSets[$activeSet] == undefined) {
    			activeSet.set(0);
    		}
    	});

    	const removeInstrument = index => {
    		let currentInstruments = [...$instrumentSets[$activeSet].instruments];
    		currentInstruments.splice(index, 1);
    		set_store_value(instrumentSets, $instrumentSets[$activeSet].instruments = [...currentInstruments], $instrumentSets);
    		instrumentSets.set([...$instrumentSets]);
    		instrumentSets.set($instrumentSets);
    		activeSet.set($activeSet);
    	};

    	const deleteSet = event => {
    		const i = $activeSet;
    		const name = $instrumentSets[$activeSet].name;
    		event.preventDefault();
    		event.stopPropagation();
    		let newSets = [...$instrumentSets];
    		newSets.splice(i, 1);
    		instrumentSets.set(newSets);

    		if (newSets.length < 2) {
    			activeSet.set(0);
    		}

    		if ($activeSet >= newSets.length) {
    			activeSet.set(newSets.length - 1);
    		}

    		deleteDialog.close();
    		window.pushToast("Removed <i>" + name + "</i>");
    	};

    	const switchAdsrOpt = () => {
    		let curr = $showAdsr;
    		showAdsr.set(!curr);
    	};

    	const renameSet = () => {
    		let name = prompt("New name");

    		if (name != null && name.toString().length > 1) {
    			set_store_value(instrumentSets, $instrumentSets[$activeSet].name = name.toString(), $instrumentSets);
    			instrumentSets.set($instrumentSets); // force an update
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<SetEditor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SetEditor", $$slots, []);
    	const click_handler = () => deleteDialog.showModal();
    	const remove_handler = index => removeInstrument(index);
    	const click_handler_1 = () => deleteDialog.close();

    	function dialog_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			deleteDialog = $$value;
    			$$invalidate(0, deleteDialog);
    		});
    	}

    	$$self.$capture_state = () => ({
    		activeSet,
    		instrumentSets,
    		editMode,
    		isReordering,
    		currentSoundFont,
    		showAdsr,
    		InstrumentCard,
    		InstrumentAdder,
    		DragAndDropList,
    		Button,
    		Toast,
    		slide,
    		onMount,
    		afterUpdate,
    		deleteDialog,
    		availableInstruments,
    		getInstruments,
    		update,
    		toggleReorder,
    		removeInstrument,
    		deleteSet,
    		switchAdsrOpt,
    		renameSet,
    		$currentSoundFont,
    		$instrumentSets,
    		$activeSet,
    		$isReordering,
    		$showAdsr,
    		$editMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("deleteDialog" in $$props) $$invalidate(0, deleteDialog = $$props.deleteDialog);
    		if ("availableInstruments" in $$props) $$invalidate(1, availableInstruments = $$props.availableInstruments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		deleteDialog,
    		availableInstruments,
    		$instrumentSets,
    		$activeSet,
    		$isReordering,
    		$showAdsr,
    		$editMode,
    		update,
    		toggleReorder,
    		removeInstrument,
    		deleteSet,
    		switchAdsrOpt,
    		renameSet,
    		click_handler,
    		remove_handler,
    		click_handler_1,
    		dialog_binding
    	];
    }

    class SetEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetEditor",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\SetListItem.svelte generated by Svelte v3.24.1 */
    const file$b = "src\\components\\SetListItem.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (50:2) {:else}
    function create_else_block$2(ctx) {
    	let span;

    	let t_value = (/*i*/ ctx[1] + 1 < 10
    	? /*i*/ ctx[1] + 1
    	: /*i*/ ctx[1] >= 10 ? "" : 0) + "";

    	let t;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "kbdkey svelte-yp7wir");
    			attr_dev(span, "style", span_style_value = /*i*/ ctx[1] >= 10 ? "visibility:hidden" : "");
    			add_location(span, file$b, 50, 4, 1322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 2 && t_value !== (t_value = (/*i*/ ctx[1] + 1 < 10
    			? /*i*/ ctx[1] + 1
    			: /*i*/ ctx[1] >= 10 ? "" : 0) + "")) set_data_dev(t, t_value);

    			if (dirty & /*i*/ 2 && span_style_value !== (span_style_value = /*i*/ ctx[1] >= 10 ? "visibility:hidden" : "")) {
    				attr_dev(span, "style", span_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(50:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if $editMode}
    function create_if_block_2$5(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "edit" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(48:2) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if set.instruments.length > 0 && !$editMode}
    function create_if_block_1$6(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let ul_transition;
    	let current;
    	let each_value = /*set*/ ctx[0].instruments;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*i*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-yp7wir");
    			add_location(ul, file$b, 57, 4, 1556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*normalizedName, set*/ 65) {
    				const each_value = /*set*/ ctx[0].instruments;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$5, null, get_each_context$5);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && ul_transition) ul_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(57:2) {#if set.instruments.length > 0 && !$editMode}",
    		ctx
    	});

    	return block;
    }

    // (59:6) {#each set.instruments as i (i.id)}
    function create_each_block$5(key_1, ctx) {
    	let li;
    	let span;
    	let t0_value = /*normalizedName*/ ctx[6](/*i*/ ctx[1].name) + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$b, 60, 10, 1646);
    			attr_dev(li, "class", "svelte-yp7wir");
    			add_location(li, file$b, 59, 8, 1630);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*set*/ 1 && t0_value !== (t0_value = /*normalizedName*/ ctx[6](/*i*/ ctx[1].name) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(59:6) {#each set.instruments as i (i.id)}",
    		ctx
    	});

    	return block;
    }

    // (66:2) {#if $editMode}
    function create_if_block$7(ctx) {
    	let ul;
    	let li;
    	let span;
    	let t0_value = /*set*/ ctx[0].instruments.length + "";
    	let t0;
    	let t1;
    	let t2_value = (/*set*/ ctx[0].instruments.length != 1 ? "s" : "") + "";
    	let t2;
    	let ul_transition;
    	let current;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" instrument");
    			t2 = text(t2_value);
    			add_location(span, file$b, 68, 8, 1825);
    			attr_dev(li, "class", "svelte-yp7wir");
    			add_location(li, file$b, 67, 6, 1811);
    			set_style(ul, "grid-area", "list");
    			attr_dev(ul, "class", "svelte-yp7wir");
    			add_location(ul, file$b, 66, 4, 1758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*set*/ 1) && t0_value !== (t0_value = /*set*/ ctx[0].instruments.length + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*set*/ 1) && t2_value !== (t2_value = (/*set*/ ctx[0].instruments.length != 1 ? "s" : "") + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching && ul_transition) ul_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(66:2) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (90:6) <Button outline on:click={switchSf}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*$currentSoundFont*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentSoundFont*/ 8) set_data_dev(t, /*$currentSoundFont*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(90:6) <Button outline on:click={switchSf}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let span0;
    	let t1_value = /*set*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let dialog;
    	let seteditor;
    	let t5;
    	let div3;
    	let div1;
    	let span1;
    	let t7;
    	let button0;
    	let t8;
    	let div2;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_2$5, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$editMode*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*set*/ ctx[0].instruments.length > 0 && !/*$editMode*/ ctx[5] && create_if_block_1$6(ctx);
    	let if_block2 = /*$editMode*/ ctx[5] && create_if_block$7(ctx);
    	seteditor = new SetEditor({ $$inline: true });

    	button0 = new Button({
    			props: {
    				outline: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*switchSf*/ ctx[7]);

    	button1 = new Button({
    			props: { label: "Close" },
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			dialog = element("dialog");
    			create_component(seteditor.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Soundfont";
    			t7 = space();
    			create_component(button0.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			create_component(button1.$$.fragment);
    			attr_dev(span0, "class", "setname svelte-yp7wir");
    			add_location(span0, file$b, 54, 2, 1459);
    			attr_dev(div0, "class", "flex svelte-yp7wir");
    			toggle_class(div0, "active", /*$activeSet*/ ctx[4] === /*i*/ ctx[1] && !/*$editMode*/ ctx[5]);
    			toggle_class(div0, "disabled", /*set*/ ctx[0].instruments.length < 1 && !/*$editMode*/ ctx[5]);
    			toggle_class(div0, "editing", /*$editMode*/ ctx[5]);
    			add_location(div0, file$b, 40, 0, 1028);
    			set_style(span1, "font-size", "0.6rem");
    			set_style(span1, "text-transform", "uppercase");
    			set_style(span1, "letter-spacing", "0.5px");
    			set_style(span1, "opacity", "0.6");
    			add_location(span1, file$b, 85, 6, 2241);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "column");
    			set_style(div1, "gap", "0.2rem");
    			set_style(div1, "margin-right", "auto");
    			set_style(div1, "align-items", "center");
    			set_style(div1, "justify-content", "center");
    			add_location(div1, file$b, 82, 4, 2090);
    			set_style(div2, "margin-top", "auto");
    			add_location(div2, file$b, 91, 4, 2471);
    			attr_dev(div3, "class", "actions");
    			add_location(div3, file$b, 81, 2, 2063);
    			add_location(dialog, file$b, 78, 0, 2006);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block2) if_block2.m(div0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, dialog, anchor);
    			mount_component(seteditor, dialog, null);
    			append_dev(dialog, t5);
    			append_dev(dialog, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t7);
    			mount_component(button0, div1, null);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			mount_component(button1, div2, null);
    			/*dialog_binding*/ ctx[11](dialog);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t0);
    			}

    			if ((!current || dirty & /*set*/ 1) && t1_value !== (t1_value = /*set*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (/*set*/ ctx[0].instruments.length > 0 && !/*$editMode*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*set, $editMode*/ 33) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$editMode*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$editMode*/ 32) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$7(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*$activeSet, i, $editMode*/ 50) {
    				toggle_class(div0, "active", /*$activeSet*/ ctx[4] === /*i*/ ctx[1] && !/*$editMode*/ ctx[5]);
    			}

    			if (dirty & /*set, $editMode*/ 33) {
    				toggle_class(div0, "disabled", /*set*/ ctx[0].instruments.length < 1 && !/*$editMode*/ ctx[5]);
    			}

    			if (dirty & /*$editMode*/ 32) {
    				toggle_class(div0, "editing", /*$editMode*/ ctx[5]);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope, $currentSoundFont*/ 16392) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(seteditor.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(seteditor.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(dialog);
    			destroy_component(seteditor);
    			destroy_component(button0);
    			destroy_component(button1);
    			/*dialog_binding*/ ctx[11](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $currentSoundFont;
    	let $activeSet;
    	let $editMode;
    	validate_store(currentSoundFont, "currentSoundFont");
    	component_subscribe($$self, currentSoundFont, $$value => $$invalidate(3, $currentSoundFont = $$value));
    	validate_store(activeSet, "activeSet");
    	component_subscribe($$self, activeSet, $$value => $$invalidate(4, $activeSet = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(5, $editMode = $$value));
    	let { set } = $$props;
    	let { i } = $$props;

    	const normalizedName = name => {
    		name = name.replace(/_/g, " ");
    		return name.charAt(0).toUpperCase() + name.slice(1);
    	};

    	const switchSf = () => {
    		let curr = $currentSoundFont;
    		if (curr == soundFont.fluid) currentSoundFont.set(soundFont.mk);
    		if (curr == soundFont.mk) currentSoundFont.set(soundFont.fatboy);
    		if (curr == soundFont.fatboy) currentSoundFont.set(soundFont.fluid);
    	};

    	const showEditDialog = () => {
    		activeSet.set(i);
    		setEditDialog.showModal();

    		setEditDialog.addEventListener("click", e => {
    			if (e.target == setEditDialog) {
    				setEditDialog.close();
    			}
    		});
    	};

    	let setEditDialog;
    	const writable_props = ["set", "i"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SetListItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SetListItem", $$slots, []);
    	const click_handler = () => $editMode ? showEditDialog() : activeSet.set(i);
    	const click_handler_1 = () => setEditDialog.close();

    	function dialog_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			setEditDialog = $$value;
    			$$invalidate(2, setEditDialog);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("set" in $$props) $$invalidate(0, set = $$props.set);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    	};

    	$$self.$capture_state = () => ({
    		activeSet,
    		editMode,
    		soundFont,
    		currentSoundFont,
    		set,
    		i,
    		Button,
    		SetEditor,
    		Icon,
    		slide,
    		fade,
    		scale,
    		normalizedName,
    		switchSf,
    		showEditDialog,
    		setEditDialog,
    		$currentSoundFont,
    		$activeSet,
    		$editMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("set" in $$props) $$invalidate(0, set = $$props.set);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    		if ("setEditDialog" in $$props) $$invalidate(2, setEditDialog = $$props.setEditDialog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		set,
    		i,
    		setEditDialog,
    		$currentSoundFont,
    		$activeSet,
    		$editMode,
    		normalizedName,
    		switchSf,
    		showEditDialog,
    		click_handler,
    		click_handler_1,
    		dialog_binding
    	];
    }

    class SetListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { set: 0, i: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetListItem",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*set*/ ctx[0] === undefined && !("set" in props)) {
    			console.warn("<SetListItem> was created without expected prop 'set'");
    		}

    		if (/*i*/ ctx[1] === undefined && !("i" in props)) {
    			console.warn("<SetListItem> was created without expected prop 'i'");
    		}
    	}

    	get set() {
    		throw new Error("<SetListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set set(value) {
    		throw new Error("<SetListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<SetListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<SetListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SetList.svelte generated by Svelte v3.24.1 */
    const file$c = "src\\components\\SetList.svelte";

    // (78:2) {#if $editMode}
    function create_if_block$8(ctx) {
    	let div1;
    	let h4;
    	let t1;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let t3;
    	let button2;
    	let t4;
    	let button3;
    	let div1_transition;
    	let current;

    	button0 = new Button({
    			props: {
    				toggled: /*$isReordering*/ ctx[1],
    				label: "Reorder",
    				icon: "reorder"
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*toggleReorder*/ ctx[7]);

    	button1 = new Button({
    			props: { label: "Export", icon: "save" },
    			$$inline: true
    		});

    	button1.$on("click", /*downloadObjectAsJson*/ ctx[4]);

    	button2 = new Button({
    			props: { label: "Import", icon: "open" },
    			$$inline: true
    		});

    	button2.$on("click", /*restore*/ ctx[5]);

    	button3 = new Button({
    			props: { label: "Add set", icon: "add3" },
    			$$inline: true
    		});

    	button3.$on("click", /*addSet*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Edit mode";
    			t1 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			t3 = space();
    			create_component(button2.$$.fragment);
    			t4 = space();
    			create_component(button3.$$.fragment);
    			attr_dev(h4, "class", "svelte-uckx0q");
    			add_location(h4, file$c, 79, 6, 2170);
    			set_style(div0, "display", "flex");
    			set_style(div0, "gap", "4px");
    			add_location(div0, file$c, 80, 6, 2196);
    			attr_dev(div1, "class", "title-flex svelte-uckx0q");
    			add_location(div1, file$c, 78, 4, 2121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t2);
    			mount_component(button1, div0, null);
    			append_dev(div0, t3);
    			mount_component(button2, div0, null);
    			append_dev(div0, t4);
    			mount_component(button3, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*$isReordering*/ 2) button0_changes.toggled = /*$isReordering*/ ctx[1];
    			button0.$set(button0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(78:2) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    // (106:4) <p slot="error">
    function create_error_slot$1(ctx) {
    	let p;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("No instrument sets.\r\n      ");
    			br = element("br");
    			t1 = text("\r\n      This is an error.");
    			add_location(br, file$c, 107, 6, 2920);
    			attr_dev(p, "slot", "error");
    			add_location(p, file$c, 105, 4, 2869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_error_slot$1.name,
    		type: "slot",
    		source: "(106:4) <p slot=\\\"error\\\">",
    		ctx
    	});

    	return block;
    }

    // (95:2) <DragAndDropList      bind:list={$instrumentSets}      canReroder={$isReordering}      let:item={set}      let:index={i}      wrap={!$isReordering}      column={$isReordering}      {update}    >
    function create_default_slot$2(ctx) {
    	let setlistitem;
    	let t;
    	let current;

    	setlistitem = new SetListItem({
    			props: { set: /*set*/ ctx[9], i: /*i*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(setlistitem.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(setlistitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const setlistitem_changes = {};
    			if (dirty & /*set*/ 512) setlistitem_changes.set = /*set*/ ctx[9];
    			if (dirty & /*i*/ 1024) setlistitem_changes.i = /*i*/ ctx[10];
    			setlistitem.$set(setlistitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(setlistitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(setlistitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(setlistitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(95:2) <DragAndDropList      bind:list={$instrumentSets}      canReroder={$isReordering}      let:item={set}      let:index={i}      wrap={!$isReordering}      column={$isReordering}      {update}    >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let draganddroplist;
    	let updating_list;
    	let t1;
    	let toast;
    	let current;
    	let if_block = /*$editMode*/ ctx[2] && create_if_block$8(ctx);

    	function draganddroplist_list_binding(value) {
    		/*draganddroplist_list_binding*/ ctx[8].call(null, value);
    	}

    	let draganddroplist_props = {
    		canReroder: /*$isReordering*/ ctx[1],
    		wrap: !/*$isReordering*/ ctx[1],
    		column: /*$isReordering*/ ctx[1],
    		update: /*update*/ ctx[6],
    		$$slots: {
    			default: [
    				create_default_slot$2,
    				({ item: set, index: i }) => ({ 9: set, 10: i }),
    				({ item: set, index: i }) => (set ? 512 : 0) | (i ? 1024 : 0)
    			],
    			error: [
    				create_error_slot$1,
    				({ item: set, index: i }) => ({ 9: set, 10: i }),
    				({ item: set, index: i }) => (set ? 512 : 0) | (i ? 1024 : 0)
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*$instrumentSets*/ ctx[0] !== void 0) {
    		draganddroplist_props.list = /*$instrumentSets*/ ctx[0];
    	}

    	draganddroplist = new DragAndDropList({
    			props: draganddroplist_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(draganddroplist, "list", draganddroplist_list_binding));
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(draganddroplist.$$.fragment);
    			t1 = space();
    			create_component(toast.$$.fragment);
    			attr_dev(div, "class", "container svelte-uckx0q");
    			add_location(div, file$c, 76, 0, 2073);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			mount_component(draganddroplist, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(toast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$editMode*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$editMode*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const draganddroplist_changes = {};
    			if (dirty & /*$isReordering*/ 2) draganddroplist_changes.canReroder = /*$isReordering*/ ctx[1];
    			if (dirty & /*$isReordering*/ 2) draganddroplist_changes.wrap = !/*$isReordering*/ ctx[1];
    			if (dirty & /*$isReordering*/ 2) draganddroplist_changes.column = /*$isReordering*/ ctx[1];

    			if (dirty & /*$$scope, set, i*/ 3584) {
    				draganddroplist_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_list && dirty & /*$instrumentSets*/ 1) {
    				updating_list = true;
    				draganddroplist_changes.list = /*$instrumentSets*/ ctx[0];
    				add_flush_callback(() => updating_list = false);
    			}

    			draganddroplist.$set(draganddroplist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(draganddroplist.$$.fragment, local);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(draganddroplist.$$.fragment, local);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(draganddroplist);
    			if (detaching) detach_dev(t1);
    			destroy_component(toast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randId() {
    	return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $instrumentSets;
    	let $isReordering;
    	let $editMode;
    	validate_store(instrumentSets, "instrumentSets");
    	component_subscribe($$self, instrumentSets, $$value => $$invalidate(0, $instrumentSets = $$value));
    	validate_store(isReordering, "isReordering");
    	component_subscribe($$self, isReordering, $$value => $$invalidate(1, $isReordering = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(2, $editMode = $$value));

    	function addSet() {
    		instrumentSets.set([
    			...$instrumentSets,
    			{
    				id: randId(),
    				name: "New set",
    				instruments: []
    			}
    		]);

    		window.pushToast("Instrument set added");
    	}

    	function downloadObjectAsJson() {
    		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($instrumentSets));
    		var downloadAnchorNode = document.createElement("a");
    		downloadAnchorNode.setAttribute("href", dataStr);
    		downloadAnchorNode.setAttribute("download", "backup.json");
    		document.body.appendChild(downloadAnchorNode); // required for firefox
    		downloadAnchorNode.click();
    		downloadAnchorNode.remove();
    		window.pushToast("Backup downloading");
    	}

    	function restore() {
    		let input = prompt("Copy-paste the backup .json contents");

    		if (input != null) {
    			try {
    				let parsed = JSON.parse(input);
    				instrumentSets.set([...parsed]);
    			} catch(error) {
    				window.pushToast("Restore not successful", "error");
    			}

    			window.pushToast("Restore successful");
    		} else {
    			window.pushToast("Invalid restore input", "error");
    		}
    	}

    	function update(from, to) {
    		let newList = [...$instrumentSets];
    		newList[from] = [newList[to], newList[to] = newList[from]][0];
    		set_store_value(instrumentSets, $instrumentSets = [...newList]);
    		instrumentSets.set($instrumentSets);
    	}

    	const toggleReorder = () => {
    		isReordering.set(!$isReordering);
    		window.pushToast("Reordering " + ($isReordering ? "on" : "off"));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SetList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SetList", $$slots, []);

    	function draganddroplist_list_binding(value) {
    		$instrumentSets = value;
    		instrumentSets.set($instrumentSets);
    	}

    	$$self.$capture_state = () => ({
    		slide,
    		activeSet,
    		instrumentSets,
    		editMode,
    		isReordering,
    		Button,
    		DragAndDropList,
    		Toast,
    		SetListItem,
    		randId,
    		addSet,
    		downloadObjectAsJson,
    		restore,
    		update,
    		toggleReorder,
    		$instrumentSets,
    		$isReordering,
    		$editMode
    	});

    	return [
    		$instrumentSets,
    		$isReordering,
    		$editMode,
    		addSet,
    		downloadObjectAsJson,
    		restore,
    		update,
    		toggleReorder,
    		draganddroplist_list_binding
    	];
    }

    class SetList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetList",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\ThemeSwitcher.svelte generated by Svelte v3.24.1 */
    const file$d = "src\\components\\ThemeSwitcher.svelte";

    // (130:0) {#if optionsVisible}
    function create_if_block$9(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "backdrop svelte-1f3ipbu");
    			add_location(div, file$d, 130, 2, 2780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(130:0) {#if optionsVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let button;
    	let t0;
    	let div1;
    	let ul;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let t6;
    	let t7;
    	let toast;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				tooltip: "Change theme",
    				active: /*optionsVisible*/ ctx[0],
    				icon: "theme"
    			},
    			$$inline: true
    		});

    	button.$on("click", /*toggleOptionsVisibility*/ ctx[3]);
    	let if_block = /*optionsVisible*/ ctx[0] && create_if_block$9(ctx);
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(button.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Auto";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "Light";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "Dark";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			create_component(toast.$$.fragment);
    			add_location(div0, file$d, 112, 2, 2262);
    			attr_dev(li0, "class", "svelte-1f3ipbu");
    			toggle_class(li0, "active", /*$theme*/ ctx[1] === 0);
    			add_location(li0, file$d, 121, 6, 2488);
    			attr_dev(li1, "class", "svelte-1f3ipbu");
    			toggle_class(li1, "active", /*$theme*/ ctx[1] === 1);
    			add_location(li1, file$d, 122, 6, 2568);
    			attr_dev(li2, "class", "svelte-1f3ipbu");
    			toggle_class(li2, "active", /*$theme*/ ctx[1] === 2);
    			add_location(li2, file$d, 123, 6, 2649);
    			attr_dev(ul, "class", "svelte-1f3ipbu");
    			add_location(ul, file$d, 120, 4, 2476);
    			attr_dev(div1, "class", "options svelte-1f3ipbu");
    			toggle_class(div1, "visible", /*optionsVisible*/ ctx[0]);
    			add_location(div1, file$d, 119, 2, 2418);
    			attr_dev(div2, "class", "container svelte-1f3ipbu");
    			add_location(div2, file$d, 111, 0, 2235);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(button, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			insert_dev(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(toast, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[5], false, false, false),
    					listen_dev(li2, "click", /*click_handler_2*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*optionsVisible*/ 1) button_changes.active = /*optionsVisible*/ ctx[0];
    			button.$set(button_changes);

    			if (dirty & /*$theme*/ 2) {
    				toggle_class(li0, "active", /*$theme*/ ctx[1] === 0);
    			}

    			if (dirty & /*$theme*/ 2) {
    				toggle_class(li1, "active", /*$theme*/ ctx[1] === 1);
    			}

    			if (dirty & /*$theme*/ 2) {
    				toggle_class(li2, "active", /*$theme*/ ctx[1] === 2);
    			}

    			if (dirty & /*optionsVisible*/ 1) {
    				toggle_class(div1, "visible", /*optionsVisible*/ ctx[0]);
    			}

    			if (/*optionsVisible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(t7.parentNode, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(button);
    			if (detaching) detach_dev(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(toast, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $theme;
    	validate_store(theme, "theme");
    	component_subscribe($$self, theme, $$value => $$invalidate(1, $theme = $$value));
    	let optionsVisible = false;

    	function applyTheme(newVal) {
    		theme.set(newVal);

    		if ($theme === 0 && window.matchMedia("(prefers-color-scheme: dark)").matches || $theme === 2) {
    			document.querySelector("html").className = "dark";
    		} else {
    			document.querySelector("html").className = "";
    		}

    		toggleOptionsVisibility();
    		window.pushToast("Theme set to <i>" + (newVal == 0 ? "auto" : newVal == 1 ? "light" : "dark") + "</i>");
    	}

    	function toggleOptionsVisibility() {
    		$$invalidate(0, optionsVisible = !optionsVisible);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ThemeSwitcher> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ThemeSwitcher", $$slots, []);
    	const click_handler = () => applyTheme(0);
    	const click_handler_1 = () => applyTheme(1);
    	const click_handler_2 = () => applyTheme(2);
    	const click_handler_3 = () => $$invalidate(0, optionsVisible = false);

    	$$self.$capture_state = () => ({
    		Button,
    		Toast,
    		theme,
    		optionsVisible,
    		applyTheme,
    		toggleOptionsVisibility,
    		$theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("optionsVisible" in $$props) $$invalidate(0, optionsVisible = $$props.optionsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		optionsVisible,
    		$theme,
    		applyTheme,
    		toggleOptionsVisibility,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class ThemeSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ThemeSwitcher",
    			options,
    			id: create_fragment$d.name
    		});
    	}
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
      var value = scale$1(voltage);
      var startValue = scale$1(voltage);
      var endValue = scale$1(voltage);

      node._startAmount = scale$1(startValue);
      node._endAmount = scale$1(endValue);

      node._multiplier = scale$1(value);
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

    function scale$1(node){
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
    (function(e){var t; {module.exports=e();}})(function(){return function o(e,t,s){function a(n,i){if(!t[n]){if(!e[n]){var l=typeof commonjsRequire=="function"&&commonjsRequire;if(!i&&l)return l(n,!0);if(r)return r(n,!0);var h=new Error("Cannot find module '"+n+"'");throw h.code="MODULE_NOT_FOUND",h}var c=t[n]={exports:{}};e[n][0].call(c.exports,function(t){var s=e[n][1][t];return a(s?s:t)},c,c.exports,o,e,t,s);}return t[n].exports}var r=typeof commonjsRequire=="function"&&commonjsRequire;for(var n=0;n<s.length;n++)a(s[n]);return a}({1:[function(e,t,s){Object.defineProperty(s,"__esModule",{value:true});s["default"]=function(e){function t(e){this._event=e;this._data=e.data;this.receivedTime=e.receivedTime;if(this._data&&this._data.length<2){console.warn("Illegal MIDI message of length",this._data.length);return}this._messageCode=e.data[0]&240;this.channel=e.data[0]&15;switch(this._messageCode){case 128:this.messageType="noteoff";this.key=e.data[1]&127;this.velocity=e.data[2]&127;break;case 144:this.messageType="noteon";this.key=e.data[1]&127;this.velocity=e.data[2]&127;break;case 160:this.messageType="keypressure";this.key=e.data[1]&127;this.pressure=e.data[2]&127;break;case 176:this.messageType="controlchange";this.controllerNumber=e.data[1]&127;this.controllerValue=e.data[2]&127;if(this.controllerNumber===120&&this.controllerValue===0){this.channelModeMessage="allsoundoff";}else if(this.controllerNumber===121){this.channelModeMessage="resetallcontrollers";}else if(this.controllerNumber===122){if(this.controllerValue===0){this.channelModeMessage="localcontroloff";}else {this.channelModeMessage="localcontrolon";}}else if(this.controllerNumber===123&&this.controllerValue===0){this.channelModeMessage="allnotesoff";}else if(this.controllerNumber===124&&this.controllerValue===0){this.channelModeMessage="omnimodeoff";}else if(this.controllerNumber===125&&this.controllerValue===0){this.channelModeMessage="omnimodeon";}else if(this.controllerNumber===126){this.channelModeMessage="monomodeon";}else if(this.controllerNumber===127){this.channelModeMessage="polymodeon";}break;case 192:this.messageType="programchange";this.program=e.data[1];break;case 208:this.messageType="channelpressure";this.pressure=e.data[1]&127;break;case 224:this.messageType="pitchbendchange";var t=e.data[2]&127;var s=e.data[1]&127;this.pitchBend=(t<<8)+s;break}}return new t(e)};t.exports=s["default"];},{}]},{},[1])(1)});

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
        __proto__: null,
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

    /* src\App.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$1, console: console_1$1, document: document_1, window: window_1 } = globals;

    const file$e = "src\\App.svelte";

    // (295:6) {#if $editMode}
    function create_if_block$a(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let div_transition;
    	let current;

    	button0 = new Button({
    			props: {
    				spaced: true,
    				outline: true,
    				icon: "chordMode",
    				label: "Clear chords"
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[9]);

    	button1 = new Button({
    			props: {
    				spaced: true,
    				outline: true,
    				icon: "chordMode",
    				label: "Reset chords"
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div, "class", "chord-controls svelte-1oiabnc");
    			add_location(div, file$e, 295, 8, 7631);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(295:6) {#if $editMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t1;
    	let div0;
    	let t2;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let button2;
    	let t5;
    	let themeswitcher;
    	let t6;
    	let pianogrid;
    	let t7;
    	let controls;
    	let t8;
    	let setlist;
    	let t9;
    	let toast;
    	let t10;
    	let meta;
    	let meta_content_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$editMode*/ ctx[1] && create_if_block$a(ctx);

    	button0 = new Button({
    			props: {
    				spaced: true,
    				tooltip: "Stop all sounds",
    				icon: "stopAll2",
    				disabled: /*$editMode*/ ctx[1]
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*stopAllSounds*/ ctx[4]);

    	button1 = new Button({
    			props: {
    				spaced: true,
    				tooltip: "Edit mode",
    				toggled: /*$editMode*/ ctx[1],
    				icon: "edit"
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*toggleEditMode*/ ctx[5]);

    	button2 = new Button({
    			props: {
    				spaced: true,
    				disabled: /*$editMode*/ ctx[1],
    				toggled: /*$chordMode*/ ctx[2],
    				tooltip: "Chord mode",
    				icon: "chordMode"
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*toggleChordMode*/ ctx[6]);
    	themeswitcher = new ThemeSwitcher({ $$inline: true });
    	pianogrid = new PianoGrid({ $$inline: true });
    	controls = new Controls({ $$inline: true });
    	setlist = new SetList({ $$inline: true });
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Piano";
    			t1 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			create_component(button2.$$.fragment);
    			t5 = space();
    			create_component(themeswitcher.$$.fragment);
    			t6 = space();
    			create_component(pianogrid.$$.fragment);
    			t7 = space();
    			create_component(controls.$$.fragment);
    			t8 = space();
    			create_component(setlist.$$.fragment);
    			t9 = space();
    			create_component(toast.$$.fragment);
    			t10 = space();
    			meta = element("meta");
    			attr_dev(h3, "class", "svelte-1oiabnc");
    			add_location(h3, file$e, 292, 4, 7506);
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			set_style(div0, "justify-content", "center");
    			add_location(div0, file$e, 293, 4, 7526);
    			attr_dev(div1, "class", "titlebar svelte-1oiabnc");
    			add_location(div1, file$e, 291, 2, 7478);
    			attr_dev(div2, "class", "grid-container svelte-1oiabnc");
    			toggle_class(div2, "edit-mode", /*$editMode*/ ctx[1]);
    			add_location(div2, file$e, 290, 0, 7418);
    			attr_dev(meta, "name", "theme-color");
    			attr_dev(meta, "content", meta_content_value = "#" + (/*isDark*/ ctx[0] ? "242424" : "ffffff"));
    			add_location(meta, file$e, 362, 2, 9186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t2);
    			mount_component(button0, div0, null);
    			append_dev(div0, t3);
    			mount_component(button1, div0, null);
    			append_dev(div0, t4);
    			mount_component(button2, div0, null);
    			append_dev(div0, t5);
    			mount_component(themeswitcher, div0, null);
    			append_dev(div2, t6);
    			mount_component(pianogrid, div2, null);
    			append_dev(div2, t7);
    			mount_component(controls, div2, null);
    			append_dev(div2, t8);
    			mount_component(setlist, div2, null);
    			insert_dev(target, t9, anchor);
    			mount_component(toast, target, anchor);
    			insert_dev(target, t10, anchor);
    			append_dev(document_1.head, meta);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handleKeyDown*/ ctx[7], false, false, false),
    					listen_dev(window_1, "keyup", /*handleKeyUp*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$editMode*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$editMode*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const button0_changes = {};
    			if (dirty & /*$editMode*/ 2) button0_changes.disabled = /*$editMode*/ ctx[1];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*$editMode*/ 2) button1_changes.toggled = /*$editMode*/ ctx[1];
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*$editMode*/ 2) button2_changes.disabled = /*$editMode*/ ctx[1];
    			if (dirty & /*$chordMode*/ 4) button2_changes.toggled = /*$chordMode*/ ctx[2];
    			button2.$set(button2_changes);

    			if (dirty & /*$editMode*/ 2) {
    				toggle_class(div2, "edit-mode", /*$editMode*/ ctx[1]);
    			}

    			if (!current || dirty & /*isDark*/ 1 && meta_content_value !== (meta_content_value = "#" + (/*isDark*/ ctx[0] ? "242424" : "ffffff"))) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(themeswitcher.$$.fragment, local);
    			transition_in(pianogrid.$$.fragment, local);
    			transition_in(controls.$$.fragment, local);
    			transition_in(setlist.$$.fragment, local);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(themeswitcher.$$.fragment, local);
    			transition_out(pianogrid.$$.fragment, local);
    			transition_out(controls.$$.fragment, local);
    			transition_out(setlist.$$.fragment, local);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(themeswitcher);
    			destroy_component(pianogrid);
    			destroy_component(controls);
    			destroy_component(setlist);
    			if (detaching) detach_dev(t9);
    			destroy_component(toast, detaching);
    			if (detaching) detach_dev(t10);
    			detach_dev(meta);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clamp(value, min, max) {
    	if (value <= min) return min;
    	if (value >= max) return max;
    	return value;
    }

    function randId$1() {
    	return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $instrumentSets;
    	let $activeSet;
    	let $theme;
    	let $editMode;
    	let $chordMode;
    	let $isFocused;
    	let $keysPressed;
    	let $keysDown;
    	let $volume;
    	let $octaveShift;
    	let $chordNotes;
    	validate_store(instrumentSets, "instrumentSets");
    	component_subscribe($$self, instrumentSets, $$value => $$invalidate(11, $instrumentSets = $$value));
    	validate_store(activeSet, "activeSet");
    	component_subscribe($$self, activeSet, $$value => $$invalidate(12, $activeSet = $$value));
    	validate_store(theme, "theme");
    	component_subscribe($$self, theme, $$value => $$invalidate(13, $theme = $$value));
    	validate_store(editMode, "editMode");
    	component_subscribe($$self, editMode, $$value => $$invalidate(1, $editMode = $$value));
    	validate_store(chordMode, "chordMode");
    	component_subscribe($$self, chordMode, $$value => $$invalidate(2, $chordMode = $$value));
    	validate_store(isFocused, "isFocused");
    	component_subscribe($$self, isFocused, $$value => $$invalidate(14, $isFocused = $$value));
    	validate_store(keysPressed, "keysPressed");
    	component_subscribe($$self, keysPressed, $$value => $$invalidate(15, $keysPressed = $$value));
    	validate_store(keysDown, "keysDown");
    	component_subscribe($$self, keysDown, $$value => $$invalidate(16, $keysDown = $$value));
    	validate_store(volume, "volume");
    	component_subscribe($$self, volume, $$value => $$invalidate(17, $volume = $$value));
    	validate_store(octaveShift, "octaveShift");
    	component_subscribe($$self, octaveShift, $$value => $$invalidate(18, $octaveShift = $$value));
    	validate_store(chordNotes, "chordNotes");
    	component_subscribe($$self, chordNotes, $$value => $$invalidate(3, $chordNotes = $$value));
    	instrumentSets.useLocalStorage();
    	showAdsr.useLocalStorage();
    	currentSoundFont.useLocalStorage();
    	activeSet.useLocalStorage();
    	volume.useLocalStorage();
    	octaveShift.useLocalStorage();
    	editMode.useLocalStorage();
    	theme.useLocalStorage();
    	isReordering.useLocalStorage();
    	chordMode.useLocalStorage();
    	chordNotes.useLocalStorage();

    	function stopAllSounds() {
    		try {
    			if ($instrumentSets[$activeSet].instruments.length < 1) return;

    			for (let instr of $instrumentSets[$activeSet].instruments) {
    				instr.data.then(k => {
    					k.stop();
    				});
    			}

    			for (let i in keyCodes) {
    				document.querySelector("#" + keyCodes[i]).classList.remove("piano-key-highlight");
    			}

    			window.pushToast("Stopped all sounds", "error");
    		} catch(error) {
    			
    		}
    	}

    	let isDark = false;

    	function applyTheme() {
    		if ($theme === 0 && window.matchMedia("(prefers-color-scheme: dark)").matches || $theme === 2) {
    			document.querySelector("html").className = "dark";
    			document.querySelector("meta[name=\"theme-color\"]").setAttribute("content", "#242424");
    			$$invalidate(0, isDark = true);
    		} else {
    			document.querySelector("html").className = "";
    			document.querySelector("meta[name=\"theme-color\"]").setAttribute("content", "#ffffff");
    			$$invalidate(0, isDark = false);
    		}
    	}

    	function toggleEditMode() {
    		editMode.set(!$editMode);
    		instrumentSets.set([...$instrumentSets]);
    		if ($editMode === false) isReordering.set(false);
    		window.pushToast("Edit mode " + ($editMode ? "on" : "off"));
    	}

    	function toggleChordMode() {
    		chordMode.set(!$chordMode);
    		window.pushToast("Chord mode " + ($chordMode ? "on" : "off"));
    	}

    	function handleKeyDown(e) {
    		if ($isFocused || $editMode) {
    			return;
    		} else if (e.keyCode !== 116) {
    			e.preventDefault();
    			e.stopPropagation();
    		}

    		let kCode = e.keyCode;
    		if ($instrumentSets[$activeSet].instruments.length < 1) return;
    		if (keyCodes[kCode] == null) return;
    		if (keyNotes[kCode] == null) return;
    		if ($keysPressed[kCode] === null) return;
    		if ($keysDown[kCode] === true) return;
    		document.querySelector("#" + keyCodes[kCode]).classList.add("piano-key-highlight");
    		set_store_value(keysDown, $keysDown[kCode] = true, $keysDown);

    		for (let instrument of $instrumentSets[$activeSet].instruments) {
    			let vol = instrument.volume > -1
    			? instrument.absoluteVolume
    				? $volume * (instrument.volume / 100) / 100
    				: instrument.volume / 100
    			: $volume / 100;

    			let adjustedOctShift = clamp($octaveShift + instrument.octave, -3, 3);

    			instrument.data.then(instr => {
    				let newAdsr = instrument.adsr;
    				if (newAdsr[0] < 0) newAdsr[0] = defaultAdsr[0];
    				if (newAdsr[1] < 0) newAdsr[1] = defaultAdsr[1];
    				if (newAdsr[2] < 0) newAdsr[2] = defaultAdsr[2];
    				if (newAdsr[3] < 0) newAdsr[3] = defaultAdsr[3];

    				let noteCollection = $chordMode
    				? chords[$chordNotes[kCode]]
    				: keyNotes[kCode];

    				if (noteCollection == null) return;

    				for (let noteCode of noteCollection) {
    					let note = (parseInt($chordMode ? keyNotes[noteCode] : noteCode) + 12 * adjustedOctShift).toString();

    					try {
    						let inst = instr.play(note, ac.currentTime, { loop: true, adsr: newAdsr, gain: vol });

    						if ($keysPressed[kCode].indexOf(inst) === -1) {
    							let currentPressed = $keysPressed[kCode];
    							set_store_value(keysPressed, $keysPressed[kCode] = [...currentPressed, inst], $keysPressed);
    						}
    					} catch(error) {
    						window.popToast("Error: " + error.message);
    					}
    				}
    			});
    		}
    	}

    	function handleKeyUp(e) {
    		if ($isFocused || $editMode) {
    			return;
    		} else if (e.keyCode !== 116) {
    			e.preventDefault();
    			e.stopPropagation();
    		}

    		let kCode = e.keyCode;

    		if (kCode >= 48 && kCode <= 58) {
    			stopAllSounds();
    			let newCode = kCode - 49;

    			if (kCode == 48) {
    				newCode = 9;
    			}

    			if ($instrumentSets[newCode] != undefined) activeSet.set(newCode); else activeSet.set(0);
    		}

    		if (kCode === 16) {
    			if ($octaveShift <= 2) {
    				octaveShift.set($octaveShift + 1);
    			}

    			return;
    		}

    		if (kCode === 17) {
    			if ($octaveShift >= -2) {
    				octaveShift.set($octaveShift - 1);
    			}

    			return;
    		}

    		if (kCode === 37) {
    			if ($volume >= 1) volume.set($volume - 1);
    			return;
    		}

    		if (kCode === 40) {
    			if ($volume >= 10) volume.set($volume - 10);
    			if ($volume - 10 < 0) volume.set(0);
    			return;
    		}

    		if (kCode === 39) {
    			if ($volume < 99) volume.set($volume + 1);
    			return;
    		}

    		if (kCode === 38) {
    			if ($volume <= 90) volume.set($volume + 10);
    			if ($volume + 10 > 100) volume.set(100);
    			return;
    		}

    		if (kCode === 192) {
    			toggleChordMode();
    			return;
    		}

    		if ($instrumentSets[$activeSet].instruments.length < 1) return;
    		if (keyCodes[kCode] == null) return;
    		if (keyNotes[kCode] == null) return;
    		if ($keysPressed[kCode] === null) return;
    		if ($keysDown[kCode] === false) return;
    		document.querySelector("#" + keyCodes[kCode]).classList.remove("piano-key-highlight");
    		set_store_value(keysDown, $keysDown[kCode] = false, $keysDown);

    		for (var i of $keysPressed[kCode]) {
    			try {
    				i.stop();
    			} catch(err) {
    				console.error("Errored stop, stopping all.");
    				console.error("Error: ", err.message);
    				stopAllSounds();
    			}
    		}

    		set_store_value(keysPressed, $keysPressed[kCode] = [], $keysPressed);
    	}

    	onMount(() => {
    		let colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    		colorSchemeQuery.addEventListener("change", applyTheme);
    		applyTheme();

    		for (let set of $instrumentSets) {
    			if (set.id == null) {
    				set.id = randId$1();
    			}
    		}
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	const click_handler = () => {
    		let temp = $chordNotes;

    		for (let keyboardKey of Object.keys(defaultChords)) {
    			temp[keyboardKey] = "";
    		}

    		chordNotes.set(temp);

    		for (let sel of document.querySelectorAll(".piano-grid select")) {
    			sel.value = null;
    		}
    	};

    	const click_handler_1 = () => {
    		chordNotes.set(defaultChords);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		Button,
    		Controls,
    		PianoGrid,
    		SetList,
    		ThemeSwitcher,
    		Toast,
    		Soundfont: lib$2,
    		keyCodes,
    		keyNotes,
    		activeSet,
    		instrumentSets,
    		keysDown,
    		keysPressed,
    		volume,
    		octaveShift,
    		currentSoundFont,
    		ac,
    		defaultAdsr,
    		isFocused,
    		showAdsr,
    		editMode,
    		theme,
    		isReordering,
    		chordMode,
    		chordNotes,
    		chords,
    		defaultChords,
    		clamp,
    		stopAllSounds,
    		isDark,
    		applyTheme,
    		toggleEditMode,
    		toggleChordMode,
    		handleKeyDown,
    		handleKeyUp,
    		randId: randId$1,
    		$instrumentSets,
    		$activeSet,
    		$theme,
    		$editMode,
    		$chordMode,
    		$isFocused,
    		$keysPressed,
    		$keysDown,
    		$volume,
    		$octaveShift,
    		$chordNotes
    	});

    	$$self.$inject_state = $$props => {
    		if ("isDark" in $$props) $$invalidate(0, isDark = $$props.isDark);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isDark,
    		$editMode,
    		$chordMode,
    		$chordNotes,
    		stopAllSounds,
    		toggleEditMode,
    		toggleChordMode,
    		handleKeyDown,
    		handleKeyUp,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
