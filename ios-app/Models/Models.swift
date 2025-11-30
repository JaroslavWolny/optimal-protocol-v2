import Foundation

struct User: Identifiable, Codable {
    let id: UUID
    let username: String?
    let avatarStage: Int
    let streak: Int
    let createdAt: Date
    let lastActive: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case avatarStage = "avatar_stage"
        case streak
        case createdAt = "created_at"
        case lastActive = "last_active"
    }
}

struct Habit: Identifiable, Codable {
    let id: UUID
    let userId: UUID
    let title: String
    let category: HabitCategory
    let frequency: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case category
        case frequency
        case createdAt = "created_at"
    }
}

enum HabitCategory: String, Codable, CaseIterable {
    case training
    case nutrition
    case recovery
    case knowledge
}

struct Log: Identifiable, Codable {
    let id: UUID
    let userId: UUID
    let habitId: UUID
    let completedAt: Date
    let dateString: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case habitId = "habit_id"
        case completedAt = "completed_at"
        case dateString = "date_string"
    }
}
