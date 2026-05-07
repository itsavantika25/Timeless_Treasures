(function () {
  const canvas = document.getElementById("heritage-canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas) {
    return;
  }

  if (!window.THREE) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const drawFallback = (time) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.28;
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.00025);
      ctx.strokeStyle = "rgba(240, 213, 143, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(120, 246, 255, 0.36)";
      for (let index = 0; index < 4; index += 1) {
        ctx.save();
        ctx.rotate(index * Math.PI / 4);
        ctx.scale(1, 0.28 + index * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, radius * (1.12 + index * 0.16), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = "rgba(215, 168, 78, 0.9)";
      for (let index = 0; index < 42; index += 1) {
        const angle = index * 0.82 + time * 0.0003;
        const distance = radius * (0.75 + (index % 9) * 0.08);
        ctx.fillRect(Math.cos(angle) * distance, Math.sin(angle) * distance, 3, 3);
      }
      ctx.restore();
      if (!reduceMotion) {
        requestAnimationFrame(drawFallback);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawFallback(0);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const archive = new THREE.Group();
  scene.add(archive);

  const coreGeometry = new THREE.IcosahedronGeometry(1.7, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7a84e,
    emissive: 0x3b2508,
    metalness: 0.58,
    roughness: 0.28,
    transparent: true,
    opacity: 0.86,
    wireframe: true
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  archive.add(core);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x78f6ff,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide
  });

  for (let index = 0; index < 4; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35 + index * 0.22, 0.008, 8, 160), ringMaterial);
    ring.rotation.x = Math.PI / 2 + index * 0.34;
    ring.rotation.y = index * 0.6;
    archive.add(ring);
  }

  const points = [];
  for (let index = 0; index < 160; index += 1) {
    const radius = 2.5 + Math.random() * 1.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    points.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xf0d58f, size: 0.035, transparent: true, opacity: 0.78 })
  );
  archive.add(particles);

  scene.add(new THREE.AmbientLight(0xf7f0df, 0.55));
  const goldLight = new THREE.PointLight(0xd7a84e, 1.8, 14);
  goldLight.position.set(3, 2, 4);
  scene.add(goldLight);
  const blueLight = new THREE.PointLight(0x78f6ff, 1.1, 12);
  blueLight.position.set(-3, -1, 3);
  scene.add(blueLight);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  resize();

  const render = () => {
    archive.rotation.y += reduceMotion ? 0 : 0.004;
    archive.rotation.x = Math.sin(Date.now() * 0.0004) * 0.12;
    particles.rotation.y -= reduceMotion ? 0 : 0.0015;
    renderer.render(scene, camera);
    if (!reduceMotion) {
      requestAnimationFrame(render);
    }
  };

  render();
})();
