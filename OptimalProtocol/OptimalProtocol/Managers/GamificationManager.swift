import SwiftUI
import Combine
import Supabase
import WidgetKit
import UserNotifications
import BackgroundTasks

// Configuration Struct
struct Config {
    static let supabaseUrl = URL(string: "https://ucywcjpunougqrjfaqbf.supabase.co")!
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeXdjanB1bm91Z3FyamZhcWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NzY5MTMsImV4cCI6MjA4MDA1MjkxM30.IpCbxkFMzmhwTvi2zDuDB8o4oT9A5Z7Tss5_82e_xYo"
}

// Widget Data (Shared)
struct WidgetData: Codable {
    let streak: Int
    let integrity: Float
    let habits: [SimpleHabit]
    let lastUpdate: Date
}

struct SimpleHabit: Codable, Identifiable {
    let id: UUID
    let title: String
    let isCompleted: Bool
}

class GamificationManager: ObservableObject {
    // Dependencies
    private let client = SupabaseClient(supabaseURL: Config.supabaseUrl, supabaseKey: Config.supabaseAnonKey)
    private let haptics = HapticsManager.shared
    
    // Published State
    @Published var user: User?
    @Published var habits: [Habit] = []
    @Published var logs: [Log] = []
    @Published var hardcoreMode: Bool = false
    @Published var streak: Int = 0
    @Published var stats: Stats = Stats()
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
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
        Task {
            await checkSession()
            setupNotifications()
        }
    }
    
    // --- NOTIFICATIONS ---
    func setupNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                self.scheduleDailyBriefing()
            }
        }
    }
    
    func scheduleDailyBriefing() {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        
        // Morning Briefing (07:00)
        let morningContent = UNMutableNotificationContent()
        morningContent.title = "SYSTEM REBOOT"
        morningContent.body = "EXECUTE MORNING PROTOCOL. DO NOT FAIL."
        morningContent.sound = .default
        
        var morningDate = DateComponents()
        morningDate.hour = 7
        morningDate.minute = 0
        let morningTrigger = UNCalendarNotificationTrigger(dateMatching: morningDate, repeats: true)
        let morningRequest = UNNotificationRequest(identifier: "morning_brief", content: morningContent, trigger: morningTrigger)
        center.add(morningRequest)
        
        // Evening Check (20:00)
        let eveningContent = UNMutableNotificationContent()
        eveningContent.title = "STATUS CHECK"
        eveningContent.body = "REPORT PROGRESS. MAINTAIN THE STREAK."
        eveningContent.sound = .default
        
        var eveningDate = DateComponents()
        eveningDate.hour = 20
        eveningDate.minute = 0
        let eveningTrigger = UNCalendarNotificationTrigger(dateMatching: eveningDate, repeats: true)
        let eveningRequest = UNNotificationRequest(identifier: "evening_check", content: eveningContent, trigger: eveningTrigger)
        center.add(eveningRequest)
    }
    
    // --- WIDGET SYNC ---
    private func syncWidget() {
        let simpleHabits = habits.map { h in
            SimpleHabit(id: h.id, title: h.title, isCompleted: logs.contains(where: { $0.habitId == h.id }))
        }
        
        let widgetData = WidgetData(
            streak: streak,
            integrity: stats.integrity,
            habits: simpleHabits,
            lastUpdate: Date()
        )
        
        if let defaults = UserDefaults(suiteName: "group.com.optimal.protocol"),
           let encoded = try? JSONEncoder().encode(widgetData) {
            defaults.set(encoded, forKey: "widgetData")
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
    
    // --- BACKGROUND FETCH ---
    func performBackgroundFetch() async {
        guard let user = user else { return }
        await fetchData(userId: user.id)
    }
    
    @MainActor
    func checkSession() async {
        do {
            let session = try await client.auth.session
            // OPRAVA: Session user je nyní non-optional, takže 'if let' není třeba
            let user = session.user
            await fetchData(userId: user.id)
            await checkVitalSigns()
        } catch {
            print("Session check failed: \(error)")
        }
    }
    
    @MainActor
    func fetchData(userId: UUID) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // 1. Fetch Profile - OPRAVA: Odstraněno .database
            let profile: User = try await client
                .from("profiles")
                .select()
                .eq("id", value: userId)
                .single()
                .execute()
                .value
            
            self.user = profile
            self.streak = profile.streak
            
            // 2. Fetch Habits - OPRAVA: Odstraněno .database
            let habits: [Habit] = try await client
                .from("habits")
                .select()
                .eq("user_id", value: userId)
                .execute()
                .value
            
            self.habits = habits
            
            // 3. Fetch Today's Logs - OPRAVA: Odstraněno .database
            let todayStr = ISO8601DateFormatter().string(from: Date()).prefix(10)
            let logs: [Log] = try await client
                .from("logs")
                .select()
                .eq("user_id", value: userId)
                .eq("date_string", value: String(todayStr))
                .execute()
                .value
            
            self.logs = logs
            
            calculateStats()
            
        } catch {
            self.errorMessage = "Failed to fetch data: \(error.localizedDescription)"
            // haptics.playError() // Uncomment if haptics implemented
        }
    }
    
    @MainActor
    func checkVitalSigns() async {
        do {
            // Call RPC - OPRAVA: Odstraněno .database
            // Používáme jednoduché volání bez generického typu pro zjednodušení, pokud RPC vrací JSON
            let _: Void = try await client.rpc("check_vital_signs").execute().value
            
            // Pokud funkce nic nevrací nebo vrací komplexní objekt,
            // zde by byla logika pro zpracování "DEAD" statusu.
            // Pro MVP to necháme takto (funkce na serveru smaže data sama).
            
        } catch {
            print("Vital signs check failed: \(error)")
        }
    }
    
    @MainActor
    func toggleHabit(habit: Habit) async {
        guard let user = user else { return }
        
        let todayStr = String(ISO8601DateFormatter().string(from: Date()).prefix(10))
        
        // Optimistic Update
        let isCompleted = logs.contains(where: { $0.habitId == habit.id })
        
        if isCompleted {
            // Remove Log
            logs.removeAll(where: { $0.habitId == habit.id })
            haptics.playImpact(intensity: 0.5)
            
            do {
                try await client
                    .from("logs")
                    .delete()
                    .match(["habit_id": habit.id, "date_string": todayStr])
                    .execute()
            } catch {
                print("Error deleting log: \(error)")
                await fetchData(userId: user.id) // Re-sync
            }
        } else {
            // Add Log
            let newLog = Log(id: UUID(), userId: user.id, habitId: habit.id, completedAt: Date(), dateString: String(todayStr))
            logs.append(newLog)
            haptics.playSuccess()
            
            do {
                try await client
                    .from("logs")
                    .insert(newLog)
                    .execute()
                
                // Fetch updated streak
                let updatedProfile: User = try await client
                    .from("profiles")
                    .select()
                    .eq("id", value: user.id)
                    .single()
                    .execute()
                    .value
                
                self.streak = updatedProfile.streak
                
            } catch {
                print("Error inserting log: \(error)")
                logs.removeAll(where: { $0.id == newLog.id }) // Rollback
                // haptics.playError()
            }
        }
        
        calculateStats()
    }
    
    private func calculateStats() {
        var newStats = Stats()
        
        let totalHabits = habits.count
        if totalHabits == 0 {
            self.stats = newStats
            syncWidget()
            return
        }
        
        let completedIds = Set(logs.map { $0.habitId })
        
        var trainingCount = 0
        var nutritionCount = 0
        var recoveryCount = 0
        var knowledgeCount = 0
        
        for habit in habits {
            if completedIds.contains(habit.id) {
                switch habit.category {
                case .training: trainingCount += 1
                case .nutrition: nutritionCount += 1
                case .recovery: recoveryCount += 1
                case .knowledge: knowledgeCount += 1
                }
            }
        }
        
        newStats.training = Float(trainingCount)
        newStats.nutrition = Float(nutritionCount)
        newStats.recovery = Float(recoveryCount)
        newStats.knowledge = Float(knowledgeCount)
        
        self.stats = newStats
        
        // SYNC WIDGET
        syncWidget()
    }
    
    func toggleHardcore() {
        hardcoreMode.toggle()
        haptics.playImpact()
    }
}
