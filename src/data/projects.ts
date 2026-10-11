export const projects = [
  { id:'robotics', number:'01', eyebrow:'ROBOT LEARNING', title:'From demonstrations to robotic behavior.', description:'Simulation-based manipulation, reinforcement and imitation learning, and VR teleoperation workflows.', href:'/projects/robotics/', tags:['Isaac Sim / Lab','RL · IL','Teleoperation'], accent:'robotics' },
  { id:'vision', number:'02', eyebrow:'PERCEPTION AT SCALE', title:'Computer vision, beyond a notebook.', description:'Detection, tracking and recognition systems built with the constraints of real-time deployment in mind.', href:'/projects/vision/', tags:['PyTorch','DeepStream','OpenCV'], accent:'vision' },
  { id:'hardware', number:'03', eyebrow:'MADE BY HAND', title:'A circuit. A controller. A working idea.', description:'Personal electronics projects that connect software to physical interfaces and mechanisms.', href:'/projects/hardware/', tags:['Arduino','PCB design','Prototyping'], accent:'hardware' },
] as const;
