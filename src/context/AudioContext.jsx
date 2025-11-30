import React, { createContext, useContext, useEffect } from 'react';
import { soundManager } from '../utils/SoundManager';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    useEffect(() => {
        const initAudio = () => {
            soundManager.init();
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const play = (soundName) => {
        // Map simplified names to manager methods if needed, or expose manager directly
        switch (soundName) {
            case 'thud': soundManager.playThud(); break;
            case 'charge': soundManager.playCharge(); break;
            case 'glitch': soundManager.playGlitch(); break;
            case 'gameover': soundManager.playGameOver(); break;
            default: break;
        }
    };

    return (
        <AudioContext.Provider value={{ soundManager, play }}>
            {children}
        </AudioContext.Provider>
    );
};
