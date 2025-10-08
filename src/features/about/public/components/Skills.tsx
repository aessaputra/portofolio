"use client";

import { motion } from "@/shared/ui/motion";
import { useEffect, useState } from "react";

interface SkillProps {
  name: string;
  x: string;
  y: string;
}

interface SkillsData {
  skills: Array<{
    name: string;
  }>;
}

// Hook to detect screen size
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);
  
  return screenSize;
};

// Function to generate adaptive circular positions for skills
const generateCircularPositions = (skills: Array<{ name: string }>, screenSize: string) => {
  if (skills.length === 0) return [];
  
  return skills.map((skill, index) => {
    const totalSkills = skills.length;
    
    // Adaptive radius based on number of skills and screen size
    let baseRadius: number;
    if (totalSkills <= 3) {
      baseRadius = screenSize === 'xs' ? 12 : screenSize === 'sm' ? 14 : 15;
    } else if (totalSkills <= 6) {
      baseRadius = screenSize === 'xs' ? 14 : screenSize === 'sm' ? 16 : 18;
    } else if (totalSkills <= 10) {
      baseRadius = screenSize === 'xs' ? 16 : screenSize === 'sm' ? 18 : 22;
    } else {
      baseRadius = screenSize === 'xs' ? 18 : screenSize === 'sm' ? 20 : 25;
    }
    
    // Add controlled randomness for natural distribution
    const radiusVariation = (Math.random() - 0.5) * (screenSize === 'xs' ? 4 : 6);
    const radius = Math.max(baseRadius + radiusVariation, screenSize === 'xs' ? 6 : 8);
    
    // Calculate angle with offset for better distribution
    const angleOffset = Math.PI / 4; // 45 degree offset for better visual balance
    const angle = (2 * Math.PI * index) / totalSkills + angleOffset;
    
    // Calculate x and y positions
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // Add slight random offset for more natural look (smaller on mobile)
    const randomOffsetX = (Math.random() - 0.5) * (screenSize === 'xs' ? 1 : 2);
    const randomOffsetY = (Math.random() - 0.5) * (screenSize === 'xs' ? 1 : 2);
    
    return {
      name: skill.name,
      x: `${(x + randomOffsetX).toFixed(1)}vw`,
      y: `${(y + randomOffsetY).toFixed(1)}vw`
    };
  });
};

const Skill = ({ name, x, y }: SkillProps) => {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full font-semibold bg-dark text-light py-3 px-6 shadow-dark cursor-pointer absolute dark:text-dark dark:bg-light 
      lg:py-2 lg:px-4 md:text-sm md:py-1.5 md:px-3 xs:bg-transparent xs:dark:bg-transparent xs:text-dark xs:dark:text-light xs:font-bold
      transition-all duration-300 ease-in-out"
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      whileInView={{ 
        x: x, 
        y: y, 
        opacity: 1,
        transition: { 
          duration: 1.5,
          ease: "easeOut",
          delay: Math.random() * 0.5 // Staggered animation
        } 
      }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {name}
    </motion.div>
  );
};

export default function Skills({ data }: { data?: SkillsData }) {
  const skills = data?.skills ?? [];
  const screenSize = useScreenSize();
  
  // Generate positions for skills (auto-generate if not provided)
  const skillsWithPositions = generateCircularPositions(skills, screenSize);

  return (
    <>
      <h2 className="font-bold text-8xl mt-60 w-full text-center mb-8 pb-4 lg:pb-2 md:text-6xl md:mt-32">
        Skills
      </h2>
      <div
        className="skills-container w-full h-screen relative flex items-center justify-center rounded-full bg-circular-light dark:bg-circular-dark
       lg:h-[80vh] sm:h-[60vh] xs:h-[40vh]
       lg:bg-circular-light-lg lg:dark:bg-circular-dark-lg
       md:bg-circular-light-md md:dark:bg-circular-dark-md
       sm:bg-circular-light-sm sm:dark:bg-circular-dark-sm
       xs:bg-circular-light-xs xs:dark:bg-circular-dark-xs
       transition-all duration-500 ease-in-out"
      >
        {/* Additional concentric circles for mobile */}
        <div className="hidden sm:block absolute inset-0 rounded-full border border-white/10 dark:border-white/5 animate-pulse"></div>
        <div className="hidden sm:block absolute inset-4 rounded-full border border-white/5 dark:border-white/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Mobile specific circles */}
        <div className="sm:hidden absolute inset-0 rounded-full border border-white/10 dark:border-white/5 animate-pulse"></div>
        <div className="sm:hidden absolute inset-2 rounded-full border border-white/8 dark:border-white/4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="sm:hidden absolute inset-4 rounded-full border border-white/6 dark:border-white/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="sm:hidden absolute inset-6 rounded-full border border-white/4 dark:border-white/2 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="sm:hidden absolute inset-8 rounded-full border border-white/2 dark:border-white/1 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <motion.div
          className="flex items-center justify-center rounded-full font-semibold bg-dark text-light p-8 shadow-dark cursor-pointer dark:text-dark dark:bg-light lg:p-6 md:p-4 xs:text-xs xs:p-2
          transition-all duration-300 ease-in-out relative z-10"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ 
            scale: 1, 
            opacity: 1,
            transition: { 
              duration: 1,
              ease: "easeOut"
            } 
          }}
          viewport={{ once: true }}
        >
          Software Engineer
        </motion.div>

        {skillsWithPositions.map((skill, index) => (
          <Skill key={`${skill.name}-${index}`} name={skill.name} x={skill.x} y={skill.y} />
        ))}
        {skills.length === 0 && (
          <motion.p 
            className="absolute bottom-6 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.8, delay: 0.5 }
            }}
            viewport={{ once: true }}
          >
            Skills will appear here once added in the admin panel.
          </motion.p>
        )}
      </div>
    </>
  );
}
