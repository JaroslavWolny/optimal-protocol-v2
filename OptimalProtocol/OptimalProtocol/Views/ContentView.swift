import SwiftUI

struct ContentView: View {
    @StateObject private var manager = GamificationManager()
    
    var body: some View {
        ZStack {
            // Background / 3D Layer
            DoomAvatarView(manager: manager)
                .edgesIgnoringSafeArea(.all)
            
            // UI Overlay
            VStack {
                // Header
                HStack {
                    Text("OPTIMAL PROTOCOL")
                        .font(.custom("ShareTechMono-Regular", size: 20))
                        .foregroundColor(.green)
                        .shadow(color: .green, radius: 5)
                    
                    Spacer()
                    
                    Button(action: {
                        manager.toggleHardcore()
                    }) {
                        HStack {
                            Image(systemName: manager.hardcoreMode ? "skull.fill" : "shield.fill")
                            Text(manager.hardcoreMode ? "DEATH" : "SAFE")
                        }
                        .padding(8)
                        .background(manager.hardcoreMode ? Color.red.opacity(0.8) : Color.green.opacity(0.2))
                        .foregroundColor(manager.hardcoreMode ? .white : .green)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(manager.hardcoreMode ? Color.red : Color.green, lineWidth: 1)
                        )
                    }
                }
                .padding()
                .background(LinearGradient(colors: [.black.opacity(0.8), .clear], startPoint: .top, endPoint: .bottom))
                
                Spacer()
                
                // Bottom Sheet (Glassmorphism)
                VStack(spacing: 20) {
                    // Stats Row
                    HStack(spacing: 30) {
                        StatView(label: "STR", value: manager.stats.training)
                        StatView(label: "NUT", value: manager.stats.nutrition)
                        StatView(label: "REC", value: manager.stats.recovery)
                        StatView(label: "INT", value: manager.stats.knowledge)
                    }
                    
                    Divider().background(Color.white.opacity(0.2))
                    
                    // Habits List Placeholder
                    ScrollView {
                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(manager.habits) { habit in
                                HabitRow(habit: habit)
                            }
                            if manager.habits.isEmpty {
                                Text("NO PROTOCOLS ACTIVE")
                                    .font(.custom("ShareTechMono-Regular", size: 14))
                                    .foregroundColor(.gray)
                                    .frame(maxWidth: .infinity, alignment: .center)
                                    .padding()
                            }
                        }
                    }
                    .frame(height: 200)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(20, corners: [.topLeft, .topRight])
                .shadow(color: .black.opacity(0.5), radius: 10, x: 0, y: -5)
            }
            .edgesIgnoringSafeArea(.bottom)
        }
        .preferredColorScheme(.dark)
    }
}

struct StatView: View {
    let label: String
    let value: Float
    
    var body: some View {
        VStack {
            Text(label)
                .font(.caption)
                .bold()
                .foregroundColor(.gray)
            ZStack(alignment: .bottom) {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 8, height: 40)
                Rectangle()
                    .fill(Color.green)
                    .frame(width: 8, height: 40 * CGFloat(value))
            }
        }
    }
}

struct HabitRow: View {
    let habit: Habit
    
    var body: some View {
        HStack {
            Text(habit.title)
                .font(.body)
                .foregroundColor(.white)
            Spacer()
            Image(systemName: "circle")
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(8)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape( RoundedCorner(radius: radius, corners: corners) )
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}
