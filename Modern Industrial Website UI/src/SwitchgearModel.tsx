import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SwitchgearModel() {
  const mountRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x101010, 7, 14)
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, .1, 50)
    camera.position.set(5.8, 3.2, 7.4)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    const steel = new THREE.MeshStandardMaterial({ color: 0x313235, roughness: .42, metalness: .78 })
    const dark = new THREE.MeshStandardMaterial({ color: 0x111213, roughness: .55, metalness: .7 })
    const orange = new THREE.MeshStandardMaterial({ color: 0xc8650a, roughness: .38, metalness: .55 })
    const copper = new THREE.MeshStandardMaterial({ color: 0xb56328, roughness: .3, metalness: .9 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x1a2428, roughness: .15, metalness: .2, transmission: .15 })
    const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh
    }
    ;[-1.55, 0, 1.55].forEach((x, bay) => {
      box(1.45, 3.9, 1.35, steel, x, 0, 0)
      box(1.27, 1.15, .06, dark, x, 1.15, .71)
      box(1.27, 2.15, .06, dark, x, -.62, .71)
      box(.62, .34, .08, glass, x, 1.2, .76)
      box(.18, .05, .08, orange, x, .87, .77)
      for (let i = 0; i < 4; i++) box(.84, .06, .08, bay === 1 && i === 1 ? orange : steel, x, .25 - i * .38, .77)
      box(.04, 3.65, .05, orange, x - .64, 0, .75)
    })
    box(4.8, .16, 1.55, dark, 0, -2.03, 0)
    for (let i = 0; i < 3; i++) box(4.4, .055, .06, copper, 0, 1.55 - i * .13, -.74)
    group.rotation.y = -.32
    scene.add(group)

    scene.add(new THREE.HemisphereLight(0xdbe7ed, 0x15100b, 1.6))
    const key = new THREE.DirectionalLight(0xffddc2, 4); key.position.set(4, 7, 6); key.castShadow = true; scene.add(key)
    const rim = new THREE.PointLight(0xc8650a, 45, 12); rim.position.set(-4, 1, -3); scene.add(rim)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .8, metalness: .15 }))
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.12; floor.receiveShadow = true; scene.add(floor)

    let dragging = false, previousX = 0, targetRot = group.rotation.y, targetZoom = camera.position.z
    const down = (e: PointerEvent) => { dragging = true; previousX = e.clientX; renderer.domElement.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => { if (!dragging) return; targetRot += (e.clientX - previousX) * .009; previousX = e.clientX }
    const up = () => { dragging = false }
    const wheel = (e: WheelEvent) => { e.preventDefault(); targetZoom = THREE.MathUtils.clamp(targetZoom + e.deltaY * .004, 5, 10) }
    renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('wheel', wheel, { passive: false })
    const resize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight) }
    window.addEventListener('resize', resize)
    let frame = 0
    const animate = () => { frame = requestAnimationFrame(animate); if (!dragging) targetRot += .0012; group.rotation.y += (targetRot - group.rotation.y) * .06; camera.position.z += (targetZoom - camera.position.z) * .08; camera.lookAt(0, 0, 0); renderer.render(scene, camera) }
    animate()
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointermove', move); renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('wheel', wheel)
      scene.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const mats = Array.isArray(obj.material) ? obj.material : [obj.material]; mats.forEach(m => m.dispose()) } })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  return <div className="three-mount" ref={mountRef} />
}
