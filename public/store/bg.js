/* ═══════════════════════════════════════════════════════════════
   STORE — 3D Background  (Three.js r165 via CDN)
   • Deep-space star field
   • Floating neon wireframe polyhedra (icosahedra + octahedra)
   • Neural-net particle web (nodes + connecting lines)
   • Mouse parallax / drag on camera
   • Blue / cyan / gold palette matching the page theme
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Wait for Three.js ─────────────────────────── */
    if (typeof THREE === 'undefined') {
        console.warn('[bg.js] THREE not loaded yet — retrying in 100 ms');
        setTimeout(() => { try { init(); } catch (e) { console.error(e); } }, 100);
    } else {
        init();
    }

    let renderer, scene, camera;
    let starField, particles, particleLines;
    let polyhedra = [];
    let mouse = { x: 0, y: 0 };
    let targetCam = { x: 0, y: 0 };
    let raf, W, H;

    /* ── Colour palette ───────────────────────────── */
    const CYAN = 0x4af0ff;
    const GOLD = 0xf7d794;
    const BLUE = 0x243a7a;
    const WHITE = 0xffffff;
    const PURPLE = 0xb57bff;

    function init() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        W = window.innerWidth;
        H = window.innerHeight;

        /* ── Renderer ────────────────────────────── */
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x080f28, 1);   // matches --bg-deep
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        /* ── Scene ───────────────────────────────── */
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x080f28, 0.018);

        /* ── Camera ──────────────────────────────── */
        camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
        camera.position.set(0, 0, 45);

        /* ── Build scene layers ──────────────────── */
        buildStarField();
        buildParticleWeb();
        buildPolyhedra();
        buildAmbientLights();

        /* ── Events ──────────────────────────────── */
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);

        /* ── Start loop ──────────────────────────── */
        animate(0);
    }

    /* ════════════════════════════════════════════════
       STAR FIELD
       ════════════════════════════════════════════════ */
    function buildStarField() {
        const COUNT = 1800;
        const pos = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        const colors = new Float32Array(COUNT * 3);

        const palette = [
            new THREE.Color(CYAN).multiplyScalar(0.9),
            new THREE.Color(WHITE).multiplyScalar(0.7),
            new THREE.Color(BLUE).multiplyScalar(2.5),
            new THREE.Color(GOLD).multiplyScalar(0.5),
        ];

        for (let i = 0; i < COUNT; i++) {
            pos[i * 3] = (Math.random() - .5) * 260;
            pos[i * 3 + 1] = (Math.random() - .5) * 260;
            pos[i * 3 + 2] = (Math.random() - .5) * 200 - 50;
            sizes[i] = Math.random() * 1.2 + .3;
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('customSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                attribute float customSize;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float uTime;
                void main() {
                    vColor = color;
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + position.x * 13.7 + position.y * 9.3);
                    gl_PointSize = customSize * twinkle * (180.0 / -mvPos.z);
                    gl_Position = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;
                    float alpha = 1.0 - smoothstep(0.2, 0.5, d);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            vertexColors: true,
        });

        starField = new THREE.Points(geo, mat);
        scene.add(starField);
    }

    /* ════════════════════════════════════════════════
       NEURAL-NET PARTICLE WEB
       ════════════════════════════════════════════════ */
    function buildParticleWeb() {
        const NODE_COUNT = 120;
        const CONNECT_DIST = 14;
        const RANGE = 60;

        /* ── Node positions + velocities ── */
        const nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: (Math.random() - .5) * RANGE,
                y: (Math.random() - .5) * RANGE * .65,
                z: (Math.random() - .5) * RANGE * .5 - 10,
                vx: (Math.random() - .5) * .012,
                vy: (Math.random() - .5) * .012,
                vz: (Math.random() - .5) * .006,
            });
        }

        /* ── Node spheres ── */
        const nodeGeo = new THREE.SphereGeometry(.18, 8, 8);
        const nodeMat = new THREE.MeshBasicMaterial({
            color: CYAN, transparent: true, opacity: .85
        });

        const nodeGroup = new THREE.Group();
        nodes.forEach(n => {
            const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
            mesh.position.set(n.x, n.y, n.z);
            nodeGroup.add(mesh);
        });
        scene.add(nodeGroup);

        /* ── Lines geometry (pre-allocated) ── */
        const MAX_SEGMENTS = NODE_COUNT * NODE_COUNT;
        const linePositions = new Float32Array(MAX_SEGMENTS * 6);
        const lineColors = new Float32Array(MAX_SEGMENTS * 6);

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: .55,
            depthWrite: false,
        });

        particleLines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(particleLines);

        const cyanC = new THREE.Color(CYAN);
        const goldC = new THREE.Color(GOLD);
        const purC = new THREE.Color(PURPLE);

        /* ── Animated update function ── */
        const nodeColors = [cyanC, goldC, purC];

        particleLines.userData.update = function (t) {
            /* Move nodes */
            nodes.forEach((n, i) => {
                n.x += n.vx; n.y += n.vy; n.z += n.vz;
                if (Math.abs(n.x) > RANGE / 2) n.vx *= -1;
                if (Math.abs(n.y) > RANGE * .325) n.vy *= -1;
                if (n.z > -5 || n.z < -RANGE * .5 - 5) n.vz *= -1;

                const mesh = nodeGroup.children[i];
                mesh.position.set(n.x, n.y, n.z);
                /* Gentle pulse */
                const s = .9 + .35 * Math.sin(t * .6 + i * .7);
                mesh.scale.setScalar(s);
            });

            /* Rebuild lines */
            let idx = 0;
            for (let a = 0; a < NODE_COUNT; a++) {
                for (let b = a + 1; b < NODE_COUNT; b++) {
                    const dx = nodes[a].x - nodes[b].x;
                    const dy = nodes[a].y - nodes[b].y;
                    const dz = nodes[a].z - nodes[b].z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < CONNECT_DIST) {
                        const alpha = 1 - dist / CONNECT_DIST;
                        const c = nodeColors[Math.floor((a + b) % 3)];

                        linePositions[idx * 6] = nodes[a].x;
                        linePositions[idx * 6 + 1] = nodes[a].y;
                        linePositions[idx * 6 + 2] = nodes[a].z;
                        linePositions[idx * 6 + 3] = nodes[b].x;
                        linePositions[idx * 6 + 4] = nodes[b].y;
                        linePositions[idx * 6 + 5] = nodes[b].z;

                        lineColors[idx * 6] = c.r * alpha;
                        lineColors[idx * 6 + 1] = c.g * alpha;
                        lineColors[idx * 6 + 2] = c.b * alpha;
                        lineColors[idx * 6 + 3] = c.r * alpha;
                        lineColors[idx * 6 + 4] = c.g * alpha;
                        lineColors[idx * 6 + 5] = c.b * alpha;
                        idx++;
                    }
                }
            }
            lineGeo.setDrawRange(0, idx * 2);
            lineGeo.attributes.position.needsUpdate = true;
            lineGeo.attributes.color.needsUpdate = true;
        };
    }

    /* ════════════════════════════════════════════════
       FLOATING WIREFRAME POLYHEDRA
       ════════════════════════════════════════════════ */
    function buildPolyhedra() {
        const configs = [
            /* big distant ones */
            { geo: new THREE.IcosahedronGeometry(7, 0), pos: [-38, 14, -30], color: CYAN, speed: .0012 },
            { geo: new THREE.OctahedronGeometry(5, 0), pos: [42, -12, -25], color: GOLD, speed: .0018 },
            { geo: new THREE.TetrahedronGeometry(4, 0), pos: [-20, -20, -15], color: PURPLE, speed: .0022 },
            { geo: new THREE.IcosahedronGeometry(4, 0), pos: [28, 22, -20], color: CYAN, speed: .0015 },
            /* small floating mid-ground */
            { geo: new THREE.OctahedronGeometry(2.5, 0), pos: [-10, 8, -8], color: GOLD, speed: .003 },
            { geo: new THREE.IcosahedronGeometry(2, 0), pos: [14, -8, -10], color: CYAN, speed: .0025 },
            { geo: new THREE.TetrahedronGeometry(1.8, 0), pos: [4, 16, -12], color: PURPLE, speed: .004 },
            { geo: new THREE.OctahedronGeometry(1.5, 0), pos: [-26, 2, -18], color: GOLD, speed: .0032 },
        ];

        configs.forEach(cfg => {
            const wireGeo = new THREE.WireframeGeometry(cfg.geo);
            const wireMat = new THREE.LineBasicMaterial({
                color: cfg.color,
                transparent: true,
                opacity: .35,
                depthWrite: false,
            });
            const mesh = new THREE.LineSegments(wireGeo, wireMat);
            mesh.position.set(...cfg.pos);
            mesh.userData.baseY = cfg.pos[1];
            mesh.userData.speed = cfg.speed;
            mesh.userData.phase = Math.random() * Math.PI * 2;
            mesh.userData.floatA = .8 + Math.random() * 1.2;

            /* Glow — add a slightly larger solid variant with additive blend */
            const glowGeo = cfg.geo.clone ? cfg.geo.clone() : cfg.geo;
            /* scale it up a touch for inner glow effect */
            const glowMesh = new THREE.Mesh(
                glowGeo,
                new THREE.MeshBasicMaterial({
                    color: cfg.color,
                    transparent: true,
                    opacity: .04,
                    side: THREE.FrontSide,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                })
            );
            glowMesh.scale.setScalar(1.05);
            mesh.add(glowMesh);

            scene.add(mesh);
            polyhedra.push(mesh);
        });
    }

    /* ════════════════════════════════════════════════
       LIGHTS
       ════════════════════════════════════════════════ */
    function buildAmbientLights() {
        /* Soft ambient */
        scene.add(new THREE.AmbientLight(0x0a1535, 2));

        /* Rim point lights */
        const l1 = new THREE.PointLight(CYAN, 1.5, 80);
        l1.position.set(-30, 20, 10);
        scene.add(l1);

        const l2 = new THREE.PointLight(GOLD, .8, 60);
        l2.position.set(30, -15, 5);
        scene.add(l2);

        const l3 = new THREE.PointLight(PURPLE, .6, 50);
        l3.position.set(0, 0, 20);
        scene.add(l3);
    }

    /* ════════════════════════════════════════════════
       ANIMATION LOOP
       ════════════════════════════════════════════════ */
    function animate(ts) {
        raf = requestAnimationFrame(animate);
        const t = ts * 0.001;

        /* Star twinkle uniform */
        starField.material.uniforms.uTime.value = t;

        /* Star slow drift */
        starField.rotation.y = t * .008;
        starField.rotation.x = t * .003;

        /* Particle web */
        if (particleLines.userData.update) particleLines.userData.update(t);

        /* Polyhedra float + spin */
        polyhedra.forEach(p => {
            p.rotation.x += p.userData.speed * 1.3;
            p.rotation.y += p.userData.speed;
            p.rotation.z += p.userData.speed * .7;
            p.position.y = p.userData.baseY + Math.sin(t * .4 + p.userData.phase) * p.userData.floatA;
        });

        /* Camera parallax from mouse */
        targetCam.x += (mouse.x * 5 - targetCam.x) * .03;
        targetCam.y += (mouse.y * 3 - targetCam.y) * .03;
        camera.position.x = targetCam.x;
        camera.position.y = targetCam.y;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    /* ════════════════════════════════════════════════
       EVENT HANDLERS
       ════════════════════════════════════════════════ */
    function onResize() {
        W = window.innerWidth;
        H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    }

    function onMouseMove(e) {
        mouse.x = (e.clientX / window.innerWidth - .5) * 2;
        mouse.y = -(e.clientY / window.innerHeight - .5) * 2;
    }

}());
