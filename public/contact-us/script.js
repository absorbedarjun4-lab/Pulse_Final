/* ═══════════════════════════════════════════
   PULSE — Contact Us Page · Script
   Three.js Water + Cursor Heading + Scroll Anim
   ═══════════════════════════════════════════ */

; (function () {
    'use strict'

    /* ─────────────────────────────────────
       1. THREE.JS WATER BACKGROUND
       ───────────────────────────────────── */

    const waterVertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float wave1 = sin(pos.x * 0.8 + uTime * 0.4) * 0.25;
      wave1 += sin(pos.y * 0.6 + uTime * 0.3) * 0.2;

      float wave2 = sin(pos.x * 1.5 + pos.y * 1.2 + uTime * 0.6) * 0.12;

      float wave3 = sin(pos.x * 3.0 + uTime * 0.8) * 0.04;
      wave3 += cos(pos.y * 2.5 + uTime * 0.5) * 0.05;

      float wave4 = sin((pos.x + pos.y) * 0.5 + uTime * 0.25) * 0.15;

      float elevation = wave1 + wave2 + wave3 + wave4;
      pos.z += elevation;
      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

    const waterFragmentShader = `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      float mixFactor = smoothstep(-0.3, 0.4, vElevation);
      vec3 color = mix(uColor1, uColor2, mixFactor);

      float peakFactor = smoothstep(0.2, 0.5, vElevation);
      color = mix(color, uColor3, peakFactor * 0.15);

      float shimmer = sin(vUv.x * 30.0 + uTime * 0.5) * sin(vUv.y * 25.0 + uTime * 0.4);
      shimmer = smoothstep(0.6, 1.0, shimmer) * 0.08;
      color += vec3(shimmer) * uColor3;

      float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x)
                     * smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

      gl_FragColor = vec4(color, uOpacity * edgeFade);
    }
  `

    function initBackground() {
        const container = document.getElementById('bg3d')
        if (!container || typeof THREE === 'undefined') return

        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(0x0f1b38, 5, 20)

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50)
        camera.position.set(0, 3, 7)

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.8
        container.appendChild(renderer.domElement)

        // Lights
        const ambient = new THREE.AmbientLight(0x4a6fa5, 0.15)
        scene.add(ambient)

        const keyLight = new THREE.DirectionalLight(0xF7D794, 0.4)
        keyLight.position.set(5, 8, 3)
        scene.add(keyLight)

        const rimLight = new THREE.DirectionalLight(0x3a5a9a, 0.2)
        rimLight.position.set(-3, 2, -5)
        scene.add(rimLight)

        const pointLight = new THREE.PointLight(0xF7D794, 0.3, 15, 2)
        pointLight.position.set(0, 2, 0)
        scene.add(pointLight)

        // Water surface
        const waterGeo = new THREE.PlaneGeometry(20, 20, 128, 128)
        const waterMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x0a1628) },
                uColor2: { value: new THREE.Color(0x1a3a6a) },
                uColor3: { value: new THREE.Color(0xF7D794) },
                uOpacity: { value: 0.85 },
            },
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        })

        const waterMesh = new THREE.Mesh(waterGeo, waterMat)
        waterMesh.rotation.set(-Math.PI / 2.5, 0, Math.PI / 8)
        waterMesh.position.set(0, -1, 0)
        scene.add(waterMesh)

        // Floating light orbs
        const orbs = []
        for (let i = 0; i < 5; i++) {
            const orbGeo = new THREE.SphereGeometry(0.03, 8, 8)
            const orbMat = new THREE.MeshBasicMaterial({ color: 0xF7D794, transparent: true, opacity: 0.15 })
            const orb = new THREE.Mesh(orbGeo, orbMat)
            orb.userData = {
                baseX: (Math.random() - 0.5) * 12,
                baseY: (Math.random() - 0.5) * 4 + 1,
                baseZ: (Math.random() - 0.5) * 8,
                speed: 0.2 + Math.random() * 0.3,
                offset: Math.random() * Math.PI * 2,
            }
            orb.position.set(orb.userData.baseX, orb.userData.baseY, orb.userData.baseZ)
            scene.add(orb)
            orbs.push(orb)
        }

        // Animation loop
        const clock = new THREE.Clock()
        function animate() {
            requestAnimationFrame(animate)
            const t = clock.getElapsedTime()

            waterMat.uniforms.uTime.value = t

            orbs.forEach((orb) => {
                const d = orb.userData
                orb.position.y = d.baseY + Math.sin(t * d.speed + d.offset) * 0.5
                orb.position.x = d.baseX + Math.sin(t * d.speed * 0.5 + d.offset) * 0.3
                orb.material.opacity = 0.15 + Math.sin(t * d.speed + d.offset) * 0.1
            })

            renderer.render(scene, camera)
        }
        animate()

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        })
    }

    /* ─────────────────────────────────────
       2. CURSOR-REACTIVE HEADING
       ───────────────────────────────────── */

    function initReactiveHeading() {
        const container = document.getElementById('reactiveHeading')
        if (!container) return

        const text = 'CONTACT US'
        const letters = []

        text.split('').forEach((char) => {
            const span = document.createElement('span')
            span.className = 'letter'
            span.textContent = char === ' ' ? '\u00A0' : char
            container.appendChild(span)
            letters.push({ el: span, targetX: 0, targetY: 0, targetRX: 0, targetRY: 0, x: 0, y: 0, rx: 0, ry: 0 })
        })

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            letters.forEach((l) => {
                const r = l.el.getBoundingClientRect()
                const cx = r.left + r.width / 2 - rect.left
                const cy = r.top + r.height / 2 - rect.top

                const dx = mouseX - cx
                const dy = mouseY - cy
                const dist = Math.sqrt(dx * dx + dy * dy)
                const maxDist = 350
                const influence = Math.max(0, 1 - dist / maxDist)

                l.targetX = dx * influence * 0.06
                l.targetY = dy * influence * 0.06
                l.targetRX = -dy * influence * 0.12
                l.targetRY = dx * influence * 0.12
            })
        })

        container.addEventListener('mouseleave', () => {
            letters.forEach((l) => {
                l.targetX = 0
                l.targetY = 0
                l.targetRX = 0
                l.targetRY = 0
            })
        })

        // Smooth spring interpolation loop
        function tick() {
            requestAnimationFrame(tick)
            const ease = 0.1
            letters.forEach((l) => {
                l.x += (l.targetX - l.x) * ease
                l.y += (l.targetY - l.y) * ease
                l.rx += (l.targetRX - l.rx) * ease
                l.ry += (l.targetRY - l.ry) * ease
                l.el.style.transform = `translate(${l.x}px, ${l.y}px) rotateX(${l.rx}deg) rotateY(${l.ry}deg)`
            })
        }
        tick()
    }

    /* ─────────────────────────────────────
       3. SCROLL ANIMATIONS
       ───────────────────────────────────── */

    function initAnimations() {
        // Hero fade-ins with delay
        document.querySelectorAll('.anim-fade').forEach((el) => {
            const delay = parseInt(el.dataset.delay || '0', 10)
            setTimeout(() => el.classList.add('visible'), delay)
        })

        // Scroll-triggered sections
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    const section = entry.target

                    const children = section.querySelectorAll('.anim-child')
                    children.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible')
                        }, i * 120)
                    })

                    // Footer line special case
                    const fline = section.querySelector('.footer-line')
                    if (fline) {
                        setTimeout(() => fline.classList.add('visible'), 300)
                    }

                    observer.unobserve(section)
                })
            },
            { threshold: 0.15, rootMargin: '-60px' }
        )

        document.querySelectorAll('.anim-section').forEach((s) => observer.observe(s))
    }

    /* ─────────────────────────────────────
       4. FORM HANDLING
       ───────────────────────────────────── */

    function initForm() {
        const form = document.getElementById('contactForm')
        const success = document.getElementById('formSuccess')
        if (!form || !success) return

        form.addEventListener('submit', (e) => {
            e.preventDefault()
            form.style.display = 'none'
            success.style.display = 'block'
            success.style.opacity = '0'
            success.style.transform = 'scale(0.95)'
            success.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
            requestAnimationFrame(() => {
                success.style.opacity = '1'
                success.style.transform = 'scale(1)'
            })
        })
    }

    /* ─────────────────────────────────────
       INIT
       ───────────────────────────────────── */

    document.addEventListener('DOMContentLoaded', () => {
        initBackground()
        initReactiveHeading()
        initAnimations()
        initForm()
    })
})()
