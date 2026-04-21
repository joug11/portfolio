import { DataLoader }           from '../../shared/js/utils/data-loader.js';
import { Navbar }               from './components/navbar.js';
import { TypingAnimation }      from './components/typing.js';
import { FadeInObserver }       from './components/fade-in.js';
import { ScrollTopButton }      from './components/scroll-top.js';
import { ProfileRenderer }      from './components/profile-renderer.js';
import { SkillsRenderer }       from './components/skills-renderer.js';
import { ProjectsRenderer }     from './components/projects-renderer.js';
import { ExperienceRenderer }   from './components/experience-renderer.js';

async function initPortfolio() {
  const loader = new DataLoader();

  const [profile, projects, skills, experience] = await loader.loadAll([
    'data/profile.json',
    'data/projects.json',
    'data/skills.json',
    'data/experience.json',
  ]);

  const profileRenderer = new ProfileRenderer(loader);
  profileRenderer.renderHero(profile);
  profileRenderer.renderAbout(profile);
  profileRenderer.renderContact(profile);

  const projectsRenderer = new ProjectsRenderer('projectsGrid');
  projectsRenderer.render(projects);

  const skillsRenderer = new SkillsRenderer('skillsTabs', 'skillsGrid');
  skillsRenderer.render(skills);
  skillsRenderer.initTabs();

  const experienceRenderer = new ExperienceRenderer('experienceTimeline');
  experienceRenderer.render(experience);

  const navbar = new Navbar('navbar', 'navMenu', 'hamburger');
  navbar.init();

  const typing = new TypingAnimation('typingText', profile.roles || []);
  typing.start(800);

  const fadeIn = new FadeInObserver('.fade-in');
  fadeIn.observe();

  const fadeInGrid = new FadeInObserver('.fade-in');
  fadeInGrid.observeNew(document.getElementById('projectsGrid') || document);
  fadeInGrid.observeNew(document.getElementById('experienceTimeline') || document);

  const scrollTop = new ScrollTopButton('scrollTop');
  scrollTop.init();
}

document.addEventListener('DOMContentLoaded', initPortfolio);
