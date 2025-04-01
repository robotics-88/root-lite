import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export class Octree {
  constructor(pointCloud) {
    this.maxPointsPerOctant = 100
    this.boundingBox = this.computeBoundingBox(pointCloud)
    this.root = this.build(pointCloud)
    this.center = this.boundingBox.center()
  }

  // Build the octree from the point cloud
  build(pointCloud) {
    let rootNode = new OctreeNode(this.boundingBox)
    
    // Divide the points into 8 sections (octants)
    rootNode.subdivide(pointCloud, this.maxPointsPerOctant)
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
    
    return new BoundingBox(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ))
  }

  findIntersection(ray, minDistance = 0.005) {
    return this._findIntersection(this.root, ray, minDistance)
  }

  _findIntersection(node, ray, minDistance) {
    
    if (!node.boundingBox.intersectsRay(ray)) return null
  
    let closestPoint = null
    let closestDistance = Infinity
  
    if (node.points.length > 0) {
      for (let point of node.points) {
        let closestOnRay = this._closestPointOnRay(ray, point)
        let distanceToRay = Vector3.Distance(point, closestOnRay)  // Perpendicular distance to the ray
        let originDistance = Vector3.Distance(ray.origin, point)   // Distance from the camera (ray origin)
  
        // Only consider points that are very close to the ray (distanceToRay should be near 0)
        if (distanceToRay < 0.008 && originDistance > minDistance) {  // Threshold to allow small error
          let projection = Vector3.Dot(point.subtract(ray.origin), ray.direction)
  
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
          let intersectionDist = Vector3.Distance(ray.origin, intersection)
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
    let projectionLength = Vector3.Dot(toPoint, ray.direction)  // Projection of point onto ray direction
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
    // AABB (Axis-Aligned Bounding Box) ray intersection test

    // Calculate intersection points with the X-axis aligned planes
    let tMin = (this.min.x - ray.origin.x) / ray.direction.x
    let tMax = (this.max.x - ray.origin.x) / ray.direction.x

    // Ensure tMin is always the smaller value
    if (tMin > tMax) [tMin, tMax] = [tMax, tMin]

    // Calculate intersection points with the Y-axis aligned planes
    let tYMin = (this.min.y - ray.origin.y) / ray.direction.y
    let tYMax = (this.max.y - ray.origin.y) / ray.direction.y

    // Ensure tYMin is always the smaller value
    if (tYMin > tYMax) [tYMin, tYMax] = [tYMax, tYMin]

    // If the X and Y intervals do not overlap, there's no intersection
    if ((tMin > tYMax) || (tYMin > tMax)) return false

    // Update tMin and tMax to consider Y-axis intersections
    if (tYMin > tMin) tMin = tYMin
    if (tYMax < tMax) tMax = tYMax

    // Calculate intersection points with the Z-axis aligned planes
    let tZMin = (this.min.z - ray.origin.z) / ray.direction.z
    let tZMax = (this.max.z - ray.origin.z) / ray.direction.z

    // Ensure tZMin is always the smaller value
    if (tZMin > tZMax) [tZMin, tZMax] = [tZMax, tZMin]

    // If the X, Y, and Z intervals do not overlap, there's no intersection
    if ((tMin > tZMax) || (tZMin > tMax)) return false

    // If we reach this point, the ray intersects the AABB
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

  tryAddPoint(point) {
    if (point.x === 0 && point.y === 0 && point.z === 0) {
      // Skip this point, or log it for debugging
      return false
    }
    
    if (this.boundingBox.containsPoint(point)) {
      this.points.push(point)
      return true
    }
    return false
  }
  
  // Modify the subdivision to handle (0, 0, 0) points
  subdivide(pointCloud, maxPointsPerOctant) {
    // If this node is already subdivided, exit early
    if (!this.isLeaf()) return

    // Calculate half the size of the bounding box
    let halfSize = this.boundingBox.size().scale(0.5)
    let center = this.boundingBox.center() // Get the center of the bounding box

    // Compute quarter size to determine offsets for child octants
    let quarterSize = new Vector3(
      halfSize.x / 2,
      halfSize.y / 2,
      halfSize.z / 2,
    )

    // Define offsets for the 8 child octants relative to the center
    let offsets = [
      new Vector3(quarterSize.x, quarterSize.y, quarterSize.z),   // Front-Right-Top
      new Vector3(-quarterSize.x, quarterSize.y, quarterSize.z),  // Front-Left-Top
      new Vector3(quarterSize.x, -quarterSize.y, quarterSize.z),  // Front-Right-Bottom
      new Vector3(-quarterSize.x, -quarterSize.y, quarterSize.z), // Front-Left-Bottom
      new Vector3(quarterSize.x, quarterSize.y, -quarterSize.z),  // Back-Right-Top
      new Vector3(-quarterSize.x, quarterSize.y, -quarterSize.z), // Back-Left-Top
      new Vector3(quarterSize.x, -quarterSize.y, -quarterSize.z), // Back-Right-Bottom
      new Vector3(-quarterSize.x, -quarterSize.y, -quarterSize.z), // Back-Left-Bottom
    ]

    // Create 8 child nodes by positioning them around the center using offsets
    this.children = offsets.map(offset => {
      let childCenter = center.add(offset)
      let childMin = childCenter.subtract(quarterSize)
      let childMax = childCenter.add(quarterSize)

      return new OctreeNode(new BoundingBox(childMin, childMax))
    })

    // Distribute all points in the current node to the new child nodes
    while (pointCloud.length > 0) {
      let point = pointCloud.pop()
      this.children.forEach((node) => {
        if (node.tryAddPoint(point)) return // Try adding the point to the appropriate child
      })
    }

    // Recursively subdivide children if they exceed the max allowed points
    this.children.forEach(node => {
      if (node.points.length > maxPointsPerOctant) 
        node.subdivide(node.points, maxPointsPerOctant)
    })
  }

}
