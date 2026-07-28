
import React from 'react';

interface CollectionCardProps {
  imageUrl: string;
  title: string;
  description: string;
  className?: string;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ imageUrl, title, description, className }) => {
  return (
    <div className={`relative rounded-2xl overflow-hidden group ${className}`}>
      <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
        <h3 className="text-2xl font-bold mb-2 font-serif">{title}</h3>
        <p className="text-sm text-gray-200 line-clamp-2">{description}</p>
        <div className="mt-4 overflow-hidden h-0 group-hover:h-8 transition-all duration-300">
           <span className="text-xs font-bold uppercase tracking-widest border-b border-white pb-1 cursor-pointer">Explorar colección</span>
        </div>
      </div>
    </div>
  );
};

const FeaturedCollections: React.FC = () => {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4 font-serif">Colecciones Destacadas</h2>
            <p className="text-gray-600 text-lg">Descubre nuestra selección de piezas curadas para cada espacio de tu vida.</p>
          </div>
          <button className="text-brand-primary font-bold border-b-2 border-brand-support pb-1 hover:text-opacity-70 transition-all">Ver todo el portfolio</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CollectionCard 
            imageUrl="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop" 
            title="Comedores Modernos" 
            description="La armonía perfecta para tus momentos compartidos."
            className="h-[500px]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <CollectionCard 
              imageUrl="https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=400&auto=format&fit=crop" 
              title="Dormitorios Relax" 
              description="Confort absoluto para un descanso reparador."
              className="h-60 md:h-auto"
            />
            <CollectionCard 
              imageUrl="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400&auto=format&fit=crop" 
              title="Estanterías & Deco" 
              description="Orden y estilo en una sola pieza."
              className="h-60 md:row-span-2"
            />
            <CollectionCard 
              imageUrl="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop" 
              title="Home Office" 
              description="Potencia tu productividad con el mejor diseño."
               className="h-60 md:h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
