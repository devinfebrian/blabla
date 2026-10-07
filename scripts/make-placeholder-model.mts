import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const OUT = 'public/models/hijab.glb'
const SEGMENTS = 32
const Y_SHIFT = -0.275

const PROFILE: Array<[number, number]> = [
  [0.0, 1.0],
  [0.3, 0.95],
  [0.45, 0.8],
  [0.5, 0.55],
  [0.52, 0.3],
  [0.6, 0.05],
  [0.72, -0.2],
  [0.8, -0.45],
]

const ringSize = SEGMENTS + 1
const positions: number[] = []

for (const [radius, y] of PROFILE) {
  for (let s = 0; s <= SEGMENTS; s++) {
    const theta = (s / SEGMENTS) * Math.PI * 2
    positions.push(Math.cos(theta) * radius, y + Y_SHIFT, Math.sin(theta) * radius)
  }
}

const indices: number[] = []
for (let ring = 0; ring < PROFILE.length - 1; ring++) {
  for (let s = 0; s < SEGMENTS; s++) {
    const a = ring * ringSize + s
    const b = a + 1
    const c = a + ringSize
    const d = c + 1
    indices.push(a, c, b, b, c, d)
  }
}

const normals = new Float64Array(positions.length)
const addFaceNormal = (i0: number, i1: number, i2: number) => {
  const at = (i: number) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]
  const [ax, ay, az] = at(i0)
  const [bx, by, bz] = at(i1)
  const [cx, cy, cz] = at(i2)
  const ux = bx - ax
  const uy = by - ay
  const uz = bz - az
  const vx = cx - ax
  const vy = cy - ay
  const vz = cz - az
  const nx = uy * vz - uz * vy
  const ny = uz * vx - ux * vz
  const nz = ux * vy - uy * vx
  const len = Math.hypot(nx, ny, nz) || 1
  for (const i of [i0, i1, i2]) {
    normals[i * 3] += nx / len
    normals[i * 3 + 1] += ny / len
    normals[i * 3 + 2] += nz / len
  }
}
for (let t = 0; t < indices.length; t += 3) addFaceNormal(indices[t], indices[t + 1], indices[t + 2])
for (let i = 0; i < normals.length; i += 3) {
  const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1
  normals[i] /= len
  normals[i + 1] /= len
  normals[i + 2] /= len
}

const positionBuffer = Buffer.from(new Float32Array(positions).buffer)
const normalBuffer = Buffer.from(new Float32Array(normals).buffer)
const indexBuffer = Buffer.from(new Uint16Array(indices).buffer)

const pad4 = (n: number) => (n + 3) & ~3
const views: Array<{ buffer: number; byteOffset: number; byteLength: number }> = []
const chunks: Buffer[] = []
let binaryLength = 0
for (const chunk of [positionBuffer, normalBuffer, indexBuffer]) {
  const padded = pad4(chunk.length)
  views.push({ buffer: 0, byteOffset: binaryLength, byteLength: chunk.length })
  chunks.push(chunk, Buffer.alloc(padded - chunk.length))
  binaryLength += padded
}
const binary = Buffer.concat(chunks)

const min = [Infinity, Infinity, Infinity]
const max = [-Infinity, -Infinity, -Infinity]
for (let i = 0; i < positions.length; i += 3) {
  for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], positions[i + axis])
    max[axis] = Math.max(max[axis], positions[i + axis])
  }
}

const vertexCount = positions.length / 3
const json = {
  asset: { version: '2.0', generator: 'make-placeholder-model' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: 'HijabPlaceholder' }],
  meshes: [
    {
      name: 'Hijab',
      primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }],
    },
  ],
  materials: [
    {
      name: 'Fabric',
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 0.85,
      },
    },
  ],
  buffers: [{ byteLength: binaryLength }],
  bufferViews: views,
  accessors: [
    { bufferView: 0, componentType: 5126, count: vertexCount, type: 'VEC3', min, max },
    { bufferView: 1, componentType: 5126, count: vertexCount, type: 'VEC3' },
    { bufferView: 2, componentType: 5123, count: indices.length, type: 'SCALAR' },
  ],
}

const jsonChunk = Buffer.from(JSON.stringify(json), 'utf8')
const jsonPadded = Buffer.concat([jsonChunk, Buffer.alloc(pad4(jsonChunk.length) - jsonChunk.length, 0x20)])
const binPadded = Buffer.concat([binary, Buffer.alloc(pad4(binary.length) - binary.length)])

const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 8)

const jsonHeader = Buffer.alloc(8)
jsonHeader.writeUInt32LE(jsonPadded.length, 0)
jsonHeader.writeUInt32LE(0x4e4f534a, 4)

const binHeader = Buffer.alloc(8)
binHeader.writeUInt32LE(binPadded.length, 0)
binHeader.writeUInt32LE(0x004e4942, 4)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]))

const written = readFileSync(OUT)
const bytes = statSync(OUT).size
const parsed = JSON.parse(written.subarray(20, 20 + written.readUInt32LE(12)).toString('utf8'))
const material = parsed.materials?.[0]

if (parsed.materials?.length !== 1 || material.name !== 'Fabric') {
  throw new Error('placeholder model must have exactly one material named "Fabric"')
}
if (material.pbrMetallicRoughness.baseColorFactor.join(',') !== '1,1,1,1') {
  throw new Error('Fabric material baseColorFactor must be neutral white')
}
if (bytes > 2 * 1024 * 1024) {
  throw new Error(`placeholder model is too large: ${bytes} bytes`)
}

console.log(
  `Wrote ${OUT}: ${bytes} bytes, ${vertexCount} vertices, ${indices.length / 3} triangles, material="${material.name}"`,
)
