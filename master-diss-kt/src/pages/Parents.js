import React from "react";
import parentImage from "../image/parent.png";
import { DumbbellParity } from "../components/D3CyberCharts";
import ResponsiveChart from "../components/ResponsiveChart";

function Parents() {
  return (
    <div className="page">
      <h2>Behind Every Cyber Security Student is a Parent Who Said Yes</h2>
      <img src={parentImage} alt="Cyber Careers Hub" className="parent-image" />

      <h3>Why Parents Hold the Keys</h3>
      <p>
        Picture everyday moments you already recognise. Your child spots a fake
        giveaway on Instagram before anyone else. They set up two-factor
        authentication on a new phone without being asked. They teach a
        grandparent how to update a password manager. Those are not just tech
        habits. They are early signs of problem solving, patience, and digital
        judgement that sit at the heart of cyber security careers.
      </p>
      <p>
        Cyber is not a niche reserved for elite programmers. It touches law,
        business, psychology, defence, healthcare, media, and the arts. The
        biggest hurdle for many young people is not ability but confidence.
        Encouragement at home is often what turns curiosity into momentum. A
        parent who says <em>“give it a go, let’s see where this leads”</em> can
        turn an interest into a pathway.
      </p>

      <h3>The Stakes: Why Cyber Matters for the Next Generation</h3>
      <p>
        Families already live with digital risk. Phishing messages, stolen
        passwords, and hacked accounts are the household version of the threats
        organisations face at scale. We need more people with the skills to keep
        us safe, and better ways to help them into the industry.
      </p>
      <p>Two points show the need for skilled people:</p>
      <ul>
        <li>
          IBM’s 2023 Cost of a Data Breach Report estimated the average UK
          breach at about £3.4 million.
        </li>
        <li>
          Fortinet’s 2024 global skills survey reported that 87% of
          organisations experienced a breach in 2023, with leaders increasingly
          accountable.
        </li>
      </ul>
      <p>
        For young people, this is both challenge and opportunity. Cyber roles
        are resilient, well paid, and meaningful. Supporting an interest in this
        field is not just about jobs. It is about life skills that keep them,
        their friends, and their future workplaces safer.
      </p>

      <h3>What Schools Cover and What They Cannot</h3>
      <p>
        Cyber already threads through the timetable, even if it is not named
        explicitly. In Mathematics, pupils meet the basics of cryptography and
        logic. In PSHE, they discuss privacy, consent, and online behaviour. In
        Computer Science, they learn networks, algorithms, and how malware
        works. In Wales, the Digital Competence Framework builds critical
        thinking, data handling, and ethical use of technology across subjects.
      </p>
      <p>
        Provision still varies. Many teachers want clearer, ready-to-use
        materials and more time for practical activities. That is normal when a
        fast-moving field meets a busy curriculum. It means classroom learning
        should be seen as a foundation, not the finish line.
      </p>
      <p>
        What helps most is safe, hands-on practice that builds confidence.
        Parents can make a difference here by helping children find activities
        that turn theory into experience: local clubs, capture-the-flag events,
        beginner-friendly online platforms, or short courses that offer a
        structured path. The aim is not perfection. It is regular practice and
        small wins.
      </p>
      <p>
        A useful context for families: recent analysis of data-breach incidents
        in schools found that many insider attacks were caused by weak or stolen
        passwords. In other words, basic cyber hygiene really matters at every
        level. Helping your child learn good habits at home has real-world value
        later.
      </p>

      <h3>Diversity and Why Belief Matters</h3>
      <p>
        The UK cyber workforce is still unbalanced. Roughly 17% of cyber
        professionals are women and around 15% are from ethnic minority groups.
        Disabled and neurodivergent professionals are also under-represented.
        Too often, young people self-select out before they start.
      </p>
      <div className="chart-tight">
        <ResponsiveChart aspect={2.6} maxHeight={300}>
          {({ width, height }) => (
            <DumbbellParity
              width={width}
              height={height}
              title="Representation gaps to parity (50%)"
              subtitle="UK cyber workforce"
              data={[
                { label: "Women", value: 17 },
                { label: "Ethnic minority", value: 15 },
              ]}
            />
          )}
        </ResponsiveChart>
      </div>

      <p>
        Parental reassurance is a powerful counterweight to stereotypes.
        Encouraging daughters, neurodivergent learners, or children from less
        advantaged backgrounds to try a taster course or attend a beginner
        session can change how they see themselves.
      </p>
      <p>
        Clare Johnson, Capability Lead at ITSUS Consulting and founder of Women
        in Cyber Wales, puts it plainly:{" "}
        <em>
          “Community is vital. Frame computing and cyber so girls and women can
          see themselves in it. Create spaces where women learn from each other;
          career stories are especially powerful.”
        </em>
      </p>
      <p>Why this works:</p>
      <ul>
        <li>
          Role models and stories reduce the feeling of “this is not for me.”
        </li>
        <li>Beginner-friendly spaces lower the fear of making mistakes.</li>
        <li>Practical tasters let young people discover what they enjoy.</li>
        <li>Networks open doors to talks, internships, and mentors.</li>
      </ul>
      <p>
        Groups and organisations such as Women in Cyber Wales, CyberFirst Girls,
        and Cisco CyberCamps create exactly these conditions. When parents nudge
        children toward them and help with the logistics, participation goes up
        and the diversity gap narrows.
      </p>

      <h3>Mapping the Routes Without the Jargon</h3>
      <p>
        There is no single right route into cyber. Think of parallel options
        that suit different learners and budgets. Here is a parent-friendly map,
        plus how you can help at each stage.
      </p>
      <h4>GCSE and A level route</h4>
      <ul>
        <li>
          <strong>What it looks like:</strong> Computer Science, Mathematics,
          Further Maths, or subjects with data and problem solving. Add clubs,
          coding societies, or capture-the-flag challenges.
        </li>
        <li>
          <strong>Why it works:</strong> Builds strong logic and gives evidence
          of interest. Competitions add teamwork and persistence.
        </li>
        <li>
          <strong>Ways you can support:</strong> Encourage the subject choices
          they enjoy, not just what “looks right.” Help them find a local club
          or an online challenge with beginner levels. Celebrate effort as much
          as outcomes.
        </li>
      </ul>
      <h4>T Levels and apprenticeships</h4>
      <ul>
        <li>
          <strong>What it looks like:</strong> T Level Digital or a Level 3 or
          Level 4 cyber apprenticeship that blends study with paid work.
        </li>
        <li>
          <strong>Why it works:</strong> Young people build habits and
          confidence in real environments and leave with experience employers
          trust.
        </li>
        <li>
          <strong>Ways you can support:</strong> Ask schools and colleges about
          local placements. Help your child prepare a simple CV and practise
          interview basics. Look for employers who support training and
          wellbeing.
        </li>
      </ul>
      <h4>University degrees</h4>
      <ul>
        <li>
          <strong>What it looks like:</strong> Cyber Security, Digital
          Forensics, Ethical Hacking, or broader computing with security
          modules.
        </li>
        <li>
          <strong>Why it works:</strong> Offers depth, networks, and placements.
        </li>
        <li>
          <strong>Ways you can support:</strong> At open days, ask about links
          to employers, placement rates, and practical facilities. Encourage
          course projects that can be showcased to future employers.
        </li>
      </ul>
      <h4>Alternative and flexible routes</h4>
      <ul>
        <li>
          <strong>What it looks like:</strong> Short bootcamps, beginner
          certifications, part-time IT roles, volunteering on a school tech
          team, or contributing to community projects.
        </li>
        <li>
          <strong>Why it works:</strong> Builds a portfolio and confidence
          without big upfront costs.
        </li>
        <li>
          <strong>Ways you can support:</strong> Help find reputable providers
          with clear beginner pathways. Encourage a simple online portfolio that
          shows progress.
        </li>
      </ul>
      <p>
        Two national examples give confidence that these routes lead somewhere.
        CyberFirst has engaged more than 30,000 students across hundreds of
        schools, and its bursary scheme places a large majority of graduates
        directly into cyber roles. In Wales, the Cyber Innovation Hub has
        reached more than 10,000 learners through bootcamps and outreach that
        connect schools with local employers.
      </p>

      <h3>How Parents Bridge the Gap</h3>
      <p>
        Employers regularly say the same thing. Technical basics matter, but so
        do communication, teamwork, and confidence. Those habits start long
        before a first job.
      </p>
      <ul>
        <li>
          Ask your child to explain a project in simple terms. If they can teach
          it, they understand it.
        </li>
        <li>
          Encourage collaboration. Building something with a friend mirrors real
          work.
        </li>
        <li>
          Model safe digital behaviour at home. Strong passwords, updates, and
          pausing before clicking build instincts.
        </li>
      </ul>
      <p>
        Emilia Edwards, co-founder of Project Pioneers, explains the bigger
        picture:{" "}
        <em>
          “Students only know what schools teach them. Schools don’t always know
          what industry wants and industry doesn’t necessarily know what
          students are learning.”
        </em>
      </p>
      <p>
        Parents can create the same clarity at home by linking class topics to
        real life. A lesson on phishing becomes a family discussion about fake
        messages. A homework task on networks becomes a chance to label the home
        router and set up guest Wi-Fi safely. This can significantly aid in your
        childs learning as it turns abstract ideas into lived experience, which
        boosts confidence, makes interviews easier later, and shows a young
        person they already belong in the conversation.
      </p>

      <h3>Supporting Your Child at Home</h3>
      <p>
        You do not need to be a cyber expert to raise one. The best support is
        encouragement and access:
      </p>
      <ul>
        <li>Talk openly about scams, passwords, updates, and privacy.</li>
        <li>Support attendance at meetups, summer schools, or competitions.</li>
        <li>
          Allow time on beginner-friendly platforms like TryHackMe or Hack The
          Box.
        </li>
        <li>
          Encourage puzzles, games, tinkering with kits, and creative projects.
        </li>
      </ul>
      <p>
        Here is where access really matters. Emilia Edwards adds a practical
        reminder that fits this step exactly:{" "}
        <em>
          “To build technical knowledge you usually need a computer, which in
          most cases at younger ages would be provided by parents. Where
          possible, provide young people with resources they need, and if they
          do not have the resources, learn alongside them so they are not going
          through the pathway on their own.”
        </em>
        That could mean sharing a device schedule at home, using school or
        community computers when needed, or sitting beside them for the first
        half hour of a new platform so they feel supported, not stuck.
      </p>

      <h3>Parents are the Pipeline Builders</h3>
      <p>
        The future cyber workforce will not be built only in boardrooms. It will
        be built in living rooms, school halls, and weekend trips to taster
        events. Parents who encourage curiosity, enable practice, and show
        belief in their child’s potential are building the workforce the UK
        needs.
      </p>
      <p>
        Your part is simple: offer belief, encouragement, and opportunity. Say
        yes to the club, help find a starter course, talk about digital life,
        and celebrate small wins. In doing so, you strengthen the resilience of
        the society they will inherit.
      </p>
    </div>
  );
}

export default Parents;
