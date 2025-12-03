import CoreHaptics
import UIKit

class HapticsManager {
    static let shared = HapticsManager()
    private var engine: CHHapticEngine?
    
    init() {
        prepareHaptics()
    }
    
    private func prepareHaptics() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        do {
            engine = try CHHapticEngine()
            try engine?.start()
            
            // Restart engine if it stops (e.g. backgrounding)
            engine?.resetHandler = { [weak self] in
                try? self?.engine?.start()
            }
        } catch {
            print("Haptics Error: \(error)")
        }
    }
    
    func playImpact(intensity: Float = 1.0) {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        let event = CHHapticEvent(eventType: .hapticTransient, parameters: [
            CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
        ], relativeTime: 0)
        
        playPattern(events: [event])
    }
    
    func playSuccess() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        // "Charge Up" sensation
        let events = [
            CHHapticEvent(eventType: .hapticContinuous, parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.5),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
            ], relativeTime: 0, duration: 0.2),
            CHHapticEvent(eventType: .hapticTransient, parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 1.0)
            ], relativeTime: 0.2)
        ]
        
        playPattern(events: events)
    }
    
    func playError() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        
        // "Glitch" sensation (rapid staccato)
        let events = [
            CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0),
            CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0.05),
            CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0.1)
        ]
        
        playPattern(events: events)
    }
    
    private func playPattern(events: [CHHapticEvent]) {
        do {
            let pattern = try CHHapticPattern(events: events, parameters: [])
            let player = try engine?.makePlayer(with: pattern)
            try player?.start(atTime: 0)
        } catch {
            print("Failed to play haptic: \(error)")
        }
    }
}
