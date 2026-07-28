import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, Html, Line, useGLTF, RoundedBox, useTexture } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, MousePointer2, Ruler } from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';

interface PieceViewer3DProps {
    isOpen: boolean;
    onClose: () => void;
    pieceName: string;
    dimensions: string; // Formato 'Largo x Ancho x Espesor' (cm) ej: '120x40x1.5'
    modelUrl?: string; // URL para el archivo .glb
    finishes?: string[]; // Opcional: Arreglo de 6 acabados ['derecha', 'izquierda', 'arriba', 'abajo', 'frente', 'atrás']
}

const DimensionLabel: React.FC<{ position: [number, number, number], label: string, value: string }> = ({ position, label, value }) => (
    <Html position={position} center distanceFactor={12}>
        <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="bg-white/95 backdrop-blur-sm border border-brand-support/20 px-2 py-1 rounded-full shadow-md flex items-center space-x-1.5 whitespace-nowrap">
                <span className="text-[8px] font-bold text-brand-primary/50 uppercase tracking-tighter">{label}</span>
                <span className="text-xs font-black text-brand-primary font-mono">{value}</span>
                <span className="text-[8px] font-bold text-brand-primary/40">cm</span>
            </div>
            <div className="w-px h-2 bg-brand-support/30 mt-0.5"></div>
        </div>
    </Html>
);

const MaderaPieza: React.FC<{ dimensions: string, finishes?: string[] }> = ({ dimensions, finishes }) => {
    // Parseo de dimensiones (asumiendo formato Largo x Ancho x Espesor en cm)
    const [l, a, e] = (dimensions || '10x10x1.5').toLowerCase().split('x').map(val => parseFloat(val.trim()));
    
    // Normalizamos nombres de materiales: 0: R, 1: L, 2: Top, 3: Bottom, 4: Front, 5: Back
    const defaultFinishes = (finishes && finishes.length === 6) ? finishes : ['roble', 'roble', 'roble', 'roble', 'roble', 'roble'];

    // Cargamos texturas (usaremos placeholders de alta calidad que simulen Roble y Blanco)
    const woodTexture = useTexture('https://i.postimg.cc/mD8N05p4/Gemini-Generated-Image-k9r42rk9r42rk9r4.webp'); // Textura de Roble
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;

    // Convertimos a unidades de escena (escala 0.05 para que no sea gigante)
    const scale = 0.05;
    const w = l * scale;
    const h = e * scale;
    const d = a * scale;

    return (
        <group>
            <RoundedBox 
                args={[w, h, d]} 
                radius={0.01} // Bisel de 1mm
                smoothness={4}
            >
                {defaultFinishes.map((finish, idx) => {
                    const isRoble = finish.toLowerCase() === 'roble';
                    const isWhite = finish.toLowerCase() === 'blanco';
                    
                    return (
                        <meshStandardMaterial 
                            key={idx}
                            attach={`material-${idx}`}
                            color={isRoble ? '#ffffff' : (isWhite ? '#ffffff' : '#cccccc')} 
                            map={isRoble ? woodTexture : null}
                            roughness={isRoble ? 0.4 : 0.2}
                            metalness={0.05}
                            onBeforeCompile={(shader) => {
                                if (isRoble && woodTexture) {
                                    // Ajuste de tiling para que la veta no se vea gigante
                                    woodTexture.repeat.set(l/20, a/20);
                                }
                            }}
                        />
                    );
                })}
            </RoundedBox>
            
            {/* Etiquetas de dimensiones para referencia visual */}
            <group>
                {/* Largo (X) */}
                <group position={[0, -h / 2 - 0.3, d / 2 + 0.3]}>
                    <Line points={[[-w / 2, 0, 0], [w / 2, 0, 0]]} color="#2D5A27" lineWidth={2} />
                    <DimensionLabel position={[0, 0, 0]} label="Largo" value={l.toString()} />
                </group>
                {/* Ancho (Z) */}
                <group position={[w / 2 + 0.3, -h / 2 - 0.3, 0]}>
                    <Line points={[[0, 0, -d / 2], [0, 0, d / 2]]} color="#2D5A27" lineWidth={2} />
                    <DimensionLabel position={[0, 0, 0]} label="Ancho" value={a.toString()} />
                </group>
                {/* Espesor (Y) */}
                <group position={[-w / 2 - 0.3, 0, d / 2 + 0.3]}>
                    <Line points={[[0, -h / 2, 0], [0, h / 2, 0]]} color="#2D5A27" lineWidth={2} />
                    <DimensionLabel position={[0, 0, 0]} label="Espes." value={e.toString()} />
                </group>
            </group>
        </group>
    );
};

const PieceModel: React.FC<{ url: string }> = ({ url }) => {
    const isObj = url.toLowerCase().endsWith('.obj');
    
    if (isObj) {
        const obj = useLoader(OBJLoader, url);
        return <primitive object={obj} scale={10} />;
    }
    
    const gltf = useGLTF(url);
    const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
    return <primitive object={scene} scale={10} />;
};

const PieceViewer3D: React.FC<PieceViewer3DProps> = ({ isOpen, onClose, pieceName, dimensions, modelUrl, finishes }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="bg-white w-full max-w-5xl h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Premium */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-brand-bg rounded-2xl">
                                    <Ruler className="text-brand-primary" size={24} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl md:text-2xl font-black text-brand-primary tracking-tight uppercase leading-none font-serif">{pieceName}</h2>
                                    <p className="text-xs md:text-sm text-gray-400 font-medium flex items-center mt-1">
                                        <Box size={14} className="mr-2" />
                                        Componente de precisión en madera
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-brand-primary"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* 3D Canvas */}
                        <div className="flex-1 bg-[#FDFDFD] relative cursor-grab active:cursor-grabbing">
                            <Canvas shadows dpr={[1, 2]}>
                                <Suspense fallback={
                                    <Html center>
                                        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-support"></div>
                                            <p className="text-brand-primary text-xs font-bold uppercase tracking-widest whitespace-nowrap">Cargando 3D...</p>
                                        </div>
                                    </Html>
                                }>
                                    <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={55} />
                                    <OrbitControls
                                        makeDefault
                                        minDistance={1}
                                        maxDistance={15}
                                        enableDamping={true}
                                    />

                                    <Stage intensity={0.8} environment="city" adjustCamera={true}>
                                        {modelUrl ? (
                                            <PieceModel url={modelUrl} />
                                        ) : (
                                            <MaderaPieza dimensions={dimensions} finishes={finishes} />
                                        )}
                                    </Stage>

                                    <Environment preset="city" />
                                    <ambientLight intensity={0.4} />
                                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                                </Suspense>
                            </Canvas>

                            {/* Controles Overlay */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                                <div className="px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 flex items-center space-x-3 transition-transform hover:scale-105">
                                    <MousePointer2 size={16} className="text-brand-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/60">
                                        Arrastra para rotar la pieza
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer con dimensiones reales */}
                        {dimensions && dimensions !== '10x10x1.5' && (
                            <div className="p-4 md:p-6 bg-brand-support/5 flex justify-center space-x-8 md:space-x-16 border-t border-brand-support/10">
                                {dimensions.split('x').map((dim, idx) => {
                                    const labels = ['LARGO', 'ANCHO', 'ESPESOR'];
                                    return (
                                        <div key={idx} className="flex flex-col items-center">
                                            <span className="text-[9px] font-bold text-brand-primary/40 tracking-widest uppercase mb-1">{labels[idx]}</span>
                                            <span className="text-lg md:text-xl font-black text-brand-primary">{dim} cm</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PieceViewer3D;
