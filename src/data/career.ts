export const career = [
  { id: 'iitb', name: 'IIT Bombay', shortName: 'IIT Bombay', role: 'Research internships', dates: '2019–2020 · 2021–2022',
    description: 'Built OCR and annotation tools for structured document extraction, then applied computer vision to rice phenotyping.',
    details: 'Machine Learning Intern, July 2019–May 2020. Computer Vision Intern, August 2021–March 2022. Developed data-labeling and augmentation tools and contributed to genotype discrimination research.',
    link: '/research/', color: '#567c88', logo: '/world/logos/hires/iitb.svg' },
  { id: 'jio', name: 'Jio', shortName: 'Jio', role: 'Deep Learning Engineer', dates: '2022–2024',
    description: 'Developed production vision systems for license-plate recognition, person analytics and access control.',
    details: 'April 2022–December 2024. Worked on detection, recognition, tracking and scalable deployment using DeepStream, PyTorch, OpenCV and Milvus.',
    link: '/projects/vision/', color: '#9b5e60', logo: '/world/logos/hires/jio.svg' },
  { id: 'samsung', name: 'Samsung Electro-Mechanics', shortName: 'Samsung Electro-Mechanics', role: 'Robotics / Deep Learning Engineer', dates: '2024–present',
    description: 'Builds simulation-based robotic manipulation pipelines, VR teleoperation and robot-learning data workflows.',
    details: 'December 2024–present. Develops and evaluates reinforcement and imitation learning policies using Isaac Sim and Isaac Lab, building on earlier driver-monitoring perception work.',
    link: '/projects/robotics/', color: '#536f98', logo: '/world/logos/samsung.svg' },
] as const;
