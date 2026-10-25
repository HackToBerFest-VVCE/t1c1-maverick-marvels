# Installing the design skills into Antigravity

Antigravity reads skills from `.agents/skills/<name>/SKILL.md` in the workspace,
or `~/.gemini/config/skills/` globally. Each skill needs YAML frontmatter with a
`description`; `name` defaults to the folder name.

`.agents/skills/saakshi-dashboard-ui/` in this kit is already in that format and
needs no installation.

---

## Optional: the community design skills

These are the six repos from the list you shared. They were written for Claude
Code, which uses the same `SKILL.md` convention, so most drop straight into
`.agents/skills/`.

| # | Author | Repo |
|---|---|---|
| 1 | Emil Kowalski (`/apple-design`) | `github.com/emilkowalski/skills` |
| 2 | garden-skills (`web-design-engineer`) | `github.com/ConardLi/garden-skills` |
| 3 | ai-design-skills (`landing-page-design`) | `github.com/elayadesign/ai-design-skills` |
| 4 | Meng To | `github.com/MengTo/Skills` |
| 5 | Jakub Krehel | `github.com/jakubkrehel/skills` |
| 6 | designer-skills (`build-awwwards-quality-sites`) | `github.com/Owl-Listener/designer-skills` |

Install one:

```bash
mkdir -p .agents/skills
git clone --depth 1 https://github.com/<owner>/<repo> /tmp/sk
cp -r /tmp/sk/<skill-folder> .agents/skills/
```

Then check each copied folder has a `SKILL.md` with frontmatter containing a
`description`. Without one it is silently ignored. Restart Antigravity and
confirm the skill appears as a `/slash-command`.

---

## Read this before you install them

These skills are written for **marketing sites and product landing pages** —
awwwards-quality visual work, Apple-style polish, landing-page composition. That
is a different problem from a dense government data interface, and some of their
advice actively conflicts with `design/DESIGN-BRIEF.md`:

| They tend to favour | Saakshi requires |
|---|---|
| Large expressive type, generous scale | A tight scale; density is the point |
| Gradients, glass, layered shadows | Hairline rules; shadows nearly absent |
| Expressive colour and motion | One reserved accent; minimal motion |
| Hero-led, scroll-driven composition | Table-led, scan-driven composition |

**Where they disagree with `DESIGN-BRIEF.md`, the brief wins.** This is not a
landing page. The screen's job is to let a resource person scan 200 rows and
find the ones that need action, in sunlight, on a cheap phone.

What they are genuinely good for: micro-interaction quality, focus and hover
state craft, spacing rhythm, and the general discipline of not shipping
defaults. Take that. Leave the gradients.

If you install them, add this to `AGENTS.md` so precedence is explicit:

```markdown
## Design skill precedence
When a community design skill conflicts with design/DESIGN-BRIEF.md or
.agents/rules/00-design-system.md, the Saakshi brief and rules win. The
community skills inform craft — interaction states, spacing rhythm, polish —
not palette, density or chart rules.
```
