let renderer, scene, camera, controls
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const spheres = []
const cylinders = []
const spheresCylinderMap = {}
const cylinderLength = 20
const sphereRadius = 0.4

init()
animate()

function getGeometry() {
  const cubeGeometry = new THREE.Geometry()
  cubeGeometry.vertices.push(
    new THREE.Vector3(-10, -10, 10), //0
    new THREE.Vector3(10, -10, 10),  //1
    new THREE.Vector3(-10, 10, 10),  //2
    new THREE.Vector3(10, 10, 10),  //3
    new THREE.Vector3(-10, -10, -10),  //4
    new THREE.Vector3(10, -10, -10),   //5
    new THREE.Vector3(-10, 10, -10),   //6
    new THREE.Vector3(10, 10, -10)   //7
  )
  cubeGeometry.faces.push(
    
    new THREE.Face3(0, 3, 2),
    new THREE.Face3(0, 1, 3),
    
    new THREE.Face3(1, 7, 3),
    new THREE.Face3(1, 5, 7),
    
    new THREE.Face3(5, 6, 7),
    new THREE.Face3(5, 4, 6),
    
    new THREE.Face3(4, 2, 6),
    new THREE.Face3(4, 0, 2),
    
    new THREE.Face3(2, 7, 6),
    new THREE.Face3(2, 3, 7),
    
    new THREE.Face3(4, 1, 0),
    new THREE.Face3(4, 5, 1)
  )
  return cubeGeometry
}
function getCylinder({ x, y, z, rotate }) {
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, cylinderLength, 30)
  const material = new THREE.MeshBasicMaterial({ color: '#333' })
  const cylinder = new THREE.Mesh(geometry, material)
  scene.add(cylinder)
  cylinders.push(cylinder)
  cylinder.position.set(x, y, z)

  switch (rotate) {
    case 'z':
      cylinder.geometry.rotateZ(3.14 / 2)
      break
    case 'x':
      cylinder.geometry.rotateX(3.14 / 2)
      break
    default:
      break
  }
  return cylinder
}
function makeSphereInstance({ x, y, z }) {
  const sphereGeometry = new THREE.SphereGeometry(5, 40, 32)
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: '#' + Math.random().toString(16).substr(-6) })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

  sphere.scale.set(sphereRadius, sphereRadius, sphereRadius)
  sphere.position.set(x, y, z)
  spheres.push(sphere)
  scene.add(sphere)
  spheresCylinderMap[sphere.id] = []

  return sphere
}
function makeCubeInstanse(geometry) {
  const cubeMaterial = new THREE.MeshLambertMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    transparent: true,
    opacity: 0
  })
  const cube = new THREE.Mesh(geometry, cubeMaterial)

  scene.add(cube)

  const x = Math.round(Math.random() * 500 + 1)
  const y = Math.round(Math.random() * 500 + 1)
  const z = Math.round(Math.random() * 500 + 1)

  cube.position.x = x
  cube.position.y = y
  cube.position.z = z

  const helper = new THREE.BoxHelper(cube, 'black')
  scene.add(helper)

  return { x, y, z }
}
function getMovingCenter() {
  return (cylinderLength / 2) 
}
function feedMap(id, targetArr = []) {
  spheresCylinderMap[id] = [...spheresCylinderMap[id], ...targetArr]
}
function getTriplet(arr) {
  return arr.map(getCylinder)
}
function createEdges(spheres) {
  const [sId1, sId2, sId3, sId4, sId5, sId6, sId7, sId8] = [
    spheres[0].id,
    spheres[1].id,
    spheres[2].id,
    spheres[3].id,
    spheres[4].id,
    spheres[5].id,
    spheres[6].id,
    spheres[7].id
  ]
  spheres.forEach(({ position: { x, y, z }}, index) => {
    switch (index) {
      case 0:
        const [one, two, three] = getTriplet([
          {
            x,
            y,
            z: z + getMovingCenter(),
            rotate: 'x'
          },
          {
            x,
            y: y - getMovingCenter(),
            z
          },
          {
            x: x - getMovingCenter(),
            y,
            z,
            rotate: 'z'
          }
        ])
        feedMap(sId1, [one, two, three])
        feedMap(sId2, [three])
        feedMap(sId3, [two])
        feedMap(sId5, [one])
        break
      case 3:
        const [four, five, six] = getTriplet([
          {
            x,
            y,
            z: z + getMovingCenter(),
            rotate: 'x'
          },
          {
            x,
            y: y + getMovingCenter(),
            z
          },
          {
            x: x + getMovingCenter(),
            y,
            z,
            rotate: 'z'
          }
        ])
        feedMap(sId4, [four, five, six])
        feedMap(sId2, [five])
        feedMap(sId3, [six])
        feedMap(sId8, [four])
        break
      case 5:
        const [seven, eight, nine] = getTriplet([
          {
            x,
            y,
            z: z - getMovingCenter(),
            rotate: 'x'
          },
          {
            x,
            y: y - getMovingCenter(),
            z
          },
          {
            x: x + getMovingCenter(),
            y,
            z,
            rotate: 'z'
          }
        ])
        feedMap(sId6, [seven, eight, nine])
        feedMap(sId5, [nine])
        feedMap(sId2, [seven])
        feedMap(sId8, [eight])
        break
      case 6:
        const [ten, eleven, twelve] = getTriplet([
          {
            x,
            y,
            z: z - getMovingCenter(),
            rotate: 'x'
          },
          {
            x,
            y: y + getMovingCenter(),
            z,
          },
          {
            x: x - getMovingCenter(),
            y,
            z,
            rotate: 'z'
          }
        ])
        feedMap(sId7, [ten, eleven, twelve])
        feedMap(sId5, [eleven])
        feedMap(sId3, [ten])
        feedMap(sId8, [twelve])
        break
    }
  })
}
function init() {
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor('#E5E8E8', 1)
  document.body.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(250, 250, 250)
  scene.add(camera)

  controls = new THREE.OrbitControls(camera, renderer.domElement)

  const numberOfCubes = Math.round(Math.random() * 60 + 50)
  for (let i = 0; i < numberOfCubes; i++) {
    const cubeGeometry = getGeometry()
    const { x, y, z } = makeCubeInstanse(cubeGeometry)

    const spheres = cubeGeometry.vertices.map(el => makeSphereInstance({
      x: x - el.x,
      y: y - el.y,
      z: z - el.z
    }))
    createEdges(spheres)
  }

  document.addEventListener('click', onDocumentMouseDown, false)
}
function onDocumentMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const interS = raycaster.intersectObjects(spheres)

  if (interS.length > 0) {
    const sphere = interS[0].object
    
    spheresCylinderMap[sphere.id].forEach(el => {
      el.material.color = sphere.material.color
    })
  }
}
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

}

window.addEventListener( 'resize', onWindowResize, true )
  
function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}