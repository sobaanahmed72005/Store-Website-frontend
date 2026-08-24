import { describe, it, expect } from 'vitest'
import { getProduct3DType, has3DModel } from './has3DModel'

describe('has3DModel', () => {
  it('returns true ONLY when a 3D model file is uploaded or explicitly attached', () => {
    expect(has3DModel({ name: 'Laptop', model_3d: '/uploads/170000-model.glb' })).toBe(true)
    expect(has3DModel({ name: 'Headphones', model_3d: 'headphone.gltf' })).toBe(true)
    expect(has3DModel({ name: 'Custom Item', has_3d: true })).toBe(true)
    expect(getProduct3DType({ name: 'Item', model_3d: '/uploads/model.glb' })).toBe('custom')
  })

  it('returns false when no 3D model file is uploaded', () => {
    expect(has3DModel({ name: 'MacBook Pro 16" M3 Max' })).toBe(false)
    expect(has3DModel({ name: 'Sony WH-1000XM5 Headphones' })).toBe(false)
    expect(has3DModel({ name: 'Logitech G PRO X Superlight 2 Wireless Mouse' })).toBe(false)
    expect(has3DModel({ name: 'Razer BlackWidow V4 Pro Mechanical Keyboard' })).toBe(false)
    expect(has3DModel({ name: 'NVIDIA GeForce RTX 4090 OC 24GB Graphics Card' })).toBe(false)
    expect(has3DModel({ name: 'Anker 737 Power Bank 24,000mAh 140W' })).toBe(false)
    expect(has3DModel({ name: '4K Ultra HD Outdoor CCTV Camera' })).toBe(false)
    expect(has3DModel(null)).toBe(false)
  })
})
