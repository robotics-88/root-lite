import * as babylon from '@babylonjs/core'

/**
 * A lot of work left to do here.  This is a dumb version of this.  It is doing a little good
 * but not much.  Need to optimize and take full advantage of the data structure
 * 
 * 1. this does not subdivide the top layer of nodes.  It creates 8 boxes and divides the points up into them.  
 * 2. searching and finding a collision is around 100-300ms, building is arouns 300ms
 * 3. this is for a splat with around 3,000,000 points
 * 
 * Need to make this subdivide the nodes so that is can further optimize the search
 */

export class Octree {
  constructor(pointCloud) {
    this.maxPointsPerOctant = 100 // This can be adjusted later for more efficient subdivision
    this.boundingBox = this.computeBoundingBox(pointCloud)
    this.root = this.build(pointCloud)
    this.center = null
    this.center = this.boundingBox.center()
  }

  // Build the octree from the point cloud
  build(pointCloud) {
    let rootNode = new OctreeNode(this.boundingBox)
    
    // Divide the points into 8 sections (octants)
    this.subdivide(rootNode, pointCloud)
    return rootNode
  }

  // Compute the bounding box that contains all points in the point cloud
  computeBoundingBox(pointCloud) {
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

    pointCloud.forEach(p => {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      minZ = Math.min(minZ, p.z)
      maxX = Math.max(maxX, p.x)
      maxY = Math.max(maxY, p.y)
      maxZ = Math.max(maxZ, p.z)
    })
    
    return new BoundingBox(new babylon.Vector3(minX, minY, minZ), new babylon.Vector3(maxX, maxY, maxZ))
  }

  // Subdivide the octree into 8 sections (octants) and assign points to them
  subdivide(node, pointCloud) {
    let halfSize = node.boundingBox.size().scale(0.5)
    let center = node.boundingBox.center()

    // Create 8 child nodes (octants)
    let childNodes = [
      new OctreeNode(new BoundingBox(center, halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(halfSize.x, 0, 0)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(0, halfSize.y, 0)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(0, 0, halfSize.z)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(-halfSize.x, 0, 0)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(0, -halfSize.y, 0)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(0, 0, -halfSize.z)), halfSize)),
      new OctreeNode(new BoundingBox(center.add(new babylon.Vector3(-halfSize.x, -halfSize.y, -halfSize.z)), halfSize)),
    ]

    // Assign points to the corresponding octants
    let pointGroups = [[], [], [], [], [], [], [], []]
    pointCloud.forEach(p => {
      for (let i = 0; i < 8; i++) {
        if (childNodes[i].boundingBox.containsPoint(p)) {
          pointGroups[i].push(p)
          break
        }
      }
    })

    childNodes.forEach((childNode, i) => {
      childNode.points = pointGroups[i] // Assign points to the child node
    })

    // Set the child nodes for the current node
    node.children = childNodes
  }

  findIntersection(ray, minDistance = 0.05) {
    const result = this._findIntersection(this.root, ray, minDistance)
    return result
  }

  _findIntersection(node, ray, minDistance) {
    
    if (!node.boundingBox.intersectsRay(ray)) {
      return null
    }
  
    let closestPoint = null
    let closestDistance = Infinity
  
    if (node.points.length > 0) {
      for (let point of node.points) {
        let closestOnRay = this._closestPointOnRay(ray, point)
        let distanceToRay = babylon.Vector3.Distance(point, closestOnRay)  // Perpendicular distance to the ray
        let originDistance = babylon.Vector3.Distance(ray.origin, point)   // Distance from the camera (ray origin)
  
        // Only consider points that are very close to the ray (distanceToRay should be near 0)
        if (distanceToRay < 0.008 && originDistance > minDistance) {  // Threshold to allow small error
          let projection = babylon.Vector3.Dot(point.subtract(ray.origin), ray.direction)
  
          // Ensure the point is in front of the ray (in the direction of the ray)
          if (projection > 0 && projection < closestDistance) {
            closestDistance = projection
            closestPoint = point
          }
        }
      }
      return closestPoint
    }
  
    // Check child nodes if it's not a leaf node
    for (let child of node.children) {
      if (child) {
        let intersection = this._findIntersection(child, ray, minDistance)
        if (intersection) {
          let intersectionDist = babylon.Vector3.Distance(ray.origin, intersection)
          if (intersectionDist < closestDistance && intersectionDist > minDistance) {
            closestDistance = intersectionDist
            closestPoint = intersection
          }
        }
      }
    }
  
    return closestPoint
  }
  
  // Helper function to get closest point on the ray from the point
  _closestPointOnRay(ray, point) {
    let toPoint = point.subtract(ray.origin)
    let projectionLength = babylon.Vector3.Dot(toPoint, ray.direction)  // Projection of point onto ray direction
    return ray.origin.add(ray.direction.scale(projectionLength))  // Get the closest point on the ray
  }
}
// Bounding Box Class
class BoundingBox {
  constructor(min, max) {
    this.min = min
    this.max = max
  }

