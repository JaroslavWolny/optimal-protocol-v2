import SwiftUI
import WidgetKit

// --- VIEWS ---

struct OptimalWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            // Scanlines
            VStack(spacing: 2) {
                ForEach(0..<20) { _ in
                    Rectangle()
                        .fill(Color.green.opacity(0.05))
                        .frame(height: 1)
                    Spacer()
                }
            }
            
            if family == .systemSmall {
                SmallWidgetView(data: entry.data)
            } else {
                MediumWidgetView(data: entry.data)
            }
        }
    }
}

struct SmallWidgetView: View {
    let data: WidgetData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("STATUS")
                .font(.custom("Courier", size: 10))
                .foregroundColor(.gray)
            
            HStack {
                Text("🔥")
                Text("\(data.streak)")
                    .font(.custom("Courier", size: 24))
                    .bold()
                    .foregroundColor(.green)
            }
            
            Spacer()
            
            // Retro Face
            Text(data.integrity > 0.5 ? "[^_^]" : "[x_x]")
                .font(.custom("Courier", size: 20))
                .foregroundColor(data.integrity > 0.5 ? .green : .red)
                .frame(maxWidth: .infinity, alignment: .center)
            
            Spacer()
            
            Text("INTEGRITY")
                .font(.custom("Courier", size: 8))
                .foregroundColor(.gray)
            
            // Health Bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 4)
                    Rectangle()
                        .fill(data.integrity > 0.4 ? Color.green : Color.red)
                        .frame(width: geo.size.width * CGFloat(data.integrity), height: 4)
                }
            }
            .frame(height: 4)
        }
        .padding()
        .overlay(
            RoundedRectangle(cornerRadius: 0)
                .stroke(Color.green.opacity(0.3), lineWidth: 1)
        )
    }
}

struct MediumWidgetView: View {
    let data: WidgetData
    
    var body: some View {
        HStack(spacing: 15) {
            // Left Panel: Stats
            VStack(alignment: .leading) {
                Text("OPTIMAL PROTOCOL")
                    .font(.custom("Courier", size: 10))
                    .bold()
                    .foregroundColor(.green)
                
                Spacer()
                
                HStack {
                    VStack(alignment: .leading) {
                        Text("STREAK")
                            .font(.custom("Courier", size: 8))
                            .foregroundColor(.gray)
                        Text("\(data.streak)")
                            .font(.custom("Courier", size: 20))
                            .foregroundColor(.white)
                    }
                    Spacer()
                    VStack(alignment: .leading) {
                        Text("SYSTEM")
                            .font(.custom("Courier", size: 8))
                            .foregroundColor(.gray)
                        Text(data.integrity * 100 > 90 ? "GOD" : "NRML")
                            .font(.custom("Courier", size: 20))
                            .foregroundColor(data.integrity > 0.8 ? .yellow : .green)
                    }
                }
            }
            .frame(width: 100)
            
            Divider().background(Color.green)
            
            // Right Panel: Habits
            VStack(alignment: .leading, spacing: 6) {
                ForEach(data.habits.prefix(3)) { habit in
                    HStack {
                        Image(systemName: habit.isCompleted ? "checkmark.square.fill" : "square")
                            .foregroundColor(habit.isCompleted ? .green : .gray)
                            .font(.system(size: 12))
                        Text(habit.title.uppercased())
                            .font(.custom("Courier", size: 10))
                            .foregroundColor(habit.isCompleted ? .gray : .white)
                            .lineLimit(1)
                    }
                }
                if data.habits.isEmpty {
                    Text("NO DIRECTIVES")
                        .font(.custom("Courier", size: 10))
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .overlay(
            RoundedRectangle(cornerRadius: 0)
                .stroke(Color.green.opacity(0.3), lineWidth: 1)
        )
    }
}

// --- TIMELINE PROVIDER ---

struct Provider: TimelineProvider {
    // TOTO BYLA TA CHYBA - Explicitně říkáme, co je "Entry"
    typealias Entry = SimpleEntry

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: WidgetData(streak: 0, integrity: 1.0, habits: [], lastUpdate: Date()))
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), data: loadData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        // Refresh every 15 minutes
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        
        let entry = SimpleEntry(date: currentDate, data: loadData())
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
    
    private func loadData() -> WidgetData {
        // Read from App Group
        if let defaults = UserDefaults(suiteName: "group.com.optimal.protocol"),
           let savedData = defaults.data(forKey: "widgetData"),
           let decoded = try? JSONDecoder().decode(WidgetData.self, from: savedData) {
            return decoded
        }
        return WidgetData(streak: 0, integrity: 0.5, habits: [
            SimpleHabit(id: UUID(), title: "TRAINING", isCompleted: false),
            SimpleHabit(id: UUID(), title: "DEEP WORK", isCompleted: true)
        ], lastUpdate: Date())
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

struct OptimalWidgets: Widget {
    let kind: String = "OptimalWidgets"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            OptimalWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Tactical HUD")
        .description("Monitor your vital signs.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
