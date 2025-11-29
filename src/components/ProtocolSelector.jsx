import React from 'react';
import './ProtocolSelector.css';
import { Sword, Brain, PenTool, Sliders } from 'lucide-react';

const protocols = [
    {
        id: 'spartan',
        name: 'THE SPARTAN',
        subtitle: 'PHYSICAL DOMINANCE',
        icon: <Sword size={32} />,
        color: '#ff003c',
        habits: [
            { text: '100 Pushups', category: 'training' },
            { text: 'Cold Shower', category: 'recovery' },
            { text: 'Zero Sugar', category: 'nutrition' },
            { text: 'No Social Media', category: 'knowledge' }
        ]
    },
    {
        id: 'monk',
        name: 'MONK MODE',
        subtitle: 'MENTAL CLARITY',
        icon: <Brain size={32} />,
        color: '#39D1FF',
        habits: [
            { text: '4h Deep Work', category: 'knowledge' },
            { text: 'Meditation (20m)', category: 'recovery' },
            { text: 'Read 10 Pages', category: 'knowledge' },
            { text: 'Journaling', category: 'knowledge' }
        ]
    },
    {
        id: 'architect',
        name: 'THE ARCHITECT',
        subtitle: 'SYSTEM BALANCE',
        icon: <PenTool size={32} />,
        color: '#39FF14',
        habits: [
            { text: '8h Sleep', category: 'recovery' },
            { text: '3L Water', category: 'nutrition' },
            { text: 'Gym Session', category: 'training' },
            { text: 'Plan Tomorrow', category: 'knowledge' }
        ]
    },
    {
        id: 'custom',
        name: 'CUSTOM',
        subtitle: 'DESIGN YOUR SYSTEM',
        icon: <Sliders size={32} />,
        color: '#ffffff',
        habits: [
            { text: 'Define Objective 1', category: 'training' }
        ]
    }
];

const ProtocolSelector = ({ onSelect }) => {
    return (
        <div className="protocol-selector-container">
            <h2 className="protocol-title">CHOOSE YOUR PATH</h2>
            <p className="protocol-subtitle">Select a protocol to initialize your system.</p>

            <div className="protocol-grid">
                {protocols.map((p) => (
                    <div
                        key={p.id}
                        className="protocol-card"
                        style={{ '--accent-color': p.color }}
                        onClick={() => onSelect(p.habits)}
                    >
                        <div className="protocol-icon" style={{ color: p.color }}>
                            {p.icon}
                        </div>
                        <div className="protocol-info">
                            <h3>{p.name}</h3>
                            <span>{p.subtitle}</span>
                        </div>
                        <ul className="protocol-list">
                            {p.habits.map((h, i) => (
                                <li key={i}>• {h.text}</li>
                            ))}
                        </ul>
                        <button className="protocol-btn">INITIALIZE</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProtocolSelector;
