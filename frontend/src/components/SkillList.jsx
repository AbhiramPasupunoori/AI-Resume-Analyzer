function SkillList({ title, skills, emptyMessage }) {
  return (
    <div className="card">
      <h2>{title}</h2>

      {skills && skills.length > 0 ? (
        <div className="skill-list">
          {skills.map((skill) => (
            <span className="skill-badge" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">{emptyMessage || "No skills found."}</p>
      )}
    </div>
  );
}

export default SkillList;
