import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import works from '../../data/experience.json';

interface ExperienceModel {
  company: string;
  job: string;
  date: string;
  description: string;
}

export default function Experience() {
  return (
    <div className="hero min-h-screen px-5" id='experience'>
      <VerticalTimeline>
        {works.experience.map((exp: ExperienceModel) => (
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'hsl(var(--p))', color: '#fff' }}
            contentArrowStyle={{ borderRight: '7px solid hsl(var(--p))' }}
            date={exp.date}
            iconStyle={{ background: 'white' }}
            icon={
              <img
                alt={exp.company}
                src={
                  process.env.PUBLIC_URL +
                  '/assets/works/' +
                  exp.company.toLowerCase().replace(' ', '_') +
                  '.jpg'
                }
                className="rounded-full"
              />
            }
          >
            <h3 className="vertical-timeline-element-title">{exp.job}</h3>
            <h4 className="vertical-timeline-element-subtitle">
              {exp.company}
            </h4>
            <p>{exp.description}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
}
