import SwiftUI
import SceneKit

struct DoomAvatarView: UIViewRepresentable {
    @ObservedObject var manager: GamificationManager
    
    func makeUIView(context: Context) -> SCNView {
        let scnView = SCNView()
        scnView.scene = SCNScene()
        scnView.backgroundColor = UIColor(white: 0.06, alpha: 1.0)
        scnView.antialiasingMode = .none // Pixelated look
        
        // Camera
        let cameraNode = SCNNode()
        cameraNode.camera = SCNCamera()
        cameraNode.position = SCNVector3(0, 0, 5)
        scnView.scene?.rootNode.addChildNode(cameraNode)
        
        // Lights
        let ambientLight = SCNNode()
        ambientLight.light = SCNLight()
        ambientLight.light?.type = .ambient
        ambientLight.light?.intensity = 800
        scnView.scene?.rootNode.addChildNode(ambientLight)
        
        let directionalLight = SCNNode()
        directionalLight.light = SCNLight()
        directionalLight.light?.type = .directional
        directionalLight.position = SCNVector3(2, 5, 5)
        directionalLight.light?.castsShadow = true
        scnView.scene?.rootNode.addChildNode(directionalLight)
        
        // Avatar
        let avatarNode = DoomAvatarNode()
        avatarNode.name = "avatar"
        scnView.scene?.rootNode.addChildNode(avatarNode)
        
        // Post-Processing (Technique)
        // In a real app, we would load the technique from a plist or dictionary
        // scnView.technique = createRetroTechnique()
        
        return scnView
    }
    
    func updateUIView(_ scnView: SCNView, context: Context) {
        if let avatarNode = scnView.scene?.rootNode.childNode(withName: "avatar", recursively: false) as? DoomAvatarNode {
            avatarNode.update(stats: manager.stats, hardcore: manager.hardcoreMode)
        }
    }
}

class DoomAvatarNode: SCNNode {
    private let head: SCNNode
    private let torso: SCNNode
    private let leftArm: SCNNode
    private let rightArm: SCNNode
    private let leftLeg: SCNNode
    private let rightLeg: SCNNode
    
    override init() {
        // Initialize parts
        head = DoomAvatarNode.createLimb(size: SCNVector3(0.35, 0.4, 0.4), color: .green)
        torso = DoomAvatarNode.createLimb(size: SCNVector3(0.9, 0.6, 0.5), color: .green)
        leftArm = DoomAvatarNode.createLimb(size: SCNVector3(0.3, 0.7, 0.3), color: .green)
        rightArm = DoomAvatarNode.createLimb(size: SCNVector3(0.3, 0.7, 0.3), color: .green)
        leftLeg = DoomAvatarNode.createLimb(size: SCNVector3(0.3, 1.1, 0.35), color: .green)
        rightLeg = DoomAvatarNode.createLimb(size: SCNVector3(0.3, 1.1, 0.35), color: .green)
        
        super.init()
        
        // Assemble
        addChildNode(head)
        addChildNode(torso)
        addChildNode(leftArm)
        addChildNode(rightArm)
        addChildNode(leftLeg)
        addChildNode(rightLeg)
        
        // Initial positions
        head.position = SCNVector3(0, 1.45, 0)
        torso.position = SCNVector3(0, 0.9, 0)
        leftArm.position = SCNVector3(0.6, 0.9, 0)
        rightArm.position = SCNVector3(-0.6, 0.9, 0)
        leftLeg.position = SCNVector3(0.2, -0.1, 0)
        rightLeg.position = SCNVector3(-0.2, -0.1, 0)
        
        // Start Idle Animation
        runAction(SCNAction.repeatForever(SCNAction.sequence([
            SCNAction.moveBy(x: 0, y: 0.05, z: 0, duration: 1.0),
            SCNAction.moveBy(x: 0, y: -0.05, z: 0, duration: 1.0)
        ])))
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func update(stats: GamificationManager.Stats, hardcore: Bool) {
        // Update colors and scales based on stats
        let primaryColor: UIColor = hardcore ? .black : UIColor(red: 0.48, green: 0.59, blue: 0.44, alpha: 1.0) // Military Green
        
        [head, torso, leftArm, rightArm, leftLeg, rightLeg].forEach { node in
            node.geometry?.firstMaterial?.diffuse.contents = primaryColor
        }
        
        // Muscle scaling
        let muscleScale = 0.85 + (stats.training * 0.7)
        leftArm.scale = SCNVector3(muscleScale, 1, muscleScale)
        rightArm.scale = SCNVector3(muscleScale, 1, muscleScale)
    }
    
    static func createLimb(size: SCNVector3, color: UIColor) -> SCNNode {
        let geometry = SCNBox(width: CGFloat(size.x), height: CGFloat(size.y), length: CGFloat(size.z), chamferRadius: 0)
        geometry.firstMaterial?.diffuse.contents = color
        geometry.firstMaterial?.roughness.contents = 0.6
        geometry.firstMaterial?.metalness.contents = 0.4
        return SCNNode(geometry: geometry)
    }
}
