import React from "react";
import studentImage from "../image/student.png";
import { SchoolReadinessStacked100 } from "../components/D3CyberCharts";
import { TriptychRadialBadges } from "../components/D3CyberCharts";
import { PackedCirclesOutcomeGauge } from "../components/D3CyberCharts";

function Students() {
  return (
    <div className="page">
      <h2>
        Not Just Hackers: How to Build a Cyber Career from School to First Job
      </h2>
      <img
        src={studentImage}
        alt="Cyber Careers Hub"
        className="student-image"
      />

      <p>
        The stereotype of the “hacker in a hoodie” typing green code into the
        night has done real damage. It makes cyber security feel mysterious,
        intimidating, and far away. In reality, the industry is wide,
        fast-growing, and varied. There is space for people who love problem
        solving, for storytellers and communicators, and for anyone who wants to
        make technology safer.
      </p>
      <p>
        Confidence, not technical genius, is often the hurdle for students
        looking to get into the industry. As Taylor Watson, co-founder of
        Project Pioneers, explained:{" "}
        <em>“Companies can teach the tech; they can’t teach you to be you.”</em>
        Employers know they can build technical expertise on the job, but they
        cannot replace curiosity, teamwork, or the ability to communicate
        clearly. Clare Johnson, Capability Lead at ITSUS Consulting, made the
        same point from an industry perspective:
        <em>
          {" "}
          “We need those who have broad technical understanding AND are also
          comfortable communicating”.
        </em>
      </p>
      <p>
        The message for students is clear: cyber is not a locked door. It is a
        set of careers that need your creativity and perspective. Whether you
        are into science, psychology, social justice or storytelling, the sector
        has a place for you.
      </p>

      <h3>What school covers now, and why it is a start not the finish</h3>
      <p>
        Cyber topics are already embedded in the curriculum, even if the word
        “cybersecurity” isn’t on your timetable. In secondary school Computer
        Science, you might meet cryptography, malware, mobile security, privacy,
        and the legal side of digital life. In Wales, the Digital Competence
        Framework goes further, asking pupils to capture and interrogate data,
        evaluate computational processes, and reflect on the ethical use of
        technology.These are not abstract add-ons, they are the foundation of
        digital responsibility and awareness.
      </p>
      <p>
        Yet the picture is uneven. Teachers frequently report that while the
        framework sets the ambition, classrooms often lack the resources,
        training, or confidence to deliver cyber content in depth. As well as
        this schools often lack the proper training to keep their own systems
        safe. A 2022 SWGfL (South West Grid for Learning) survey of 350 schools
        found that 62% of teachers had never received any cybersecurity
        training, 31% of schools had no IT security policy, and 80% lacked a
        proper set up for backups of their data making schools themselves
        vulnerable to attacks.
      </p>

      <section style={{ maxWidth: 900, margin: "2rem auto" }}>
        <SchoolReadinessStacked100 />
      </section>
      <p>
        The risks are not hypothetical. An ISO analysis of 215 school data
        breach reports (2022–2024) found that 57% of insider cyber incidents
        were caused by students, most often through stolen or guessed login
        details. In fact, 97% of stolen-credential incidents were traced back to
        pupils. The National Crime Agency has warned that one in five young
        people aged 10–16 engages in some form of illegal online activity, with
        referrals to its Cyber Choices programme including children as young as
        seven.
      </p>
      <div style={{ maxWidth: 840, margin: "2rem auto" }}>
        <TriptychRadialBadges />
      </div>
      <p>
        This pattern highlights two truths. First, young people are curious,
        capable, and often several steps ahead of the adults around them.
        Second, without safe routes to explore those skills, curiosity can drift
        into risk. Former teacher and industry professional Martin Peake saw
        this curiosity as a positive:{" "}
        <em>
          “We built an isolated school cyber lab for safe, legitimate practice.
          Schools rarely have segregated networks for legitimate testing. The
          largest blocker is not being allowed (or equipped) to try things
          safely.”
        </em>{" "}
        By creating drop-in lab sessions where trial and error was encouraged,
        he found more students gained the confidence to develop skills in cyber
        in a safe and legal environment.
      </p>
      <p>
        The lesson is clear: when schools provide structured opportunities to
        make mistakes, recover, and learn exciting skills in a legal way,
        students not only stay safe but begin to see cyber as an interesting
        pathway rather than a rule they might break.
      </p>

      <h3>The skills gap, made simple, and why it should not scare you</h3>
      <p>
        You may hear the phrase “skills gap” thrown around in the news or in
        lessons, but what does it actually mean? At its simplest, it is the
        difference between the cyber security skills that organisations need and
        the skills their staff actually have.
      </p>
      <p>
        The scale of this gap is clear. Government research in 2024 showed that
        44 percent of UK organisations lacked basic cyber security skills, while
        27 percent reported shortages in advanced areas like penetration
        testing. Even though demand for cyber professionals dipped slightly last
        year, the reality is that new entrants are still not keeping pace,
        leaving an annual shortfall of around 3,500 roles. That means jobs
        exist, but not enough people are qualified or confident to step into
        them.
      </p>
      <p>
        Employers are not just struggling to recruit cryptographers or elite
        hackers. The shortages often appear in day-to-day essentials: firewall
        setup, incident response, and malware removal. CompTIA research
        highlighted that half of UK businesses lacked staff who could set up
        firewalls correctly, and one in three could not rely on staff to respond
        to incidents. For students, this should not feel intimidating, it should
        feel like opportunity. These are learnable skills, and industry is
        actively looking for people who want to grow into them.
      </p>
      <p>
        As Emilia Edwards, co-founder of Project Pioneers and industry
        professional puts it,{" "}
        <em>
          “Build your fundamentals, but prioritise soft skills first:
          presenting, networking, talking to people, documentation, even writing
          professional emails. Focus on developing as a well-rounded person
          entering the industry; the technical depth can be learned over time.”
        </em>{" "}
        That combination of strong fundamentals, good communication, and
        curiosity is often what makes one applicant stand out from another.
      </p>

      <h3>Busting perceptions and misconceptions</h3>
      <ul>
        <li>
          <strong>Myth 1: “You have to be a coding prodigy.”</strong>
          Strong fundamentals help, but employers do not expect fully formed
          experts. What matters is the habit of learning, plus evidence you can
          apply basics in real contexts. Practice platforms, entry-level
          competitions and small projects build exactly that. One of the main
          misconceptions with the industry is that you have to be perfect from
          day one, but as senior lecturer Elaine Haigh puts it{" "}
          <em>
            "Students worry that they'll be thrown in and expected to do
            everything from day one. Larger organisations typically run solid
            graduate schemes with training and sensible expectations. I remind
            students they can choose the right fit and that good base skills
            give them options."
          </em>{" "}
          Clear targets, feedback, and repetition does more for readiness than
          trying to memorise every tool or command.
        </li>
        <li>
          <strong>Myth 2: “There is only one job: hacker.”</strong>
          Security is an ecosystem. Roles span security operations centre
          analysis, digital forensics, governance and risk, incident response,
          awareness and training, secure design, product security, and
          operational technology security. If you like coaching people, cyber
          awareness and training might fit. If you enjoy structured thinking,
          governance and compliance could click. If you are curious about how
          things break and why, testing and vulnerability research might suit
          you. Employers look for different profiles that combine technical
          basics with communication, documentation, ethics, and clear thinking.
        </li>
        <li>
          <strong>Myth 3: “It is too late to start.”</strong>
          Cyber is full of latecomers, people who began in teaching, social
          sciences, or law before switching paths. What makes the difference is
          not when you start, but how you start. Short courses,
          beginner-friendly competitions, and project-based learning give
          newcomers a way to build skills and confidence quickly. Community
          spaces, from local meetups to online groups, also matter. They make it
          easier to ask questions, share progress, and see that there are many
          valid routes in. The key lesson is simple: there is no expiry date on
          curiosity.
        </li>
      </ul>
      <p>
        <strong>What this means for you</strong>
      </p>
      <p>
        You can stand out by combining fundamentals with soft skills: explain
        your process, show how you collaborate, and reflect on what you learned
        from mistakes. Build small proofs of progress like a home lab write-up,
        a CTF walkthrough, a short awareness resource you presented at school,
        or a GitHub repo with notes and scripts. Employers can train specific
        tools. They cannot train curiosity, reliability, and clear communication
        as quickly. Start where you are, pick a lane that interests you, and
        stack small wins. That is how most people get hired.
      </p>

      <h3>Diversity and belonging</h3>
      <p>
        Cyber needs many kinds of thinkers. Different perspectives help teams
        spot risks earlier, design safer products, and communicate clearly with
        users. Yet the UK workforce is still uneven. Women make up roughly 17
        percent of cyber roles, ethnic minority representation is around 15
        percent, and disability and neurodiversity remain under-represented
        compared with the wider workforce. That is not a talent problem. It is
        an access and awareness problem, which students can help change.
      </p>
      <p>
        Community is one of the fastest ways to feel you belong. National and
        local initiatives are designed to welcome newcomers and remove
        guesswork. CyberFirst offers free courses, bursaries, summer schools,
        and competitions that build skills step by step. Women in Cyber Wales
        creates a supportive network for meetups, mentoring, and role models.
        Cyber Wales clusters host talks and hands-on sessions where you can meet
        practitioners and try tools in a safe environment. Schemes backed by
        IASME and NCSC help schools and colleges run practical activities that
        mirror the real world.
      </p>
      <p>
        Small signals matter. Seeing people who look like you or share your
        experiences makes a difference to confidence and persistence. As Clare
        Johnson put it,
        <em>
          {" "}
          “Community and relatable stories help girls think, ‘I could do that.’”
        </em>{" "}
        That same principle applies across backgrounds. If you are
        neurodivergent, there are teams and programmes that actively adapt
        teaching and assessment so you can show what you can do. As Dr Yulia
        Cherdantseva noted,
        <em>
          {" "}
          “Beyond gender, cyber is comparatively welcoming for some
          neurodivergent learners; inclusive workplaces can help with reasonable
          adjustments (environment, lighting, noise) and flexible arrangements.
          Not every role will suit everyone, incident response, for example, can
          be high-stress and 24/7, but the breadth of roles means there’s
          usually a good fit.”
        </em>
      </p>
      <p>
        Competitions and collaborative projects also build belonging.
        WorldSkills and similar challenges give a clear bar to aim for, create
        peer groups, and turn individual interest into team momentum. Even
        students who never compete benefit from the standard and the confidence
        it sets inside a classroom or club.
      </p>
      <p>
        If you are starting out, plug into one or two communities, turn up
        regularly, and ask questions. You will find mentors, learn the
        vocabulary, and discover where your strengths fit. Belonging grows with
        practice and people, not perfection.
      </p>

      <h3>Pathways that actually work: GCSE to first role</h3>
      <p>
        There is no single doorway into cyber. Students can find a route that
        matches their learning style, interests, and confidence level, whether
        that means structured study, hands-on practice, or a mix of both. What
        matters is not how you start, but that you start somewhere.
      </p>
      <p>
        GCSEs and A levels remain a natural foundation. Computer Science, Maths,
        and related subjects build problem-solving and logical thinking. But
        learning does not stop in the classroom. Cyber clubs, coding societies,
        capture-the-flag competitions, and projects like Advent of Cyber give
        you a chance to apply theory and discover how security works in
        practice.
      </p>
      <p>
        For those who prefer applied learning, T Levels and apprenticeships
        blend college teaching with paid industry experience. Employers often
        value this because students arrive with professional habits and a record
        of teamwork as well as technical skills. Apprenticeships are
        particularly strong in cyber because they let you earn, learn, and build
        a network at the same time.
      </p>
      <p>
        University is another well-trodden route, with degrees in Cyber
        Security, Digital Forensics, and Ethical Hacking available at many UK
        institutions. Mixed courses such as Computer Science with Security or
        Business with Cyber also give flexibility if you want to combine
        interests. Universities often have strong links with local industry,
        which can open doors to placements or graduate schemes.
      </p>
      <p>
        But non-linear routes are equally valid. Short bootcamps, vendor
        certifications, open-source projects, or even part-time jobs in IT
        support can all lead to security careers. They give evidence of
        initiative and hands-on ability, which employers trust.
      </p>
      <p>
        These pathways are backed by proven programmes. CyberFirst has engaged
        more than 30,000 students across 270 schools, delivering over 1,500
        events. Its bursary scheme has an 87 percent success rate in placing
        graduates directly into cyber jobs, with summer courses now reaching
        near gender parity. In Wales, the Cyber Innovation Hub ecosystem has
        worked with more than 200 schools and reached 10,000 learners, offering
        modules, bootcamps, and direct industry connections. Both examples show
        how national and regional efforts can remove barriers and give students
        confidence.
      </p>
      <div style={{ maxWidth: 760, margin: "1.5rem auto" }}>
        <PackedCirclesOutcomeGauge
          width={760}
          height={360}
          metrics={[
            {
              id: "cf_students",
              label: "CyberFirst students reached",
              value: 30000,
              program: "CyberFirst",
            },
            {
              id: "cih_students",
              label: "Cyber Innovation Hub students reached",
              value: 10000,
              program: "Cyber Innovation Hub",
            },
          ]}
          placementPct={87}
        />
      </div>

      <p>
        For some, entry happens by accident. Taylor Watson reflected on his own
        journey:{" "}
        <em>
          “Although I was technical and knew about the industry, I largely got
          in through luck. My school was one of the first CyberFirst schools,
          which led to work experience and a Level 3 apprenticeship.”
        </em>{" "}
        His experience shows that it doesn’t take a perfect roadmap to begin but
        by staying curious and open to new chances can be enough to set you on
        the path for your future career.
      </p>

      <h3>Why you matter: closing the gap and shaping safer tech</h3>
      <p>
        The future of cyber will be built by the next generation, and that
        includes you. Every student who chooses to step into this field helps
        close the skills gap and makes technology safer for everyone. Your
        background, your perspective, and your persistence are not just welcome,
        they are essential.
      </p>
      <p>
        Taylor Watson offers a practical nudge:{" "}
        <em>
          “Build your network. With thousands of applicants per role, an
          internal advocate helps. Look after your mental health, the field
          moves fast and burnout is real.”
        </em>{" "}
        And Clare Johnson adds:{" "}
        <em>
          “Follow professionals on social media and read widely; if you’re drawn
          in, that’s a good sign. Do hands-on platforms (TryHackMe, Immersive
          Labs, Hack The Box) to discover what excites you and gather evidence
          of your strengths.”
        </em>{" "}
        Start small, keep going, ask for help. That is how careers begin, and
        how safer technology gets built. By you.
      </p>
    </div>
  );
}

export default Students;
