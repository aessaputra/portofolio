"use client";

import { motion } from "@/shared/ui/motion";

interface SkillProps {
  name: string;
  x: string;
  y: string;
}

interface SkillsData {
  skills: Array<{
    name: string;
    x: string;
    y: string;
  }>;
}

const Skill = ({ name, x, y }: SkillProps) => {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full font-semibold bg-dark text-light py-3 px-6 shadow-dark cursor-pointer absolute dark:text-dark dark:bg-light \
      lg:py-2 lg:px-4 md:text-sm md:py-1.5 md:px-3 xs:bg-transparent xs:dark:bg-transparent xs:text-dark xs:dark:text-light xs:font-bold"
      whileHover={{ scale: 1.05 }}
      initial={{ x: 0, y: 0 }}
      whileInView={{ x, y, transition: { duration: 1.5 } }}
      viewport={{ once: true }}
    >
      {name}
    </motion.div>
  );
};

export default function Skills({ data }: { data?: SkillsData }) {
  const skills = data?.skills ?? [];

  return (
    <>
      <h2 className="font-bold text-8xl mt-60 w-full text-center mb-8 pb-4 lg:pb-2 md:text-6xl md:mt-32">
        Skills
      </h2>
      <div
        className="w-full h-screen relative flex items-center justify-center rounded-full bg-circular-light dark:bg-circular-dark
       lg:h-[80vh] sm:h-[60vh] xs:h-[40vh]
       lg:bg-circular-light-lg lg:dark:bg-circular-dark-lg
       md:bg-circular-light-md md:dark:bg-circular-dark-md
       sm:bg-circular-light-sm sm:dark:bg-circular-dark-sm"
      >
        <motion.div
          className="flex items-center justify-center rounded-full font-semibold bg-dark text-light p-8 shadow-dark cursor-pointer dark:text-dark dark:bg-light lg:p-6 md:p-4 xs:text-xs xs:p-2"
          whileHover={{ scale: 1.05 }}
        >
          web
        </motion.div>

        {skills.map((skill, index) => (
          <Skill key={`${skill.name}-${index}`} name={skill.name} x={skill.x} y={skill.y} />
        ))}
        {skills.length === 0 && (
          <p className="absolute bottom-6 text-sm text-gray-500 dark:text-gray-400">
            Skills will appear here once added in the admin panel.
          </p>
        )}
      </div>
    </>
  );
}
