
import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const newsItems = [
  {
    category: 'Articles Story',
    title: 'Sello Buen Diseño',
    description: '¿Es trones productos? Están esta proporior comodidad, funcionalidad astille, poll y tor que peer seder compartir megria mregria con uctades. Se ensguileeme onunciar que nuestra ma lines de productos intmties.',
    imageUrl: 'https://picsum.photos/id/21/800/500'
  },
  {
    category: 'Design Trends',
    title: 'Minimalist Living',
    description: 'Discover how minimalism can transform your living space into a sanctuary of peace and clarity. Less is more when it comes to creating a truly harmonious home environment.',
    imageUrl: 'https://picsum.photos/id/1078/800/500'
  },
  {
    category: 'Material Focus',
    title: 'The Beauty of Oak',
    description: 'Explore the timeless appeal of oak wood in furniture design. Its durability, grain patterns, and warm tones make it a perennial favorite for creating lasting pieces.',
    imageUrl: 'https://picsum.photos/id/357/800/500'
  }
];

const LatestNews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? newsItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === newsItems.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <section className="py-24 bg-brand-bg">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif text-center mb-12 text-brand-primary font-serif">Latest News</h2>
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-lg shadow-xl bg-white">
            <div className="flex transition-transform ease-in-out duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {newsItems.map((item, index) => (
                <div key={index} className="min-w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2">
                  <div className="relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-64 md:h-full object-cover" />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                    <h3 className="text-2xl lg:text-3xl font-serif font-bold mb-4 text-brand-primary font-serif">{item.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                    <button className="bg-white text-brand-primary font-semibold py-2 px-6 rounded-md border border-gray-300 self-start hover:bg-gray-100 transition-colors">
                      Descubra now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={prevSlide} className="absolute top-1/2 left-0 md:-left-6 transform -translate-y-1/2 bg-white/80 rounded-md p-2 shadow-md hover:bg-white transition-colors">
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 right-0 md:-right-6 transform -translate-y-1/2 bg-white/80 rounded-md p-2 shadow-md hover:bg-white transition-colors">
            <ChevronRightIcon className="h-6 w-6 text-gray-700" />
          </button>
          
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex justify-center py-2 space-x-2">
            {newsItems.map((_, slideIndex) => (
              <button 
                key={slideIndex} 
                onClick={() => goToSlide(slideIndex)}
                className={`w-2 h-2 rounded-md transition-colors ${currentIndex === slideIndex ? 'bg-brand-support' : 'bg-gray-300'}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
