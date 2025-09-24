import React from "react";
import policyImage from "../image/policy.png";
import { ConcentricRadialGauges } from "../components/D3CyberCharts";
import ResponsiveChart from "../components/ResponsiveChart";

function Educators() {
  return (
    <div className="page">
      <h2>Teaching Cyber: Closing the skills gap from the classroom</h2>
      <img src={policyImage} alt="Cyber Careers Hub" className="policy-image" />

      <h3>The Classroom Challenge</h3>
      <p>
        Teachers are at the front line of digital literacy, but many feel
        under-prepared when it comes to cyber security. Frameworks such as the
        Curriculum for Wales, the Digital Competence Framework, and CyBOK were
        created to bring cyber into the classroom, but the reality on the ground
        is uneven. Some schools provide lively, practical lessons that spark
        curiosity, while others barely touch the subject.
      </p>
      <p>
        As Martin Peake, a former teacher who moved into the cyber industry,
        reflected:{" "}
        <em>
          “Mostly teachers are left to figure it out. Communities like Computing
          at School help, but they feel home-grown and under-resourced. If the
          curriculum doesn’t reflect practical cyber, many teachers won’t
          prioritise it.”
        </em>{" "}
        His point is clear: enthusiasm is valuable, but without proper resources
        and backing, delivery depends too heavily on individual effort.
      </p>

      <h3>Curriculum and Frameworks</h3>
      <p>
        On paper, progress is significant. CyBOK provides a national benchmark
        for higher education, setting out the domains every cyber professional
        should understand. In Wales, the Digital Competence Framework aims to
        weave online safety, critical thinking, and responsible data use into
        everyday teaching. These frameworks recognise that cyber is not just
        about code, but about legal, social, and human issues.
      </p>
      <p>
        In practice, though, coverage is inconsistent. A 2024 DSIT report found
        that 44% of UK organisations still lack basic cyber skills, while 27%
        report shortages in advanced areas such as penetration testing. That
        downstream gap begins in schools, where not all pupils have access to
        the same level of exposure.
      </p>
      <ResponsiveChart>
        {({ width, height }) => (
          <ConcentricRadialGauges
            width={width}
            height={height}
            basic={44}
            advanced={27}
          />
        )}
      </ResponsiveChart>
      <p>
        Dr Yulia Cherdantseva, Reader in Cyber Security at Cardiff University,
        underlined this:{" "}
        <em>
          “Cyber isn’t yet coherently embedded in the curriculum; it appears
          piecemeal within ICT/CS. Formal curriculum integration is essential to
          reach every learner; voluntary schemes are self-selecting and miss
          many.”
        </em>{" "}
        Without making cyber part of the mainstream curriculum, many young
        people will never encounter it in a meaningful way.
      </p>

      <h3>Barriers for Teachers</h3>
      <p>
        Teachers juggle crowded timetables, exam pressures, and shifting
        specifications. Cyber can feel like “one more thing,” and confidence is
        often low when technology develops faster than specifications.
      </p>
      <p>
        Elaine Haigh, Senior Lecturer in Cyber Security, described the problem:{" "}
        <em>
          “It’s erratic in schools and often depends on an enthusiastic teacher,
          local support, and access to kit and software. Barriers include
          curriculum time, standards/resources, IT support, and basic
          equipment.”
        </em>
      </p>
      <p>
        Andrew Bellamy (Cyber Innovation Hub; USW National Cyber Security
        Academy) underlines the staffing and capability gap:{" "}
        <em>
          “Very few Computer Science/Cyber graduates go into school teaching.
          Often the ‘IT teacher’ has come from another subject and upskilled.
          Some do an excellent job, but provision is inconsistent… Most schools
          aren’t fully equipped, working conditions are tough, and pay compares
          poorly with industry, which makes recruiting specialist teachers
          hard.”
        </em>
      </p>
      <p>
        Yulia Cherdantseva adds to this picture:{" "}
        <em>
          “Limited curriculum time; a lack of coherent, cross-subject
          integration; variable teacher confidence and access to CPD; and uneven
          resources.”
        </em>{" "}
        All of these views highlight a system where delivery depends too much on
        enthusiasm, rather than structured support. The implication is that
        teachers want to do more, but they cannot be expected to carry the
        weight without proper training, time, and resources.
      </p>

      <h3>Examples of What Works</h3>
      <p>
        Where schools are resourced and supported, the outcomes are striking.
        National initiatives like CyberFirst have made a visible difference,
        particularly through their bursary scheme, summer courses, and the
        CyberFirst Girls competition. These initiatives not only introduce young
        people to cyber, but also raise aspirations by providing role models,
        hands-on challenges, and a clear sense of progression. Teachers who
        integrate these programmes into their school calendars report higher
        student engagement and increased interest in Computer Science.
      </p>
      <p>
        WorldSkills is another powerful model. By embedding WorldSkills
        standards into her teaching, Elaine Haigh found students gained
        structure, benchmarks, and confidence:{" "}
        <em>
          “Multiple students reached UK finals and Squad UK. The whole cohort
          benefited from the higher bar, structured practice, networking, and
          confidence.”
        </em>
        Competitions like these create a level playing field, motivating
        students who may not otherwise see themselves as “cyber people.” Andrew
        Bellamy’s broader takeaway applies here too:{" "}
        <em>
          “Outreach and visibility are essential… we need to articulate the
          career paths far better than we currently do.”
        </em>
      </p>
      <p>
        Local and regional schemes are equally valuable. Technocamps delivers
        ready-to-use activities to schools in Wales, and CyberFirst Ambassadors
        bring working professionals into classrooms. Teachers can also draw on
        resources such as the National Centre for Computing Education, Computing
        at School communities, and free platforms like TryHackMe or Immersive
        Labs to create engaging, low-barrier ways for students to practise
        skills.
      </p>
      <p>
        These examples demonstrate that teachers are not alone. Structured
        schemes, competitions, and industry partnerships can make cyber teaching
        more exciting and sustainable, while also easing the preparation burden
        on staff.
      </p>

      <h3>Bridging Education to Industry</h3>
      <p>
        Too often, students leave school interested in cyber but unclear about
        next steps. Apprenticeships, T-Levels, and university courses all exist,
        but if pupils and parents do not know about them, they cannot pursue
        them. Schools that partner with local employers or colleges help make
        these options visible.
      </p>
      <p>
        Clare Johnson, Capability Lead at ITSUS Consulting, explained why this
        matters:{" "}
        <em>
          “We need people with broad technical understanding who can communicate
          well. There’s also a shortage at the mid-tier: experienced people who
          understand both business context and technology.”
        </em>
        While schools cannot be expected to deliver everything industry demands,
        they can prepare students by embedding collaboration, communication, and
        confidence into classroom practice alongside technical skills.
      </p>
      <p>
        Employers repeatedly say that teamwork and the ability to explain
        technical ideas are as valuable as configuring a system. Teachers who
        encourage students to present their work, collaborate on projects, and
        reflect on their thinking are already giving them a head start in
        bridging the gap between classroom and career.
      </p>

      <h3>Supporting Teachers to Shape the Pipeline</h3>
      <p>
        Teachers are the starting point of the cyber workforce pipeline. Every
        curious, confident student begins with a lesson that sparks interest. To
        make that spark possible, teachers need consistent resources, practical
        CPD, and clear support from leadership.
      </p>
      <p>
        Martin Peake offered practical advice:{" "}
        <em>
          “Approach local companies (start with larger employers) and ask about
          their cyber functions and community outreach. Aim to find an industry
          mentor who can advise and occasionally visit. Do some of this legwork
          in holidays so you have bandwidth. Secure senior leadership buy-in
          early, as IT services will be cautious. Having the head teacher’s
          support is vital to set up a safe, isolated cyber lab and to timetable
          clubs or enrichment.”
        </em>
      </p>
      <p>
        Andrew Bellamy offers two practical steers for classroom design:{" "}
        <em>
          “Teach security from the architectural level, don’t bolt it on.
          Understanding the secure development lifecycle is key.” And on lesson
          planning: “Tailor to age and context: for younger learners focus on
          social media literacy; in digitally deprived areas design around
          devices pupils actually use; at post-16 bring in industry speakers on
          malware, phishing, and secure development.”
        </em>
      </p>
      <p>
        And while cyber changes rapidly, Taylor Watson reminds us that strong
        fundamentals endure:{" "}
        <em>
          “The curriculum can’t keep pace with rapidly changing tech, but it can
          keep pace with fundamentals. Emphasise networking, system
          architecture, and sound administration. Strong fundamentals, well
          taught, can be the gateway for students.”
        </em>
      </p>
      <p>
        Teachers are not expected to do this alone. By linking into national
        schemes, drawing on existing resources, and building local partnerships,
        they can offer students real opportunities without carrying the weight
        unsupported. In turn, policymakers and school leaders must ensure that
        teachers receive the time, training, and resources they need.
      </p>
      <p>
        Supporting teachers is how we support the next generation. By closing
        the skills gap within the classroom, we give every pupil the chance to
        see themselves in cyber and see it as an accessible and interesting
        career for their future.
      </p>
    </div>
  );
}

export default Educators;
