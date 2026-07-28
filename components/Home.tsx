import React from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import CategoryGrid from './CategoryGrid';
import PopularProducts from './PopularProducts';

import NewsSection from './NewsSection';
import Newsletter from './Newsletter';
import { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onProductClick: (product: Product) => void;
  onStartAR: (product: Product | null) => void;
}

const Home: React.FC<HomeProps> = ({ onProductClick, onStartAR }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Hero />
      <CategoryGrid />
      <PopularProducts onProductClick={onProductClick} />

      <NewsSection />
      <Newsletter />
    </motion.div>
  );
};

export default Home;
