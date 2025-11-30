import SwiftUI
import Combine

class GamificationManager: ObservableObject {
    @Published var user: User?
    @Published var habits: [Habit] = []
    @Published var logs: [Log] = []
    @Published var hardcoreMode: Bool = false
    @Published var streak: Int = 0
    @Published var stats: Stats = Stats()
    
    struct Stats {
        var training: Float = 0.0
        var nutrition: Float = 0.0
        var recovery: Float = 0.0
        var knowledge: Float = 0.0
        
        var integrity: Float {
            (training + nutrition + recovery + knowledge) / 4.0
        }
    }
    
    init() {
        // Load initial state or mock data
        self.streak = 5
        self.stats = Stats(training: 0.8, nutrition: 0.6, recovery: 0.4, knowledge: 0.7)
    }
    
    func toggleHardcore() {
        hardcoreMode.toggle()
        // Play sound
        // Trigger haptic
    }
    
    func checkSystemFailure() {
        if hardcoreMode {
            // Logic to check if a day was missed
            // If missed -> Trigger System Failure
        }
    }
}
