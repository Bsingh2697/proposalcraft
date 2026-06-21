# /components

Reusable React components used across multiple pages. These are client-side UI building blocks.

## Structure

```
components/
├── ui/                  # shadcn/ui base components (auto-generated, don't edit manually)
│   ├── button.tsx       # Button with variants (default, outline, ghost, destructive)
│   ├── card.tsx         # Card container with header, content, footer slots
│   ├── textarea.tsx     # Multi-line text input
│   ├── select.tsx       # Dropdown selector
│   ├── badge.tsx        # Small status label (e.g. "Free Plan", "Pro")
│   ├── input.tsx        # Single-line text input
│   ├── label.tsx        # Form field label
│   └── separator.tsx    # Horizontal dividing line
│
├── ProposalForm.tsx     # The main generator form (job description, skills, tone)
├── ProposalOutput.tsx   # Displays the generated proposal with a Copy button
└── UsageBadge.tsx       # Shows "X of 3 proposals used" or "Pro — unlimited"
```

## shadcn/ui components (`/ui`)

These are **owned by this project** — shadcn copies the source into your repo rather than importing from a package. This means you can customize them freely. They are built on top of Radix UI primitives (accessible, unstyled) with Tailwind CSS for styling.

To add more: `pnpm dlx shadcn@latest add <component-name>`

## Custom components

### ProposalForm

The main input form. Controlled component — manages its own state and calls `POST /api/generate` on submit. Props:
- `onResult(proposal: string)` — callback with the generated text
- `usage` — current usage count to disable the form when limit is reached

### ProposalOutput

Displays the generated proposal text. Includes a "Copy to clipboard" button and a "Generate another" link. Props:
- `proposal: string` — the generated text to display

### UsageBadge

Small badge shown in the navbar and on the generate page. Shows remaining free proposals or "Pro — unlimited". Props:
- `used: number` — proposals used this month
- `plan: 'free' | 'pro'` — current user plan