  size() {
    return this.max.subtract(this.min)
  }

  center() {
    return this.min.add(this.max).scale(0.5)
  }

  containsPoint(point) {
    return (
      point.x >= this.min.x && point.x <= this.max.x &&
      point.y >= this.min.y && point.y <= this.max.y &&
      point.z >= this.min.z && point.z <= this.max.z
    )
  }

  intersectsRay(ray) {
    // AABB ray intersection test (simplified)
    let tMin = (this.min.x - ray.origin.x) / ray.direction.x
    let tMax = (this.max.x - ray.origin.x) / ray.direction.x

    if (tMin > tMax) [tMin, tMax] = [tMax, tMin]

    let tYMin = (this.min.y - ray.origin.y) / ray.direction.y
    let tYMax = (this.max.y - ray.origin.y) / ray.direction.y

    if (tYMin > tYMax) [tYMin, tYMax] = [tYMax, tYMin]

    if ((tMin > tYMax) || (tYMin > tMax)) return false

    if (tYMin > tMin) tMin = tYMin
    if (tYMax < tMax) tMax = tYMax

    let tZMin = (this.min.z - ray.origin.z) / ray.direction.z
    let tZMax = (this.max.z - ray.origin.z) / ray.direction.z

    if (tZMin > tZMax) [tZMin, tZMax] = [tZMax, tZMin]

    if ((tMin > tZMax) || (tZMin > tMax)) return false

    return true
  }
}

export class OctreeNode {
  constructor(boundingBox) {
    this.boundingBox = boundingBox // Axis-aligned bounding box for this node
    this.children = [] // 8 child nodes
    this.points = [] // Points contained within this node
  }

  // Check if this node is a leaf (no children)
  isLeaf() {
    return this.children.length === 0
  }

  // Add a point to this node
  addPoint(point) {
    if (this.boundingBox.containsPoint(point)) {
      this.points.push(point)
      return true
    }
    return false
  }

  // Subdivide the node into 8 octants
  subdivide() {
    if (!this.isLeaf()) return // Already subdivided

    let halfSize = this.boundingBox.size().scale(0.5)
    let center = this.boundingBox.center()

    let offsets = [
      new babylon.Vector3(halfSize.x, halfSize.y, halfSize.z),
      new babylon.Vector3(-halfSize.x, halfSize.y, halfSize.z),
      new babylon.Vector3(halfSize.x, -halfSize.y, halfSize.z),
      new babylon.Vector3(-halfSize.x, -halfSize.y, halfSize.z),
      new babylon.Vector3(halfSize.x, halfSize.y, -halfSize.z),
      new babylon.Vector3(-halfSize.x, halfSize.y, -halfSize.z),
      new babylon.Vector3(halfSize.x, -halfSize.y, -halfSize.z),
      new babylon.Vector3(-halfSize.x, -halfSize.y, -halfSize.z),
    ]

    for (let i = 0; i < 8; i++) {
      let min = center.add(offsets[i].scale(-1))
      let max = center.add(offsets[i])
      this.children.push(new OctreeNode(new BoundingBox(min, max)))
    }
  }
}
