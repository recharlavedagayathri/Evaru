// three_body.js — Digital Human Body Twin using Three.js

let scene, camera, renderer, bodyGroup;
let organMeshes = {};
let animFrame;
let currentColor = 0x4CAF50; // green default

function initTwin() {
  const canvas = document.getElementById("twin-canvas");
  const wrap = document.getElementById("twin-canvas-wrap");
  const W = wrap.clientWidth || 420;
  const H = 360;
  canvas.width = W;
  canvas.height = H;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1a0d);

  // Camera
  camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.2, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(3, 6, 4);
  dirLight.castShadow = true;
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x4CAF50, 0.4);
  rimLight.position.set(-3, 2, -3);
  scene.add(rimLight);

  // Build body
  bodyGroup = new THREE.Group();
  scene.add(bodyGroup);

  const skinMat = () => new THREE.MeshPhongMaterial({ color: 0x88ccaa, transparent: true, opacity: 0.82, shininess: 40 });
  const wireMat = () => new THREE.MeshPhongMaterial({ color: 0x4CAF50, wireframe: true, transparent: true, opacity: 0.15 });

  function addPart(geo, mat, pos, name) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    bodyGroup.add(mesh);
    if (name) organMeshes[name] = mesh;
    return mesh;
  }

  // Head
  addPart(new THREE.SphereGeometry(0.38, 16, 16), skinMat(), [0, 2.55, 0], "head");

  // Neck
  addPart(new THREE.CylinderGeometry(0.15, 0.18, 0.3, 12), skinMat(), [0, 2.15, 0]);

  // Torso (chest)
  addPart(new THREE.CylinderGeometry(0.52, 0.42, 1.0, 16), skinMat(), [0, 1.45, 0], "chest");
  // Torso wire overlay
  addPart(new THREE.CylinderGeometry(0.53, 0.43, 1.01, 16), wireMat(), [0, 1.45, 0]);

  // Abdomen
  addPart(new THREE.CylinderGeometry(0.42, 0.38, 0.55, 16), skinMat(), [0, 0.82, 0], "abdomen");

  // Pelvis
  addPart(new THREE.CylinderGeometry(0.45, 0.35, 0.35, 16), skinMat(), [0, 0.42, 0]);

  // Organs (internal — slightly smaller, offset forward)
  const heartMat = new THREE.MeshPhongMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.85 });
  const heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), heartMat);
  heartMesh.position.set(-0.12, 1.6, 0.3);
  bodyGroup.add(heartMesh);
  organMeshes["heart"] = heartMesh;

  const liverMat = new THREE.MeshPhongMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.85 });
  const liverMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), liverMat);
  liverMesh.scale.set(1.4, 0.8, 0.9);
  liverMesh.position.set(0.18, 1.25, 0.3);
  bodyGroup.add(liverMesh);
  organMeshes["liver"] = liverMesh;

  const pancMat = new THREE.MeshPhongMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.85 });
  const pancMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.3, 10), pancMat);
  pancMesh.rotation.z = Math.PI / 4;
  pancMesh.position.set(-0.1, 1.0, 0.3);
  bodyGroup.add(pancMesh);
  organMeshes["pancreas"] = pancMesh;

  const kidneyL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshPhongMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.85 }));
  kidneyL.scale.set(0.7, 1, 0.7);
  kidneyL.position.set(-0.35, 0.95, -0.15);
  bodyGroup.add(kidneyL);
  organMeshes["kidney"] = kidneyL;

  const nerveMat = new THREE.MeshPhongMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.85 });
  const nerveMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), nerveMat);
  nerveMesh.position.set(0, 1.1, -0.3);
  bodyGroup.add(nerveMesh);
  organMeshes["nervous system"] = nerveMesh;

  // Upper arms
  [-1, 1].forEach(side => {
    addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.7, 10), skinMat(), [side * 0.68, 1.55, 0]);
    addPart(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 10), skinMat(), [side * 0.68, 0.85, 0]);
    addPart(new THREE.SphereGeometry(0.1, 10, 10), skinMat(), [side * 0.68, 0.5, 0]);
  });

  // Upper legs
  [-1, 1].forEach(side => {
    addPart(new THREE.CylinderGeometry(0.18, 0.15, 0.85, 10), skinMat(), [side * 0.22, -0.18, 0]);
    addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.8, 10), skinMat(), [side * 0.22, -1.1, 0]);
    addPart(new THREE.SphereGeometry(0.15, 10, 10), skinMat(), [side * 0.22, -1.57, 0]);
  });

  // Glow grid floor
  const gridHelper = new THREE.GridHelper(6, 12, 0x1a3d1a, 0x1a3d1a);
  gridHelper.position.y = -1.8;
  scene.add(gridHelper);

  // Animate
  function animate() {
    animFrame = requestAnimationFrame(animate);
    bodyGroup.rotation.y += 0.008;
    renderer.render(scene, camera);
  }
  animate();
}

// Update organ colors based on food analysis
function updateTwinColor(color, affectedOrgans = []) {
  const colorMap = {
    green: 0x4CAF50,
    yellow: 0xFFC107,
    red: 0xF44336
  };
  const col = colorMap[color] || 0x4CAF50;
  currentColor = col;

  // Reset all organs to green
  Object.entries(organMeshes).forEach(([name, mesh]) => {
    if (mesh.material) {
      if (affectedOrgans.includes(name)) {
        mesh.material.color.setHex(col);
        mesh.material.emissive = new THREE.Color(col).multiplyScalar(0.3);
      } else {
        mesh.material.color.setHex(0x4CAF50);
        mesh.material.emissive = new THREE.Color(0x000000);
      }
    }
  });

  // Update status bar
  const statusEl = document.getElementById("food-status-bar");
  const labels = { green: "✅ Safe Food", yellow: "⚠️ Moderate Risk", red: "🚨 High Risk" };
  const bgColors = { green: "#2d7a30", yellow: "#9a6800", red: "#c62828" };
  if (statusEl) {
    statusEl.textContent = labels[color] || "🧬 Analyzing…";
    statusEl.style.background = bgColors[color] || "rgba(0,0,0,0.75)";
  }

  // Organ labels
  const labelWrap = document.getElementById("organ-labels");
  if (labelWrap) {
    labelWrap.innerHTML = "";
    const positions = {
      heart: { top: "30%", left: "38%" },
      liver: { top: "36%", left: "55%" },
      pancreas: { top: "44%", left: "38%" },
      kidney: { top: "47%", left: "28%" },
      "nervous system": { top: "52%", left: "55%" }
    };
    affectedOrgans.forEach(org => {
      if (positions[org]) {
        const el = document.createElement("div");
        el.className = "organ-label";
        el.textContent = "⚡ " + org.charAt(0).toUpperCase() + org.slice(1);
        el.style.top = positions[org].top;
        el.style.left = positions[org].left;
        el.style.borderColor = color === "red" ? "#F44336" : color === "yellow" ? "#FFC107" : "#4CAF50";
        labelWrap.appendChild(el);
      }
    });
  }
}

// Init on load
window.addEventListener("load", () => {
  try { initTwin(); } catch(e) { console.warn("Three.js init failed", e); }
});
window.addEventListener("resize", () => {
  if (!renderer) return;
  const wrap = document.getElementById("twin-canvas-wrap");
  const W = wrap.clientWidth;
  camera.aspect = W / 360;
  camera.updateProjectionMatrix();
  renderer.setSize(W, 360);
});