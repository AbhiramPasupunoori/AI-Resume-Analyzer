def clean_value(value):
    if value is None:
        return ""

    return str(value).strip()


def format_list(values):
    if not values:
        return ""

    cleaned_values = [
        clean_value(value)
        for value in values
        if clean_value(value)
    ]

    return "\n".join(
        f"- {value}"
        for value in cleaned_values
    )


def format_dict_list(items, fields):
    if not items:
        return ""

    lines = []

    for item in items:
        if not isinstance(item, dict):
            continue

        title_parts = []

        for field in fields:
            value = clean_value(item.get(field))

            if value:
                title_parts.append(value)

        if title_parts:
            lines.append(" | ".join(title_parts))

        description = clean_value(
            item.get("description")
        )

        if description:
            lines.append(description)

        bullet_points = item.get("bullets", [])

        if isinstance(bullet_points, list):
            for bullet in bullet_points:
                bullet = clean_value(bullet)

                if bullet:
                    lines.append(f"- {bullet}")

        lines.append("")

    return "\n".join(lines).strip()


def add_section(parts, title, content):
    content = clean_value(content)

    if content:
        parts.append(title)
        parts.append(content)
        parts.append("")


def build_resume_text_from_data(data):
    parts = []

    full_name = clean_value(data.get("full_name"))
    email = clean_value(data.get("email"))
    phone = clean_value(data.get("phone"))
    location = clean_value(data.get("location"))
    linkedin = clean_value(data.get("linkedin"))
    github = clean_value(data.get("github"))
    portfolio = clean_value(data.get("portfolio"))

    if full_name:
        parts.append(full_name)

    contact_parts = [
        email,
        phone,
        location,
        linkedin,
        github,
        portfolio,
    ]

    contact_line = " | ".join(
        item
        for item in contact_parts
        if item
    )

    if contact_line:
        parts.append(contact_line)

    parts.append("")

    add_section(
        parts,
        "Professional Summary",
        data.get("summary"),
    )

    add_section(
        parts,
        "Skills",
        format_list(data.get("skills", [])),
    )

    add_section(
        parts,
        "Education",
        format_dict_list(
            data.get("education", []),
            [
                "degree",
                "institution",
                "year",
            ],
        ),
    )

    add_section(
        parts,
        "Experience",
        format_dict_list(
            data.get("experience", []),
            [
                "role",
                "company",
                "duration",
            ],
        ),
    )

    add_section(
        parts,
        "Projects",
        format_dict_list(
            data.get("projects", []),
            [
                "title",
                "technologies",
            ],
        ),
    )

    add_section(
        parts,
        "Certifications",
        format_list(data.get("certifications", [])),
    )

    add_section(
        parts,
        "Achievements",
        format_list(data.get("achievements", [])),
    )

    return "\n".join(parts).strip()


def build_resume_text(built_resume):
    return build_resume_text_from_data(
        {
            "full_name": built_resume.full_name,
            "email": built_resume.email,
            "phone": built_resume.phone,
            "location": built_resume.location,
            "linkedin": built_resume.linkedin,
            "github": built_resume.github,
            "portfolio": built_resume.portfolio,
            "summary": built_resume.summary,
            "skills": built_resume.skills,
            "education": built_resume.education,
            "experience": built_resume.experience,
            "projects": built_resume.projects,
            "certifications": built_resume.certifications,
            "achievements": built_resume.achievements,
        }
    )
