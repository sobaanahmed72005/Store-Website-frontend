/**
 * Utility to check if a product has a 3D model view available.
 * Returns true ONLY when an actual 3D model file (model_3d, .glb/.gltf)
 * has been uploaded or explicitly assigned to the product.
 */

export function getProduct3DType(product) {
  if (!product) return null

  // 1. Check for uploaded / attached 3D model file (model_3d, model3d, has_3d)
  if (product.model_3d && String(product.model_3d).trim() !== '') {
    return 'custom'
  }
  if (product.model3d && String(product.model3d).trim() !== '') {
    return 'custom'
  }
  if (product.has_3d === true || product.has_3d === 1 || product.has3d === true || product.has3d === 1) {
    return 'custom'
  }

  // If no 3D model file has been uploaded for this product, return null (no 3D option)
  return null
}

export function has3DModel(product) {
  return getProduct3DType(product) !== null
}
